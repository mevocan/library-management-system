import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
    constructor(private favoritesService: FavoritesService) {}

    // Kullanıcının favorilerini getir
    @Get()
    getUserFavorites(@Request() req) {
        return this.favoritesService.getUserFavorites(req.user.id);
    }

    // Favorilere ekle
    @Post(':bookId')
    addToFavorites(@Request() req, @Param('bookId') bookId: string) {
        return this.favoritesService.addToFavorites(req.user.id, +bookId);
    }

    // Favorilerden çıkar
    @Delete(':bookId')
    removeFromFavorites(@Request() req, @Param('bookId') bookId: string) {
        return this.favoritesService.removeFromFavorites(req.user.id, +bookId);
    }

    // Kitap favorilerde mi?
    @Get('check/:bookId')
    async checkFavorite(@Request() req, @Param('bookId') bookId: string) {
        const isFavorite = await this.favoritesService.isFavorite(req.user.id, +bookId);
        return { isFavorite };
    }
}
