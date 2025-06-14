import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CoffeeResponseDto } from './dto/coffee-response.dto';

@Injectable()
export class CoffeesService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<CoffeeResponseDto[]> {
    const coffees = await this.prisma.coffee.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    }));
  }

  async findOne(id: string): Promise<CoffeeResponseDto> {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${id} not found`);
    }

    return {
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    };
  }

  async create(createCoffeeDto: CreateCoffeeDto) {

    const coffee = createCoffeeDto
    const tags = this.prisma.tag.findMany({
      where: {
        id: { in: coffee.tagIds }
      }
    })

    return this.prisma.coffee.create({
      data: {
        name: coffee.name,
        description: coffee.description,
        price: coffee.price,
        imageUrl: coffee.imageUrl,
        tags: {
          create: coffee.tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // Verifica se o café existe
    const coffeeExists = await this.prisma.coffee.findUnique({
      where: { id },
    });

    if (!coffeeExists) {
      throw new Error('Café não encontrado');
    }

    const updateData: any = {
      name: updateCoffeeDto.name,
      description: updateCoffeeDto.description,
      price: updateCoffeeDto.price,
      imageUrl: updateCoffeeDto.imageUrl,
    };

    if (updateCoffeeDto.tagIds?.length) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: updateCoffeeDto.tagIds } },
      });

      if (tags.length !== updateCoffeeDto.tagIds.length) {
        throw new Error('Uma ou mais tags fornecidas não existem');
      }

      await this.prisma.coffeeTag.deleteMany({
        where: { coffeeId: id },
      });

      for (const tagId of updateCoffeeDto.tagIds) {
        await this.prisma.coffeeTag.create({
          data: {
            coffeeId: id,
            tagId,
          },
        });
      }
    }

    return this.prisma.coffee.update({
      where: { id },
      data: updateData,
      include: {
        tags: { include: { tag: true } },
      },
    });
  }

  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
    });

    if (!coffee) {
      throw new Error('Café não encontrado');
    }

    await this.prisma.coffeeTag.deleteMany({
      where: { coffeeId: id },
    });

    return this.prisma.coffee.delete({
      where: { id },
    });
  }



  async searchCoffees(params: {
    start_date?: Date;
    end_date?: Date;
    name?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { start_date, end_date, name, tags, limit = 10, offset = 0 } = params;

    // Construir o filtro

    // Filtro por data

    // Filtro por nome

    // Filtro por tags

    // Buscar os cafés com paginação

    // Formatar a resposta
    return {
      data: [],
      pagination: {
        total: [],
        limit,
        offset,
        hasMore: offset,
      },
    };
  }
} 