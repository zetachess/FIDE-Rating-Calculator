import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, BookOpenText, Cake, ChartBar, ChartLine, ChartNoAxesCombined, ChartPie, ChevronDown, CircleHelp, CircleX, ExternalLink, Flag, Gauge, Handshake, Hash, Info, Languages, List, Plus, Radio, RotateCcw, Route, Share2, Target, TrendingUp, Trophy, UserRound, UserRoundPlus, X, Zap, Trash2 } from 'lucide-react';
import { ES, GB } from 'country-flag-icons/react/3x2';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { calculateInitialRating, calculateRatingPeriod } from './lib/fideRating';
import { DP_TABLE, PD_TABLE } from './lib/fideTables';
import type { GameResult, RatedGame } from './types/rating';

type Language = 'en' | 'es';
type Mode = 'rated' | 'unrated' | 'help';
type Texts = typeof copy.en;

const seed: RatedGame[] = [{ id: '1', opponentRating: '', result: 'draw' }];
const STORAGE_KEY = 'fide-state-v2';
const uid = () => crypto.randomUUID();
const resultLabels: Record<GameResult, string> = { win: '1', draw: '½', loss: '0' };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const copy = {
  en: {
    title: 'FIDE Rating Calculator',
    subtitle: 'Developed by NA Diego Alvarez',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    share: 'Share web',
    reset: 'Reset',
    regulations: 'FIDE Regulations',
    handbook: 'FIDE Handbook',
    tabs: { rated: 'I have a FIDE rating', unrated: "I'm unrated", help: 'How it works' },
    currentTitle: 'Your current FIDE rating',
    currentHelp: 'Enter your ELO rating.',
    initialTitle: 'Calculate your initial FIDE rating',
    initialHelp: 'Enter your results against FIDE-rated opponents.',
    currentRating: 'Current rating',
    age: 'Age',
    completed: 'Rated games completed',
    reached: 'If you ever reached 2400 ELO',
    reachedTiny: 'FIDE applies K = 10',
    reachedRules: ['Turn this on only if your published FIDE rating has reached 2400 or more before.', 'When a player has reached 2400 ELO, FIDE uses K = 10.'],
    kFactor: 'K factor',
    kTiny: 'What does K mean?',
    kRules: ['K = 40 → new or young players.', 'K = 20 → most players.', 'K = 10 → players who have reached 2400 ELO.'],
    minRatingError: 'A FIDE published rating cannot be below 1400.',
    games: 'Your games',
    gamesHelp: 'Opponent ratings and results.',
    valid: 'valid',
    opponent: 'Opponent rating',
    opponentPlaceholder: 'Enter your opponent ELO',
    result: 'Result',
    remove: 'Remove game',
    addGame: 'Add game',
    virtualOpponent: 'FIDE virtual opponent',
    draw: 'Draw',
    virtualNote: 'Added by the official initial-rating calculation',
    newRating: 'Your new rating',
    initialResult: 'Initial rating result',
    live: 'Live',
    startingRating: 'Starting rating',
    ratingChange: 'Rating change',
    newRatingMetric: 'New rating',
    ratingMap: 'Rating map',
    score: 'Score',
    wins: 'wins',
    draws: 'draws',
    losses: 'losses',
    breakdown: 'Game breakdown',
    emptyScore: 'Add a rated opponent to start the score sheet.',
    difference: 'Difference',
    expected: 'Expected',
    initialFideRating: 'Initial FIDE rating',
    eligible: 'Eligible for publication',
    notEnough: 'Not enough rated games yet',
    ratedGames: 'Rated games',
    virtualGames: 'Virtual games',
    averageOpposition: 'Average opposition',
    scorePercentage: 'Score percentage',
    dp: 'dp',
    analytics: 'Rating analytics',
    analyticsHelp: 'Shadcn-style Recharts: progression, game impact and score profile.',
    ratingPath: 'Rating path',
    gameImpact: 'Game impact',
    scoreProfile: 'Score profile',
    win: 'Win',
    loss: 'Loss',
    resultNames: { win: 'win', draw: 'draw', loss: 'loss' },
    initialReasonFallback: 'At least 5 rated games are required',
    howCalculated: 'How was this calculated?',
    fideTables: 'Official FIDE Tables',
    tablesHelp: 'Exact lookup constants used by the engine',
    search: 'Search a value…',
    footerA: 'Calculations based on the official FIDE Rating Regulations.',
    footerB: 'This tool is independent and is not an official FIDE service.',
    copyLink: 'Copy this link',
    helpTitle: 'How can I help you understand the calculator?',
    promptPlaceholder: 'Type a question about FIDE ratings…',
    ask: 'Ask',
    guide: 'GUIDE',
    fallbackAnswer: 'Choose one of the suggested questions below for a concise FIDE explanation.',
    start: 'Start',
    gameShort: 'Game',
    noGames: '0 games',
    faqs: [
      ['How do I calculate a new rating?', 'Choose “I have a FIDE rating”, enter your current rating, pick your K factor, then add each opponent and score. The result updates instantly.'],
      ['What is an initial rating?', 'Choose “I’m unrated”. Add at least five rated opponents and your results; FIDE adds two virtual 1800-rated draws to the official initial-rating calculation.'],
      ['What do 1 / ½ / 0 mean?', 'They are the official FIDE scores: 1 for a win, ½ for a draw and 0 for a loss.'],
      ['When does FIDE publish my rating?', 'A new rating needs at least five rated games and must reach the current publication floor of 1400.'],
      ['What is the 400-point rule?', 'For players below 2650, a difference above 400 is counted as 400. From 2650 onward, the full difference is used.'],
      ['How does K factor work?', 'Choose K = 10, 20 or 40. FIDE also limits K multiplied by the number of games to 700 in one rating period.'],
      ['What happens with a zero-score first event?', 'Under Article 8.2.1, a zero score in the first event is disregarded for the initial-rating calculation.'],
      ['What are the initial-rating limits?', 'The initial rating needs at least five valid rated games, must reach 1400 to be published, and is capped at 2200.'],
      ['Which games are counted?', 'Only valid games against rated opponents from 1400 upward are counted; empty or invalid rows are ignored.'],
    ],
  },
  es: {
    title: 'Calculadora de rating FIDE',
    subtitle: 'Desarrollado por AN Diego Álvarez',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',
    share: 'Compartir web',
    reset: 'Reiniciar',
    regulations: 'Reglamento FIDE',
    handbook: 'Manual FIDE',
    tabs: { rated: 'Tengo ELO FIDE', unrated: 'No tengo ELO', help: '¿Cómo funciona?' },
    currentTitle: 'Tu rating FIDE actual',
    currentHelp: 'Introduce tu rating ELO.',
    initialTitle: 'Calcula tu rating FIDE inicial',
    initialHelp: 'Introduce tus resultados contra rivales con rating FIDE.',
    currentRating: 'ELO actual',
    age: 'Edad',
    completed: 'Partidas valoradas jugadas',
    reached: 'Si ya superaste los 2400 ELO',
    reachedTiny: 'FIDE aplica K = 10',
    reachedRules: ['Actívalo solo si tu rating FIDE publicado ya llegó alguna vez a 2400 o más.', 'Cuando un jugador ha alcanzado 2400 ELO, FIDE usa K = 10.'],
    kFactor: 'Factor K',
    kTiny: '¿Qué es el factor K?',
    kRules: ['K = 40 → jugadores nuevos/jóvenes.', 'K = 20 → mayoría de jugadores.', 'K = 10 → jugadores que han alcanzado 2400 ELO.'],
    minRatingError: 'Un rating FIDE publicado no puede estar por debajo de 1400.',
    games: 'Tus partidas',
    gamesHelp: 'Ratings de rivales y resultados.',
    valid: 'válidas',
    opponent: 'Rating del rival',
    opponentPlaceholder: 'Introduce el ELO de tu rival',
    result: 'Resultado',
    remove: 'Eliminar partida',
    addGame: 'Añadir partida',
    virtualOpponent: 'Rival virtual FIDE',
    draw: 'Tablas',
    virtualNote: 'Añadido por el cálculo oficial del rating inicial',
    newRating: 'Tu nuevo rating',
    initialResult: 'Resultado del rating inicial',
    live: 'En vivo',
    startingRating: 'Rating inicial',
    ratingChange: 'Cambio de rating',
    newRatingMetric: 'Nuevo rating',
    ratingMap: 'Mapa de rating',
    score: 'Puntuación',
    wins: 'victorias',
    draws: 'tablas',
    losses: 'derrotas',
    breakdown: 'Detalle de partidas',
    emptyScore: 'Añade un rival con rating para empezar la planilla.',
    difference: 'Diferencia',
    expected: 'Esperado',
    initialFideRating: 'Rating FIDE inicial',
    eligible: 'Publicable',
    notEnough: 'Aún no hay suficientes partidas con rating',
    ratedGames: 'Partidas válidas',
    virtualGames: 'Partidas virtuales',
    averageOpposition: 'Media de rivales',
    scorePercentage: 'Porcentaje',
    dp: 'dp',
    analytics: 'Analítica de rating',
    analyticsHelp: 'Gráficas estilo shadcn con progresión, impacto y perfil de puntuación.',
    ratingPath: 'Ruta del rating',
    gameImpact: 'Impacto por partida',
    scoreProfile: 'Perfil de puntuación',
    win: 'Victoria',
    loss: 'Derrota',
    resultNames: { win: 'victoria', draw: 'tablas', loss: 'derrota' },
    initialReasonFallback: 'Se necesitan al menos 5 partidas válidas',
    howCalculated: 'Cómo se calculó',
    fideTables: 'Tablas oficiales FIDE',
    tablesHelp: 'Constantes exactas usadas por el motor',
    search: 'Buscar valor…',
    footerA: 'Cálculos basados en las Regulaciones oficiales de rating FIDE.',
    footerB: 'Esta herramienta es independiente y no es un servicio oficial de FIDE.',
    copyLink: 'Copia este enlace',
    helpTitle: '¿Cómo puedo ayudarte a entender la calculadora?',
    promptPlaceholder: 'Pregunta algo sobre ratings FIDE…',
    ask: 'Preguntar',
    guide: 'GUÍA',
    fallbackAnswer: 'Elige una de las preguntas sugeridas para ver una explicación breve sobre FIDE.',
    start: 'Inicio',
    gameShort: 'Partida',
    noGames: '0 partidas',
    faqs: [
      ['¿Cómo calculo mi nuevo ELO FIDE?', 'Elige “Tengo ELO FIDE”, introduce tu ELO actual, selecciona el factor K y añade cada rival con su resultado. El cálculo se actualiza al instante.'],
      ['¿Qué pasa si no tengo ELO?', 'Elige “No tengo ELO”. Añade al menos cinco rivales con rating FIDE y tus resultados; FIDE suma dos tablas virtuales contra rivales de 1800.'],
      ['¿Qué significan 1 / ½ / 0?', 'Son los resultados FIDE: 1 por victoria, ½ por tablas y 0 por derrota.'],
      ['¿Cuándo publica FIDE mi ELO?', 'Para publicar un nuevo ELO hacen falta al menos cinco partidas válidas y llegar al mínimo actual de 1400.'],
      ['¿Qué es la regla de 400 puntos?', 'Para jugadores por debajo de 2650, una diferencia superior a 400 se cuenta como 400. Desde 2650 se usa la diferencia completa.'],
      ['¿Cómo funciona el factor K?', 'Puedes elegir K = 10, 20 o 40. FIDE también limita K multiplicado por las partidas a 700 en un periodo.'],
      ['¿Qué pasa con un primer evento con cero puntos?', 'Según el Artículo 8.2.1, un cero en el primer evento se descarta para calcular el rating inicial.'],
      ['¿Cuáles son los límites del ELO inicial?', 'El ELO inicial necesita al menos cinco partidas válidas, debe llegar a 1400 para publicarse y tiene un máximo de 2200.'],
      ['¿Qué partidas cuentan?', 'Solo cuentan partidas válidas contra rivales con rating desde 1400; las filas vacías o inválidas se ignoran.'],
    ],
  },
};

