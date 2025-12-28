import { scrapeWebsite } from "@/lib/crawler";
import { analyzeSeoLocally } from "@/lib/seo-analyzer";

export async function processWebsiteAction(url: string) {
    try {
        const scrapedData = await scrapeWebsite(url);

        // Directly perform analysis after scraping
        const report = analyzeSeoLocally(scrapedData as any);

        return {
            success: true,
            data: scrapedData,
            report: report
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

