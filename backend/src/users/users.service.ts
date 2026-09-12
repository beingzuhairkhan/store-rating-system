import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        address: dto.address,
        role: dto.role,
      },
      select: this.userSelect(),
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }) {
    return this.prisma.user.findMany({
      ...params,
      select: this.userSelect(),
    });
  }

  async count(where?: Record<string, unknown>) {
    return this.prisma.user.count({ where });
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
}
