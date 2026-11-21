import React, { useMemo, useRef, useState } from "react";
import { Check, Clock3, Users, ArrowRight, ArrowDown, Sparkles, UtensilsCrossed, X, Minus, ShoppingCart, Trash2, Copy, Eye, MessageCircle, Mail, ShieldCheck, Store, ChevronDown, RotateCcw, Target, BadgeCheck } from "lucide-react";

type Product = {
  id: string;
  code: string;
  num: string;
  name: string;
  type: "Personal" | "Equipo" | "Equipo chico" | "Sede";
  pain: string;
  leap: string;
  deliverable: string;
  scope: string;
  hours?: number;
  price?: number;
  variants?: { label: string; hours: number; price: number }[];
};

const products: Product[] = [
  { id: "P0", code: "P0", num: "01", name: "Mapa de Fricciones", type: "Personal", pain: "No sabes dónde se pierde el tiempo.", leap: "De no saber → a saber dónde.", deliverable: "Mapa de 1 página.", scope: "1 persona (entrevista)", hours: 3, price: 3.57 },
  { id: "A", code: "A", num: "02", name: "Agencia Aumentada", type: "Equipo", pain: "Equipo usa IA sin verificar y filtra datos.", leap: "De depender → a verificar.", deliverable: "3 casos verificados.", scope: "Hasta 12 personas", hours: 18, price: 21.42 },
  { id: "B", code: "B", num: "03", name: "Ingeniería del Cambio Complejo", type: "Equipo chico", pain: "Proceso que se devuelve, depende de 1 persona.", leap: "De retrabajo → a sin retrabajo.", deliverable: "Flujograma validado.", scope: "5 a 7 personas", hours: 24, price: 28.56 },
  { id: "C", code: "C", num: "04", name: "Territorio Inteligente y Resiliente", type: "Sede", pain: "Si se corta la luz, no sabes qué hacer en la primera hora.", leap: "De paralizado → a sigue operando.", deliverable: "Protocolos + simulación.", scope: "8 a 12 personas, beneficia a toda la sede", hours: 28, price: 33.32 },
  { id: "D", code: "D", num: "05", name: "Sostenibilidad Operativa", type: "Equipo chico", pain: "Mandante te pide 5 indicadores y arriesgas contrato.", leap: "De no saber demostrar → a demostrar con planilla.", deliverable: "Planilla funcional.", scope: "3 a 5 personas", hours: 20, price: 23.80 },
  { id: "MOD", code: "Módulo", num: "06", name: "Acompañamiento", type: "Equipo", pain: "Taller gustó pero nadie usa a las 2 semanas.", leap: "De taller → a uso real.", deliverable: "Verificación + 1 ajuste.", scope: "Mismo equipo del producto principal", variants: [{ label: "M30", hours: 10, price: 11.90 }, { label: "M90", hours: 14, price: 16.66 }] },
  { id: "E", code: "E", num: "07", name: "Auditoría de Cláusulas / GIA", type: "Equipo chico", pain: "Pides mal y la IA ejecuta mal.", leap: "De mal pedido → a buen pedido.", deliverable: "30 cláusulas + 5 corregidas.", scope: "3 a 5 personas", hours: 18, price: 21.42 },
  { id: "F", code: "F", num: "08", name: "Mapa de Rol", type: "Equipo", pain: "Todos usan IA sin saber para qué.", leap: "De usar por usar → a usar con rol.", deliverable: "Mapa de familias.", scope: "Hasta 12 personas", hours: 18, price: 21.42 },
  { id: "G", code: "G", num: "09", name: "Gobernanza de IA", type: "Equipo", pain: "Cada uno guarda su receta donde quiere.", leap: "De desorden → a orden con dueño.", deliverable: "Repositorio 10 géneros.", scope: "8 a 12 personas", hours: 24, price: 28.56 },
  { id: "I", code: "I", num: "10", name: "Repositorio Gobernado", type: "Equipo chico", pain: "Tu receta se copia sin permiso.", leap: "De se filtra → a con dueño.", deliverable: "Repositorio con licencia.", scope: "5 a 8 personas", hours: 18, price: 21.42 },
];

type Combo = { id: string; title: string; formula: string; hours: number; price: number; leap: string };
const combos: Combo[] = [
  { id: "C1", title: "Opción 1 · Esencial", formula: "A + M30", hours: 28, price: 33.32, leap: "De depender → a verificar, y que se use." },
  { id: "C2", title: "Opción 2 · Completa", formula: "B + C", hours: 44, price: 52.36, leap: "De retrabajo y paralizado → a operar sin retrabajo." },
  { id: "C3", title: "Opción 3 · Acompañada", formula: "B + C + M90", hours: 58, price: 69.02, leap: "De retrabajo → a uso real, sostenido en el tiempo." },
  { id: "C4", title: "Opción 4 · Gobernanza", formula: "F + G + M30", hours: 46, price: 54.74, leap: "De usar por usar → a usar con rol y orden." },
  { id: "C5", title: "Opción 5 · Auditoría", formula: "E + G + M30", hours: 52, price: 61.88, leap: "De mal pedido → a buen pedido, con dueño." },
  { id: "C6", title: "Opción 6 · Repositorio", formula: "F + G + I + M30", hours: 64, price: 76.16, leap: "De se filtra → a con dueño, con rol y orden." },
];

const filters = ["Todos", "Personal", "Equipo chico", "Equipo", "Sede"] as const;
const badgeStyle: Record<string, string> = {
  Personal: "bg-[var(--terracotta-soft)] text-[var(--terracotta)] border-[var(--terracotta)]",
  Equipo: "bg-[var(--navy-soft)] text-[var(--navy)] border-[var(--navy)]",
  "Equipo chico": "bg-[#F3EEDF] text-[#7A5A18] border-[#C9A84A]",
  Sede: "bg-[#E7F0E9] text-[#2F5D3A] border-[#5E8B6A]",
};
function fmt(n: number) { return n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

async function api(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.error) throw new Error(json?.error || `No se pudo completar la operación (${res.status})`);
  return json.data;
}

type CartItem = { id: string; kind: "product" | "combo"; code: string; name: string; hours: number; price: number; detail: string };
const paymentLabels: Record<string, string> = {
  transferencia: "Transferencia (factura en UF)",
  link: "Link de pago (te enviamos link)",
  cuotas: "2 cuotas (50% al inicio, 50% al entregar)",
};
const SELLER_EMAIL = "expertoschile.contacto@gmail.com";
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/EYx8qjczskb9SukbLW8Qia?s=cl&p=i&iam=2";

