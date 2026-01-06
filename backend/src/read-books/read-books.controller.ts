import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ReadBooksService } from './read-books.service';
import { CreateReadBookDto } from './dto/create-read-book.dto';
import { UpdateReadBookDto } from './dto/update-read-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('read-books')
export class ReadBooksController {
    constructor(private readBooksService: ReadBooksService) {}

    // Kitabın tüm yorumları (PUBLIC - auth gerekmez)
    @Get('reviews/:bookId')
    getBookReviews(@Param('bookId') bookId: string) {
        return this.readBooksService.getBookReviews(+bookId);
    }

    // Kitabın puanı (PUBLIC)
    @Get('rating/:bookId')
    getBookRating(@Param('bookId') bookId: string) {
        return this.readBooksService.getBookRating(+bookId);
    }

    // === Aşağıdakiler için auth gerekli ===

    // Kullanıcının okuduğu kitaplar
    @Get()
    @UseGuards(JwtAuthGuard)
    getMyReadBooks(@Request() req) {
        return this.readBooksService.getUserReadBooks(req.user.id);
    }

    // İstatistikler
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    getMyStats(@Request() req) {
        return this.readBooksService.getUserStats(req.user.id);
    }

    // Kitap okundu mu?
    @Get('check/:bookId')
    @UseGuards(JwtAuthGuard)
    checkRead(@Request() req, @Param('bookId') bookId: string) {
        return this.readBooksService.isRead(req.user.id, +bookId);
    }

    // Okundu olarak işaretle
    @Post()
    @UseGuards(JwtAuthGuard)
    markAsRead(@Request() req, @Body() createDto: CreateReadBookDto) {
        return this.readBooksService.markAsRead(req.user.id, createDto);
    }

    // Güncelle
    @Put(':bookId')
    @UseGuards(JwtAuthGuard)
    update(
        @Request() req,
        @Param('bookId') bookId: string,
        @Body() updateDto: UpdateReadBookDto,
    ) {
        return this.readBooksService.update(req.user.id, +bookId, updateDto);
    }

    // Kaldır
    @Delete(':bookId')
    @UseGuards(JwtAuthGuard)
    remove(@Request() req, @Param('bookId') bookId: string) {
        return this.readBooksService.removeFromRead(req.user.id, +bookId);
    }
}
