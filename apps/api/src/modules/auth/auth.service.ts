import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { ApiErrorCode, AuthUser } from '@dpd/shared';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { TokenRevocationService } from './token-revocation.service';

export interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenRevocation: TokenRevocationService,
  ) {}

  async login(dto: LoginDto): Promise<{ user: AuthUser; accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw this.unauthorized('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw this.unauthorized('Invalid email or password');
    }

    const authUser = this.usersService.toAuthUser(user);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
    } satisfies JwtPayload);

    return { user: authUser, accessToken };
  }

  async validatePayload(payload: JwtPayload): Promise<AuthUser> {
    if (await this.tokenRevocation.isRevoked(payload.jti)) {
      throw this.unauthorized('Session expired');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw this.unauthorized('Session expired');
    }

    return this.usersService.toAuthUser(user);
  }

  async revokeAccessToken(token: string | undefined) {
    if (!token) {
      return;
    }

    await this.tokenRevocation.revokeToken(token, this.jwtService);
  }

  private unauthorized(message: string) {
    return new UnauthorizedException({ code: ApiErrorCode.UNAUTHORIZED, message });
  }
}
