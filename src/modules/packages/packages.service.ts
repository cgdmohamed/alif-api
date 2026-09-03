import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Package } from './package.entity'
import { School } from '../schools/school.entity'
import type { CreatePackageDto } from './dto/create-package.dto'
import type { UpdatePackageDto } from './dto/update-package.dto'

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package) private readonly packagesRepository: Repository<Package>,
    @InjectRepository(School) private readonly schoolsRepository: Repository<School>,
  ) {}

  async findAll() {
    const packages = await this.packagesRepository.find({ order: { price: 'ASC' } })
    return Promise.all(
      packages.map(async (pkg) => ({
        ...pkg,
        subscribedSchools: await this.schoolsRepository.count({ where: { packageId: pkg.id } }),
      })),
    )
  }

  async findOne(id: string) {
    const pkg = await this.packagesRepository.findOne({ where: { id } })
    if (!pkg) throw new NotFoundException('Package not found')
    return pkg
  }

  create(dto: CreatePackageDto) {
    return this.packagesRepository.save(this.packagesRepository.create(dto))
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.findOne(id)
    Object.assign(pkg, dto)
    return this.packagesRepository.save(pkg)
  }

  async remove(id: string) {
    await this.findOne(id)
    const subscribedSchools = await this.schoolsRepository.count({ where: { packageId: id } })
    if (subscribedSchools > 0) {
      throw new BadRequestException(
        `لا يمكن حذف هذه الباقة — ${subscribedSchools} مدرسة مشتركة بها حاليًا`,
      )
    }
    await this.packagesRepository.delete(id)
    return { id }
  }
}
