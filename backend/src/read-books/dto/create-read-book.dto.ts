import { IsNumber, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';

export class CreateReadBookDto {
    @IsNumber()
    bookId: number;

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
