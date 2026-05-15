import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';

import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

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
    private readonly logger = new Logger(ScraperService.name);

    private readonly BASE_URL =
        'https://webscraper.io/test-sites/e-commerce/static/computers/laptops';

    private readonly limit = pLimit(5);

    async scrapeAllPages(): Promise<Product[]> {
        try {
            const totalPages = await this.getTotalPages();

            const promises = Array.from(
                { length: totalPages },
                (_, index) =>
                    this.limit(() =>
                        this.retry(() => this.scrapePage(index + 1)),
                    ),
            );

            const pages = await Promise.all(promises);

            return pages.flat();
        } catch (error) {
            this.logger.error('Error while scraping products', error);

            throw new InternalServerErrorException(
                'Error while scraping products',
            );
        }
    }

    private async getTotalPages(): Promise<number> {
        const response = await axios.get(this.BASE_URL, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        const pageNumbers: number[] = [];

        $('.pagination li a').each((_, element) => {
            const page = Number($(element).text().trim());

            if (!isNaN(page)) {
                pageNumbers.push(page);
            }
        });

        return Math.max(...pageNumbers);
    }

    private async scrapePage(
        page: number,
    ): Promise<Product[]> {
        const url = `${this.BASE_URL}?page=${page}`;

        this.logger.log(`Scraping page ${page}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        const products: Product[] = [];

        $('.card.thumbnail').each((_, element) => {
            const name =
                $(element)
                    .find('.title')
                    .attr('title')
                    ?.trim() || '';

            const price = Number(
                $(element)
                    .find('[itemprop="price"]')
                    .text()
                    .replace('$', '')
                    .trim(),
            );

            const description = $(element)
                .find('.description')
                .text()
                .trim();

            const reviews = Number(
                $(element)
                    .find('[itemprop="reviewCount"]')
                    .text()
                    .trim(),
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
                price,
                description,
                reviews,
                rating,
                link: `https://webscraper.io${relativeLink}`,
            });
        });

        return products;
    }

    private async retry<T>(
        fn: () => Promise<T>,
        retries = 3,
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            this.logger.warn(
                `Request failed. Retries left: ${retries}`,
            );

            if (retries === 0) {
                throw error;
            }

            await this.sleep(1000);

            return this.retry(fn, retries - 1);
        }
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) =>
            setTimeout(resolve, ms),
        );
    }
}