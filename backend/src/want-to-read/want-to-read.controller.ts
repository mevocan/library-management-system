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
import { WantToReadService } from './want-to-read.service';
import { CreateWantToReadDto } from './dto/create-want-to-read.dto';
import { UpdateWantToReadDto } from './dto/update-want-to-read.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('want-to-read')
@UseGuards(JwtAuthGuard)
export class WantToReadController {
    constructor(private wantToReadService: WantToReadService) {}

    // Kullanıcının listesi
    @Get()
    getMyList(@Request() req) {
        return this.wantToReadService.getUserList(req.user.id);
    }

    // Sayı
    @Get('count')
    getCount(@Request() req) {
        return this.wantToReadService.getCount(req.user.id);
    }

    // Listede mi?
    @Get('check/:bookId')
    checkInList(@Request() req, @Param('bookId') bookId: string) {
        return this.wantToReadService.isInList(req.user.id, +bookId);
    }

    // Ekle
    @Post()
    addToList(@Request() req, @Body() createDto: CreateWantToReadDto) {
        return this.wantToReadService.addToList(req.user.id, createDto);
    }

    // Güncelle
    @Put(':bookId')
    update(
        @Request() req,
        @Param('bookId') bookId: string,
        @Body() updateDto: UpdateWantToReadDto,
    ) {
        return this.wantToReadService.update(req.user.id, +bookId, updateDto);
    }

    // Çıkar
    @Delete(':bookId')
    removeFromList(@Request() req, @Param('bookId') bookId: string) {
        return this.wantToReadService.removeFromList(req.user.id, +bookId);
    }
}
