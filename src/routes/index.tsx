import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell, BookOpen, ChevronDown, Crown, Heart, Home, LifeBuoy, Play, Search, Settings, TrendingUp, Users, ArrowRight, Clock, Eye, Check, X,
} from "lucide-react";
import { CinematicSky } from "@/components/creators/CinematicSky";
import { categories, courses, trending, faqs, type Category } from "@/components/creators/data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marketing Creators — Aprenda. Crie. Conquiste." },
      { name: "description", content: "Painel do criador: cursos, tendências e uma comunidade que cresce junto com você." },
      { property: "og:title", content: "Marketing Creators — Aprenda. Crie. Conquiste." },
      { property: "og:description", content: "Estratégias reais, ferramentas poderosas e uma comunidade de criadores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "cursos", label: "Meus Cursos", icon: BookOpen },
  { id: "tendencias", label: "Tendências", icon: TrendingUp },
  { id: "comunidade", label: "Comunidade", icon: Users },
  { id: "suporte", label: "Suporte", icon: LifeBuoy },
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const;

const PHASES = ["Amanhecer", "Manhã", "Entardecer", "Anoitecer", "Noite"];

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setV(JSON.parse(raw)); } catch { /* ignore */ }
    loaded.current = true;
  }, [key]);
  useEffect(() => { if (loaded.current) localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV] as const;
}

const initialNotifs = [
  { id: 1, text: "Nova aula em “Thumbnails que as pessoas querem clicar”", read: false },
  { id: 2, text: "Dani Alves respondeu sua dúvida na comunidade", read: false },
  { id: 3, text: "Live hoje às 20h com Rafa Mendes", read: false },
];

