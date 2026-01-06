import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) {}

    // Kullanıcının bildirimleri
    @Get()
    getMyNotifications(@Request() req) {
        return this.notificationsService.getUserNotifications(req.user.id);
    }

    // Okunmamış sayısı
    @Get('unread-count')
    getUnreadCount(@Request() req) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    // Okundu olarak işaretle
    @Put(':id/read')
    markAsRead(@Request() req, @Param('id') id: string) {
        return this.notificationsService.markAsRead(+id, req.user.id);
    }

    // Tümünü okundu yap
    @Put('read-all')
    markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    // Bildirimi sil
    @Delete(':id')
    delete(@Request() req, @Param('id') id: string) {
        return this.notificationsService.delete(+id, req.user.id);
    }

    // Tümünü sil
    @Delete()
    deleteAll(@Request() req) {
        return this.notificationsService.deleteAll(req.user.id);
    }
}
