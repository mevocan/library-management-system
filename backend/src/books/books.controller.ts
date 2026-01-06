import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get()
    findAll() {
        return this.booksService.findAll();
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.booksService.search(query);
    }

    // Gelişmiş filtreleme endpoint'i
    @Get('filter')
    filter(
        @Query('categoryId') categoryId?: string,
        @Query('authorId') authorId?: string,
        @Query('yearFrom') yearFrom?: string,
        @Query('yearTo') yearTo?: string,
        @Query('minRating') minRating?: string,
        @Query('search') search?: string,
    ) {
        return this.booksService.filter({
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            authorId: authorId ? parseInt(authorId) : undefined,
            yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
            yearTo: yearTo ? parseInt(yearTo) : undefined,
            minRating: minRating ? parseFloat(minRating) : undefined,
            search: search || undefined,
        });
    }

    // İstatistikler endpoint'i
    @Get('stats')
    getStats() {
        return this.booksService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.booksService.findOne(+id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() createBookDto: CreateBookDto) {
        return this.booksService.create(createBookDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.booksService.update(+id, updateBookDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.booksService.remove(+id);
    }
}
