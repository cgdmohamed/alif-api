import { MigrationInterface, QueryRunner } from 'typeorm'

export class OperationalWorkflows1788890000000 implements MigrationInterface {
  name = 'OperationalWorkflows1788890000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."school_approvals_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    )
    await queryRunner.query(
      `ALTER TABLE "school_approvals" ADD "status" "public"."school_approvals_status_enum" NOT NULL DEFAULT 'pending'`,
    )
    await queryRunner.query(`ALTER TABLE "school_approvals" ADD "reviewedBy" character varying`)
    await queryRunner.query(`ALTER TABLE "school_approvals" ADD "reviewedAt" TIMESTAMP WITH TIME ZONE`)
    await queryRunner.query(
      `DELETE FROM "attendance_records" a USING "attendance_records" b WHERE a.ctid < b.ctid AND a."studentId" = b."studentId" AND a."meetingId" = b."meetingId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "attendance_records" ADD CONSTRAINT "UQ_attendance_student_meeting" UNIQUE ("studentId", "meetingId")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "UQ_attendance_student_meeting"`)
    await queryRunner.query(`ALTER TABLE "school_approvals" DROP COLUMN "reviewedAt"`)
    await queryRunner.query(`ALTER TABLE "school_approvals" DROP COLUMN "reviewedBy"`)
    await queryRunner.query(`ALTER TABLE "school_approvals" DROP COLUMN "status"`)
    await queryRunner.query(`DROP TYPE "public"."school_approvals_status_enum"`)
  }
}
