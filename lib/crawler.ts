import axios from 'axios';
import * as cheerio from 'cheerio';

async function performScrape(url: string, useMobile = false) {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ];

  const mobileUA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': useMobile ? mobileUA : userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
      maxRedirects: 10,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const $ = cheerio.load(data);

    // Check for common bot protection patterns
    const pageText = $('body').text().toLowerCase();
    if (pageText.includes('cloudflare') && (pageText.includes('checking your browser') || pageText.includes('verify you are human'))) {
      throw new Error('This site is protected by Cloudflare. Automated access is currently restricted.');
    }

    // Get basic SEO elements with fallbacks
    const title = $('title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() || '';

    const metaDescription = $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') || '';

    // Detailed analysis data
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);

    const $images = $('img');
    const images = $images.length;
    let imagesWithAlt = 0;
    $images.each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt && alt.trim().length > 0) {
        imagesWithAlt++;
      }
    });
    const imagesWithoutAlt = images - imagesWithAlt;

    const $links = $('a');
    const links = $links.length;
    const urlObj = new URL(url);
    let internalLinks = 0;

    $links.each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        const linkUrl = new URL(href, url);
        if (linkUrl.hostname === urlObj.hostname || href.startsWith('/') || href.startsWith('./') || href.startsWith('#')) {
          internalLinks++;
        }
      } catch (e) {
        if (href.startsWith('/') || href.startsWith('./') || href.startsWith('#')) {
          internalLinks++;
        }
      }
    });

    const externalLinks = Math.max(0, links - internalLinks);

    // Remove noisy elements for content analysis
    const $clean = cheerio.load(data);
    $clean('script, style, nav, footer, noscript, iframe, link, svg, canvas, header').remove();
    let content = $clean('main').text() || $clean('article').text() || $clean('#content').text() || $clean('body').text();
    content = content.replace(/\s+/g, ' ').trim();

    return {
      title,
      metaDescription,
      content: content.slice(0, 40000),
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
      if (error.code === 'ECONNABORTED') throw new Error('Request timed out. This site might be slow or blocking us.');
      if (error.code === 'ENOTFOUND') throw new Error('Domain not found. Please check the URL.');
      if (error.response?.status === 403) throw new Error('Access forbidden (403). Automated access is restricted by this site.');
      if (error.response?.status === 429) throw new Error('Too many requests. This site has rate-limited our crawler.');
    }
    throw error;
  }
}

export async function scrapeWebsite(url: string) {
  let processedUrl = url.trim();
  if (!processedUrl.startsWith('http')) {
    processedUrl = `https://${processedUrl}`;
  }

  try {
    let result = await performScrape(processedUrl);

    // Fallback: If no title and very little content, try mobile UA which sometimes bypasses simple blocks
    if (!result.title && result.content.length < 500) {
      try {
        const mobileResult = await performScrape(processedUrl, true);
        if (mobileResult.title || mobileResult.content.length > result.content.length) {
          return mobileResult;
        }
      } catch (e) {
        // ignore fallback error and return original result
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Try WWW fallback
    if (errorMessage.includes('not found') || errorMessage.includes('ECONNREFUSED')) {
      try {
        const urlObj = new URL(processedUrl);
        if (!urlObj.hostname.startsWith('www.')) {
          const wwwUrl = new URL(processedUrl);
          wwwUrl.hostname = `www.${urlObj.hostname}`;
          return await performScrape(wwwUrl.toString());
        }
      } catch (e) { }
    }

    throw new Error(errorMessage);
  }
}
