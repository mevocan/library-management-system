import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('borrowings')
export class BorrowingsController {
    constructor(private borrowingsService: BorrowingsService) {}

    // Ödünç alma talebi oluştur
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() createBorrowingDto: CreateBorrowingDto) {
        return this.borrowingsService.create(req.user.id, createBorrowingDto);
    }

    // Kullanıcının ödünç almalarını getir
    @Get('my')
    @UseGuards(JwtAuthGuard)
    getMyBorrowings(@Request() req) {
        return this.borrowingsService.getUserBorrowings(req.user.id);
    }

    // Tüm ödünç almaları getir (Admin)
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.borrowingsService.findAll();
    }

    // Kitabın müsaitlik durumunu getir
    @Get('availability/:bookId')
    getAvailability(@Param('bookId') bookId: string) {
        return this.borrowingsService.getAvailability(+bookId);
    }

    // Kitabın ödünç alma takvimini getir
    @Get('book/:bookId')
    getBookBorrowings(@Param('bookId') bookId: string) {
        return this.borrowingsService.getBookBorrowings(+bookId);
    }

    // Tek bir ödünç almayı getir
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.borrowingsService.findOne(+id);
    }

    // Durumu güncelle (Admin)
    @Put(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdateBorrowingDto) {
        return this.borrowingsService.updateStatus(+id, updateDto);
    }

    // Talebi iptal et (Kullanıcı)
    @Put(':id/cancel')
    @UseGuards(JwtAuthGuard)
    cancel(@Request() req, @Param('id') id: string) {
        return this.borrowingsService.cancel(+id, req.user.id);
    }
}
