import { scrapeWebsite } from "@/lib/crawler";
import { analyzeSeoLocally, SeoData } from "@/lib/seo-analyzer";

export async function processWebsiteAction(url: string) {
    try {
        const scrapedData = await scrapeWebsite(url);

        // Directly perform analysis after scraping
        const report = analyzeSeoLocally(scrapedData as SeoData);

        return {
            success: true,
            data: scrapedData,
            report: report
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

