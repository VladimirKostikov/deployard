import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AccessLevel, AppSection, SectionAccess } from '@dpd/shared';
import { PermissionEntity, RoleEntity, UserEntity } from '../entities/user.entity';

const LEGACY_ACTIONS = new Set([
  'view',
  'logs',
  'rollback',
  'scale',
  'exec',
  'manage_users',
  'manage_namespaces',
  'create',
  'delete',
  'update_image',
  'manage_ingress',
]);

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureLegacyEmailDomain();

    const shouldSeed = this.configService.get<string>('DB_SEED', 'true') === 'true';
    if (!shouldSeed) {
      return;
    }

    const existing = await this.usersRepository.count();
    if (existing > 0) {
      await this.ensureAccessModel();
      return;
    }

    await this.seed();
  }

  private async ensureLegacyEmailDomain() {
    const legacyUsers = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :domain', { domain: '%@kdd.local' })
      .getMany();

    for (const user of legacyUsers) {
      const previousEmail = user.email;
      const nextEmail = previousEmail.replace(/@kdd\.local$/, '@dpd.local');
      const conflict = await this.usersRepository.findOne({ where: { email: nextEmail } });

      if (conflict) {
        continue;
      }

      user.email = nextEmail;
      await this.usersRepository.save(user);
      this.logger.log(`Migrated user email ${previousEmail} -> ${nextEmail}`);
    }
  }

  private async ensureAccessModel() {
    const permissions = await this.permissionsRepository.find();
    const isLegacy =
      permissions.length === 0 ||
      permissions.some(
        (permission) =>
          !permission.level ||
          LEGACY_ACTIONS.has(permission.section) ||
          !Object.values(AppSection).includes(permission.section as AppSection),
      );

    if (!isLegacy) {
      return;
    }

    this.logger.log('Migrating permissions to section access model...');

    const roles = await this.rolesRepository.find({ relations: { permissions: true } });
    for (const role of roles) {
      role.permissions = [];
      await this.rolesRepository.save(role);
    }

    if (permissions.length > 0) {
      await this.permissionsRepository
        .createQueryBuilder()
        .delete()
        .from(PermissionEntity)
        .execute();
    }

    for (const role of roles) {
      const access = role.name === 'admin' ? this.adminAccess() : this.demoUserAccess();
      role.permissions = await this.permissionsRepository.save(
        access.map((grant) => this.buildPermission(grant)),
      );
      await this.rolesRepository.save(role);
    }

    this.logger.log('Permission migration complete');
  }

  async seed() {
    this.logger.log('Seeding database...');

    const adminPermissions = await this.permissionsRepository.save(
      this.adminAccess().map((grant) => this.buildPermission(grant)),
    );

    const userPermissions = await this.permissionsRepository.save(
      this.demoUserAccess().map((grant) => this.buildPermission(grant)),
    );

    const adminRole = await this.rolesRepository.save({
      name: 'admin',
      permissions: adminPermissions,
    });

    const userRole = await this.rolesRepository.save({
      name: 'user',
      permissions: userPermissions,
    });

    const adminPassword = this.configService.get<string>('SEED_ADMIN_PASSWORD', 'Admin123!');
    const userPassword = this.configService.get<string>('SEED_USER_PASSWORD', 'User123!');

    await this.usersRepository.save([
      {
        email: 'admin@dpd.local',
        displayName: 'Admin',
        passwordHash: await bcrypt.hash(adminPassword, 12),
        isActive: true,
        roles: [adminRole],
      },
      {
        email: 'user@dpd.local',
        displayName: 'Demo User',
        passwordHash: await bcrypt.hash(userPassword, 12),
        isActive: true,
        roles: [userRole],
      },
    ]);

    this.logger.log('Seed complete: admin@dpd.local, user@dpd.local');
  }

  private adminAccess(): SectionAccess[] {
    return [
      { section: AppSection.DEPLOYMENTS, level: AccessLevel.MANAGE, namespace: null },
      { section: AppSection.NETWORK, level: AccessLevel.MANAGE, namespace: null },
      { section: AppSection.IMPORT, level: AccessLevel.MANAGE, namespace: null },
      { section: AppSection.NAMESPACES, level: AccessLevel.MANAGE, namespace: null },
      { section: AppSection.METRICS, level: AccessLevel.VIEW, namespace: null },
      { section: AppSection.ADMIN, level: AccessLevel.MANAGE, namespace: null },
    ];
  }

  private demoUserAccess(): SectionAccess[] {
    return [
      { section: AppSection.DEPLOYMENTS, level: AccessLevel.OPERATE, namespace: null },
      { section: AppSection.NETWORK, level: AccessLevel.VIEW, namespace: null },
      { section: AppSection.IMPORT, level: AccessLevel.VIEW, namespace: null },
      { section: AppSection.NAMESPACES, level: AccessLevel.VIEW, namespace: null },
      { section: AppSection.METRICS, level: AccessLevel.VIEW, namespace: null },
    ];
  }

  private buildPermission(grant: SectionAccess) {
    const permission = new PermissionEntity();
    permission.section = grant.section;
    permission.level = grant.level;
    permission.namespace = grant.namespace;
    return permission;
  }
}
