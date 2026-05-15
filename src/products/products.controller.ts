import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get(':marca')
  async findProducts(@Param('marca') marca: string) {
     return this.productsService.findProducts(marca);
  }
}
