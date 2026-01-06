import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadBooksController } from './read-books.controller';
import { ReadBooksService } from './read-books.service';
import { ReadBook } from './read-book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReadBook])],
  controllers: [ReadBooksController],
  providers: [ReadBooksService],
  exports: [ReadBooksService],
})
export class ReadBooksModule {}
