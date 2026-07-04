import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RevokedTokenEntity } from './entities/revoked-token.entity';

interface RevocablePayload {
  jti?: string;
  exp?: number;
}

@Injectable()
export class TokenRevocationService {
  constructor(
    @InjectRepository(RevokedTokenEntity)
    private readonly revokedTokensRepository: Repository<RevokedTokenEntity>,
  ) {}

  async isRevoked(jti: string | undefined): Promise<boolean> {
    if (!jti) {
      return false;
    }

    await this.cleanupExpired();
    const entry = await this.revokedTokensRepository.findOne({ where: { jti } });
    return Boolean(entry);
  }

  async revoke(jti: string, expiresAtMs: number) {
    await this.revokedTokensRepository.save({
      jti,
      expiresAt: new Date(expiresAtMs),
    });
    await this.cleanupExpired();
  }

  async revokeToken(token: string, jwtService: JwtService) {
    try {
      const payload = await jwtService.verifyAsync<RevocablePayload>(token);
      if (payload.jti && payload.exp) {
        await this.revoke(payload.jti, payload.exp * 1000);
      }
    } catch {
      return;
    }
  }

  private async cleanupExpired() {
    await this.revokedTokensRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
