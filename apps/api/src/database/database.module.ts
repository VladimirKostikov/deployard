import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { authEntities } from './auth-entities';
import { buildDatabaseOptions, resolveMigrationRun } from './database-options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const synchronize = configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';
        const migrationsRun = resolveMigrationRun(
          synchronize,
          configService.get<string>('DB_MIGRATE'),
        );

        return buildDatabaseOptions({
          databaseUrl: configService.get<string>('DATABASE_URL'),
          synchronize,
          migrationsRun,
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
          entities: authEntities,
        });
      },
    }),
  ],
})
export class DatabaseModule {}
