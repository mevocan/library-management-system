import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
    ) {}

    // Bildirim oluştur
    async create(data: {
        userId: number;
        type: NotificationType;
        title: string;
        message: string;
        link?: string;
        bookId?: number;
    }): Promise<Notification> {
        const notification = this.notificationsRepository.create(data);
        return this.notificationsRepository.save(notification);
    }

    // Kullanıcının bildirimlerini getir
    async getUserNotifications(userId: number): Promise<Notification[]> {
        return this.notificationsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    // Okunmamış bildirim sayısı
    async getUnreadCount(userId: number): Promise<number> {
        return this.notificationsRepository.count({
            where: { userId, isRead: false },
        });
    }

    // Bildirimi okundu olarak işaretle
    async markAsRead(id: number, userId: number): Promise<Notification> {
        const notification = await this.notificationsRepository.findOne({
            where: { id, userId },
        });

        if (!notification) {
            throw new NotFoundException('Bildirim bulunamadı');
        }

        notification.isRead = true;
        return this.notificationsRepository.save(notification);
    }

    // Tüm bildirimleri okundu olarak işaretle
    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationsRepository.update(
            { userId, isRead: false },
            { isRead: true },
        );
    }

    // Bildirimi sil
    async delete(id: number, userId: number): Promise<void> {
        const notification = await this.notificationsRepository.findOne({
            where: { id, userId },
        });

        if (!notification) {
            throw new NotFoundException('Bildirim bulunamadı');
        }

        await this.notificationsRepository.remove(notification);
    }

    // Tüm bildirimleri sil
    async deleteAll(userId: number): Promise<void> {
        await this.notificationsRepository.delete({ userId });
    }

    // === Hazır Bildirim Metodları ===

    // Ödünç talebi onaylandı
    async notifyBorrowApproved(userId: number, bookTitle: string, bookId: number): Promise<Notification> {
        return this.create({
            userId,
            type: NotificationType.BORROW_APPROVED,
            title: '✅ Ödünç Talebiniz Onaylandı',
            message: `"${bookTitle}" kitabı için ödünç alma talebiniz onaylandı. Kitabı teslim alabilirsiniz.`,
            link: `/books/${bookId}`,
            bookId,
        });
    }

    // Ödünç talebi reddedildi
    async notifyBorrowRejected(userId: number, bookTitle: string, bookId: number, reason?: string): Promise<Notification> {
        return this.create({
            userId,
            type: NotificationType.BORROW_REJECTED,
            title: '❌ Ödünç Talebiniz Reddedildi',
            message: `"${bookTitle}" kitabı için ödünç alma talebiniz reddedildi.${reason ? ` Sebep: ${reason}` : ''}`,
            link: `/books/${bookId}`,
            bookId,
        });
    }

    // Kitap iade edildi
    async notifyBookReturned(userId: number, bookTitle: string, bookId: number): Promise<Notification> {
        return this.create({
            userId,
            type: NotificationType.BOOK_RETURNED,
            title: '📚 Kitap İade Edildi',
            message: `"${bookTitle}" kitabını başarıyla iade ettiniz. Teşekkür ederiz!`,
            link: `/books/${bookId}`,
            bookId,
        });
    }

    // Favori kitap müsait oldu (toplu bildirim için)
    async notifyBookAvailable(userIds: number[], bookTitle: string, bookId: number): Promise<void> {
        const notifications = userIds.map(userId => ({
            userId,
            type: NotificationType.BOOK_AVAILABLE,
            title: '📗 Favori Kitabınız Müsait!',
            message: `Favorilerinizde bulunan "${bookTitle}" kitabı artık müsait. Hemen ödünç alabilirsiniz!`,
            link: `/books/${bookId}`,
            bookId,
        }));

        await this.notificationsRepository.save(notifications);
    }
}
