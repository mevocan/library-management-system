import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadBook } from './read-book.entity';
import { CreateReadBookDto } from './dto/create-read-book.dto';
import { UpdateReadBookDto } from './dto/update-read-book.dto';

@Injectable()
export class ReadBooksService {
    constructor(
        @InjectRepository(ReadBook)
        private readBooksRepository: Repository<ReadBook>,
    ) {}

    // Kullanıcının okuduğu kitapları getir
    async getUserReadBooks(userId: number): Promise<ReadBook[]> {
        return this.readBooksRepository.find({
            where: { userId },
            relations: ['book', 'book.author', 'book.categories'],
            order: { createdAt: 'DESC' },
        });
    }

    // Kitabı okundu olarak işaretle
    async markAsRead(userId: number, createDto: CreateReadBookDto): Promise<ReadBook> {
        const existing = await this.readBooksRepository.findOne({
            where: { userId, bookId: createDto.bookId },
        });

        if (existing) {
            throw new ConflictException('Bu kitap zaten okundu olarak işaretli');
        }

        const readBook = this.readBooksRepository.create({
            userId,
            bookId: createDto.bookId,
            rating: createDto.rating,
            review: createDto.review,
            readDate: createDto.readDate ? new Date(createDto.readDate) : new Date(),
        });

        return this.readBooksRepository.save(readBook);
    }

    // Güncelle (puan, yorum ekle)
    async update(userId: number, bookId: number, updateDto: UpdateReadBookDto): Promise<ReadBook> {
        const readBook = await this.readBooksRepository.findOne({
            where: { userId, bookId },
        });

        if (!readBook) {
            throw new NotFoundException('Okuma kaydı bulunamadı');
        }

        if (updateDto.rating !== undefined) readBook.rating = updateDto.rating;
        if (updateDto.review !== undefined) readBook.review = updateDto.review;
        if (updateDto.readDate) readBook.readDate = new Date(updateDto.readDate);

        return this.readBooksRepository.save(readBook);
    }

    // Okundu işaretini kaldır
    async removeFromRead(userId: number, bookId: number): Promise<void> {
        const readBook = await this.readBooksRepository.findOne({
            where: { userId, bookId },
        });

        if (!readBook) {
            throw new NotFoundException('Okuma kaydı bulunamadı');
        }

        await this.readBooksRepository.remove(readBook);
    }

    // Kitap okundu mu kontrol et
    async isRead(userId: number, bookId: number): Promise<{ isRead: boolean; data: ReadBook | null }> {
        const readBook = await this.readBooksRepository.findOne({
            where: { userId, bookId },
        });
        return { isRead: !!readBook, data: readBook };
    }

    // Kitabın ortalama puanı
    async getBookRating(bookId: number): Promise<{ average: number; count: number }> {
        const result = await this.readBooksRepository
            .createQueryBuilder('rb')
            .select('AVG(rb.rating)', 'average')
            .addSelect('COUNT(rb.rating)', 'count')
            .where('rb.bookId = :bookId', { bookId })
            .andWhere('rb.rating IS NOT NULL')
            .getRawOne();

        return {
            average: parseFloat(result.average) || 0,
            count: parseInt(result.count) || 0,
        };
    }

    // Kitabın tüm yorumlarını getir (public)
    async getBookReviews(bookId: number): Promise<any[]> {
        const reviews = await this.readBooksRepository.find({
            where: { bookId },
            relations: ['user', 'book'],
            order: { createdAt: 'DESC' },
        });

        // Kullanıcı bilgilerini güvenli şekilde döndür (şifre hariç)
        return reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            review: r.review,
            readDate: r.readDate,
            createdAt: r.createdAt,
            user: {
                id: r.user.id,
                name: r.user.name,
            },
        }));
    }
    // İstatistikler
    async getUserStats(userId: number): Promise<{ totalRead: number; totalRated: number; averageRating: number }> {
        const readBooks = await this.readBooksRepository.find({ where: { userId } });

        const rated = readBooks.filter(rb => rb.rating);
        const totalRating = rated.reduce((sum, rb) => sum + (rb.rating || 0), 0);

        return {
            totalRead: readBooks.length,
            totalRated: rated.length,
            averageRating: rated.length > 0 ? totalRating / rated.length : 0,
        };
    }
}
