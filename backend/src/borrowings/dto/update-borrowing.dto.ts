import { IsOptional, IsEnum, IsString } from 'class-validator';
import { BorrowingStatus } from '../borrowing.entity';

export class UpdateBorrowingDto {
    @IsOptional()
    @IsEnum(BorrowingStatus)
    status?: BorrowingStatus;

    @IsOptional()
    @IsString()
    adminNote?: string;
}
