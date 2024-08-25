import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Product } from './entities/product.entity';
import { RpcException } from '@nestjs/microservices';

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
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Product with id ${id} not found`,
      });
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

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products
  }
}