function ResultToggle({ value, onChange, t }: { value: GameResult; onChange: (x: GameResult) => void; t: Texts }) {
  const titles: Record<GameResult, string> = { win: t.win, draw: t.draw, loss: t.loss };
  return <div className="result-toggle">{(['win', 'draw', 'loss'] as const).map((x) => <button aria-label={titles[x]} title={titles[x]} aria-pressed={value === x} className={value === x ? 'active' : ''} onClick={() => onChange(x)} key={x}>{resultLabels[x]}</button>)}</div>;
}

function GameList({ games, setGames, virtual = false, t }: { games: RatedGame[]; setGames: (x: RatedGame[]) => void; virtual?: boolean; t: Texts }) {
  return <div className="games"><div className="game-head"><span><UserRound size={12} />{t.opponent}</span><span><ChartNoAxesCombined size={12} />{t.result}</span><span /></div>{games.map((g, i) => <div className="game-row" key={g.id}><div className="number-field"><span>{i + 1}</span><input aria-label={`${t.opponent} ${i + 1}`} placeholder={t.opponentPlaceholder} autoFocus={i === 0 && g.opponentRating === ''} min="1400" max="4000" inputMode="numeric" value={g.opponentRating} onChange={(e) => setGames(games.map((x) => x.id === g.id ? { ...x, opponentRating: e.target.value } : x))} /></div><ResultToggle value={g.result} onChange={(result) => setGames(games.map((x) => x.id === g.id ? { ...x, result } : x))} t={t} /><button className="icon-button" aria-label={t.remove} onClick={() => setGames(games.filter((x) => x.id !== g.id))}><Trash2 size={16} /></button></div>)}<button className="add" onClick={() => setGames([...games, { id: uid(), opponentRating: '', result: 'draw' }])}><Plus size={16} />{t.addGame}</button>{virtual && <><div className="virtual-row"><span>{t.virtualOpponent}</span><strong>1800</strong><span>{t.draw}</span></div><div className="virtual-row"><span>{t.virtualOpponent}</span><strong>1800</strong><span>{t.draw}</span></div><p className="virtual-note">{t.virtualNote}</p></>}</div>;
}

