import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        address: dto.address,
        role: Role.USER,
      },
      select: this.userSelect(),
    });

    return { message: 'User registered successfully', data: user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);
    return { message: 'Login successful', data: { token, user } };
  }

  async logout(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const expiresIn = this.getTokenExpirySeconds(payload);
      await this.redisService.blacklistToken(token, expiresIn);
      return { message: 'Logout successful', data: null };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordValid) throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully', data: null };
  }

  private getTokenExpirySeconds(payload: Record<string, unknown>): number {
    const exp = payload.exp as number;
    if (!exp) {
      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1h';
      return this.parseExpiryToSeconds(expiresIn);
    }
    return Math.max(exp - Math.floor(Date.now() / 1000), 0);
  }

  private parseExpiryToSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] || 3600);
  }

  userSelect() {
    return {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  async health() {
    let postgres = 'ok';
    let redis = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      postgres = 'error';
    }

    try {
      await this.redisService.getClient().ping();
    } catch {
      redis = 'error';
    }

    return {
      postgres,
      redis,
      status:
        postgres === 'ok' && redis === 'ok'
          ? 'ok'
          : 'error',
    };
  }

}
