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
  const wins: string[] = [];
  const highImpactKeywords: string[] = [];
  const allKeywords: { word: string; count: number }[] = [];
  let score = 0;

  // 1. Keyword Extraction
  const words = data.content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'your', 'their', 'about', 'more', 'when', 'into', 'some'].includes(word));

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

  // 2. Ranking Analysis & Scoring
  const rankingFactors: { title: string; status: 'good' | 'warning' | 'critical'; desc: string }[] = [];

  // Title Score (Max 25)
  if (data.title.length >= 30 && data.title.length <= 65) {
    score += 25;
    wins.push("Perfect Title Length: Your title is optimized for search engines.");
    rankingFactors.push({ title: 'Title Length', status: 'good', desc: 'Optimal title length for SERP display.' });
  } else if (data.title.length > 0) {
    score += 10;
    rankingFactors.push({ title: 'Title Optimization', status: 'warning', desc: `Current length: ${data.title.length}. Ideal is 30-65 characters.` });
  } else {
    rankingFactors.push({ title: 'Title Missing', status: 'critical', desc: 'No title tag found.' });
  }

  // H1 Score (Max 20)
  if (data.h1s.length === 1) {
    score += 20;
    wins.push("Single H1 Tag: You have the perfect heading hierarchy.");
    rankingFactors.push({ title: 'H1 Header', status: 'good', desc: 'Exactly one H1 tag found. Perfect.' });
  } else if (data.h1s.length > 1) {
    score += 5;
    rankingFactors.push({ title: 'Multiple H1s', status: 'warning', desc: 'More than one H1 found. Try to use only one.' });
  } else {
    rankingFactors.push({ title: 'H1 Missing', status: 'critical', desc: 'No H1 tag found.' });
  }

  // Meta Score (Max 20)
  if (data.metaDescription.length > 120) {
    score += 20;
    wins.push("Robust Meta Description: Great for click-through rates.");
    rankingFactors.push({ title: 'Meta Description', status: 'good', desc: 'Detailed description found.' });
  } else if (data.metaDescription.length > 0) {
    score += 5;
    rankingFactors.push({ title: 'Meta Length', status: 'warning', desc: 'Meta description is a bit short.' });
  } else {
    rankingFactors.push({ title: 'Meta Tag Missing', status: 'critical', desc: 'No meta description found.' });
  }

  // Image Score (Max 15)
  if (data.images.total > 0 && data.images.withoutAlt === 0) {
    score += 15;
    wins.push("Accessible Images: All your images have descriptive ALT text.");
    rankingFactors.push({ title: 'Image Alt Tags', status: 'good', desc: 'All images have ALT attributes.' });
  } else if (data.images.total > 0) {
    const altPercent = Math.round(((data.images.total - data.images.withoutAlt) / data.images.total) * 15);
    score += altPercent;
    rankingFactors.push({ title: 'Image ALTs', status: 'warning', desc: `${data.images.withoutAlt} images are missing ALT text.` });
  } else if (data.images.total === 0) {
    score += 15; // Neutral
    rankingFactors.push({ title: 'No Images', status: 'good', desc: 'Simple text-based design.' });
  }

  // Link & Content Score (Max 20)
  if (data.links.total > 10) {
    score += 10;
    wins.push("High Connectivity: Your page is well-linked.");
  } else {
    score += 5;
  }

  if (words.length > 300) {
    score += 10;
    wins.push("Content Volume: Good amount of readable text.");
  } else {
    score += 5;
  }

  // Final clean up for recommendations
  if (data.h1s.length === 0) recommendations.push("Add a main H1 heading to define your page's purpose.");
  if (data.metaDescription.length < 120) recommendations.push("Lengthen your meta description to between 150-160 characters.");
  if (data.images.withoutAlt > 0) recommendations.push("Add missing ALT tags to images for better accessibility.");
  if (data.links.internal < 3) recommendations.push("Add more internal links to guide users through your site.");

  const html = `
    <div class="space-y-8">
      <!-- Top Score Header (Mobile Only, Desktop UI will show its own) -->
      <div class="lg:hidden flex items-center justify-between p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
        <div>
          <h3 class="text-sm font-black uppercase tracking-widest text-emerald-500">Overall Grade</h3>
          <p class="text-xs text-muted-foreground mt-1">Based on key SEO metrics</p>
        </div>
        <div class="text-4xl font-black italic text-emerald-500">${score}%</div>
      </div>

      <!-- Success Wins -->
      <section class="bg-card rounded-3xl border border-emerald-500/20 p-6 shadow-sm overflow-hidden relative group">
        <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-500 tracking-tighter"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <h2 class="text-emerald-500 font-black text-xl mb-6 flex items-center gap-2">
            <span class="bg-emerald-500 text-white p-1 rounded-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
            QUICK WINS
        </h2>
        <div class="space-y-3">
          ${wins.length > 0 ? wins.map(win => `
            <div class="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-sm font-medium">
              <span class="text-emerald-500">✦</span>
              <span>${win}</span>
            </div>
          `).join('') : '<p class="text-sm text-muted-foreground italic pl-2">Perform more optimizations to unlock wins!</p>'}
        </div>
      </section>

      <!-- Ranking Factors -->
      <section class="bg-card rounded-3xl border p-6 shadow-sm">
        <h2 class="text-primary font-black text-xl mb-6 uppercase tracking-tight italic">📊 SEO Audit Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${rankingFactors.map(f => `
            <div class="p-4 rounded-2xl border ${f.status === 'good' ? 'bg-emerald-500/5 border-emerald-500/20' : f.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full ${f.status === 'good' ? 'bg-emerald-500' : f.status === 'warning' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}"></span>
                <span class="font-black text-xs uppercase tracking-wider">${f.title}</span>
              </div>
              <p class="text-xs text-muted-foreground font-medium">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Keyword Intelligence -->
      <section class="bg-card rounded-3xl border p-6 shadow-sm">
        <h2 class="text-primary font-black text-xl mb-6 uppercase tracking-tight italic">🔍 Topic Intelligence</h2>
        
        <div class="mb-8">
          <h3 class="text-xs font-black mb-4 text-emerald-500 uppercase tracking-[0.2em]">High-Impact Pillars</h3>
          <div class="flex flex-wrap gap-2">
            ${highImpactKeywords.map(k => `<span class="px-4 py-2 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors cursor-default">${k}</span>`).join('')}
            ${highImpactKeywords.length === 0 ? '<p class="text-xs text-muted-foreground italic">Gathering more intelligence...</p>' : ''}
          </div>
        </div>

        <div>
          <h3 class="text-xs font-black mb-4 text-muted-foreground uppercase tracking-[0.2em]">Contextual Keywords</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            ${allKeywords.slice(0, 16).map(k => `
              <div class="px-3 py-3 rounded-xl border bg-muted/30 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                <span class="text-xs font-bold truncate mr-2 uppercase tracking-tighter">${k.word}</span>
                <span class="text-[9px] font-black bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-600">${k.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Action Plan -->
      <section class="bg-card rounded-3xl border p-6 shadow-sm">
        <h2 class="text-primary font-black text-xl mb-6 uppercase tracking-tight italic">🚀 Growth Roadmap</h2>
        <div class="space-y-4">
          ${recommendations.length > 0 ? `
            <div class="space-y-3">
              ${recommendations.map(r => `
                <div class="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 group hover:border-primary/30 transition-all">
                  <div class="bg-primary/10 p-2 rounded-xl text-primary font-black text-xs">TODO</div>
                  <span class="text-sm font-medium leading-relaxed">${r}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="p-8 text-center rounded-3xl border-2 border-dashed border-emerald-500/20 bg-emerald-500/5">
                <p class="text-lg font-black italic text-emerald-600 mb-2">FLAWLESS EXECUTION</p>
                <p class="text-sm text-muted-foreground">This project is already following peak SEO patterns.</p>
            </div>
          `}
          
          <div class="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 border border-primary/10">
            <div class="flex items-center gap-3 mb-4">
                <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
                <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Data Snapshot</h4>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px]">
              <div class="space-y-1">
                <span class="text-muted-foreground block uppercase tracking-widest font-bold">Lexicon</span>
                <span class="font-black text-sm">${words.length} Words</span>
              </div>
              <div class="space-y-1">
                <span class="text-muted-foreground block uppercase tracking-widest font-bold">Node Mesh</span>
                <span class="font-black text-sm">${data.links.internal} Internal</span>
              </div>
              <div class="space-y-1">
                <span class="text-muted-foreground block uppercase tracking-widest font-bold">External</span>
                <span class="font-black text-sm">${data.links.external} Links</span>
              </div>
              <div class="space-y-1">
                <span class="text-muted-foreground block uppercase tracking-widest font-bold">Structure</span>
                <span class="font-black text-sm">${rankingFactors.length} Factors</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return { html, score };
}