function Metric({ label, value, accent = false, tone, icon }: { label: string; value: string | number; accent?: boolean; tone?: string; icon?: ReactNode }) {
  return <div className={accent ? 'metric focal' : 'metric'}><span>{icon}{label}</span><strong className={tone}>{value}</strong></div>;
}

function RatingGauge({ value, label, icon }: { value: number; label: string; icon?: ReactNode }) {
  const pct = clamp((Number(value || 0) - 1400) / (2650 - 1400) * 100, 0, 100);
  return <div className="rating-gauge"><div className="gauge-head"><span>{icon}{label}</span><strong>{value || 0}</strong></div><div className="gauge-track"><i style={{ left: `${pct}%` }} />{[1400, 1800, 2200, 2400, 2650].map((v) => <span key={v} style={{ left: `${clamp((v - 1400) / (2650 - 1400) * 100, 0, 100)}%` }}>{v}</span>)}</div></div>;
}

function HelpPanel({ t }: { t: Texts }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const ask = (q: string, a: string) => { setQuestion(q); setAnswer(a); };
  return <section className="help-panel"><div className="help-heading"><h2>{t.helpTitle}</h2></div><div className="prompt-box"><input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && question) setAnswer(t.fallbackAnswer); }} placeholder={t.promptPlaceholder} /><button onClick={() => question && setAnswer(t.fallbackAnswer)}>{t.ask}</button></div><div className="prompt-suggestions">{t.faqs.map(([q, a]) => <button key={q} onClick={() => ask(q, a)}>{q}</button>)}</div>{answer && <div className="prompt-answer"><span>{t.guide}</span><strong>{question}</strong><p>{answer}</p></div>}</section>;
}