/* ---------- FUNNEL / QUIZ ---------- */
type QuizAnswers = { q1: string | null; q2: string | null; q3: string | null };
const quizQuestions = [
  {
    id: "q1" as const,
    step: "Pregunta 1 de 3",
    title: "¿Qué le duele más hoy?",
    options: [
      { id: "q1a", label: "Mi equipo usa IA pero comete errores / filtra datos", hint: "Recomienda A o E" },
      { id: "q1b", label: "Tengo un proceso que se devuelve y depende de 1 persona", hint: "Recomienda B" },
      { id: "q1c", label: "Si se corta la luz / falla proveedor, no sé qué hacer", hint: "Recomienda C" },
      { id: "q1d", label: "Me piden indicadores de sostenibilidad y no sé demostrarlos", hint: "Recomienda D" },
      { id: "q1e", label: "Todos usan IA pero cada uno hace lo que quiere", hint: "Recomienda F / G" },
    ],
  },
  {
    id: "q2" as const,
    step: "Pregunta 2 de 3",
    title: "¿Para cuántas personas es?",
    options: [
      { id: "q2a", label: "Solo yo / 1 entrevista", hint: "P0" },
      { id: "q2b", label: "Equipo chico (3–8)", hint: "B / D / E / I" },
      { id: "q2c", label: "Equipo (hasta 12)", hint: "A / F / G" },
      { id: "q2d", label: "Toda la sede", hint: "C" },
    ],
  },
  {
    id: "q3" as const,
    step: "Pregunta 3 de 3",
    title: "¿Qué quiere lograr primero?",
    options: [
      { id: "q3a", label: "Usar IA sin errores", hint: "A" },
      { id: "q3b", label: "Ordenar proceso", hint: "B" },
      { id: "q3c", label: "Seguir operando ante crisis", hint: "C" },
      { id: "q3d", label: "Cumplir mandante", hint: "D" },
      { id: "q3e", label: "Ordenar y gobernar IA", hint: "F / G" },
    ],
  },
];

const scoreMap: Record<string, Record<string, number>> = {
  q1a: { A: 2, E: 1 }, q1b: { B: 2 }, q1c: { C: 2 }, q1d: { D: 2 }, q1e: { F: 2, G: 1 },
  q2a: { P0: 2 }, q2b: { B: 1, D: 1, E: 1, I: 1 }, q2c: { A: 1, F: 1, G: 1 }, q2d: { C: 2 },
  q3a: { A: 2 }, q3b: { B: 2 }, q3c: { C: 2 }, q3d: { D: 2 }, q3e: { F: 2, G: 1 },
};
const tieOrder = ["C", "D", "B", "A", "F", "G", "E", "P0", "I"];

function recommendedFor(a: QuizAnswers): Product | null {
  if (!a.q1 || !a.q2 || !a.q3) return null;
  const scores: Record<string, number> = {};
  [a.q1, a.q2, a.q3].forEach((key) => {
    Object.entries(scoreMap[key] || {}).forEach(([code, pts]) => { scores[code] = (scores[code] || 0) + pts; });
  });
  let best: string | null = null;
  let bestScore = -1;
  for (const code of tieOrder) {
    const s = scores[code] || 0;
    if (s > bestScore) { bestScore = s; best = code; }
  }
  return products.find((p) => p.code === best) || products.find((p) => p.id === best) || null;
}

