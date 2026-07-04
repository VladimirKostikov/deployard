import { IsString } from 'class-validator';
import { PodFilePathQueryDto } from './pod-file-path-query.dto';

export class WritePodFileDto extends PodFilePathQueryDto {
  @IsString()
  declare path: string;

  @IsString()
  contentBase64!: string;
}

export class CreatePodDirectoryDto extends PodFilePathQueryDto {
  @IsString()
  declare path: string;
}

export class RenamePodPathDto extends PodFilePathQueryDto {
  @IsString()
  fromPath!: string;

  @IsString()
  toPath!: string;
}
