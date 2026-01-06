import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Book } from '../books/book.entity';

@Entity('read_books')
@Unique(['userId', 'bookId'])
export class ReadBook {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Book, { eager: true })
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: number;

    // Puan (1-5 yıldız)
    @Column({ type: 'int', nullable: true })
    rating: number;

    // Yorum/Not
    @Column({ type: 'text', nullable: true })
    review: string;

    // Okuma tarihi
    @Column({ type: 'date', nullable: true })
    readDate: Date;

    @CreateDateColumn()
    createdAt: Date;
}
