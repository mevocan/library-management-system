import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Author } from '../authors/author.entity';
import { Category } from '../categories/category.entity';
import { Favorite } from '../favorites/favorite.entity';
import { Borrowing } from '../borrowings/borrowing.entity';

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ unique: true })
    isbn: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    publishedYear: number;

    // 📸 Kapak Fotoğrafı URL'i
    @Column({ nullable: true })
    coverImage: string;

    // 📚 Toplam kopya sayısı
    @Column({ default: 1 })
    totalCopies: number;

    @CreateDateColumn()
    createdAt: Date;

    // Yazar ilişkisi
    @ManyToOne(() => Author, (author) => author.books, { eager: true })
    @JoinColumn({ name: 'authorId' })
    author: Author;

    @Column()
    authorId: number;

    // Kategori ilişkisi
    @ManyToMany(() => Category, (category) => category.books, { eager: true })
    @JoinTable({
        name: 'book_categories',
        joinColumn: { name: 'bookId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    })
    categories: Category[];

    // Favoriler ilişkisi
    @OneToMany(() => Favorite, (favorite) => favorite.book)
    favorites: Favorite[];

    // Ödünç alma ilişkisi
    @OneToMany(() => Borrowing, (borrowing) => borrowing.book)
    borrowings: Borrowing[];
}