function Index() {
  const [active, setActive] = useState<string>("inicio");
  const [phase, setPhase] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState<Category | "todos">("todos");
  const [progress, setProgress] = usePersisted<Record<string, number>>("mc-progress", Object.fromEntries(courses.map((c) => [c.id, c.done])));
  const [liked, setLiked] = usePersisted<string[]>("mc-liked", []);
  const [joined, setJoined] = usePersisted("mc-joined", false);
  const [premium, setPremium] = usePersisted("mc-premium", false);
  const [settings, setSettings] = usePersisted("mc-settings", { email: true, lives: true, autoplay: false });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  const onPhase = useCallback((p: number) => {
    const idx = Math.min(PHASES.length - 1, Math.floor(p * PHASES.length));
    setPhase((prev) => (prev === idx ? prev : idx));
  }, []);

  // Highlight the sidebar item of the section on screen
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const totalLessons = courses.reduce((s, c) => s + c.lessons, 0);
  const doneLessons = courses.reduce((s, c) => s + (progress[c.id] ?? 0), 0);
  const overall = Math.round((doneLessons / totalLessons) * 100);
  const resume = courses.find((c) => (progress[c.id] ?? 0) > 0 && (progress[c.id] ?? 0) < c.lessons) ?? courses.find((c) => (progress[c.id] ?? 0) < c.lessons);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return courses.filter((c) => `${c.title} ${c.teacher} ${categories.find((k) => k.id === c.category)?.label}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const visible = filter === "todos" ? courses : courses.filter((c) => c.category === filter);
  const unread = notifs.filter((n) => !n.read).length;

  const watchLesson = (id: string) => {
    const c = courses.find((x) => x.id === id)!;
    const cur = progress[id] ?? 0;
    if (cur >= c.lessons) { toast.success("Curso concluído", { description: "Seu certificado já está disponível." }); return; }
    setPlaying(id);
    setTimeout(() => {
      setProgress((p) => ({ ...p, [id]: Math.min(c.lessons, (p[id] ?? 0) + 1) }));
      setPlaying(null);
      toast.success(`Aula ${cur + 1} de ${c.lessons} concluída`, { description: c.title });
    }, 900);
  };

  const pickCategory = (id: Category) => { setFilter(id); go("cursos"); };

  return (
    <div className="relative min-h-screen text-foreground">
      <CinematicSky onPhase={onPhase} />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-5 py-7 backdrop-blur-xl lg:flex">
        <button onClick={() => go("inicio")} className="flex items-center gap-3 text-left">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-primary shadow-glow"><Play className="size-5 fill-current" /></span>
          <span className="leading-tight"><b className="block text-[15px]">Marketing</b><span className="text-gradient font-semibold">Creators</span></span>
        </button>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active === n.id ? "bg-gradient-primary font-semibold shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <n.icon className="size-[18px]" />{n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl glass p-4 text-xs text-muted-foreground">
          <p className="font-serif text-lg italic text-foreground">{PHASES[phase]}</p>
          <p className="mt-1">Role a página e veja a cidade mudar com você.</p>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/30 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Buscar por cursos, estratégias ou criadores..." aria-label="Buscar"
              className="w-full rounded-full glass py-3 pl-11 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
            {query && <button aria-label="Limpar busca" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
            {searchOpen && query.trim() && (
              <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-glow">
                {results.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nada encontrado para “{query}”. Tente “YouTube” ou “roteiro”.</p> :
                  results.map((c) => (
                    <button key={c.id} onMouseDown={() => { setFilter(c.category); setQuery(""); go("cursos"); }} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-accent">
                      <span><span className="block font-medium">{c.title}</span><span className="text-xs text-muted-foreground">{c.teacher}</span></span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="relative ml-auto">
            <button aria-label="Notificações" onClick={() => setNotifOpen((o) => !o)} className="relative grid size-11 place-items-center rounded-full glass hover:bg-secondary">
              <Bell className="size-5" />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-popover p-2 shadow-glow">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <b className="text-sm">Notificações</b>
                  <button className="text-xs text-primary-glow hover:underline" onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}>Marcar todas como lidas</button>
                </div>
                {notifs.map((n) => (
                  <button key={n.id} onClick={() => setNotifs((all) => all.map((x) => (x.id === n.id ? { ...x, read: true } : x)))} className="flex w-full gap-2 rounded-xl px-2 py-2.5 text-left text-sm hover:bg-accent">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-primary-glow"}`} />
                    <span className={n.read ? "text-muted-foreground" : ""}>{n.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => go("configuracoes")} className="hidden items-center gap-2 rounded-full glass py-1.5 pl-1.5 pr-3 text-sm sm:flex">
            <span className="grid size-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold">EJ</span>
            Olá, Criador! <ChevronDown className="size-4" />
          </button>
        </header>

        <main className="space-y-28 px-4 pb-24 sm:px-8">
          {/* Hero */}
          <section id="inicio" className="grid min-h-[82vh] items-center gap-10 pt-6 xl:grid-cols-[1fr_300px]">
            <div className="reveal max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs"><span className="size-2 rounded-full bg-primary-glow" />Sua jornada como criador começa aqui</span>
              <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
                Aprenda. Crie.<br /><span className="font-serif font-normal italic text-gradient">e conquiste.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">Estratégias reais, ferramentas que funcionam e uma comunidade que cresce junto com você.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => go("acesso")} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3.5 font-semibold shadow-glow transition-transform hover:-translate-y-0.5"><Play className="size-4 fill-current" />Explorar agora</button>
                {resume && <button onClick={() => watchLesson(resume.id)} className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 font-medium hover:bg-secondary">Continuar de onde parei <ArrowRight className="size-4" /></button>}
              </div>
            </div>
            <div className="reveal rounded-3xl glass p-6" style={{ animationDelay: ".2s" }}>
              <p className="font-semibold">Seu progresso</p>
              <div className="relative mx-auto my-5 size-36">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#g)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${overall * 2.639} 263.9`} style={{ transition: "stroke-dasharray .8s" }} />
                  <defs><linearGradient id="g"><stop stopColor="var(--primary)" /><stop offset="1" stopColor="var(--primary-glow)" /></linearGradient></defs>
                </svg>
                <span className="absolute inset-0 grid place-items-center text-3xl font-bold">{overall}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{doneLessons} de {totalLessons} aulas assistidas</p>
              {resume && <>
                <p className="mt-4 text-sm leading-snug">{resume.title}</p>
                <button disabled={playing === resume.id} onClick={() => watchLesson(resume.id)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold disabled:opacity-60">
                  {playing === resume.id ? "Assistindo..." : "Retomar curso"} <ArrowRight className="size-3.5" />
                </button>
              </>}
            </div>
          </section>

          {/* Acesso rápido */}
          <section id="acesso">
            <h2 className="text-2xl font-bold">Acesso rápido</h2>
            <p className="text-sm text-muted-foreground">Tudo o que você precisa, em um só lugar.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((c) => (
                <button key={c.id} onClick={() => pickCategory(c.id)} className="group flex items-center gap-3 rounded-2xl glass p-4 text-left transition-all hover:-translate-y-1 hover:shadow-glow">
                  <span className="text-3xl transition-transform group-hover:scale-110">{c.emoji}</span>
                  <span className="flex-1"><b className="block text-sm">{c.label}</b><span className="text-xs text-muted-foreground">{c.lessons} aulas</span></span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                </button>
              ))}
            </div>
          </section>

          {/* Meus cursos */}
          <section id="cursos">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><h2 className="text-2xl font-bold">Meus cursos</h2><p className="text-sm text-muted-foreground">Cada aula assistida conta. Literalmente.</p></div>
              <div className="flex flex-wrap gap-2">
                {[{ id: "todos", label: "Todos" } as const, ...categories].map((c) => (
                  <button key={c.id} onClick={() => setFilter(c.id)} className={`rounded-full px-3.5 py-1.5 text-xs transition ${filter === c.id ? "bg-gradient-primary font-semibold" : "glass text-muted-foreground hover:text-foreground"}`}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {visible.map((c) => {
                const d = progress[c.id] ?? 0; const pct = Math.round((d / c.lessons) * 100); const done = d >= c.lessons;
                return (
                  <article key={c.id} className="flex flex-col rounded-2xl glass p-5">
                    <span className="text-xs text-muted-foreground">{categories.find((k) => k.id === c.category)?.label}</span>
                    <h3 className="mt-2 font-semibold leading-snug">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">com {c.teacher}</p>
                    <div className="mt-auto pt-5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{d}/{c.lessons} aulas</span>
                        <button disabled={playing === c.id} onClick={() => watchLesson(c.id)} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 font-medium hover:bg-accent disabled:opacity-60">
                          {done ? <><Check className="size-3.5 text-success" />Concluído</> : playing === c.id ? "Assistindo..." : d === 0 ? "Começar" : "Próxima aula"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Tendências */}
          <section id="tendencias">
            <h2 className="text-2xl font-bold">🔥 Em alta na comunidade</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {trending.map((t) => {
                const isLiked = liked.includes(t.id);
                return (
                  <article key={t.id} className="group overflow-hidden rounded-2xl glass">
                    <button onClick={() => toast(`Reproduzindo: ${t.title}`)} className="relative block aspect-video w-full overflow-hidden">
                      <img src={t.img} alt={t.title} loading="lazy" width={992} height={672} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute inset-0 grid place-items-center bg-background/30 opacity-0 transition group-hover:opacity-100"><span className="grid size-14 place-items-center rounded-full bg-gradient-primary shadow-glow"><Play className="size-6 fill-current" /></span></span>
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs"><Clock className="size-3" />{t.time}</span>
                    </button>
                    <div className="p-4">
                      <h3 className="font-semibold">{t.title}</h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t.author}</span>
                        <span className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1"><Eye className="size-3.5" />{t.views}k</span>
                          <button aria-label="Curtir" onClick={() => setLiked((l) => (isLiked ? l.filter((x) => x !== t.id) : [...l, t.id]))} className="inline-flex items-center gap-1 hover:text-foreground">
                            <Heart className={`size-4 transition ${isLiked ? "scale-110 fill-destructive text-destructive" : ""}`} />{isLiked ? "Curtido" : "Curtir"}
                          </button>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Comunidade */}
          <section id="comunidade" className="grid overflow-hidden rounded-3xl glass md:grid-cols-2">
            <img src={communityImg} alt="Criadores conversando no estúdio" loading="lazy" width={1280} height={768} className="h-full min-h-64 w-full object-cover" />
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs"><span className="size-2 animate-pulse rounded-full bg-success" />Comunidade ativa</span>
              <h2 className="mt-4 text-3xl font-bold leading-tight">Ninguém cresce <span className="font-serif font-normal italic">sozinho.</span></h2>
              <p className="mt-3 text-muted-foreground">Troque ideias, tire dúvidas e mostre seus vídeos para mais de 24 mil criadores que estão no mesmo caminho.</p>
              <button onClick={() => { setJoined(!joined); toast.success(joined ? "Você saiu da comunidade" : "Bem-vindo à comunidade!"); }}
                className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 font-semibold ${joined ? "glass" : "bg-gradient-primary shadow-glow"}`}>
                {joined ? <><Check className="size-4" />Você faz parte</> : <>Entrar agora <ArrowRight className="size-4" /></>}
              </button>
            </div>
          </section>

          {/* Suporte */}
          <section id="suporte" className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
            <div><h2 className="text-2xl font-bold">Suporte</h2><p className="mt-2 text-muted-foreground">Respostas rápidas. Se não resolver, fale com a gente.</p>
              <SupportForm /></div>
            <Accordion type="single" collapsible className="rounded-2xl glass px-6">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Configurações */}
          <section id="configuracoes" className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl glass p-6">
              <h2 className="text-2xl font-bold">Configurações</h2>
              {([["email", "Resumo semanal por e-mail"], ["lives", "Avisar quando uma live começar"], ["autoplay", "Reproduzir próxima aula automaticamente"]] as const).map(([k, label]) => (
                <label key={k} className="mt-5 flex items-center justify-between gap-4 text-sm">
                  {label}<Switch checked={settings[k]} onCheckedChange={(v) => { setSettings({ ...settings, [k]: v }); toast("Preferência salva"); }} />
                </label>
              ))}
            </div>
            <div className="flex flex-col justify-between rounded-2xl glass p-6">
              <div className="flex items-start gap-3"><Crown className="size-7 text-ember" /><div>
                <b>{premium ? "Você é Premium" : "Plano Premium"}</b>
                <p className="text-sm text-muted-foreground">{premium ? "Todos os cursos e lives liberados." : "Desbloqueie todo o potencial da plataforma."}</p></div></div>
              <button onClick={() => (premium ? (setPremium(false), toast("Assinatura cancelada")) : setUpgradeOpen(true))} className={`mt-6 rounded-full px-6 py-3 font-semibold ${premium ? "glass" : "bg-gradient-primary shadow-glow"}`}>
                {premium ? "Cancelar assinatura" : "Fazer upgrade"}
              </button>
            </div>
          </section>

          <footer className="pb-10 text-center font-serif text-3xl italic text-gradient">Sonhe. Crie. Conquiste.</footer>
        </main>
      </div>

      {/* Mobile nav */}
      <nav className="fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-2xl glass p-1.5 lg:hidden">
        {NAV.slice(0, 5).map((n) => (
          <button key={n.id} aria-label={n.label} onClick={() => go(n.id)} className={`rounded-xl p-2.5 ${active === n.id ? "bg-gradient-primary" : "text-muted-foreground"}`}><n.icon className="size-5" /></button>
        ))}
      </nav>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Premium mensal</DialogTitle><DialogDescription>Acesso a todos os cursos, lives exclusivas e certificados.</DialogDescription></DialogHeader>
          <ul className="space-y-2 text-sm">{["Mais de 1.000 aulas", "Mentorias ao vivo toda semana", "Cancele quando quiser"].map((x) => <li key={x} className="flex gap-2"><Check className="size-4 text-success" />{x}</li>)}</ul>
          <button onClick={() => { setPremium(true); setUpgradeOpen(false); toast.success("Agora você é Premium!"); }} className="mt-2 rounded-full bg-gradient-primary px-6 py-3 font-semibold shadow-glow">Ativar Premium</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SupportForm() {
  const [msg, setMsg] = useState("");
  return (
    <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); if (msg.trim().length < 10) { toast.error("Conte um pouco mais (mínimo 10 caracteres)"); return; } setMsg(""); toast.success("Mensagem enviada! Respondemos em até 24h."); }}>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="Como podemos te ajudar?" className="w-full rounded-2xl glass p-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      <button className="rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold">Enviar</button>
    </form>
  );
}
