import 'reflect-metadata'
import { config } from 'dotenv'
import * as bcrypt from 'bcryptjs'
import dataSource from '../config/typeorm.datasource'
import { User, UserStatus } from '../modules/users/user.entity'
import { AutoMessageTemplate } from '../modules/auto-messages/auto-message-template.entity'
import { PdfTemplate } from '../modules/settings/pdf-template.entity'
import { Role } from '../common/enums/role.enum'

config()

async function seed() {
  await dataSource.initialize()
  const users = dataSource.getRepository(User)

  const passwordHash = await bcrypt.hash('Passw0rd!', 10)

  const seedUsers: Partial<User>[] = [
    { name: 'Platform Admin', email: 'admin@alef.dev', passwordHash, role: Role.PLATFORM_ADMIN, status: UserStatus.ACTIVE },
    { name: 'School Admin', email: 'school-admin@alef.dev', passwordHash, role: Role.SCHOOL_ADMIN, status: UserStatus.ACTIVE },
    { name: 'Teacher', email: 'teacher@alef.dev', passwordHash, role: Role.TEACHER, status: UserStatus.ACTIVE },
    { name: 'Support Agent', email: 'support@alef.dev', passwordHash, role: Role.SUPPORT_AGENT, status: UserStatus.ACTIVE },
    { name: 'Student', email: 'student@alef.dev', phone: '+966500000001', role: Role.STUDENT, status: UserStatus.ACTIVE },
    { name: 'Parent', email: 'parent@alef.dev', phone: '+966500000002', role: Role.PARENT, status: UserStatus.ACTIVE },
  ]

  for (const seedUser of seedUsers) {
    const exists = await users.exists({ where: { email: seedUser.email! } })
    if (!exists) {
      await users.save(users.create(seedUser))
      // eslint-disable-next-line no-console
      console.log(`Seeded ${seedUser.role}: ${seedUser.email ?? seedUser.phone}`)
    }
  }

  const templates = dataSource.getRepository(AutoMessageTemplate)
  const seedTemplates: Partial<AutoMessageTemplate>[] = [
    {
      name: 'تهنئة تقييم مرتفع',
      channel: 'إيميل + داخلي',
      enabled: true,
      body: 'مرحبًا {اسم_الطالب}، حصلت على {الدرجة} في آخر تقييم! استمر بهذا التميز.',
    },
    {
      name: 'تنبيه قبل لقاء',
      channel: 'SMS',
      enabled: true,
      body: 'تذكير: لديك لقاء {اسم_الفصل} خلال ساعة.',
    },
    {
      name: 'تذكير بواجب',
      channel: 'داخلي',
      enabled: true,
      body: 'لديك واجب مستحق قريبًا في {اسم_الفصل} — لا تنسَ تسليمه.',
    },
    {
      name: 'تقرير جاهز',
      channel: 'إيميل',
      enabled: false,
      body: 'تقرير أداء {اسم_الطالب} الشهري جاهز للاطلاع.',
    },
  ]
  for (const t of seedTemplates) {
    const exists = await templates.exists({ where: { name: t.name } })
    if (!exists) {
      await templates.save(templates.create(t))
      // eslint-disable-next-line no-console
      console.log(`Seeded auto-message template: ${t.name}`)
    }
  }

  const pdfTemplates = dataSource.getRepository(PdfTemplate)
  const seedPdfTemplates = ['قالب التقرير الشهري', 'شهادة إتمام برنامج', 'تقرير أداء الفصل']
  for (const name of seedPdfTemplates) {
    const exists = await pdfTemplates.exists({ where: { name } })
    if (!exists) {
      await pdfTemplates.save(pdfTemplates.create({ name, storageUrl: null }))
      // eslint-disable-next-line no-console
      console.log(`Seeded PDF template: ${name}`)
    }
  }

  await dataSource.destroy()
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
