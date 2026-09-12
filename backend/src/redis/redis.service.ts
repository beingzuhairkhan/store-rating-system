import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private logger = new Logger('Redis');
  private readonly PREFIX = 'blacklist:';

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    const url = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(url);
    this.redis.on('connect', () => this.logger.log('Connected to Redis'));
    this.redis.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
  }

  onModuleDestroy() {
    if (this.redis) this.redis.disconnect();
  }

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const key = this.PREFIX + token;
    await this.redis.set(key, 'revoked', 'EX', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(this.PREFIX + token);
    return result !== null;
  }

  getClient(): Redis {
    return this.redis;
  }
}
