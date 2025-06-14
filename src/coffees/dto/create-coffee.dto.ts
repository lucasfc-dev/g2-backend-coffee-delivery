import { IsUrl,IsNotEmpty,MinLength, isNotEmpty, minLength, MaxLength, IsPositive, IsDecimal, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoffeeDto {
  // não pode ser vazio
  @IsNotEmpty()
  name: string;

  // mínimo de 10 e máximo de 200 caracteres
  @MinLength(10)
  @MaxLength(200)
  description: string;

  // número positivo com até 2 casas decimais
  @IsPositive()
  @IsDecimal(
    { force_decimal: true, decimal_digits: '2' }
  ) 
  @Type(() => Number)
  price: number;

  @IsUrl()
  imageUrl: string;

  // deve ser uma URL válida
  @ArrayNotEmpty()
  tagIds: string[];
} 