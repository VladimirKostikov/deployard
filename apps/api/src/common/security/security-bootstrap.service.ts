import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolveMigrationRun } from '../../database/database-options';

const WEAK_JWT_SECRETS = new Set([
  'dev-only-change-me',
  'change-me-in-production',
  'change-me',
]);

const WEAK_WEBHOOK_SECRETS = new Set(['dev-deploy-webhook-secret', 'change-me']);

@Injectable()
export class SecurityBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(SecurityBootstrapService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const strict = this.isStrict();

    this.assertSecret('JWT_SECRET', WEAK_JWT_SECRETS, strict);
    this.assertSecret('DEPLOY_WEBHOOK_SECRET', WEAK_WEBHOOK_SECRETS, strict, false);

    if (strict && this.configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true') {
      throw new Error('DB_SYNCHRONIZE must be false when APP_ENV=production');
    }

    if (strict && this.configService.get<string>('DB_SEED', 'false') === 'true') {
      throw new Error('DB_SEED must be false when APP_ENV=production');
    }

    const synchronize = this.configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';
    const migrationsRun = resolveMigrationRun(
      synchronize,
      this.configService.get<string>('DB_MIGRATE'),
    );

    if (strict && synchronize && migrationsRun) {
      throw new Error('DB_SYNCHRONIZE and DB_MIGRATE cannot both be true when APP_ENV=production');
    }

    if (strict && !synchronize && !migrationsRun) {
      throw new Error('DB_MIGRATE must be true when DB_SYNCHRONIZE is false in production');
    }
  }

  isStrict() {
    return this.configService.get<string>('APP_ENV', 'development') === 'production';
  }

  isSwaggerEnabled() {
    const explicit = this.configService.get<string>('SWAGGER_ENABLED');
    if (explicit === 'true') {
      return true;
    }
    if (explicit === 'false') {
      return false;
    }
    return !this.isStrict();
  }

  isMetricsPublic() {
    return this.configService.get<string>('METRICS_PUBLIC', 'false') === 'true';
  }

  private assertSecret(
    key: string,
    weakValues: Set<string>,
    strict: boolean,
    required = true,
  ) {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      if (strict && required) {
        throw new Error(`${key} must be set when APP_ENV=production`);
      }
      return;
    }

    if (weakValues.has(value)) {
      const message = `${key} uses a known weak default value`;
      if (strict) {
        throw new Error(message);
      }
      this.logger.warn(message);
    }
  }
}
