import { IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreateBorrowingDto {
    @IsNumber()
    bookId: number;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
