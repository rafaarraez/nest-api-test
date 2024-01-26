import { ApiResponseProperty } from '@nestjs/swagger';

export class GenericResponse {
  @ApiResponseProperty()
  message: string;
}
