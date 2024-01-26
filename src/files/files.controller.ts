import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GenericResponse } from 'src/common/interfaces/generic-response.interface';
import { getReadableStream } from 'src/helpers/get-readable-stream';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './file.entity';
import { FilesService } from './files.service';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @ApiOperation({
        description: 'Get all files, filtered by user if user is not admin',
    })
    @ApiOkResponse({
        type: [File],
    })
    @Get()
    async getFiles(): Promise<File[]> {
        return await this.filesService.getFiles();
    }

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        description: 'Upload an img',
    })
    @ApiOkResponse({
        type: File,
    })
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Body() createFileDto: CreateFileDto, @UploadedFile() file: Express.Multer.File): Promise<File> {
        if (!file) {
            throw new BadRequestException('the file should not be empty');
        }
        return await this.filesService.uploadFile(createFileDto, file);
    }

    @ApiOperation({
        description: 'Download file by id',
    })
    @Get('/download/:id')
    async downloadFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const s3Object = await this.filesService.downloadFile(id);
        const stream = getReadableStream(s3Object.Body as Buffer);

        res.set({
            'Content-Type': s3Object.ContentType,
            'Content-Length': s3Object.ContentLength,
        });

        stream.pipe(res);
    }

    @ApiOperation({
        description: 'Update file by id',
    })
    @ApiOkResponse({
        type: File,
    })
    @Patch('/:id')
    @UsePipes(ValidationPipe)
    async updateFile(@Param('id', ParseIntPipe) id: number, @Body() updateFileDto: UpdateFileDto): Promise<File> {
        return await this.filesService.updateFile(id, updateFileDto);
    }

    @ApiOperation({
        description: 'Deletes file by id',
    })
    @ApiOkResponse({
        type: GenericResponse,
    })
    @Delete('/:id')
    async deleteFile(@Param('id', ParseIntPipe) id: number): Promise<GenericResponse> {
        return await this.filesService.deleteFile(id);
    }

    @ApiOkResponse({
        type: File,
    })
    @ApiOkResponse({
        type: File,
    })
    @Get('/:id')
    async getFile(@Param('id', ParseIntPipe) id: number): Promise<File> {
        return await this.filesService.getFileById(id);
    }

    @ApiOperation({
        description: 'Get all files, filtered by user if user is not admin',
    })
    @Get('/unsplash/get')
    async getPhotoFromUnsplash(): Promise<JSON> {
        return await this.filesService.getPhotoFromUnsplash();
    }

    @ApiOperation({
        description: 'Found a random image an storage on AWS S3',
    })
    @ApiOkResponse({
        type: File,
    })
    @Post('/unsplash/upload')
    async uploadFileFromUnsplash(): Promise<File> {
        return await this.filesService.uploadFileFromUnsplash();
    }
}
