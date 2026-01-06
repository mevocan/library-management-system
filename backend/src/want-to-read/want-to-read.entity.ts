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

@Entity('want_to_read')
@Unique(['userId', 'bookId'])
export class WantToRead {
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

    // Öncelik seviyesi (1: düşük, 2: orta, 3: yüksek)
    @Column({ type: 'int', default: 2 })
    priority: number;

    // Not
    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;
}
