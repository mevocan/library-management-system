import { IsNotEmpty, IsOptional, IsNumber, IsArray, IsUrl } from 'class-validator';

export class CreateBookDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    isbn: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsNumber()
    publishedYear?: number;

    @IsOptional()
    @IsUrl()
    coverImage?: string;

    @IsOptional()
    @IsNumber()
    totalCopies?: number;

    @IsNumber()
    authorId: number;

    @IsArray()
    @IsNumber({}, { each: true })
    categoryIds: number[];
}
