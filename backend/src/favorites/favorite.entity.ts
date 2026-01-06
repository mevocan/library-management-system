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

@Entity('favorites')
@Unique(['userId', 'bookId'])
export class Favorite {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Book, (book) => book.favorites, { eager: true })
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: number;

    @CreateDateColumn()
    createdAt: Date;
}
