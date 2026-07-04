import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthUser } from '@dpd/shared';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCookieService, ACCESS_TOKEN_COOKIE } from './cookie/auth-cookie.service';
import { CurrentUser, Public } from './decorators/auth.decorators';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    this.authCookieService.setAccessToken(response, result.accessToken);
    return { user: result.user };
  }

  @Public()
  @SkipThrottle()
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.revokeAccessToken(request.cookies?.[ACCESS_TOKEN_COOKIE]);
    this.authCookieService.clearAccessToken(response);
    return { ok: true };
  }

  @SkipThrottle()
  @Get('me')
  @ApiOkResponse({ description: 'Current authenticated user' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
