import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Product {
    name: string;
    price: number;
    description: string;
    reviews: number;
    rating: number;
    link: string;
}

@Injectable()
export class ScraperService {
    private readonly BASE_URL =
        'https://webscraper.io/test-sites/e-commerce/static/computers/laptops';

    async scrapeAllPages(): Promise<Product[]> {
        try {
            const totalPages = await this.getTotalPages();

            const pagePromises = Array.from(
                { length: totalPages },
                (_, index) => this.scrapePage(index + 1),
            );

            const pages = await Promise.all(pagePromises);

            return pages.flat();
        } catch (error) {
            throw new InternalServerErrorException(
                'Error while scraping products',
            );
        }
    }

    private async getTotalPages(): Promise<number> {
        const response = await axios.get(this.BASE_URL);

        const $ = cheerio.load(response.data);

        const pageNumbers: number[] = [];

        $('.pagination li a').each((_, element) => {
            const value = Number($(element).text().trim());

            if (!isNaN(value)) {
                pageNumbers.push(value);
            }
        });

        return Math.max(...pageNumbers);
    }

    private async scrapePage(page: number): Promise<Product[]> {
        const url = `${this.BASE_URL}?page=${page}`;

        const response = await axios.get(url);

        const $ = cheerio.load(response.data);

        const products: Product[] = [];

        $('.thumbnail').each((_, element) => {
            const name = $(element)
                .find('.title')
                .attr('title')
                ?.trim() || '';

            const priceText = $(element)
                .find('.price')
                .text()
                .replace('$', '')
                .trim();

            const description = $(element)
                .find('.description')
                .text()
                .trim();

            const reviews = Number(
                $(element)
                    .find('[itemprop="reviewCount"]')
                    .text()
                    .trim()
            );

            const rating = Number(
                $(element)
                    .find('[data-rating]')
                    .attr('data-rating')
            );

            const relativeLink = $(element)
                .find('.title')
                .attr('href');


            products.push({
                name,
                price: Number(priceText),
                description,
                reviews,
                rating,
                link: `https://webscraper.io${relativeLink}`
            });
        });

        return products;
    }
}