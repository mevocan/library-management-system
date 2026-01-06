import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateWantToReadDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(3)
    priority?: number;

    @IsOptional()
    @IsString()
    note?: string;
}
