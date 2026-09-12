import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Don't allow refresh tokens to access protected APIs
      if (payload.type === 'refresh') {
        throw new UnauthorizedException(
          'Refresh token cannot be used as an access token',
        );
      }

      // Check whether access token has been revoked
      const isBlacklisted =
        await this.redisService.isBlacklisted(token);

      if (isBlacklisted) {
        throw new UnauthorizedException(
          'Token has been revoked',
        );
      }

      request.user = payload;
      request.token = token;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        'Invalid or expired token',
      );
    }
  }
}
