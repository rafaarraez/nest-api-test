import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiResponseProperty } from '@nestjs/swagger';

@Entity()
export class File extends BaseEntity {
  @ApiResponseProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiResponseProperty()
  @Column()
  name: string;

  @ApiResponseProperty()
  @Column()
  path: string;

  @ApiResponseProperty()
  @Column()
  mimetype: string;

  @ApiResponseProperty()
  @Column()
  url: string;
}