export default function App() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");
  const [cart, setCart] = useState<string[]>([]);
  const [moduleVariant, setModuleVariant] = useState<"M30" | "M90">("M30");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuando, setCuando] = useState("Este mes");
  const [acepto, setAcepto] = useState(false);
  const [pago, setPago] = useState("transferencia");

  const [orderSummary, setOrderSummary] = useState("");
  const [orderChannel, setOrderChannel] = useState<"whatsapp" | "correo" | "">("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderSaving, setOrderSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  // Funnel
  const [funnelCollapsed, setFunnelCollapsed] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({ q1: null, q2: null, q3: null });
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const answeredCount = [answers.q1, answers.q2, answers.q3].filter(Boolean).length;
  const recommended = recommendedFor(answers);

  const visible = useMemo(() => filter === "Todos" ? products : products.filter(p => p.type === filter), [filter]);

  function itemFor(id: string): CartItem | null {
    const p = products.find(x => x.id === id);
    if (p) {
      if (p.variants) { const v = p.variants.find(v => v.label === moduleVariant)!; return { id, kind: "product", code: "Módulo", name: `Acompañamiento · ${moduleVariant}`, hours: v.hours, price: v.price, detail: p.deliverable }; }
      return { id, kind: "product", code: p.code, name: p.name, hours: p.hours || 0, price: p.price || 0, detail: p.deliverable };
    }
    const c = combos.find(x => x.id === id);
    if (c) return { id, kind: "combo", code: c.formula, name: c.title, hours: c.hours, price: c.price, detail: c.leap };
    return null;
  }
  const cartItems = useMemo(() => cart.map(id => itemFor(id)).filter(Boolean) as CartItem[], [cart, moduleVariant]);
  const toggleCart = (id: string) => setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const removeItem = (id: string) => setCart(prev => prev.filter(x => x !== id));

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((s, i) => s + i.price, 0);
    const hasP0 = cart.includes("P0");
    const discount = hasP0 && cartItems.length > 1 ? 3.57 : 0;
    const total = Math.max(0, subtotal - discount);
    const neto = total / 1.19;
    const iva = total - neto;
    const hours = cartItems.reduce((s, i) => s + i.hours, 0);
    return { subtotal, discount, total, neto, iva, hours };
  }, [cartItems, cart]);

  const suggestBC = cart.includes("B") && cart.includes("C") && !cart.includes("C2");
  const suggestFG = cart.includes("F") && cart.includes("G") && !cart.includes("C4");
  const hasFGModule = suggestFG && cart.includes("MOD");

  function applyCombo(comboId: string, removeIds: string[]) {
    setCart(prev => {
      const kept = prev.filter(x => !removeIds.includes(x));
      return kept.includes(comboId) ? kept : [...kept, comboId];
    });
  }

  const detailProduct = detailId ? products.find(p => p.id === detailId) : null;
  const detailCombo = detailId ? combos.find(c => c.id === detailId) : null;

  function scrollToMenu() {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function goToMenuDirect() {
    setFunnelCollapsed(true);
    window.setTimeout(scrollToMenu, 60);
  }
  function goToProduct(productId: string) {
    setFilter("Todos");
    setHighlightId(productId);
    window.setTimeout(() => {
      document.getElementById(`product-${productId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    window.setTimeout(() => setHighlightId(null), 4200);
  }
  function resetQuiz() { setAnswers({ q1: null, q2: null, q3: null }); }

  async function confirmOrder(channel: "whatsapp" | "correo") {
    setFormError(""); setOrderStatus(""); setCopied(false);
    if (cartItems.length === 0) { setFormError("Tu carrito está vacío. Agrega al menos un producto o combinación."); return; }
    if (!nombre.trim() || !correo.trim() || !telefono.trim()) { setFormError("Completa Nombre, Correo y WhatsApp / Teléfono para confirmar el pedido."); return; }
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) { setFormError("Revisa el correo: parece que le falta algo."); return; }
    if (!acepto) { setFormError("Marca la casilla “Acepto que me contacten para coordinar fecha y forma de pago”."); return; }

    const list = cartItems.map(i => `${i.name} (${i.hours} h · ${fmt(i.price)} UF)`).join(", ");
    const summary = `Hola Gustavo, quiero contratar: ${list} — Total: ${fmt(totals.total)} UF (IVA incluido${totals.discount ? `, incluye descuento Peldaño 0: -${fmt(totals.discount)} UF` : ""}) — Nombre: ${nombre.trim()} — Empresa: ${empresa.trim() || "No indicada"} — Correo: ${correo.trim()} — WhatsApp cliente: ${telefono.trim()} — Fecha deseada: ${cuando} — Forma de pago: ${paymentLabels[pago]}`;
    setOrderSummary(summary); setOrderChannel(channel);
    setOrderSaving(true);
    try {
      await api("records.create", {
        collection: "orders",
        value: {
          items: cartItems.map(i => ({ id: i.id, name: i.name, hours: i.hours, price: i.price })),
          subtotal: Number(totals.subtotal.toFixed(2)), discount: Number(totals.discount.toFixed(2)), total: Number(totals.total.toFixed(2)), neto: Number(totals.neto.toFixed(2)), iva: Number(totals.iva.toFixed(2)),
          customer: { nombre: nombre.trim(), empresa: empresa.trim(), correo: correo.trim(), telefono: telefono.trim() },
          cuando, pago: paymentLabels[pago], summary, channel,
        },
        idempotency_key: `order-${Date.now()}-${nombre.trim().toLowerCase().replace(/\s+/g, "-")}-${cartItems.map(i => i.id).join("-")}`,
      });
      setOrderStatus("Pedido guardado. Ya puedes enviarlo por WhatsApp o correo con el resumen de abajo.");
    } catch (e) {
      setOrderStatus(e instanceof Error ? `No se pudo guardar el pedido: ${e.message}. El resumen quedó generado, pero vuelve a confirmar para dejarlo guardado.` : "No se pudo guardar el pedido.");
    }
    setOrderSaving(false);
  }

  function copySummary() {
    if (!summaryRef.current) return;
    summaryRef.current.select();
    const ok = document.execCommand("copy");
    setCopied(ok);
  }

  const waHref = orderSummary ? WHATSAPP_GROUP_URL : "";
  const mailHref = `mailto:${SELLER_EMAIL}?subject=${encodeURIComponent("Nuevo pedido — Menú Expertos Chile")}&body=${encodeURIComponent(orderSummary)}`;

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }} className="min-h-screen bg-[var(--surface)] text-[var(--ink)] overflow-x-clip">
      <div className="h-1 bg-[var(--terracotta)]" />

      {/* BOTÓN CARRITO FIJO */}
      <div className="fixed inset-x-0 top-0 z-40 pointer-events-none pt-[var(--safe-area-inset-top)]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-2 flex justify-end">
          <button onClick={() => setCartOpen(true)} className="pointer-events-auto flex items-center gap-2 rounded-full bg-[var(--navy)] text-white pl-3 pr-4 py-2.5 text-[13px] sm:text-sm font-bold shadow-[0_10px_24px_rgba(0,0,0,0.25)] hover:bg-[#163A5E]">
            <ShoppingCart size={17} /> Carrito ({cart.length}) <span className="hidden sm:inline opacity-70">—</span> <span className="hidden sm:inline">Total: {fmt(totals.total)} UF</span><span className="sm:hidden">{fmt(totals.total)} UF</span>
          </button>
        </div>
      </div>

      {/* ============ FUNNEL ============ */}
      {!funnelCollapsed ? (
        <section id="funnel" aria-label="Diagnóstico en 2 minutos" className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          {/* PASO 0 — HERO */}
          <div className="pt-14 sm:pt-20 pb-10 border-b border-[var(--line)]">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
              <span className="flex items-center gap-2 text-[var(--terracotta)]"><Target size={14} /> Diagnóstico · 2 minutos</span>
              <button onClick={() => setFunnelCollapsed(true)} className="flex items-center gap-1 normal-case tracking-normal text-[var(--muted)] hover:text-[var(--ink)]">Ocultar diagnóstico <ChevronDown size={14} className="rotate-180" /></button>
            </div>
            <p className="font-serif-display italic text-[var(--terracotta)] text-lg sm:text-xl mt-8">Antes de elegir — primero, dónde duele</p>
            <h1 className="font-serif-display font-semibold leading-[0.95] mt-3 text-[clamp(2.6rem,7.5vw,5.2rem)] [overflow-wrap:anywhere]">¿Dónde se le va<br />el tiempo a su equipo?</h1>
            <p className="mt-5 max-w-[640px] text-[17px] sm:text-xl leading-snug text-[var(--muted)]">En 2 minutos descubra qué producto necesita. <span className="text-[var(--ink)] font-medium">Sin compromiso, sin venderle humo.</span></p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="flex items-center gap-2 rounded-full bg-[var(--terracotta)] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(192,57,43,0.25)] hover:bg-[#A93226]">Hacer diagnóstico de 2 minutos <ArrowRight size={18} /></button>
              <button onClick={goToMenuDirect} className="rounded-full border border-[var(--navy)] px-6 py-3.5 text-[15px] font-bold text-[var(--navy)] hover:bg-[var(--navy-soft)]">Ver menú directo</button>
            </div>
            <p className="mt-6 max-w-[680px] text-[13.5px] leading-relaxed text-[var(--muted)]">Ayudo a empresas y territorios a mantener su operación y cumplir exigencias de sostenibilidad ante riesgos complejos. Dr. (c) M.Sc. Ing. Gustavo Godoy Uribe — Expertos Chile SpA</p>
            <div className="mt-6 flex items-center gap-3 text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" /> Paso 0 · Hero <span className="h-px flex-1 bg-[var(--line)]" /></div>
          </div>

          {/* PASO 1 — QUIZ */}
          <div id="quiz" className="py-10 border-b border-[var(--line)]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--terracotta)]">Paso 1 · Diagnóstico</p>
                <h2 className="font-serif-display text-[clamp(1.9rem,4.5vw,2.9rem)] leading-[1.02] font-semibold mt-1">Responda 3 preguntas</h2>
              </div>
              <p className="text-[13px] text-[var(--muted)]" aria-live="polite"><strong className="text-[var(--ink)]">{answeredCount} de 3</strong> respondidas · Toque una opción por pregunta</p>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[var(--line)] overflow-hidden" aria-hidden="true"><div className="h-full bg-[var(--terracotta)] transition-all" style={{ width: `${(answeredCount / 3) * 100}%` }} /></div>

            <div className="mt-7 grid gap-6 lg:grid-cols-3">
              {quizQuestions.map((q, qi) => (
                <fieldset key={q.id} className="rounded-[4px] border border-[var(--line)] bg-[var(--card)] p-5">
                  <legend className="sr-only">{q.title}</legend>
                  <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[var(--muted)]">{q.step}</p>
                  <p className="font-serif-display text-[22px] leading-tight font-semibold mt-1.5">{qi + 1}. {q.title}</p>
                  <div className="mt-4 grid gap-2" role="group" aria-label={q.title}>
                    {q.options.map((opt) => {
                      const active = answers[q.id] === opt.id;
                      return (
                        <button key={opt.id} type="button" aria-pressed={active} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                          className={`rounded border px-3.5 py-3 text-left text-[14px] leading-snug transition ${active ? "border-[var(--terracotta)] bg-[var(--terracotta-soft)] font-bold shadow-sm" : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--navy)]"}`}>
                          <span className="flex items-start justify-between gap-2"><span className="[overflow-wrap:anywhere]">{opt.label}</span>{active && <Check size={17} className="mt-0.5 shrink-0 text-[var(--terracotta)]" strokeWidth={3} />}</span>
                          <span className={`mt-1 block text-[12px] ${active ? "text-[var(--terracotta)]" : "text-[var(--muted)]"}`}>{opt.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            {recommended ? (
              <div className="mt-6 rounded-[4px] border-2 border-[var(--terracotta)] bg-[var(--terracotta-soft)] p-5 sm:p-6" role="status">
                <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--terracotta)]"><BadgeCheck size={16} /> Resultado de su diagnóstico</p>
                <p className="mt-3 font-serif-display text-[clamp(1.5rem,3.5vw,2.3rem)] leading-[1.05] font-semibold [overflow-wrap:anywhere]">Su producto recomendado es: {recommended.name} — {recommended.variants ? `${fmt(recommended.variants[0].price)} / ${fmt(recommended.variants[1].price)} UF` : `${fmt(recommended.price!)} UF`} — {recommended.leap}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]"><strong className="text-[var(--ink)]">Entregable:</strong> {recommended.deliverable} · <strong className="text-[var(--ink)]">Alcance:</strong> {recommended.scope}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => goToProduct(recommended.id)} className="flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-[14px] font-bold text-white">Ver esta ficha en el menú <ArrowDown size={16} /></button>
                  <button onClick={() => { if (!cart.includes(recommended.id)) toggleCart(recommended.id); setCartOpen(true); }} className="flex items-center gap-2 rounded-full bg-[var(--terracotta)] px-5 py-3 text-[14px] font-bold text-white">{cart.includes(recommended.id) ? "Ya está en el carrito — ver carrito" : "Agregar al carrito"}</button>
                  <button onClick={resetQuiz} className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-[13px] font-bold"><RotateCcw size={14} /> Volver a responder</button>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded border border-dashed border-[var(--line)] bg-[var(--card)] px-4 py-3 text-[13.5px] text-[var(--muted)]">Responda las 3 preguntas y aquí aparecerá su producto recomendado, con su precio y su salto de valor.</p>
            )}
          </div>

          {/* PASO 2 — PRUEBA / CONFIANZA */}
          <div className="py-10 border-b border-[var(--line)]">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--terracotta)]">Paso 2 · Prueba / Confianza</p>
            <h2 className="font-serif-display text-[clamp(1.9rem,4.5vw,2.9rem)] leading-[1.02] font-semibold mt-1">Sin sorpresas. Con entregable.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Tarifa plana 1 UF/h", desc: "Sin sorpresas" },
                { title: "Peldaño 0 se descuenta", desc: "3,57 UF" },
                { title: "Verificado, no charla", desc: "Entregable que puedes mostrar" },
              ].map((c) => (
                <div key={c.title} className="rounded-[4px] border border-[var(--line)] bg-[var(--card)] p-5">
                  <p className="font-serif-display text-[21px] leading-tight font-semibold [overflow-wrap:anywhere]">{c.title}</p>
                  <p className="mt-1.5 text-[14px] text-[var(--muted)]">{c.desc}</p>
                </div>
              ))}
            </div>
            <blockquote className="mt-6 border-l-2 border-[var(--terracotta)] pl-4 font-serif-display italic text-[22px] sm:text-[26px] leading-snug">“No es charla, es tu trabajo corregido.”</blockquote>
          </div>

          {/* PASO 3 — TRANSICIÓN */}
          <div className="py-10 text-center">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--terracotta)]">Paso 3 · Transición</p>
            <h2 className="font-serif-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.02] font-semibold mt-2">Ahora elija su producto</h2>
            <p className="mt-3 mx-auto max-w-[520px] text-[16px] leading-relaxed text-[var(--muted)]">Ya sabe qué necesita. Ahora elija como en un menú.</p>
            <button onClick={scrollToMenu} aria-label="Ir al menú" className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--navy)] text-white shadow-lg hover:bg-[#163A5E]"><ArrowDown size={22} /></button>
            <p className="mt-3 text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--muted)]">Ir al menú</p>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[var(--line)] bg-[var(--card)] px-4 py-3">
            <p className="text-[13.5px]"><strong>Diagnóstico oculto.</strong> <span className="text-[var(--muted)]">Ya está en el menú — puede volver al diagnóstico cuando quiera.</span></p>
            <button onClick={() => { setFunnelCollapsed(false); window.setTimeout(() => document.getElementById("funnel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); }} className="rounded-full bg-[var(--terracotta)] px-4 py-2.5 text-[13px] font-bold text-white">Mostrar diagnóstico</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
          <span className="flex items-center gap-2 text-[var(--terracotta)]"><UtensilsCrossed size={14} /> Carta de servicios</span>
          <span className="text-[var(--muted)] normal-case tracking-normal">Expertos Chile SpA — Dr. (c) M.Sc. Ing. Gustavo Godoy Uribe — Contacto: <a href={`mailto:${SELLER_EMAIL}`} className="underline underline-offset-2 hover:text-[var(--terracotta)]">{SELLER_EMAIL}</a> — <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-[var(--terracotta)]">Grupo de WhatsApp</a></span>
          <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full border border-[#1F7A4A] bg-[#EAF7EE] px-3 py-1.5 text-[11px] font-bold normal-case tracking-normal text-[#14532D] hover:bg-[#D8EFE0]"><MessageCircle size={13} /> Unirme al grupo de WhatsApp</a>
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:items-end">
          <div>
            <p className="font-serif-display italic text-[var(--terracotta)] text-lg sm:text-xl">Fichas por valor, no por horas</p>
            <h1 className="font-serif-display font-semibold leading-[0.92] mt-2 text-[clamp(3rem,8vw,5.8rem)]">MENÚ</h1>
            <p className="mt-4 max-w-[620px] text-[17px] sm:text-xl leading-snug text-[var(--muted)]">Qué dolor ataca, qué hace el mercado, y qué valor te llevas. <span className="text-[var(--ink)] font-medium">Elige tu plato.</span></p>
            <p className="mt-4 flex items-start gap-2 max-w-[640px] rounded border border-[var(--line)] bg-[var(--card)] px-3.5 py-3 text-[13.5px] leading-snug"><Store size={17} className="mt-0.5 shrink-0 text-[var(--terracotta)]" /><span><strong>Venta online:</strong> agrega, confirma y te contactamos para coordinar fecha y pago. Sin cobro automático en esta página.</span></p>
          </div>
          <div className="border-t-2 border-[var(--ink)] pt-4 lg:pb-2">
            <p className="font-serif-display text-[22px] leading-tight font-semibold">Dr. (c) M.Sc. Ing.<br />Gustavo Godoy Uribe</p>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">Expertos Chile SpA — Dr. (c) M.Sc. Ing. Gustavo Godoy Uribe<br />Tarifa plana <strong className="text-[var(--ink)]">1 UF/h</strong> • IVA 19% incluido<br />Peldaño 0 se descuenta<br />Contacto: <a href={`mailto:${SELLER_EMAIL}`} className="underline underline-offset-2 hover:text-[var(--terracotta)] [overflow-wrap:anywhere]">{SELLER_EMAIL}</a><br /><a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-[var(--terracotta)]">Grupo de WhatsApp</a></p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 border-y border-[var(--line)] divide-x divide-[var(--line)] text-center">
          {[["Desde", "3,57 UF"], ["Plato medio", "21,42 – 28,56 UF"], ["Plato alto", "33,32 UF"]].map(([k, v]) => (
            <div key={k} className="py-4 px-2"><p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">{k}</p><p className="font-serif-display font-semibold text-base sm:text-2xl mt-1 [overflow-wrap:anywhere]">{v}</p></div>
          ))}
        </div>
      </header>

      <main id="menu" className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pb-36">
        <section aria-label="Filtrar por tipo" className="sticky top-[var(--safe-area-inset-top)] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-[var(--surface)]/95 backdrop-blur" data-safe-area-sticky-top>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[var(--muted)] mr-1">Filtrar por tipo:</span>
            {filters.map(f => { const active = filter === f; const count = f === "Todos" ? products.length : products.filter(p => p.type === f).length; return (<button key={f} onClick={() => setFilter(f)} aria-pressed={active} className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${active ? "bg-[var(--navy)] text-white border-[var(--navy)] shadow-sm" : "bg-[var(--card)] border-[var(--line)] hover:border-[var(--navy)]"}`}>{f} <span className="opacity-70 font-medium">· {count}</span></button>); })}
          </div>
          <p className="mt-2 text-[13px] text-[var(--muted)]">Mostrando <strong className="text-[var(--ink)]">{visible.length}</strong> de {products.length} fichas{filter !== "Todos" ? <> · Tipo: <strong className="text-[var(--ink)]">{filter}</strong></> : null}</p>
          {highlightId && <p className="mt-1 text-[13px] font-bold text-[var(--terracotta)]">★ Ficha destacada por su diagnóstico: {products.find(p => p.id === highlightId)?.name}</p>}
        </section>

        {/* PRODUCTOS */}
        <section className="mt-5" aria-live="polite">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map(p => {
              const isInCart = cart.includes(p.id);
              const variant = p.variants?.find(v => v.label === moduleVariant);
              const hours = p.variants ? variant!.hours : p.hours!;
              const price = p.variants ? variant!.price : p.price!;
              const highlighted = highlightId === p.id;
              return (
                <article id={`product-${p.id}`} key={p.id} className={`relative flex flex-col rounded-[4px] border bg-[var(--card)] p-5 sm:p-6 shadow-[0_10px_30px_rgba(31,42,46,0.07)] transition scroll-mt-24 ${highlighted ? "border-[var(--terracotta)] ring-4 ring-[var(--terracotta)]/40 bg-[var(--terracotta-soft)]" : isInCart ? "border-[var(--terracotta)] ring-2 ring-[var(--terracotta)]/25" : "border-[var(--line)] hover:border-[#C8BBA9]"}`}>
                  {highlighted && (<div className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-[var(--terracotta)] px-3 py-1 text-[12px] font-bold text-white shadow">★ Su recomendación</div>)}
                  {isInCart && !highlighted && (<div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full bg-[var(--terracotta)] px-3 py-1 text-[12px] font-bold text-white shadow"><Check size={13} strokeWidth={3} /> En carrito</div>)}
                  {isInCart && highlighted && (<div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full bg-[var(--navy)] px-3 py-1 text-[12px] font-bold text-white shadow"><Check size={13} strokeWidth={3} /> En carrito</div>)}
                  <div className="flex items-start justify-between gap-3"><span className="font-serif-display text-[54px] leading-none font-semibold text-[var(--terracotta)]/90">{p.num}</span><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${badgeStyle[p.type]}`}>{p.type}</span></div>
                  <p className="mt-3 text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--muted)]">{p.code === "Módulo" ? "Módulo · Acompañamiento" : `Ficha ${p.code}`}</p>
                  <h2 className="font-serif-display text-[31px] leading-[1.05] font-semibold mt-1 [overflow-wrap:anywhere]">{p.name}</h2>
                  <div className="mt-4"><p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--muted)]">Dolor</p><p className="mt-1 text-[14.5px] leading-snug [overflow-wrap:anywhere]">{p.pain}</p></div>
                  <div className="mt-4 rounded bg-[var(--cream-deep)] border border-[var(--line)] px-3.5 py-3"><p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--terracotta)]">Salto de valor</p><p className="font-serif-display italic text-[19px] leading-tight mt-1 [overflow-wrap:anywhere]">{p.leap}</p></div>
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-[var(--line)] pt-4">
                    <div><p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]"><Clock3 size={13} /> Horas</p><p className="font-serif-display text-[28px] leading-none font-bold mt-1">{p.variants ? `${p.variants.map(v => `${v.hours} h`).join(" / ")}` : `${hours} h`}</p></div>
                    <div className="text-right"><p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Precio</p><p className="font-serif-display text-[30px] leading-none font-bold text-[var(--navy)] mt-1">{p.variants ? `${fmt(p.variants[0].price)} / ${fmt(p.variants[1].price)}` : fmt(price)} <span className="text-[15px]">UF</span></p></div>
                  </div>
                  {p.variants && (<div className="mt-3 flex gap-2" role="group" aria-label="Elegir duración del acompañamiento">{p.variants.map(v => (<button key={v.label} onClick={() => setModuleVariant(v.label as "M30" | "M90")} aria-pressed={moduleVariant === v.label} className={`flex-1 rounded border px-2 py-2 text-[13px] font-bold ${moduleVariant === v.label ? "bg-[var(--navy)] text-white border-[var(--navy)]" : "bg-transparent border-[var(--line)]"}`}>{v.label} · {v.hours} h · {fmt(v.price)} UF</button>))}</div>)}
                  <div className="mt-4 flex items-start gap-2 text-[13.5px] leading-snug text-[var(--muted)]"><Users size={16} className="mt-0.5 shrink-0 text-[var(--navy)]" /><span><strong className="text-[var(--ink)] font-semibold">Alcance:</strong> <span className="[overflow-wrap:anywhere]">{p.scope}</span></span></div>
                  <p className="mt-2 text-[13.5px]"><strong>Entregable:</strong> {p.deliverable}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button onClick={() => setDetailId(p.id)} className="flex items-center justify-center gap-1.5 rounded border border-[var(--navy)] px-2 py-3 text-[13px] font-bold text-[var(--navy)]"><Eye size={16} /> Ver ficha</button>
                    <button onClick={() => toggleCart(p.id)} aria-pressed={isInCart} className={`flex items-center justify-center gap-1.5 rounded px-2 py-3 text-[13px] font-bold text-white ${isInCart ? "bg-[var(--terracotta)]" : "bg-[var(--navy)] hover:bg-[#163A5E]"}`}>{isInCart ? <><Check size={16} strokeWidth={3} /> Agregado ✓</> : <>Agregar — {fmt(price)} UF</>}</button>
                  </div>
                  {isInCart && <p className="mt-2 text-center text-[12px] text-[var(--muted)]">Toca “Agregado ✓” para quitarlo del carrito.</p>}
                </article>
              );
            })}
          </div>
          {visible.length === 0 && <p className="rounded border border-[var(--line)] bg-[var(--card)] p-6 text-center">Sin fichas para este filtro.</p>}
        </section>

        {/* COMBOS */}
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3 border-t-2 border-[var(--ink)] pt-5">
            <div><p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--terracotta)]"><Sparkles size={14} /> Para llevar completo</p><h2 className="font-serif-display text-[clamp(2rem,5vw,3.2rem)] leading-[1.02] font-semibold mt-1">MENÚS COMBINADOS</h2></div>
            <p className="max-w-[360px] text-[14px] leading-relaxed text-[var(--muted)]">Si ya sabes que quieres el recorrido completo, elige una combinación cerrada. Precio y horas ya sumados.</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((c, i) => { const isInCart = cart.includes(c.id); return (
              <article key={c.id} className={`relative rounded-[4px] border bg-[var(--card)] p-5 flex flex-col shadow-[0_8px_24px_rgba(31,42,46,0.06)] ${isInCart ? "border-[var(--terracotta)] ring-2 ring-[var(--terracotta)]/25" : "border-[var(--line)]"}`}>
                {isInCart && <div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full bg-[var(--terracotta)] px-3 py-1 text-[12px] font-bold text-white"><Check size={13} strokeWidth={3} /> En carrito</div>}
                <div className="flex items-center justify-between"><span className="font-serif-display text-3xl font-semibold text-[var(--navy)]">0{i + 1}</span><span className="rounded-full bg-[var(--navy-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--navy)]">{c.formula}</span></div>
                <h3 className="font-serif-display text-[24px] leading-tight font-semibold mt-3 [overflow-wrap:anywhere]">{c.title}</h3>
                <p className="mt-3 rounded bg-[var(--cream-deep)] px-3 py-2.5 font-serif-display italic text-[16.5px] leading-snug [overflow-wrap:anywhere]">{c.leap}</p>
                <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--line)] pt-3"><span className="text-[14px]"><strong className="font-serif-display text-[22px]">{c.hours} h</strong></span><span className="font-serif-display text-[26px] font-bold text-[var(--navy)]">{fmt(c.price)} <span className="text-sm">UF</span></span></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setDetailId(c.id)} className="flex items-center justify-center gap-1.5 rounded border border-[var(--navy)] px-2 py-2.5 text-[13px] font-bold text-[var(--navy)]"><Eye size={15} /> Ver ficha</button>
                  <button onClick={() => toggleCart(c.id)} aria-pressed={isInCart} className={`flex items-center justify-center gap-1 rounded px-2 py-2.5 text-[13px] font-bold text-white ${isInCart ? "bg-[var(--terracotta)]" : "bg-[var(--navy)]"}`}>{isInCart ? "Agregado ✓" : `Agregar — ${fmt(c.price)} UF`}</button>
                </div>
              </article>
            ); })}
          </div>
        </section>

        <footer className="mt-16 rounded-[4px] bg-[var(--navy)] text-white px-5 sm:px-8 py-7">
          <p className="font-serif-display text-[clamp(1.4rem,3.5vw,2.1rem)] leading-tight font-medium [overflow-wrap:anywhere]">Desde 3,57 UF (Mapa) hasta 33,32 UF por producto solo, y hasta 76,16 UF en combinación completa.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[13px]"><span className="rounded-full border border-white/30 px-3 py-1.5">Escala: Entrada 3,57</span><span className="rounded-full border border-white/30 px-3 py-1.5">Medio 21,42–28,56</span><span className="rounded-full border border-white/30 px-3 py-1.5">Alto 33,32</span><span className="rounded-full bg-white text-[var(--navy)] px-3 py-1.5 font-bold">Tarifa plana 1 UF/h · IVA 19% incluido</span></div>
          <div className="mt-6 border-t border-white/20 pt-5">
            <p className="font-serif-display text-[20px] leading-snug font-medium">¿Tienes dudas antes de comprar? Únete al grupo de WhatsApp de Expertos Chile</p>
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#7ED69A] bg-[#EAF7EE] px-4 py-2.5 text-[13px] font-bold text-[#14532D] hover:bg-white"><MessageCircle size={16} /> Unirme al grupo de WhatsApp</a>
          </div>
          <p className="mt-5 text-[12.5px] leading-relaxed text-white/80 [overflow-wrap:anywhere]">Expertos Chile SpA — Dr. (c) M.Sc. Ing. Gustavo Godoy Uribe — Contacto: <a href={`mailto:${SELLER_EMAIL}`} className="underline underline-offset-2 hover:text-white">{SELLER_EMAIL}</a> — <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-white">Grupo de WhatsApp</a><br />Peldaño 0 se descuenta</p>
        </footer>
      </main>

      {/* BARRA INFERIOR CARRITO */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--terracotta)] bg-[var(--paper)] shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="min-w-0"><p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[var(--muted)]">Carrito · {cart.length} {cart.length === 1 ? "plato" : "platos"}</p><p className="truncate text-[13.5px] font-medium [overflow-wrap:anywhere]">{cartItems.length ? cartItems.map(i => i.name).join("  ·  ") : "Aún no has elegido. Toca “Agregar” en la ficha que quieras."}</p></div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right"><p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{totals.hours} h en total</p><p className="font-serif-display text-[26px] leading-none font-bold text-[var(--terracotta)]">{fmt(totals.total)} UF</p></div>
              <button onClick={() => setCartOpen(true)} className="rounded-full bg-[var(--navy)] text-white px-4 py-2.5 text-[13px] font-bold">Ver carrito</button>
              {cart.length > 0 && (<button onClick={() => { setCart([]); setOrderSummary(""); setOrderStatus(""); }} className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-2 text-[12px] font-bold"><X size={14} /> Limpiar</button>)}
            </div>
          </div>
          {totals.discount > 0 && <p className="mt-1 flex items-center gap-1 text-[12px] text-[var(--muted)]"><Minus size={12} /> Descuento Peldaño 0 aplicado: −{fmt(totals.discount)} UF. Los montos combinados ya incluyen sus productos; evita sumar un combo con sus mismos productos por separado.</p>}
        </div>
      </div>

      {/* FICHA DETALLE */}
      {(detailProduct || detailCombo) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 pt-[max(1rem,var(--safe-area-inset-top))] pb-6 px-4" role="dialog" aria-modal="true" aria-label="Ficha del producto">
          <div className="min-h-full flex items-center justify-center"><div className="w-full max-w-[560px] rounded bg-[var(--card)] border border-[var(--line)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--terracotta)]">Ficha completa</p><button onClick={() => setDetailId(null)} aria-label="Cerrar ficha" className="rounded-full border border-[var(--line)] p-1.5"><X size={16} /></button></div>
            {detailProduct && (<><p className="font-serif-display text-[54px] leading-none font-semibold text-[var(--terracotta)] mt-2">{detailProduct.num}</p><h2 className="font-serif-display text-[34px] leading-[1.05] font-semibold mt-2 [overflow-wrap:anywhere]">{detailProduct.name}</h2><p className="mt-2 text-[13px] font-bold uppercase tracking-wider text-[var(--muted)]">{detailProduct.type} · {detailProduct.scope}</p><p className="mt-4 text-[15px] leading-relaxed"><strong>Dolor:</strong> {detailProduct.pain}</p><div className="mt-4 rounded bg-[var(--cream-deep)] border border-[var(--line)] px-4 py-3"><p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--terracotta)]">Salto de valor</p><p className="font-serif-display italic text-[21px] leading-tight mt-1">{detailProduct.leap}</p></div><p className="mt-4 text-[15px]"><strong>Entregable:</strong> {detailProduct.deliverable}</p><p className="mt-3 font-serif-display text-[26px] font-bold">{detailProduct.variants ? `${fmt(detailProduct.variants[0].price)} / ${fmt(detailProduct.variants[1].price)} UF` : `${fmt(detailProduct.price!)} UF`} <span className="text-sm font-normal text-[var(--muted)]">· {detailProduct.variants ? `${detailProduct.variants.map(v => `${v.hours} h`).join(" / ")}` : `${detailProduct.hours} h`} · IVA 19% incluido</span></p><button onClick={() => { toggleCart(detailProduct.id); }} className={`mt-5 w-full rounded py-3 text-[14px] font-bold text-white ${cart.includes(detailProduct.id) ? "bg-[var(--terracotta)]" : "bg-[var(--navy)]"}`}>{cart.includes(detailProduct.id) ? "Agregado ✓ — quitar del carrito" : `Agregar — ${fmt(detailProduct.variants ? detailProduct.variants.find(v => v.label === moduleVariant)!.price : detailProduct.price!)} UF`}</button></>)}
            {detailCombo && (<><h2 className="font-serif-display text-[34px] leading-[1.05] font-semibold mt-2 [overflow-wrap:anywhere]">{detailCombo.title}</h2><p className="mt-2 text-[13px] font-bold uppercase tracking-wider text-[var(--muted)]">Combinación · {detailCombo.formula}</p><div className="mt-4 rounded bg-[var(--cream-deep)] border border-[var(--line)] px-4 py-3"><p className="font-serif-display italic text-[21px] leading-tight">{detailCombo.leap}</p></div><p className="mt-4 font-serif-display text-[26px] font-bold">{fmt(detailCombo.price)} UF <span className="text-sm font-normal text-[var(--muted)]">· {detailCombo.hours} h · IVA 19% incluido</span></p><button onClick={() => { toggleCart(detailCombo.id); }} className={`mt-5 w-full rounded py-3 text-[14px] font-bold text-white ${cart.includes(detailCombo.id) ? "bg-[var(--terracotta)]" : "bg-[var(--navy)]"}`}>{cart.includes(detailCombo.id) ? "Agregado ✓ — quitar del carrito" : `Agregar — ${fmt(detailCombo.price)} UF`}</button></>)}
          </div></div>
        </div>
      )}

      {/* CARRITO */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 pt-[max(1rem,var(--safe-area-inset-top))] pb-6 px-3 sm:px-4" role="dialog" aria-modal="true" aria-label="Carrito de compras">
          <div className="min-h-full flex items-start sm:items-center justify-center sm:justify-end">
            <div className="w-full max-w-[560px] rounded bg-[var(--card)] border border-[var(--line)] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between gap-3 bg-[var(--navy)] text-white px-5 py-4"><h2 className="font-serif-display text-[24px] font-semibold flex items-center gap-2"><ShoppingCart size={20} /> Carrito ({cart.length})</h2><button onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" className="rounded-full border border-white/30 p-1.5"><X size={16} /></button></div>

              <div className="px-5 py-5">
                {cartItems.length === 0 ? (
                  <div className="rounded border border-dashed border-[var(--line)] p-6 text-center"><p className="font-serif-display text-[20px]">Tu carrito está vacío</p><p className="mt-1 text-[13.5px] text-[var(--muted)]">Agrega un producto o una combinación desde el menú.</p><button onClick={() => setCartOpen(false)} className="mt-4 rounded bg-[var(--navy)] text-white px-4 py-2.5 text-[13px] font-bold">Seguir viendo el menú</button></div>
                ) : (<>
                  <ul className="divide-y divide-[var(--line)]">
                    {cartItems.map(i => (
                      <li key={i.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="font-semibold text-[15px] leading-snug [overflow-wrap:anywhere]">{i.name}</p><p className="text-[12.5px] text-[var(--muted)]">{i.hours} h · {i.code}</p>{i.id === "P0" && totals.discount > 0 && <p className="text-[12px] font-bold text-[var(--terracotta)]">Peldaño 0 en 0 UF por descuento</p>}</div>
                        <div className="text-right shrink-0"><p className="font-serif-display text-[19px] font-bold">{i.id === "P0" && totals.discount > 0 ? "0,00" : fmt(i.price)} UF</p><button onClick={() => removeItem(i.id)} className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[var(--terracotta)]"><Trash2 size={13} /> Quitar</button></div>
                      </li>
                    ))}
                  </ul>

                  {suggestBC && (<div className="mt-4 rounded border border-[var(--terracotta)] bg-[var(--terracotta-soft)] px-4 py-3"><p className="text-[13.5px] leading-snug"><strong>Te conviene Opción 2 Completa:</strong> ahorras 8 h (52,36 UF en vez de 61,88 UF).</p><button onClick={() => applyCombo("C2", ["B", "C"])} className="mt-2 rounded bg-[var(--navy)] text-white px-3 py-2 text-[12.5px] font-bold">Cambiar a Opción 2 Completa</button></div>)}
                  {suggestFG && (<div className="mt-4 rounded border border-[var(--terracotta)] bg-[var(--terracotta-soft)] px-4 py-3"><p className="text-[13.5px] leading-snug"><strong>Te conviene Opción 4 · Gobernanza:</strong> {hasFGModule ? "ahorras 6 h y 7,14 UF frente a F + G + M30 por separado (54,74 UF en vez de 61,88 UF)." : "incluye F + G + Acompañamiento M30 en una combinación cerrada (54,74 UF · 46 h)."}</p><button onClick={() => applyCombo("C4", ["F", "G", "MOD"])} className="mt-2 rounded bg-[var(--navy)] text-white px-3 py-2 text-[12.5px] font-bold">Cambiar a Opción 4 · Gobernanza</button></div>)}

                  <dl className="mt-4 space-y-1.5 border-t border-dashed border-[var(--line)] pt-4 text-[14px]">
                    <div className="flex justify-between"><dt className="text-[var(--muted)]">Subtotal</dt><dd className="font-semibold">{fmt(totals.subtotal)} UF</dd></div>
                    {totals.discount > 0 && <div className="flex justify-between text-[var(--terracotta)]"><dt>Descuento Peldaño 0</dt><dd className="font-bold">−{fmt(totals.discount)} UF</dd></div>}
                    <div className="flex justify-between"><dt className="text-[var(--muted)]">Subtotal neto (sin IVA)</dt><dd className="font-semibold">{fmt(totals.neto)} UF</dd></div>
                    <div className="flex justify-between"><dt className="text-[var(--muted)]">IVA 19%</dt><dd className="font-semibold">{fmt(totals.iva)} UF</dd></div>
                    <div className="flex justify-between border-t border-[var(--line)] pt-2 text-[16px]"><dt className="font-bold">Total con IVA</dt><dd className="font-serif-display text-[24px] font-bold text-[var(--terracotta)]">{fmt(totals.total)} UF</dd></div>
                  </dl>
                  <p className="mt-1 text-[12px] text-[var(--muted)]">Precios en UF, IVA 19% incluido. Sin cobro automático en esta página.</p>

                  <button onClick={() => { setCart([]); setOrderSummary(""); setOrderStatus(""); }} className="mt-4 flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-2 text-[12.5px] font-bold"><Trash2 size={14} /> Vaciar carrito</button>

                  {/* CÓMO PAGAS */}
                  <div className="mt-6">
                    <h3 className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--muted)]">Cómo pagas</h3>
                    <div className="mt-2 grid gap-2" role="radiogroup" aria-label="Cómo pagas">
                      {([["transferencia", "Transferencia", "Factura en UF"], ["link", "Link de pago", "Te enviamos link"], ["cuotas", "2 cuotas", "50% al inicio, 50% al entregar"]] as const).map(([val, title, desc]) => (
                        <button key={val} type="button" role="radio" aria-checked={pago === val} onClick={() => setPago(val)} className={`flex items-start gap-3 rounded border px-3.5 py-3 text-left ${pago === val ? "border-[var(--terracotta)] bg-[var(--terracotta-soft)]" : "border-[var(--line)] bg-[var(--paper)]"}`}>
                          <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${pago === val ? "border-[var(--terracotta)] bg-[var(--terracotta)]" : "border-[var(--muted)]"}`} />
                          <span><span className="block font-bold text-[14px]">{title}</span><span className="block text-[12.5px] text-[var(--muted)]">{desc}</span></span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FORMULARIO */}
                  <form className="mt-6" onSubmit={e => e.preventDefault()}>
                    <h3 className="font-serif-display text-[22px] font-semibold">Confirmar pedido</h3>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">Completa tus datos. Guardamos tu pedido y te contactamos para coordinar fecha y forma de pago.</p>
                    <div className="mt-4 grid gap-3">
                      <label className="grid gap-1 text-[13px] font-bold">Nombre *<input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" className="rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-normal" /></label>
                      <label className="grid gap-1 text-[13px] font-bold">Empresa<input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Empresa u organización (opcional)" className="rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-normal" /></label>
                      <label className="grid gap-1 text-[13px] font-bold">Correo *<input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@empresa.cl" className="rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-normal" /></label>
                      <label className="grid gap-1 text-[13px] font-bold">WhatsApp / Teléfono *<input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Tu WhatsApp o teléfono" className="rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-normal" /></label>
                      <label className="grid gap-1 text-[13px] font-bold">¿Para cuándo lo necesitas?<select value={cuando} onChange={e => setCuando(e.target.value)} className="rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-normal"><option>Esta semana</option><option>Este mes</option><option>Próximo mes</option></select></label>
                      <label className="flex items-start gap-2.5 text-[13.5px] leading-snug"><input type="checkbox" checked={acepto} onChange={e => setAcepto(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C0392B]" /> Acepto que me contacten para coordinar fecha y forma de pago</label>
                    </div>
                    {formError && <p role="alert" className="mt-3 rounded bg-[var(--terracotta-soft)] px-3 py-2.5 text-[13px] font-semibold text-[var(--terracotta)]">{formError}</p>}
                    <div className="mt-4 grid gap-2">
                      <button type="button" disabled={orderSaving} onClick={() => confirmOrder("whatsapp")} className="flex items-center justify-center gap-2 rounded bg-[var(--terracotta)] px-4 py-3.5 text-[14px] font-bold text-white disabled:opacity-60"><MessageCircle size={17} /> {orderSaving ? "Guardando pedido…" : "Enviar pedido al grupo de WhatsApp"}</button>
                      <button type="button" disabled={orderSaving} onClick={() => confirmOrder("correo")} className="flex items-center justify-center gap-2 rounded border border-[var(--navy)] px-4 py-3 text-[14px] font-bold text-[var(--navy)] disabled:opacity-60"><Mail size={16} /> Enviar pedido por correo</button>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-snug text-[var(--muted)]">Se abrirá el grupo, pega el resumen de tu pedido ahí.</p>
                    {orderStatus && <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-snug text-[var(--muted)]"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--terracotta)]" />{orderStatus}</p>}
                  </form>

                  <div className="mt-6 rounded border border-[#1F7A4A] bg-[#EAF7EE] px-4 py-3.5">
                    <p className="text-[14px] font-bold leading-snug text-[#14532D]">¿Tienes dudas? Pregunta en el grupo de WhatsApp</p>
                    <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-[#1F7A4A] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#14532D] hover:bg-[#D8EFE0]"><MessageCircle size={16} /> Unirme al grupo de WhatsApp</a>
                  </div>

                  {orderSummary && (<div className="mt-6 rounded border border-[var(--line)] bg-[var(--paper)] p-4">
                    <h4 className="font-serif-display text-[19px] font-semibold">Resumen de tu pedido</h4>
                    <p className="mt-1 text-[12.5px] text-[var(--muted)]">Se abrirá {orderChannel === "correo" ? "tu correo" : "el grupo de WhatsApp"} con este mensaje listo.{orderChannel !== "correo" ? " Se abrirá el grupo, pega el resumen de tu pedido ahí." : ""}</p>
                    <textarea ref={summaryRef} readOnly value={orderSummary} rows={6} className="mt-3 w-full rounded border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] leading-relaxed [overflow-wrap:anywhere]" />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button onClick={copySummary} className="flex items-center gap-1.5 rounded border border-[var(--navy)] px-3 py-2 text-[12.5px] font-bold text-[var(--navy)]"><Copy size={14} /> {copied ? "Copiado ✓" : "Copiar resumen"}</button>
                      {orderChannel !== "correo" && waHref && <a href={waHref} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded bg-[#1F7A4A] px-3 py-2 text-[12.5px] font-bold text-white"><MessageCircle size={14} /> Abrir grupo de WhatsApp</a>}
                      {orderChannel === "correo" && <a href={mailHref} className="flex items-center gap-1.5 rounded bg-[var(--navy)] px-3 py-2 text-[12.5px] font-bold text-white"><Mail size={14} /> Abrir correo</a>}
                    </div>
                    {orderChannel !== "correo" && <p className="mt-2 text-[12px] text-[var(--muted)]">Copia el resumen y pégalo en el grupo.</p>}
                  </div>)}

                  <div className="mt-6 rounded border border-dashed border-[var(--line)] px-4 py-3">
                    <p className="text-[13px] font-bold">Contacto</p>
                    <p className="mt-2 text-[12.5px] text-[var(--muted)]">Los pedidos llegan por correo o al grupo de WhatsApp.</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed [overflow-wrap:anywhere]"><strong>Correo:</strong> <a href={`mailto:${SELLER_EMAIL}`} className="underline underline-offset-2 text-[var(--navy)]">{SELLER_EMAIL}</a></p>
                    <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener" className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-[#1F7A4A] bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#14532D]"><MessageCircle size={14} /> Unirme al grupo de WhatsApp</a>
                  </div>
                </>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
