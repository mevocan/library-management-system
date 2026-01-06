import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { Borrowing, BorrowingStatus } from './borrowing.entity';
import { Book } from '../books/book.entity';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';

@Injectable()
export class BorrowingsService {
    constructor(
        @InjectRepository(Borrowing)
        private borrowingsRepository: Repository<Borrowing>,
        @InjectRepository(Book)
        private booksRepository: Repository<Book>,
    ) {}

    // Ödünç alma talebi oluştur
    async create(userId: number, createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
        const { bookId, startDate, endDate } = createBorrowingDto;

        const book = await this.booksRepository.findOne({ where: { id: bookId } });
        if (!book) {
            throw new NotFoundException('Kitap bulunamadı');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            throw new BadRequestException('Başlangıç tarihi bugünden önce olamaz');
        }

        if (end <= start) {
            throw new BadRequestException('Bitiş tarihi başlangıçtan sonra olmalı');
        }

        const isAvailable = await this.checkAvailability(bookId, startDate, endDate);
        if (!isAvailable) {
            throw new BadRequestException('Kitap bu tarihler arasında müsait değil');
        }

        const borrowing = this.borrowingsRepository.create({
            userId,
            bookId,
            startDate: start,
            endDate: end,
            status: BorrowingStatus.PENDING,
        });

        return this.borrowingsRepository.save(borrowing);
    }

    // Müsaitlik kontrolü
    async checkAvailability(bookId: number, startDate: string, endDate: string): Promise<boolean> {
        const book = await this.booksRepository.findOne({ where: { id: bookId } });
        if (!book) return false;

        // Sadece PENDING ve BORROWED durumları çakışma kontrolüne dahil
        const activeBorrowings = await this.borrowingsRepository.count({
            where: {
                bookId,
                status: In([BorrowingStatus.PENDING, BorrowingStatus.BORROWED]),
                startDate: LessThanOrEqual(new Date(endDate)),
                endDate: MoreThanOrEqual(new Date(startDate)),
            },
        });

        return activeBorrowings < book.totalCopies;
    }

    // Kitabın ödünç alma takvimini getir
    async getBookBorrowings(bookId: number): Promise<Borrowing[]> {
        return this.borrowingsRepository.find({
            where: {
                bookId,
                status: In([BorrowingStatus.PENDING, BorrowingStatus.BORROWED]),
            },
            order: { startDate: 'ASC' },
        });
    }

    // Kullanıcının ödünç almalarını getir - DÜZELTİLDİ
    async getUserBorrowings(userId: number): Promise<Borrowing[]> {
        return this.borrowingsRepository.find({
            where: { userId },
            relations: ['book', 'book.author', 'book.categories'],
            order: { createdAt: 'DESC' },
        });
    }

    // Tüm ödünç almaları getir (Admin)
    async findAll(): Promise<Borrowing[]> {
        return this.borrowingsRepository.find({
            relations: ['book', 'book.author', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    // Tek bir ödünç almayı getir
    async findOne(id: number): Promise<Borrowing> {
        const borrowing = await this.borrowingsRepository.findOne({
            where: { id },
            relations: ['book', 'book.author', 'user'],
        });
        if (!borrowing) {
            throw new NotFoundException('Ödünç alma kaydı bulunamadı');
        }
        return borrowing;
    }

    // Durumu güncelle (Admin)
    async updateStatus(id: number, updateDto: UpdateBorrowingDto): Promise<Borrowing> {
        const borrowing = await this.findOne(id);

        if (updateDto.status) {
            borrowing.status = updateDto.status;
        }
        if (updateDto.adminNote !== undefined) {
            borrowing.adminNote = updateDto.adminNote;
        }

        return this.borrowingsRepository.save(borrowing);
    }

    // İptal et (Kullanıcı)
    async cancel(id: number, userId: number): Promise<Borrowing> {
        const borrowing = await this.findOne(id);

        if (borrowing.userId !== userId) {
            throw new BadRequestException('Bu işlem için yetkiniz yok');
        }

        if (borrowing.status !== BorrowingStatus.PENDING) {
            throw new BadRequestException('Sadece bekleyen talepler iptal edilebilir');
        }

        borrowing.status = BorrowingStatus.CANCELLED;
        return this.borrowingsRepository.save(borrowing);
    }

    // Kitabın müsaitlik durumunu getir
    async getAvailability(bookId: number): Promise<{ available: boolean; nextAvailable: Date | null; borrowings: any[] }> {
        const book = await this.booksRepository.findOne({ where: { id: bookId } });
        if (!book) {
            throw new NotFoundException('Kitap bulunamadı');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentBorrowings = await this.borrowingsRepository.count({
            where: {
                bookId,
                status: BorrowingStatus.BORROWED,
                startDate: LessThanOrEqual(today),
                endDate: MoreThanOrEqual(today),
            },
        });

        const available = currentBorrowings < book.totalCopies;

        const futureBorrowings = await this.borrowingsRepository.find({
            where: {
                bookId,
                status: In([BorrowingStatus.PENDING, BorrowingStatus.BORROWED]),
                endDate: MoreThanOrEqual(today),
            },
            select: ['startDate', 'endDate', 'status'],
            order: { startDate: 'ASC' },
        });

        let nextAvailable: Date | null = null;
        if (!available && futureBorrowings.length > 0) {
            const sortedByEnd = [...futureBorrowings].sort(
                (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
            );
            nextAvailable = new Date(sortedByEnd[0].endDate);
            nextAvailable.setDate(nextAvailable.getDate() + 1);
        }

        return {
            available,
            nextAvailable,
            borrowings: futureBorrowings,
        };
    }
}
