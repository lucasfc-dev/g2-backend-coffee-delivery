import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string) {
    // Se userId for fornecido, buscar carrinho existente ou criar novo
    if (userId) {
      const existingCart = await this.prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      if (existingCart) {
        return existingCart;
      }
    }
    // Criar novo carrinho

    return this.prisma.cart.create({
      data: {
        userId: userId || null,
      },
    });
  }

  async getCart(cartId: string) {
    return this.prisma.cart.findUnique({
      where:{
        id:cartId
      }
    })
  }

  async addItem(cartId: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    // Verificar se o café existe
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartId,coffeeId:coffeeId },
    });

    if (cartItem) {
      throw new NotFoundException(`Café com ID ${coffeeId} já está no carrinho`);
    }

    const cartItems = this.prisma.cartItem.findMany({
      where:{
        cartId:cartId
      }
    })
    if((await cartItems).length==5){
      throw new HttpException('Limites de itens atingido',400)
    }
    
    const coffee = await this.prisma.coffee.findUnique({
      where:{
        id:coffeeId
      }
    })
    if(!coffee){
      throw new HttpException('Café não existe',404)
    }

    const item = this.prisma.cartItem.create({
      data:{
        coffeeId:coffeeId,
        quantity:quantity,
        cartId:cartId,
        unitPrice:coffee.price
      }
    })

    return item
  }

  async updateItem(cartId: string, itemId: string, updateItemDto: UpdateItemDto) {
    // Verificar se o item existe no carrinho
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart ${cartId}`);
    }
    return this.prisma.cartItem.update({
      where:{
        id:itemId
      },
      data:{
        quantity:updateItemDto.quantity
      }

    })

    
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Coffee with ID ${itemId} not found`);
    }

    const cartItems = this.prisma.cartItem.findMany({
      where:{
        cartId:cartId
      }
    })
    if((await cartItems).length==1){
      throw new HttpException('Minimo de itens atingido',400)
    }

    await this.prisma.cartItem.delete({
      where: {
        id: itemId
      },
    });
    
    return { success: true };
  }
} 