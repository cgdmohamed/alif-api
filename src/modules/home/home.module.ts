import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "../students/student.entity";
import { Meeting } from "../meetings/meeting.entity";
import { Assignment } from "../assignments/assignment.entity";
import { Submission } from "../assignments/submission.entity";
import { Notification } from "../notifications/notification.entity";
import { HomeService } from "./home.service";
import { HomeController } from "./home.controller";
import { User } from "../users/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Meeting,
      Assignment,
      Submission,
      Notification,
      User,
    ]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
