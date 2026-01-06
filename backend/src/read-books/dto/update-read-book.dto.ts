import { IsOptional, IsNumber, IsString, IsDateString, Min, Max } from 'class-validator';

export class UpdateReadBookDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    review?: string;

    @IsOptional()
    @IsDateString()
    readDate?: string;
}
