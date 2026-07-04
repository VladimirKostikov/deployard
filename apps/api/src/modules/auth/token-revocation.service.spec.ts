import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { TokenRevocationService } from './token-revocation.service';
import type { RevokedTokenEntity } from './entities/revoked-token.entity';
import type { Repository } from 'typeorm';

describe('TokenRevocationService', () => {
  let service: TokenRevocationService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      findOne: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    service = new TokenRevocationService(repository as unknown as Repository<RevokedTokenEntity>);
  });

  it('returns false for empty jti', async () => {
    await expect(service.isRevoked(undefined)).resolves.toBe(false);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('returns true when jti exists in storage', async () => {
    repository.findOne.mockResolvedValue({ jti: 'token-1' });

    await expect(service.isRevoked('token-1')).resolves.toBe(true);
  });

  it('persists revoked token with expiry', async () => {
    const expiresAt = Date.now() + 60_000;

    await service.revoke('token-2', expiresAt);

    expect(repository.save).toHaveBeenCalledWith({
      jti: 'token-2',
      expiresAt: new Date(expiresAt),
    });
    expect(repository.delete).toHaveBeenCalled();
  });

  it('revokes token from jwt payload', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({ jti: 'token-3', exp: 1_900_000_000 }),
    } as unknown as JwtService;

    await service.revokeToken('signed-token', jwtService);

    expect(repository.save).toHaveBeenCalledWith({
      jti: 'token-3',
      expiresAt: new Date(1_900_000_000_000),
    });
  });
});
