import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SongsModule } from './songs/songs.module';
import { SingersModule } from './singers/singers.module';
import { TopicsModule } from './topics/topics.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { FavoritesModule } from './favorites/favorites.module';
import { UploadModule } from './upload/upload.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerConfigModule } from './throttler/throttler.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from './email/mailer.module';
import { ListeningHistoryModule } from './listening-history/listening-history.module';
import { ChartsModule } from './charts/charts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        }),
      }),
    }),
    ThrottlerConfigModule,
    PrismaModule,
    AuthModule,
    UploadModule,
    SongsModule,
    SingersModule,
    TopicsModule,
    PlaylistsModule,
    FavoritesModule,
    UsersModule,
    MailerModule,
    ListeningHistoryModule,
    ChartsModule,
  ],
})
export class AppModule {}
