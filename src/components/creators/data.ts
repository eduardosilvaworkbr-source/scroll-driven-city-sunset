import thumbEdit from "@/assets/thumb-edit.jpg";
import thumbGear from "@/assets/thumb-gear.jpg";
import thumbLive from "@/assets/thumb-live.jpg";

export type Category = "producao" | "marketing" | "youtube" | "redes" | "estrategias";

export const categories: { id: Category; label: string; lessons: number; emoji: string }[] = [
  { id: "producao", label: "Produção de Conteúdo", lessons: 248, emoji: "🎬" },
  { id: "marketing", label: "Marketing Digital", lessons: 189, emoji: "📈" },
  { id: "youtube", label: "YouTube", lessons: 326, emoji: "▶️" },
  { id: "redes", label: "Redes Sociais", lessons: 142, emoji: "⭐" },
  { id: "estrategias", label: "Estratégias", lessons: 97, emoji: "🚀" },
];

export type Course = { id: string; title: string; category: Category; teacher: string; lessons: number; done: number };

export const courses: Course[] = [
  { id: "c1", title: "Roteiro que prende nos 3 primeiros segundos", category: "producao", teacher: "Lucas Ferreira", lessons: 24, done: 19 },
  { id: "c2", title: "Iluminação com o que você já tem em casa", category: "producao", teacher: "Dani Alves", lessons: 12, done: 3 },
  { id: "c3", title: "Funil simples para vender seu primeiro infoproduto", category: "marketing", teacher: "Bruna Costa", lessons: 18, done: 0 },
  { id: "c4", title: "Tráfego pago sem queimar dinheiro", category: "marketing", teacher: "Rafa Mendes", lessons: 22, done: 8 },
  { id: "c5", title: "Thumbnails que as pessoas querem clicar", category: "youtube", teacher: "Lucas Ferreira", lessons: 10, done: 10 },
  { id: "c6", title: "Do canal zerado aos primeiros 1.000 inscritos", category: "youtube", teacher: "Rafa Mendes", lessons: 30, done: 12 },
  { id: "c7", title: "Reels com cara de gente, não de propaganda", category: "redes", teacher: "Dani Alves", lessons: 14, done: 0 },
  { id: "c8", title: "Calendário editorial que você consegue cumprir", category: "estrategias", teacher: "Bruna Costa", lessons: 9, done: 4 },
];

export const trending = [
  { id: "t1", title: "Como editar vídeos como um profissional", author: "Lucas Ferreira", time: "18:24", views: 243, img: thumbEdit },
  { id: "t2", title: "Equipamentos que valem a pena em 2026", author: "Dani Alves", time: "12:17", views: 176, img: thumbGear },
  { id: "t3", title: "Live: estratégias para crescer no YouTube", author: "Rafa Mendes", time: "20:32", views: 312, img: thumbLive },
];

export const faqs = [
  { q: "Posso assistir às aulas pelo celular?", a: "Sim. Tudo funciona no navegador do celular e o progresso é salvo automaticamente." },
  { q: "Recebo certificado?", a: "Ao concluir 100% das aulas de um curso, o certificado fica disponível na própria página do curso." },
  { q: "Como cancelo o Premium?", a: "Em Configurações, a qualquer momento, sem multa. Você mantém o acesso até o fim do período pago." },
];
