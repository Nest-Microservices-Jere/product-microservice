import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotFoundError } from 'rxjs';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({ where: { available: true } });
    const data = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'asc' },
      where: { available: true },
    });
    return {
      data,
      totalPages,
    };
  }

  async findOne(id: number) {
    const data = await this.product.findUnique({
      where: { id, available: true },
    });
    if (!data) {
      throw new NotFoundError('data not found');
    }
    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const { id: idDto, ...data } = updateProductDto;
    await this.product.update({
      where: { id },
      data: data,
    });
    return `This action updates a #${id} product`;
  }

  async remove(id: number) {
    const data: Product = await this.findOne(id);
    //hard delete
    // await this.product.delete({
    //   where: { id },
    // });

    await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
    return `This action update to not available ${data.name} product`;
  }
}
