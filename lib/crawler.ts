import axios from 'axios';
import * as cheerio from 'cheerio';

async function performScrape(url: string) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 5000, // 5 second timeout to prevent hanging
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    const $ = cheerio.load(data);

    // Get basic SEO elements
    const title = $('title').text().trim();
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
      if (!href) return false;
      return href.startsWith('/') || href.startsWith('./') || href.includes(urlObj.hostname);
    }).length;
    const externalLinks = links - internalLinks;

    // Remove noisy elements for content analysis
    $('script, style, nav, footer, noscript, iframe, link').remove();
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') throw new Error('Request timed out. The site might be slow or blocking us.');
      if (error.code === 'ENOTFOUND') throw new Error('Domain not found. Please check the URL spelling.');
      if (error.response?.status === 403) throw new Error('Access forbidden. This site might be blocking automated crawlers.');
      if (error.response?.status === 404) throw new Error('Page not found (404).');
    }
    throw error;
  }
}

export async function scrapeWebsite(url: string) {
  try {
    return await performScrape(url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Only retry with WWW if it's a domain-related error and we haven't tried WWW yet
    try {
      const urlObj = new URL(url);
      const isApex = !urlObj.hostname.startsWith('www.') && (urlObj.hostname.split('.').length === 2 || (urlObj.hostname.split('.').length === 3 && urlObj.hostname.endsWith('.co.uk')));

      if (isApex) {
        const wwwUrl = new URL(url);
        wwwUrl.hostname = `www.${urlObj.hostname}`;
        console.log(`Initial attempt failed, retrying with: ${wwwUrl.toString()}`);
        return await performScrape(wwwUrl.toString());
      }
    } catch (retryError) {
      // If retry logic fails, ignore and throw original error
    }

    console.error('Final scraping error:', errorMessage);
    throw new Error(errorMessage.includes('Network Error') ? `Network error reaching ${url}. Please ensure the URL is correct and public.` : errorMessage);
  }
}
