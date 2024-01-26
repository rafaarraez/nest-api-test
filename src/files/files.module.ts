import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { FilesController } from './files.controller';
import { FileRepository } from './files.repository';
import { FilesService } from './files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileRepository]),
    AuthModule,
  ],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule { }
