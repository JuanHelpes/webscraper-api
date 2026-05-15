import { Injectable } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Injectable()
export class ProductsService {
    constructor(private readonly scraperService: ScraperService) { }

    async findProducts(marca: string) {
        const products = await this.scraperService.scrapeAllPages();

        return products
            .filter(product =>
                product.name.toLowerCase().includes(marca.toLowerCase())
            )
            .sort((a, b) => a.price - b.price);
    }
}
