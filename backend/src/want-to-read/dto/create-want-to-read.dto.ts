import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateWantToReadDto {
    @IsNumber()
    bookId: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(3)
    priority?: number;

    @IsOptional()
    @IsString()
    note?: string;
}
