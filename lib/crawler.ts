import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeWebsite(url: string) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    // Get basic SEO elements
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Detailed analysis data
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get();

    const images = $('img').length;
    const imagesWithAlt = $('img[alt]').length;
    const imagesWithoutAlt = images - imagesWithAlt;

    const links = $('a').length;
    const urlObj = new URL(url);
    const internalLinks = $('a').filter((_, el) => {
      const href = $(el).attr('href');
      return !!(href && (href.startsWith('/') || href.includes(urlObj.hostname)));
    }).length;
    const externalLinks = links - internalLinks;

    // Remove noisy elements for content analysis
    $('script, style, nav, footer, noscript').remove();
    let content = $('main').text() || $('article').text() || $('body').text();
    content = content.replace(/\s+/g, ' ').trim();

    return {
      title,
      metaDescription,
      content: content.slice(0, 20000),
      fullTitle: title || url,
      h1s,
      h2s,
      images: {
        total: images,
        withAlt: imagesWithAlt,
        withoutAlt: imagesWithoutAlt
      },
      links: {
        total: links,
        internal: internalLinks,
        external: externalLinks
      },
      url
    };
  } catch (error: any) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

