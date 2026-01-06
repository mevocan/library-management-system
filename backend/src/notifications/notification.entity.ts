import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NotificationType {
    BORROW_APPROVED = 'borrow_approved',       // Ödünç talebi onaylandı
    BORROW_REJECTED = 'borrow_rejected',       // Ödünç talebi reddedildi
    BORROW_REMINDER = 'borrow_reminder',       // İade tarihi yaklaşıyor
    BOOK_AVAILABLE = 'book_available',         // Favori kitap müsait oldu
    BOOK_RETURNED = 'book_returned',           // Kitap iade edildi
    SYSTEM = 'system',                         // Sistem bildirimi
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.SYSTEM,
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ nullable: true })
    link: string;

    @Column({ nullable: true })
    bookId: number;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
