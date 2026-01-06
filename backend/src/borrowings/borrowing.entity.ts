import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Book } from '../books/book.entity';

// Basitleştirilmiş durum
export enum BorrowingStatus {
    PENDING = 'pending',     // Onay bekliyor
    BORROWED = 'borrowed',   // Ödünç alındı (onaylandı)
    RETURNED = 'returned',   // İade edildi
    CANCELLED = 'cancelled', // İptal/Reddedildi
}

@Entity('borrowings')
export class Borrowing {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Book, (book) => book.borrowings, { eager: true })
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: number;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: BorrowingStatus,
        default: BorrowingStatus.PENDING,
    })
    status: BorrowingStatus;

    @Column({ type: 'text', nullable: true })
    adminNote: string;

    @CreateDateColumn()
    createdAt: Date;
}
