import { v4, v5 } from 'uuid';
import { Injectable, NotFoundException } from '@nestjs/common';
import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import fileType from 'file-type';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AWSError, S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { File } from './file.entity';
import { FileRepository } from './files.repository';
import { ReadableFileInterface } from './interfaces/readable-file.interface';
import { CreateFileDto } from './dto/create-file.dto';
import { PromiseResult } from 'aws-sdk/lib/request';
import { UpdateFileDto } from './dto/update-file.dto';
import { GenericResponse } from 'src/common/interfaces/generic-response.interface';
import { S3ResponseInterface } from './interfaces/s3-response.interface';

@Injectable()
export class FilesService {
    private readonly s3Client: S3;
    private readonly bucket: string;
    private readonly folder: string;
    private readonly region: string;

    private readonly unsplash: nodeFetch;

    constructor(
        @InjectRepository(FileRepository)
        private readonly fileRepository: FileRepository,
        private readonly configService: ConfigService,
    ) {
        this.s3Client = new S3({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            region: this.configService.get('AWS_REGION'),
        });

        this.bucket = this.configService.get('AWS_BUCKET');
        this.folder = 'nest-test-develop';

        this.unsplash = createApi({
            accessKey: this.configService.get('UNSPLASH_ACCESS_KEY'),
            fetch: nodeFetch,
        });
    }

    async getFiles(): Promise<File[]> {
        return this.fileRepository.getFiles();
    }

    async uploadFile(createFileDto: CreateFileDto, file: Express.Multer.File): Promise<File> {
        const { name } = createFileDto;
        const { buffer, mimetype } = file

        const fileExtension = this.getFileExtension(mimetype);
        const fileFullPath = this.generateFilePath(name, this.folder, fileExtension);
        const { fileStream, bufferSize } = this.convertToReadableStream(buffer);

        const response = await this.uploadS3(fileStream, fileFullPath, mimetype, bufferSize);

        const newFile: Partial<File> = {
            name,
            path: response.Key,
            url: response.Location,
            mimetype
        };

        await this.fileRepository.save(newFile);

        return newFile as File;

    }

    async getPhotoFromUnsplash(): Promise<JSON> {
        let item = await this.unsplash.photos.getRandom();
        return item;
    }

    async uploadFileFromUnsplash(): Promise<File> {
        let item = await this.unsplash.photos.getRandom();
        console.log('item.response.urls.small_s3', item.response.urls.small_s3);

        let img = await nodeFetch(item.response.urls.small_s3)
        let buffer = Buffer.from(await img.arrayBuffer())
        console.log('buffer', buffer);

        let { mime } = fileType(buffer)

        const fileExtension = this.getFileExtension(mime);
        const fileFullPath = this.generateFilePath(item.response.description, this.folder, fileExtension);
        const { fileStream, bufferSize } = this.convertToReadableStream(buffer);

        const response = await this.uploadS3(fileStream, fileFullPath, mime, bufferSize);

        const newFile: Partial<File> = {
            name: item.response.description,
            path: response.Key,
            url: response.Location,
            mimetype: mime
        };

        await this.fileRepository.save(newFile);

        return newFile as File;

    }

    async downloadFile(id: number): Promise<PromiseResult<S3.GetObjectOutput, AWSError>> {
        const file = await this.getFileById(id);

        const params: S3.GetObjectRequest = {
            Bucket: this.bucket,
            Key: file.path,
        };

        return await this.s3Client.getObject(params).promise();
    }

    async updateFile(id: number, updateFileDto: UpdateFileDto): Promise<File> {
        const { name } = updateFileDto;
        const file = await this.getFileById(id);
        file.name = name;
        await file.save();
        return file;
    }

    async deleteFile(id: number): Promise<GenericResponse> {
        const file = await this.getFileById(id);

        await this.fileRepository.delete(file);

        return { message: 'File deleted successfully' }
    }

    async getFileById(id: number): Promise<File> {
        const found = await this.fileRepository.findOne({ where: { id } });

        if (!found) {
            throw new NotFoundException(`File with ID ${id} not found`);
        }

        return found;
    }

    private async uploadS3(fileStream: Readable, fileFullPath: string, mimetype: string, bufferSize: number) {
        const params: S3.PutObjectRequest = {
            Bucket: this.bucket,
            Body: fileStream,
            Key: fileFullPath,
            ContentType: mimetype,
            ACL: 'public-read',
            ContentLength: bufferSize,
        };

        const response = await this.s3Client.upload(params).promise();
        console.log('response', response);

        return response;

    }

    private sanitizeFolder(folder: string): string {
        const lastCharacterPosition = folder.length - 1;
        const lastCharacter = folder[lastCharacterPosition];

        if (lastCharacter === '/') {
            return folder.substring(0, lastCharacterPosition);
        }

        return folder;
    }

    private convertToReadableStream(buffer: Buffer): ReadableFileInterface {
        console.log(buffer, 'buffer from aja');

        const fileStream = new Readable();
        const bufferSize = buffer.length;
        fileStream._read = () => { };

        fileStream.push(buffer);
        fileStream.push(null);

        return {
            fileStream,
            bufferSize,
        };
    }

    private getFileExtension(mimetype: string): string {
        return mimetype.split('/')[1];
    }

    private generateFilePath(name: string, folder: string, extension: string): string {
        const fileUniqueName = v5(name, v4());
        const sanitizedFolder = this.sanitizeFolder(folder);

        return `${sanitizedFolder}/${fileUniqueName}.${extension}`;
    }
}
