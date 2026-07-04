import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RevokedTokens1741046500000 implements MigrationInterface {
  name = 'RevokedTokens1741046500000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "revoked_tokens" (
        "jti" character varying(64) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_revoked_tokens_jti" PRIMARY KEY ("jti")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_revoked_tokens_expires_at" ON "revoked_tokens" ("expires_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_revoked_tokens_expires_at"`);
    await queryRunner.query(`DROP TABLE "revoked_tokens"`);
  }
}