const saved = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; } })();

export default function App() {
  const [mode, setMode] = useState<Mode>(saved.mode ?? 'rated');
  const [language, setLanguage] = useState<Language>(saved.language ?? 'en');
  const [rating, setRating] = useState(String(saved.rating || ''));
  const [age, setAge] = useState(saved.age ?? 0);
  const [completed, setCompleted] = useState(saved.completed ?? 0);
  const [reached, setReached] = useState(saved.reached ?? false);
  const [kOverride, setKOverride] = useState(saved.kOverride || 20);
  const [games, setGames] = useState<RatedGame[]>(saved.games?.length ? saved.games : seed);
  const [details, setDetails] = useState(false);
  const [tables, setTables] = useState(false);
  const [tableTab, setTableTab] = useState<'pd' | 'dp'>('pd');
  const [search, setSearch] = useState('');
  const t = copy[language];

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, language, rating, age, completed, reached, kOverride, games })), [mode, language, rating, age, completed, reached, kOverride, games]);

  const ratingValue = Number(rating) || 0;
  const ratingDigits = rating.replace(/\D/g, '');
  const showRatingFloorError = ratingDigits.length >= 4 && ratingValue < 1400;
  const valid = games.filter((g) => Number(g.opponentRating) >= 1400 && Number(g.opponentRating) <= 4000);
  const rated = useMemo(() => calculateRatingPeriod({ rating: ratingValue, age, ratedGamesCompleted: completed, previouslyReached2400: reached, kOverride: kOverride || undefined }, valid), [ratingValue, age, completed, reached, kOverride, valid]);
  const initial = useMemo(() => calculateInitialRating(valid), [valid]);
  const record = { wins: valid.filter((g) => g.result === 'win').length, draws: valid.filter((g) => g.result === 'draw').length, losses: valid.filter((g) => g.result === 'loss').length };
  const chart = rated.progression.map((v, i) => ({ name: i ? `${t.gameShort} ${i}` : t.start, rating: Math.round(v) }));
  const contributionChart = rated.games.map((g, i) => ({ name: `G${i + 1}`, change: Number((g.contribution * rated.k).toFixed(1)), fill: g.contribution >= 0 ? 'var(--chart-win)' : 'var(--chart-loss)' }));
  const scoreChart = [{ name: t.win, value: record.wins, fill: 'var(--chart-win)' }, { name: t.draw, value: record.draws, fill: 'var(--chart-draw)' }, { name: t.loss, value: record.losses, fill: 'var(--chart-loss)' }].filter((x) => x.value > 0);
  const reset = () => { setMode('rated'); setRating(''); setAge(0); setCompleted(0); setReached(false); setKOverride(20); setGames(seed); };
  const share = async () => { const url = window.location.href; try { if (navigator.share) { await navigator.share({ title: t.title, url }); return; } await navigator.clipboard.writeText(url); } catch { window.prompt(t.copyLink, url); } };

  return <div className={mode === 'help' ? 'app help-mode' : 'app'}><header><div><div className="brand"><div className="mark"><img src="/elo-logo.png" alt="ELO" /></div><h1>{t.title}</h1></div><p>{t.subtitle}</p></div><div className="header-actions"><div className="language-switch" aria-label={t.language}><Languages className="language-icon" size={15} /><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}><GB title="United Kingdom" className="flag" />{t.english}</button><button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')}><ES title="Spain" className="flag" />{t.spanish}</button></div><button className="share-web" onClick={share}><Share2 size={14} />{t.share}</button><button onClick={reset}><RotateCcw size={14} />{t.reset}</button><a href="https://handbook.fide.com/chapter/B022024" target="_blank"><BookOpenText size={14} />{t.regulations} <ExternalLink size={14} /></a></div></header><main><div className="mode-tabs"><button className={mode === 'rated' ? 'active' : ''} onClick={() => setMode('rated')}><BadgeCheck size={15} />{t.tabs.rated}</button><button className={mode === 'unrated' ? 'active' : ''} onClick={() => setMode('unrated')}><UserRoundPlus size={15} />{t.tabs.unrated}</button><button className={mode === 'help' ? 'active' : ''} onClick={() => setMode('help')}><CircleHelp size={15} />{t.tabs.help}</button></div><HelpPanel t={t} /><section className="workspace"><div className="input-panel"><div className="section-title"><div><h2>{mode === 'rated' ? t.currentTitle : t.initialTitle}</h2><p>{mode === 'rated' ? t.currentHelp : t.initialHelp}</p></div></div>{mode === 'rated' && <><label className="hero-input"><span><Gauge size={13} />{t.currentRating}</span><input type="number" value={rating} min="1400" max="4000" placeholder="0" onChange={(e) => setRating(e.target.value)} /></label>{showRatingFloorError && <div className="field-error"><CircleX size={17} /><span>{t.minRatingError}</span></div>}<div className="info-grid"><label><span><Cake size={13} />{t.age}</span><input type="number" value={age} min="1" onChange={(e) => setAge(Number(e.target.value))} /></label><label><span>{t.completed}</span><input type="number" value={completed} min="0" onChange={(e) => setCompleted(Number(e.target.value))} /></label><div className="reached-block"><label className="check"><input type="checkbox" checked={reached} onChange={(e) => { const checked = e.target.checked; setReached(checked); setKOverride(checked ? 10 : 20); }} /><span>{t.reached}</span></label><details className="k-help reached-help"><summary><Info size={12} />{t.reachedTiny}</summary><ul>{t.reachedRules.map((rule) => <li key={rule}>{rule}</li>)}</ul></details></div><div className="k"><span><Zap size={13} />{t.kFactor}</span><div className="k-toggle">{[10, 20, 40].map((v) => <button aria-pressed={(kOverride || rated.k) === v} onClick={() => setKOverride(v)} key={v}>{v}</button>)}</div><details className="k-help"><summary><Info size={12} />{t.kTiny}</summary><ul>{t.kRules.map((rule) => <li key={rule}>{rule}</li>)}</ul></details></div></div></>}<div className="games-title"><div><h2>{t.games}</h2><p>{t.gamesHelp}</p></div><span>{valid.length} {t.valid}</span></div><GameList games={games} setGames={setGames} virtual={mode === 'unrated'} t={t} /></div><div className="result-panel" aria-live="polite"><div className="rating-tape"><span>1400</span><span>1800</span><span>2200</span><span>2650</span></div><div className="spectrum-rail" /><div className="result-title"><div><h2><Gauge size={17} />{mode === 'rated' ? t.newRating : t.initialResult}</h2></div><span className="live-signal"><Radio size={13} />{t.live}</span></div>{mode === 'rated' ? <><div className="result-grid"><Metric label={t.startingRating} value={ratingValue} icon={<Flag size={12} />} /><Metric label={t.ratingChange} value={`${rated.change >= 0 ? '+' : ''}${rated.change}`} tone={rated.change > 0 ? 'positive' : rated.change < 0 ? 'negative' : ''} icon={<TrendingUp size={12} />} /><Metric label={t.newRatingMetric} value={rated.newRating} accent icon={<Gauge size={12} />} /></div><RatingGauge value={rated.newRating} label={t.ratingMap} icon={<Route size={12} />} /><div className="score-line"><span><Target size={12} />{t.score}</span><strong>{rated.score} / {valid.length}</strong><span>{valid.length ? Math.round(rated.score / valid.length * 100) : 0}%</span></div><div className="score-track"><span style={{ width: `${valid.length ? rated.score / valid.length * 100 : 0}%` }} /></div><div className="record"><span><Trophy size={12} />{record.wins} {t.wins}</span><span><Handshake size={12} />{record.draws} {t.draws}</span><span><X size={12} />{record.losses} {t.losses}</span></div><h3><List size={15} />{t.breakdown}</h3><div className="breakdown">{rated.games.length ? rated.games.map((g, i) => <div className="break-row" key={valid[i]?.id}><span>{g.opponentRating}<small>{valid[i]?.result ? t.resultNames[valid[i].result] : ''}</small></span><span><small>{t.difference}</small>{g.effectiveDifference > 0 ? '+' : ''}{g.effectiveDifference}</span><span><small>{t.expected}</small>{Math.round(g.expectedScore * 100)}%</span><strong className={g.contribution >= 0 ? 'positive' : 'negative'}>{g.contribution >= 0 ? '+' : ''}{(g.contribution * rated.k).toFixed(1)}</strong></div>) : <div className="empty-score">{t.emptyScore}</div>}</div></> : <><div className="initial-number"><span>{t.initialFideRating}</span><strong>{initial.initialRating ?? '—'}</strong><em className={initial.eligible ? 'eligible' : 'pending'}>{initial.eligible ? t.eligible : t.notEnough}</em>{!initial.eligible && <small>{t.initialReasonFallback}</small>}</div><RatingGauge value={initial.initialRating ?? 0} label={t.ratingMap} icon={<Route size={12} />} /><div className="summary-grid"><Metric label={t.ratedGames} value={initial.ratedGames} icon={<Hash size={12} />} /><Metric label={t.score} value={`${initial.score} / ${initial.ratedGames}`} icon={<Target size={12} />} /><Metric label={t.virtualGames} value={initial.virtualGames} /><Metric label={t.averageOpposition} value={initial.averageOpposition} /><Metric label={t.scorePercentage} value={`${Math.round(initial.percentage * 100)}%`} /><Metric label={t.dp} value={initial.dp} /></div></>}</div></section>{mode === 'rated' && <section className="wide-panel chart-panel"><div className="wide-title"><div><h2><ChartLine size={17} />{t.analytics}</h2><p>{t.analyticsHelp}</p></div><BookOpenText size={18} /></div><div className="chart-grid"><div className="chart-card chart-card-wide"><div className="chart-card-title"><span><Route size={12} />{t.ratingPath}</span><strong>{rated.newRating}</strong></div><div className="chart"><ResponsiveContainer><AreaChart data={chart}><defs><linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-rating)" stopOpacity={0.38} /><stop offset="1" stopColor="var(--chart-rating)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" stroke="var(--chart-axis)" tickLine={false} axisLine={false} /><YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke="var(--chart-axis)" tickLine={false} axisLine={false} width={45} /><Tooltip cursor={{ stroke: 'var(--chart-rating)', strokeOpacity: 0.25 }} contentStyle={{ background: '#080e0b', border: '1px solid #536755', borderRadius: 8, color: '#f5f1e8' }} /><Area type="monotone" dataKey="rating" stroke="var(--chart-rating)" strokeWidth={2.5} fill="url(#ratingFill)" dot={{ fill: 'var(--chart-rating)', stroke: '#07100d', strokeWidth: 2, r: 4 }} /></AreaChart></ResponsiveContainer></div></div><div className="chart-card"><div className="chart-card-title"><span><ChartBar size={12} />{t.gameImpact}</span><strong>{rated.change >= 0 ? '+' : ''}{rated.change}</strong></div><div className="mini-chart"><ResponsiveContainer><BarChart data={contributionChart}><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="name" stroke="var(--chart-axis)" tickLine={false} axisLine={false} /><YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} width={34} /><Tooltip cursor={{ fill: '#c5ec8f10' }} contentStyle={{ background: '#080e0b', border: '1px solid #536755', borderRadius: 8, color: '#f5f1e8' }} /><Bar dataKey="change" radius={[4, 4, 4, 4]}>{contributionChart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Bar></BarChart></ResponsiveContainer></div></div><div className="chart-card"><div className="chart-card-title"><span><ChartPie size={12} />{t.scoreProfile}</span><strong>{valid.length ? Math.round(rated.score / valid.length * 100) : 0}%</strong></div><div className="donut-wrap">{scoreChart.length ? <ResponsiveContainer><PieChart><Tooltip contentStyle={{ background: '#080e0b', border: '1px solid #536755', borderRadius: 8, color: '#f5f1e8' }} /><Pie data={scoreChart} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">{scoreChart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie></PieChart></ResponsiveContainer> : <div className="empty-donut">{t.noGames}</div>}</div><div className="chart-legend"><span><i className="win-dot" />{t.win}</span><span><i className="draw-dot" />{t.draw}</span><span><CircleX size={12} />{t.loss}</span></div></div></div></section>}<section className="disclosure"><button onClick={() => setDetails(!details)}><span><strong>{t.howCalculated}</strong><small>{mode === 'rated' ? 'Articles 8.3.1–8.3.3' : 'Article 8.2'}</small></span><ChevronDown className={details ? 'rotated' : ''} /></button></section><section className="disclosure"><button onClick={() => setTables(!tables)}><span><strong>{t.fideTables}</strong><small>{t.tablesHelp}</small></span><ChevronDown className={tables ? 'rotated' : ''} /></button>{tables && <div className="table-area"><div className="table-tools"><div className="mini-tabs"><button className={tableTab === 'pd' ? 'active' : ''} onClick={() => setTableTab('pd')}>D → PD</button><button className={tableTab === 'dp' ? 'active' : ''} onClick={() => setTableTab('dp')}>p → dp</button></div><input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="official-table">{tableTab === 'pd' ? PD_TABLE.filter((r) => !search || Number(search) >= r.min && Number(search) <= r.max).map((r) => <div key={r.min}><span>{r.min}–{r.max === Infinity ? '∞' : r.max}</span><strong>{r.higher.toFixed(2)}</strong><span>{r.lower.toFixed(2)}</span></div>) : DP_TABLE.map((dp, i) => ({ dp, i })).filter((x) => !search || String(x.i).includes(search)).map((x) => <div key={x.i}><span>{x.i}%</span><strong>{x.dp}</strong></div>)}</div></div>}</section></main><footer><span>{t.footerA}</span><a href="https://handbook.fide.com/chapter/B022024" target="_blank">{t.handbook}</a><span>{t.footerB}</span></footer></div>;
}

