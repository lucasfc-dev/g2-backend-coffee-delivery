import { Coffee as PrismaCoffee } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Coffee implements PrismaCoffee {
  id: string;
  name: string;
  description: string;
  price: Decimal;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos adicionais não presentes no modelo Prisma
  tags: { id: string; name: string }[];
} 