import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthorsModule } from './authors/authors.module';
import { CategoriesModule } from './categories/categories.module';
import { BooksModule } from './books/books.module';
import { AuthModule } from './auth/auth.module';
import { FavoritesModule } from './favorites/favorites.module';
import { BorrowingsModule } from './borrowings/borrowings.module';
import { ReadBooksModule } from './read-books/read-books.module';
import { WantToReadModule } from './want-to-read/want-to-read.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            // Production - Render
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {
            // Development - Local
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'library_db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          }
    ),
    UsersModule,
    AuthorsModule,
    CategoriesModule,
    BooksModule,
    AuthModule,
    FavoritesModule,
    BorrowingsModule,
    ReadBooksModule,
    WantToReadModule,
    NotificationsModule,
  ],
})
export class AppModule {}
