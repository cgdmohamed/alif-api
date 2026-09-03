import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import databaseConfig from './config/typeorm.config'
import { HealthModule } from './modules/health/health.module'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { PackagesModule } from './modules/packages/packages.module'
import { SchoolsModule } from './modules/schools/schools.module'
import { EnrollmentCodesModule } from './modules/enrollment-codes/enrollment-codes.module'
import { ResourcesModule } from './modules/resources/resources.module'
import { ProgramsModule } from './modules/programs/programs.module'
import { ClassesModule } from './modules/classes/classes.module'
import { TeachersModule } from './modules/teachers/teachers.module'
import { StudentsModule } from './modules/students/students.module'
import { MeetingsModule } from './modules/meetings/meetings.module'
import { RecordingsModule } from './modules/recordings/recordings.module'
import { AssignmentsModule } from './modules/assignments/assignments.module'
import { ReportsModule } from './modules/reports/reports.module'
import { AchievementsModule } from './modules/achievements/achievements.module'
import { ContentLibraryModule } from './modules/content-library/content-library.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { SupportModule } from './modules/support/support.module'
import { AutoMessagesModule } from './modules/auto-messages/auto-messages.module'
import { SettingsModule } from './modules/settings/settings.module'
import { HomeModule } from './modules/home/home.module'
import { ActivityLogModule } from './modules/activity-log/activity-log.module'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database')!,
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    PackagesModule,
    SchoolsModule,
    EnrollmentCodesModule,
    ResourcesModule,
    ProgramsModule,
    ClassesModule,
    TeachersModule,
    StudentsModule,
    MeetingsModule,
    RecordingsModule,
    AssignmentsModule,
    ReportsModule,
    AchievementsModule,
    ContentLibraryModule,
    NotificationsModule,
    SupportModule,
    AutoMessagesModule,
    SettingsModule,
    HomeModule,
    ActivityLogModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
