import { MigrationInterface, QueryRunner } from "typeorm";

export class OtpEmail1788861172971 implements MigrationInterface {
    name = 'OtpEmail1788861172971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp_codes" RENAME COLUMN "phone" TO "email"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp_codes" RENAME COLUMN "email" TO "phone"`);
    }

}
