import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateNamespaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, {
    message: 'Namespace name must be a valid DNS label (lowercase, hyphens)',
  })
  name!: string;
}
