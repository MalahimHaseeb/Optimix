"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  ExternalLink,
  Copy,
  Loader2,
  Trash2,
  TrendingUp,
  Search,
  Github
} from "lucide-react";
import { processWebsiteAction } from "./actions";
import { toast } from "react-hot-toast";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seoReport, setSeoReport] = useState<string | null>(null);

  useEffect(() => {
    if (seoReport) {
      setTimeout(() => {
        document.getElementById("report-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [seoReport]);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setScrapedData(null);
    setSeoReport(null);

    try {
      const response = await processWebsiteAction(url);
      if (response.success && response.data && response.report) {
        setScrapedData(response.data);
        setSeoReport(response.report);
        toast.success("Optimization Report Ready!");
      } else {
        toast.error(response.error || "Analysis failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScrapedData(null);
    setSeoReport(null);
    setUrl("");
  };

  const copyToClipboard = () => {
    if (seoReport) {
      const temp = document.createElement("div");
      temp.innerHTML = seoReport;
      const text = temp.innerText;
      navigator.clipboard.writeText(text);
      toast.success("Ideas copied");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-sky-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow [animation-delay:2s]" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-12 relative z-10">
        <nav className="flex items-center justify-between mb-8 md:mb-16 bg-white/5 dark:bg-black/20 backdrop-blur-2xl border border-border/50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-emerald-500/30">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black tracking-tighter leading-none">Optimix</div>
              <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-muted-foreground font-black mt-1">Growth Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl md:rounded-2xl font-bold text-xs"
              asChild
            >
              <a href="https://github.com/MalahimHaseeb/Optimix" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
        </nav>

        {!scrapedData ? (
          <div className="max-w-4xl mx-auto space-y-10 md:space-y-16 py-6 md:py-10">
            <div className="text-center space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-[12px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Optimization Redefined
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1] md:leading-[0.85] text-balance">
                ACCELERATE YOUR <br />
                <span className="text-emerald-500 italic">WEB GROWTH</span>
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium px-4">
                Unlock high-performance insights for any web project. Our local intelligence engine scans structure and keywords to sharpen your digital edge.
              </p>
            </div>

            <Card className="border-border/40 bg-card/40 backdrop-blur-3xl shadow-xl md:shadow-2xl rounded-3xl md:rounded-[3rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-700 mx-auto max-w-3xl">
              <CardContent className="p-6 md:p-12">
                <form onSubmit={handleStartAnalysis} className="flex flex-col gap-4">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type="url"
                      placeholder="Enter website URL..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="pl-12 md:pl-16 py-6 md:py-8 text-base md:text-xl bg-background/50 border-border/60 focus-visible:ring-emerald-500/20 rounded-xl md:rounded-[2rem] transition-all font-semibold"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="py-6 md:py-8 px-8 md:px-14 text-lg md:text-xl font-black italic rounded-xl md:rounded-[2rem] group relative overflow-hidden active:scale-95 transition-all"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ANALYZE NOW"}
                      {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-sky-600 group-hover:scale-105 transition-transform duration-500" />
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="bg-emerald-500/5 p-6 md:p-10 flex items-center justify-center border-t border-border/30">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full text-center">
                  {[
                    { label: "Targeting" },
                    { label: "Growth" },
                    { label: "Compliance" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-border/40 bg-card/50 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl md:sticky md:top-8">
                  <CardHeader className="border-b border-border/30 bg-emerald-500/5 p-6 md:p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-emerald-500" />
                        <CardTitle className="text-lg md:text-xl font-black italic uppercase tracking-tight">Project Hub</CardTitle>
                      </div>
                      <Badge className="bg-emerald-500 text-white font-black italic px-3 py-1 rounded-full text-[9px]">ACTIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-500/60">Site Title</label>
                      <div className="p-4 rounded-xl md:rounded-2xl bg-emerald-500/5 border border-emerald-500/10 font-bold leading-tight text-sm md:text-base italic">
                        {scrapedData.title || "Target Project"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-500/60">Current Meta</label>
                      <p className="text-xs md:text-sm text-foreground/70 leading-relaxed font-medium bg-muted/30 p-4 rounded-xl border border-border/40 italic">
                        {scrapedData.metaDescription || "No snapshot found."}
                      </p>
                    </div>

                    <Separator className="bg-border/30" />

                    <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 transition-colors">
                      <span className="text-[9px] uppercase font-black text-emerald-500/60 tracking-widest">Asset</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs font-black text-emerald-600 truncate max-w-[120px] hover:underline flex items-center gap-2 uppercase">
                        Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 md:p-8 pt-0 gap-3 flex flex-col">
                    <Button
                      onClick={copyToClipboard}
                      className="w-full h-12 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 font-black italic uppercase bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                    >
                      <Copy className="w-4 h-4" /> Copy Data
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="w-full h-12 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 font-black italic uppercase text-muted-foreground hover:text-emerald-500"
                    >
                      <Trash2 className="w-4 h-4" /> New Analysis
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div id="report-section" className="lg:col-span-8">
                {seoReport && !loading && (
                  <Card className="border-border/40 bg-card/60 backdrop-blur-3xl rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-border/30 bg-white/5 p-6 md:p-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner shrink-0">
                          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl md:text-3xl font-black italic uppercase tracking-tighter">Growth Intel</CardTitle>
                          <p className="text-[10px] md:text-xs font-bold text-emerald-500/60 uppercase tracking-[0.2em] mt-1">Audit Report</p>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="p-6 md:p-10 ai-content-styles">
                      <div dangerouslySetInnerHTML={{ __html: seoReport }} />
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="mt-20 pb-10 text-center space-y-4">
          <Separator className="max-w-[100px] mx-auto bg-emerald-500/30 h-1.5 rounded-full" />
          <div className="space-y-2">
            <p className="text-base md:text-lg font-black italic uppercase tracking-tighter">Optimix</p>
            <p className="text-[8px] md:text-9px uppercase tracking-[0.4em] font-black text-muted-foreground/40">Digital Excellence Engine</p>
            <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground/60 transition-colors hover:text-emerald-500">
              Generated by <a href="https://malahim.dev" target="_blank" rel="noopener noreferrer" className="underline decoration-emerald-500/30 underline-offset-4 hover:decoration-emerald-500">Malahim Haseeb | malahim.dev</a>
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}