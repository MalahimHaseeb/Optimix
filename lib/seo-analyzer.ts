export interface SeoData {
    title: string;
    metaDescription: string;
    content: string;
    h1s: string[];
    h2s: string[];
    images: {
        total: number;
        withAlt: number;
        withoutAlt: number;
    };
    links: {
        total: number;
        internal: number;
        external: number;
    };
    url: string;
}

export function analyzeSeoLocally(data: SeoData) {
    const recommendations: string[] = [];
    const highImpactKeywords: string[] = [];
    const allKeywords: { word: string; count: number }[] = [];

    // 1. Keyword Extraction (Simple Frequency Analysis)
    const words = data.content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'your', 'their', 'about', 'more', 'when'].includes(word));

    const wordMap: Record<string, number> = {};
    words.forEach(word => {
        wordMap[word] = (wordMap[word] || 0) + 1;
    });

    Object.entries(wordMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .forEach(([word, count]) => {
            allKeywords.push({ word, count });
            if (count > 5) highImpactKeywords.push(word);
        });

    // 2. Ranking Analysis (Rule-based)
    const rankingFactors: { title: string; status: 'good' | 'warning' | 'critical'; desc: string }[] = [];

    // Title check
    if (data.title.length > 30 && data.title.length < 60) {
        rankingFactors.push({ title: 'Title Length', status: 'good', desc: 'Optimal title length for SERP display.' });
    } else {
        rankingFactors.push({ title: 'Title Optimization', status: 'warning', desc: `Current length: ${data.title.length}. Ideal is 50-60 characters.` });
    }

    // H1 check
    if (data.h1s.length === 1) {
        rankingFactors.push({ title: 'H1 Header', status: 'good', desc: 'Exactly one H1 tag found. Perfect for structure.' });
    } else if (data.h1s.length === 0) {
        rankingFactors.push({ title: 'H1 Missing', status: 'critical', desc: 'No H1 tag found. This is a vital SEO factor.' });
    } else {
        rankingFactors.push({ title: 'Multiple H1s', status: 'warning', desc: 'More than one H1 found. Try to have only one main heading.' });
    }

    // Meta Description
    if (data.metaDescription.length > 120) {
        rankingFactors.push({ title: 'Meta Description', status: 'good', desc: 'Detailed description found.' });
    } else if (data.metaDescription.length === 0) {
        rankingFactors.push({ title: 'Meta Tag Missing', status: 'critical', desc: 'No meta description found. Search engines will auto-generate one.' });
    } else {
        rankingFactors.push({ title: 'Meta Length', status: 'warning', desc: 'Meta description is a bit short. Aim for 150-160 characters.' });
    }

    // Images
    if (data.images.withoutAlt > 0) {
        rankingFactors.push({ title: 'Image ALTs', status: 'warning', desc: `${data.images.withoutAlt} images are missing ALT text.` });
        recommendations.push('Add ALT descriptive tags to all images to improve accessibility and image search rankings.');
    } else if (data.images.total > 0) {
        rankingFactors.push({ title: 'Image Alt Tags', status: 'good', desc: 'All images have ALT attributes.' });
    }

    // Links
    if (data.links.internal < 3) {
        recommendations.push('Improve internal linking to help search engines crawl and index your site better.');
    }
    if (data.links.total === 0) {
        rankingFactors.push({ title: 'Link Profile', status: 'warning', desc: 'No links found on the page.' });
    }

    // HTML Generation
    const html = `
    <div class="space-y-8">
      <!-- Ranking Factors -->
      <section class="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
        <h2 class="text-primary font-bold text-xl mb-6">🏆 Ranking Analysis</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${rankingFactors.map(f => `
            <div class="p-4 rounded-xl border ${f.status === 'good' ? 'bg-green-500/5 border-green-500/20' : f.status === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-red-500/5 border-red-500/20'}">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full ${f.status === 'good' ? 'bg-green-500' : f.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}"></span>
                <span class="font-bold text-sm">${f.title}</span>
              </div>
              <p class="text-xs text-muted-foreground">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Keyword Intelligence -->
      <section class="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
        <h2 class="text-primary font-bold text-xl mb-4">🔍 Keyword Intelligence</h2>
        
        <div class="mb-6">
          <h3 class="text-sm font-semibold mb-3 text-foreground/80">High-Impact Keywords (High Frequency)</h3>
          <div class="flex flex-wrap gap-2">
            ${highImpactKeywords.map(k => `<span class="px-3 py-1.5 rounded-full border bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">${k}</span>`).join('')}
            ${highImpactKeywords.length === 0 ? '<p class="text-xs text-muted-foreground">No high-impact keywords detected.</p>' : ''}
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-3 text-foreground/80">All Detected Keywords</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            ${allKeywords.slice(0, 20).map(k => `
              <div class="px-3 py-2 rounded-lg border bg-muted/50 flex items-center justify-between">
                <span class="text-xs font-medium truncate mr-2">${k.word}</span>
                <span class="text-[10px] font-bold bg-background px-1.5 py-0.5 rounded text-muted-foreground">${k.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Strategy & Improvements -->
      <section class="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
        <h2 class="text-primary font-bold text-xl mb-4">🚀 Targeted Improvements</h2>
        <div class="space-y-4">
          ${recommendations.length > 0 ? `
            <ul class="space-y-3">
              ${recommendations.map(r => `
                <li class="flex items-start gap-3 text-sm">
                  <div class="mt-1 bg-primary/20 p-1 rounded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          ` : `
            <p class="text-sm text-muted-foreground">This site is already following major SEO best practices. Focus on building quality backlinks and fresh content.</p>
          `}
          
          <div class="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <h4 class="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Technical Summary</h4>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="flex justify-between border-b border-border/50 pb-1">
                <span class="text-muted-foreground">Total Words</span>
                <span class="font-bold">${words.length}</span>
              </div>
              <div class="flex justify-between border-b border-border/50 pb-1">
                <span class="text-muted-foreground">Internal Links</span>
                <span class="font-bold">${data.links.internal}</span>
              </div>
              <div class="flex justify-between border-b border-border/50 pb-1">
                <span class="text-muted-foreground">External Links</span>
                <span class="font-bold">${data.links.external}</span>
              </div>
              <div class="flex justify-between border-b border-border/50 pb-1">
                <span class="text-muted-foreground">H2 Headers</span>
                <span class="font-bold">${data.h2s.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

    return html;
}
