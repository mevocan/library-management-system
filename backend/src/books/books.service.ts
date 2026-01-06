import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Category } from '../categories/category.entity';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private booksRepository: Repository<Book>,
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) {}

    async findAll(): Promise<Book[]> {
        return this.booksRepository.find({
            relations: ['author', 'categories'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Book> {
        const book = await this.booksRepository.findOne({
            where: { id },
            relations: ['author', 'categories'],
        });
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }

    async search(query: string): Promise<Book[]> {
        return this.booksRepository.find({
            where: [
                { title: Like(`%${query}%`) },
                { isbn: Like(`%${query}%`) },
            ],
            relations: ['author', 'categories'],
        });
    }

    // Gelişmiş Filtreleme
    async filter(filters: {
        categoryId?: number;
        authorId?: number;
        yearFrom?: number;
        yearTo?: number;
        minRating?: number;
        search?: string;
    }): Promise<Book[]> {
        const query = this.booksRepository
            .createQueryBuilder('book')
            .leftJoinAndSelect('book.author', 'author')
            .leftJoinAndSelect('book.categories', 'category');

        // Kategori filtresi
        if (filters.categoryId) {
            query.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
        }

        // Yazar filtresi
        if (filters.authorId) {
            query.andWhere('book.authorId = :authorId', { authorId: filters.authorId });
        }

        // Yıl aralığı filtresi
        if (filters.yearFrom) {
            query.andWhere('book.publishedYear >= :yearFrom', { yearFrom: filters.yearFrom });
        }
        if (filters.yearTo) {
            query.andWhere('book.publishedYear <= :yearTo', { yearTo: filters.yearTo });
        }

        // Arama filtresi
        if (filters.search) {
            query.andWhere('(book.title LIKE :search OR book.isbn LIKE :search OR author.name LIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        const books = await query.orderBy('book.createdAt', 'DESC').getMany();

        // Minimum puan filtresi (read_books tablosundan hesaplanacak)
        if (filters.minRating) {
            // Bu kısım için ayrı bir sorgu yapacağız
            const booksWithRating = await this.getBooksWithRatings(books, filters.minRating);
            return booksWithRating;
        }

        return books;
    }

    // Kitapların ortalama puanlarını hesapla ve filtrele
    private async getBooksWithRatings(books: Book[], minRating: number): Promise<Book[]> {
        const bookIds = books.map(b => b.id);

        if (bookIds.length === 0) return [];

        const ratingsQuery = await this.booksRepository.manager
            .createQueryBuilder()
            .select('rb.bookId', 'bookId')
            .addSelect('AVG(rb.rating)', 'avgRating')
            .from('read_books', 'rb')
            .where('rb.bookId IN (:...bookIds)', { bookIds })
            .andWhere('rb.rating IS NOT NULL')
            .groupBy('rb.bookId')
            .having('AVG(rb.rating) >= :minRating', { minRating })
            .getRawMany();

        const validBookIds = ratingsQuery.map(r => r.bookId);

        return books.filter(book => validBookIds.includes(book.id));
    }

    async create(createBookDto: CreateBookDto): Promise<Book> {
        const { categoryIds, ...bookData } = createBookDto;

        const book = this.booksRepository.create(bookData);

        if (categoryIds && categoryIds.length > 0) {
            const categories = await this.categoriesRepository.findBy({
                id: In(categoryIds),
            });
            book.categories = categories;
        }

        return this.booksRepository.save(book);
    }

    async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
        const book = await this.findOne(id);
        const { categoryIds, ...bookData } = updateBookDto;

        Object.assign(book, bookData);

        if (categoryIds) {
            const categories = await this.categoriesRepository.findBy({
                id: In(categoryIds),
            });
            book.categories = categories;
        }

        return this.booksRepository.save(book);
    }

    async remove(id: number): Promise<void> {
        const book = await this.findOne(id);
        await this.booksRepository.remove(book);
    }

    // İstatistikler için metodlar
    // İstatistikler için metodlar
    async getStats(): Promise<{
        totalBooks: number;
        totalAuthors: number;
        totalCategories: number;
        mostReadBooks: any[];
        topRatedBooks: any[];
        mostFavoritedBooks: any[];
        recentBooks: any[];
        categoryStats: any[];
    }> {
        const totalBooks = await this.booksRepository.count();

        // En çok okunan kitaplar
        const mostReadBooks = await this.booksRepository.manager
            .createQueryBuilder()
            .select('book.id', 'id')
            .addSelect('book.title', 'title')
            .addSelect('book.coverImage', 'coverImage')
            .addSelect('author.name', 'authorName')
            .addSelect('COUNT(rb.id)', 'readCount')
            .from('books', 'book')
            .leftJoin('authors', 'author', 'book.authorId = author.id')
            .leftJoin('read_books', 'rb', 'book.id = rb.bookId')
            .groupBy('book.id')
            .addGroupBy('book.title')
            .addGroupBy('book.coverImage')
            .addGroupBy('author.name')
            .having('COUNT(rb.id) > 0')
            .orderBy('COUNT(rb.id)', 'DESC')
            .limit(10)
            .getRawMany();

        // En yüksek puanlı kitaplar
        const topRatedBooks = await this.booksRepository.manager
            .createQueryBuilder()
            .select('book.id', 'id')
            .addSelect('book.title', 'title')
            .addSelect('book.coverImage', 'coverImage')
            .addSelect('author.name', 'authorName')
            .addSelect('ROUND(AVG(rb.rating)::numeric, 1)', 'avgRating')
            .addSelect('COUNT(rb.rating)', 'ratingCount')
            .from('books', 'book')
            .leftJoin('authors', 'author', 'book.authorId = author.id')
            .leftJoin('read_books', 'rb', 'book.id = rb.bookId')
            .where('rb.rating IS NOT NULL')
            .groupBy('book.id')
            .addGroupBy('book.title')
            .addGroupBy('book.coverImage')
            .addGroupBy('author.name')
            .having('COUNT(rb.rating) >= 1')
            .orderBy('AVG(rb.rating)', 'DESC')
            .addOrderBy('COUNT(rb.rating)', 'DESC')
            .limit(10)
            .getRawMany();

        // En çok favorilenen kitaplar
        const mostFavoritedBooks = await this.booksRepository.manager
            .createQueryBuilder()
            .select('book.id', 'id')
            .addSelect('book.title', 'title')
            .addSelect('book.coverImage', 'coverImage')
            .addSelect('author.name', 'authorName')
            .addSelect('COUNT(fav.id)', 'favoriteCount')
            .from('books', 'book')
            .leftJoin('authors', 'author', 'book.authorId = author.id')
            .leftJoin('favorites', 'fav', 'book.id = fav.bookId')
            .groupBy('book.id')
            .addGroupBy('book.title')
            .addGroupBy('book.coverImage')
            .addGroupBy('author.name')
            .having('COUNT(fav.id) > 0')
            .orderBy('COUNT(fav.id)', 'DESC')
            .limit(10)
            .getRawMany();

        // Son eklenen kitaplar
        const recentBooks = await this.booksRepository.find({
            relations: ['author'],
            order: { createdAt: 'DESC' },
            take: 10,
        });

        // Kategori istatistikleri
        const categoryStats = await this.booksRepository.manager
            .createQueryBuilder()
            .select('category.id', 'id')
            .addSelect('category.name', 'name')
            .addSelect('COUNT(bc.bookId)', 'bookCount')
            .from('categories', 'category')
            .leftJoin('book_categories', 'bc', 'category.id = bc.categoryId')
            .groupBy('category.id')
            .addGroupBy('category.name')
            .orderBy('COUNT(bc.bookId)', 'DESC')
            .getRawMany();

        return {
            totalBooks,
            totalAuthors: 0,
            totalCategories: 0,
            mostReadBooks,
            topRatedBooks,
            mostFavoritedBooks,
            recentBooks: recentBooks.map(b => ({
                id: b.id,
                title: b.title,
                coverImage: b.coverImage,
                authorName: b.author?.name,
                createdAt: b.createdAt,
            })),
            categoryStats,
        };
    }
}
