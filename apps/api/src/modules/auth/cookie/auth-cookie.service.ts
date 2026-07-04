import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';

@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  setAccessToken(response: Response, token: string) {
    const secure = this.configService.get<string>('COOKIE_SECURE', 'false') === 'true';

    response.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: this.getMaxAgeMs(),
    });
  }

  clearAccessToken(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.configService.get<string>('COOKIE_SECURE', 'false') === 'true',
      sameSite: 'lax',
      path: '/',
    });
  }

  private getMaxAgeMs() {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '8h');
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 8 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];

    if (unit === 's') return value * 1000;
    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    return value * 24 * 60 * 60 * 1000;
  }
}
