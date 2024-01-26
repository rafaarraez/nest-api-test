import { InternalServerErrorException, Logger } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { CreateFileDto } from "./dto/create-file.dto";
import { File } from "./file.entity";

@EntityRepository(File)
export class FileRepository extends Repository<File>{
    private logger = new Logger('FileRepository');

    async getFiles(): Promise<File[]> {
        const query = this.createQueryBuilder('file');

        try {
            const files = await query.getMany();
            return files;
        } catch (error) {
            this.logger.error(`Failed to get files.`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async createFile(createFileDto: CreateFileDto): Promise<File> {
        const { name } = createFileDto;

        const file = new File();
        file.name = name;

        try {
            await file.save();
        } catch (error) {
            this.logger.error(`Failed to create a file for user Data: ${createFileDto}`, error.stack);
            throw new InternalServerErrorException();
        }

        return file;
    }
}