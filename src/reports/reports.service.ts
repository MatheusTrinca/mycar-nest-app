import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './report.entity';
import { User } from 'src/users/user.entity';
import { ApproveReportDto } from './dtos/approve-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async create(reportDto: CreateReportDto, user: User) {
    const report = this.reportsRepository.create(reportDto);

    report.user = user;

    return this.reportsRepository.save(report);
  }

  async changeApproval(id: number, { approved }: ApproveReportDto) {
    const report = await this.reportsRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;

    return this.reportsRepository.save(report);
  }
}
