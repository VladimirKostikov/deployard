import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AccessLevel, AppSection, SectionAccess } from '@dpd/shared';
import { authEntities } from '../auth-entities';
import { buildDatabaseOptions, resolveMigrationRun } from '../database-options';
import { loadEnvFile } from '../load-env-file';
import { PermissionEntity, RoleEntity, UserEntity } from '../../modules/users/entities/user.entity';

function adminAccess(): SectionAccess[] {
  return [
    { section: AppSection.DEPLOYMENTS, level: AccessLevel.MANAGE, namespace: null },
    { section: AppSection.NETWORK, level: AccessLevel.MANAGE, namespace: null },
    { section: AppSection.IMPORT, level: AccessLevel.MANAGE, namespace: null },
    { section: AppSection.NAMESPACES, level: AccessLevel.MANAGE, namespace: null },
    { section: AppSection.METRICS, level: AccessLevel.VIEW, namespace: null },
    { section: AppSection.ADMIN, level: AccessLevel.MANAGE, namespace: null },
  ];
}

function buildPermission(grant: SectionAccess) {
  const permission = new PermissionEntity();
  permission.section = grant.section;
  permission.level = grant.level;
  permission.namespace = grant.namespace;
  return permission;
}

async function main() {
  loadEnvFile();

  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME ?? 'Admin';

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  if (!email || !password) {
    throw new Error('Usage: create-admin <email> <password>');
  }

  const dataSource = new DataSource(
    buildDatabaseOptions({
      databaseUrl: process.env.DATABASE_URL,
      synchronize: false,
      migrationsRun: resolveMigrationRun(false, process.env.DB_MIGRATE ?? 'true'),
      logging: process.env.DB_LOGGING === 'true',
      entities: authEntities,
    }),
  );

  await dataSource.initialize();

  const usersRepository = dataSource.getRepository(UserEntity);
  const rolesRepository = dataSource.getRepository(RoleEntity);
  const permissionsRepository = dataSource.getRepository(PermissionEntity);

  const existing = await usersRepository.findOne({ where: { email } });
  if (existing) {
    throw new Error(`User already exists: ${email}`);
  }

  let adminRole = await rolesRepository.findOne({ where: { name: 'admin' }, relations: { permissions: true } });

  if (!adminRole) {
    const permissions = await permissionsRepository.save(
      adminAccess().map((grant) => buildPermission(grant)),
    );

    adminRole = await rolesRepository.save({
      name: 'admin',
      permissions,
    });
  }

  await usersRepository.save({
    email,
    displayName,
    passwordHash: await bcrypt.hash(password, 12),
    isActive: true,
    roles: [adminRole],
  });

  await dataSource.destroy();
  console.log(`Admin user created: ${email}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
