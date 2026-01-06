import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WantToReadController } from './want-to-read.controller';
import { WantToReadService } from './want-to-read.service';
import { WantToRead } from './want-to-read.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WantToRead])],
  controllers: [WantToReadController],
  providers: [WantToReadService],
  exports: [WantToReadService],
})
export class WantToReadModule {}
