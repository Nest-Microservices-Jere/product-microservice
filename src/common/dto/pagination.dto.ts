import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;
}
