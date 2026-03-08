import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: config.get<number>('THROTTLE_TTL_SHORT', 10000), // 10 seconds
            limit: config.get<number>('THROTTLE_LIMIT_SHORT', 3), // 3 requests
          },
          {
            name: 'medium',
            ttl: config.get<number>('THROTTLE_TTL_MEDIUM', 60000), // 1 minute
            limit: config.get<number>('THROTTLE_LIMIT_MEDIUM', 10), // 10 requests
          },
          {
            name: 'long',
            ttl: config.get<number>('THROTTLE_TTL_LONG', 3600000), // 1 hour
            limit: config.get<number>('THROTTLE_LIMIT_LONG', 100), // 100 requests
          },
        ],
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
