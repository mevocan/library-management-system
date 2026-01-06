import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private favoritesRepository: Repository<Favorite>,
    ) {}

    // Kullanıcının favorilerini getir
    async getUserFavorites(userId: number): Promise<Favorite[]> {
        return this.favoritesRepository.find({
            where: { userId },
            relations: ['book', 'book.author', 'book.categories'],
            order: { createdAt: 'DESC' },
        });
    }

    // Favorilere ekle
    async addToFavorites(userId: number, bookId: number): Promise<Favorite> {
        const existing = await this.favoritesRepository.findOne({
            where: { userId, bookId },
        });

        if (existing) {
            throw new ConflictException('Bu kitap zaten favorilerinizde');
        }

        const favorite = this.favoritesRepository.create({ userId, bookId });
        return this.favoritesRepository.save(favorite);
    }

    // Favorilerden çıkar
    async removeFromFavorites(userId: number, bookId: number): Promise<void> {
        const favorite = await this.favoritesRepository.findOne({
            where: { userId, bookId },
        });

        if (!favorite) {
            throw new NotFoundException('Bu kitap favorilerinizde değil');
        }

        await this.favoritesRepository.remove(favorite);
    }

    // Kitap favorilerde mi kontrol et
    async isFavorite(userId: number, bookId: number): Promise<boolean> {
        const favorite = await this.favoritesRepository.findOne({
            where: { userId, bookId },
        });
        return !!favorite;
    }

    // Kitabın favori sayısı
    async getFavoriteCount(bookId: number): Promise<number> {
        return this.favoritesRepository.count({ where: { bookId } });
    }

    // Kitabı favorilerine ekleyen kullanıcıları bul
    async getUsersWhoFavorited(bookId: number): Promise<number[]> {
        const favorites = await this.favoritesRepository.find({
            where: { bookId },
            select: ['userId'],
        });
        return favorites.map(f => f.userId);
    }
}
