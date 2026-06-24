import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<(User & { role: Role }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true },
    });
    if (!user?.isActive) {
      return null;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return null;
    }
    return user;
  }

  login(user: User & { role: Role }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };
    console.log('AuthService.login - JWT_SECRET:', process.env.JWT_SECRET);
    console.log('AuthService.login - payload:', JSON.stringify(payload));
    const jwtOpts = (this.jwtService as any).options;
    console.log('AuthService.login - jwtOptions keys:', Object.keys(jwtOpts || {}));
    if (jwtOpts) {
      console.log('AuthService.login - jwtOptions.secret:', jwtOpts.secret);
      console.log('AuthService.login - jwtOptions.privateKey:', jwtOpts.privateKey);
    }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
      },
    };
  }

  async validateJwtPayload(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user?.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
