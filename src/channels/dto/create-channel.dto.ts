import { IsString, MinLength } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @MinLength(2)
  name: string;
}
