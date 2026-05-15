import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './products.controller';
import { ScraperService } from './services/scraper.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ScraperService],
})
export class ProductsModule {}
