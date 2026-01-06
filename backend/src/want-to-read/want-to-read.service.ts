import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WantToRead } from './want-to-read.entity';
import { CreateWantToReadDto } from './dto/create-want-to-read.dto';
import { UpdateWantToReadDto } from './dto/update-want-to-read.dto';

@Injectable()
export class WantToReadService {
    constructor(
        @InjectRepository(WantToRead)
        private wantToReadRepository: Repository<WantToRead>,
    ) {}

    // Kullanıcının okuma listesini getir
    async getUserList(userId: number): Promise<WantToRead[]> {
        return this.wantToReadRepository.find({
            where: { userId },
            relations: ['book', 'book.author', 'book.categories'],
            order: { priority: 'DESC', createdAt: 'DESC' },
        });
    }

    // Listeye ekle
    async addToList(userId: number, createDto: CreateWantToReadDto): Promise<WantToRead> {
        const existing = await this.wantToReadRepository.findOne({
            where: { userId, bookId: createDto.bookId },
        });

        if (existing) {
            throw new ConflictException('Bu kitap zaten okuma listenizde');
        }

        const item = this.wantToReadRepository.create({
            userId,
            bookId: createDto.bookId,
            priority: createDto.priority || 2,
            note: createDto.note,
        });

        return this.wantToReadRepository.save(item);
    }

    // Güncelle
    async update(userId: number, bookId: number, updateDto: UpdateWantToReadDto): Promise<WantToRead> {
        const item = await this.wantToReadRepository.findOne({
            where: { userId, bookId },
        });

        if (!item) {
            throw new NotFoundException('Kayıt bulunamadı');
        }

        if (updateDto.priority !== undefined) item.priority = updateDto.priority;
        if (updateDto.note !== undefined) item.note = updateDto.note;

        return this.wantToReadRepository.save(item);
    }

    // Listeden çıkar
    async removeFromList(userId: number, bookId: number): Promise<void> {
        const item = await this.wantToReadRepository.findOne({
            where: { userId, bookId },
        });

        if (!item) {
            throw new NotFoundException('Kayıt bulunamadı');
        }

        await this.wantToReadRepository.remove(item);
    }

    // Listede mi kontrol et
    async isInList(userId: number, bookId: number): Promise<{ inList: boolean; data: WantToRead | null }> {
        const item = await this.wantToReadRepository.findOne({
            where: { userId, bookId },
        });
        return { inList: !!item, data: item };
    }

    // İstatistik
    async getCount(userId: number): Promise<number> {
        return this.wantToReadRepository.count({ where: { userId } });
    }
}
