#!/usr/bin/env node
/**
 * UEFA Europa League 2026-27 — Bracket : récupérateur de données
 * --------------------------------------------------------------------
 * Source : API SportMonks (même token que le bracket Coupe du monde 2026).
 *
 *   ligue 5 · saison 27913 (2026/2027) · stage 77484116 (« League Stage »)
 *   8 journées × 18 matchs = 144 rencontres, 36 clubs.
 *
 * Écrit un data-<lang>.json par langue (fr → data.json). Le widget les lit côté
 * client : le token n'est JAMAIS exposé.
 *
 * Ce script ne classe PAS les équipes — il livre les matchs bruts et les points
 * disciplinaires. Le classement est calculé dans le widget.
 *
 * PAS DE SCORE EN DIRECT, volontairement. Un match n'a de score que lorsqu'il
 * est TERMINÉ : suivre les rencontres en cours obligerait à interroger l'API
 * toutes les dix minutes chaque soir de C1, pour un coût sans rapport avec le
 * service rendu. Le cron ne passe donc qu'après les coups de sifflet final.
 *
 * Il détecte aussi automatiquement les stages de la phase finale (barrages,
 * 8es, quarts, demies, finale) dès que l'UEFA les tire et que SportMonks les
 * publie : tant qu'ils n'existent pas, le widget projette l'arbre à partir du
 * classement live.
 *
 *   node fetch-data.js
 */

const fs = require("fs");
const path = require("path");
const { TEAMS, LOGO } = require("./teams.js");

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadDotEnv();

const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
if (!API_TOKEN) {
  console.error("✗ SPORTMONKS_API_TOKEN manquant (voir .env.example).");
  process.exit(1);
}

const BASE = "https://api.sportmonks.com/v3/football";
const LEAGUE_ID = 5;
const SEASON_ID = 27913;        // UEFA Europa League 2026/2027
const LEAGUE_STAGE_ID = 77484116; // phase de ligue (8 journées)
const KO_FROM = "2027-02-01";   // les stages de phase finale commencent après cette date

// Un match est considéré fini 2 h 05 après son coup d'envoi : 90 minutes,
// 15 de mi-temps, et 20 d'arrêts de jeu. Si la rencontre traîne au-delà,
// l'exécution suivante la rattrape — la constante n'a donc pas à être exacte.
const DUREE_MATCH = (2 * 60 + 5) * 60 * 1000;
// Au-delà de 3 jours sans résultat publié, on cesse d'insister à chaque
// passage : le filet quotidien forcé prend le relais.
const ABANDON = 3 * 24 * 60 * 60 * 1000;

const FORCE = process.argv.includes("--force") || process.env.FORCE_REFRESH === "true";
const LANGS = ["fr", "en", "es", "pt", "it"];

// Calendrier officiel UEFA de la phase finale 2026-27 (uefa.com).
// Sert de repère tant que les tirages ne sont pas faits ; dès que SportMonks
// publie les rencontres, les vraies dates prennent le dessus.
const KO_CALENDAR = {
  po:  { fr:"18 & 25 février 2027", en:"18 & 25 February 2027", es:"18 y 25 de febrero de 2027", pt:"18 e 25 de fevereiro de 2027", it:"18 e 25 febbraio 2027" },
  r16: { fr:"11 & 18 mars 2027",    en:"11 & 18 March 2027",    es:"11 y 18 de marzo de 2027",   pt:"11 e 18 de março de 2027",     it:"11 e 18 marzo 2027" },
  qf:  { fr:"8 & 15 avril 2027",    en:"8 & 15 April 2027",     es:"8 y 15 de abril de 2027",    pt:"8 e 15 de abril de 2027",      it:"8 e 15 aprile 2027" },
  sf:  { fr:"29 avril & 6 mai 2027", en:"29 April & 6 May 2027", es:"29 de abril y 6 de mayo de 2027", pt:"29 de abril e 6 de maio de 2027", it:"29 aprile e 6 maggio 2027" },
  f:   { fr:"26 mai 2027 — Waldstadion, Francfort", en:"26 May 2027 — Waldstadion, Frankfurt", es:"26 de mayo de 2027 — Waldstadion, Fráncfort", pt:"26 de maio de 2027 — Waldstadion, Frankfurt", it:"26 maggio 2027 — Waldstadion, Francoforte" }
};

/* ------------------------------------------------------------- Portillon
 * Décide, SANS appeler l'API, s'il y a quelque chose à relever : les heures
 * de coup d'envoi sont déjà dans le data.json produit au passage précédent.
 *
 * C'est ce qui permet de lancer le cron souvent — donc de publier un résultat
 * vite après le coup de sifflet — sans multiplier les appels SportMonks : la
 * quasi-totalité des exécutions s'arrêtent ici, sans consommer un seul appel.
 */
function aRelever() {
  let ancien;
  try {
    ancien = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));
  } catch (e) {
    console.log("→ Pas de data.json exploitable : récupération complète.");
    return true;
  }
  const maintenant = Date.now();
  const dus = (ancien.matchdays || [])
    .flatMap((j) => j.matches)
    .filter((m) => {
      if (m.st !== "NS") return false;          // déjà terminé, ou reporté
      const fin = new Date(m.iso).getTime() + DUREE_MATCH;
      return maintenant >= fin && maintenant <= fin + ABANDON;
    });
  if (!dus.length) return false;
  console.log(`→ ${dus.length} match(s) terminé(s) sans résultat publié.`);
  return true;
}

/* ------------------------------------------------------------------ HTTP */

async function getJSON(url) {
  for (let tentative = 1; ; tentative++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    // 429 = quota par minute ; SportMonks le remet à zéro toutes les 60 s.
    if ((res.status === 429 || res.status >= 500) && tentative < 4) {
      const attente = res.status === 429 ? 61000 : 2000 * tentative;
      console.warn(`  ⚠ ${res.status} — nouvelle tentative dans ${Math.round(attente / 1000)} s`);
      await new Promise((r) => setTimeout(r, attente));
      continue;
    }
    throw new Error(`SportMonks ${res.status} ${res.statusText} — ${url.replace(API_TOKEN, "***")}`);
  }
}

/** Suit la pagination SportMonks jusqu'au bout. */
async function getAll(url) {
  const out = [];
  let next = url;
  while (next) {
    const json = await getJSON(next);
    out.push(...(json.data || []));
    const pg = json.pagination || {};
    next = pg.has_more && pg.next_page ? `${pg.next_page}&api_token=${API_TOKEN}` : null;
  }
  return out;
}

/* ------------------------------------------------------- Normalisation */

// Un match est joué (compte au classement) dans ces états.
const ETATS_JOUES = new Set(["FT", "AET", "FT_PEN", "AWARDED", "WO"]);
// Et reporté / annulé dans ceux-là : ni joué, ni à venir.
const ETATS_HS = new Set(["POSTPONED", "CANCELLED", "SUSPENDED", "ABANDONED", "INTERRUPTED", "DELETED"]);

/**
 * Trois états seulement : terminé, reporté, à venir. Une rencontre en cours
 * est rangée avec les matchs à venir — elle n'a pas encore de résultat, et le
 * widget affiche simplement son heure de coup d'envoi.
 */
function statutDe(fx) {
  const dev = (fx.state && fx.state.developer_name) || "NS";
  if (ETATS_JOUES.has(dev)) return "FT";
  if (ETATS_HS.has(dev)) return "OFF";
  return "NS";
}

/** Score final par participant. */
function scoresDe(fx) {
  const g = {};
  for (const s of fx.scores || []) {
    if (s.description === "CURRENT" && s.participant_id != null && s.score) {
      g[s.participant_id] = s.score.goals;
    }
  }
  return g;
}

/**
 * Les stades, pour le balisage schema.org de la page qui héberge le widget :
 * `SportsEvent` exige un `location` avec une adresse.
 *
 * SportMonks renvoie `EN`, `SC`, `WA` et `NI` pour les nations britanniques —
 * ce ne sont pas des codes ISO 3166-1 valides, Google refuserait l'adresse.
 */
const ISO_FIX = { EN: "GB", SC: "GB", WA: "GB", NI: "GB" };

function venueDe(fx) {
  const v = fx.venue;
  if (!v) return null;
  const iso = ((v.country || {}).iso2 || "").toUpperCase();
  return { id: v.id, n: v.name, c: v.city_name || null, cc: ISO_FIX[iso] || iso || null };
}

function cotes(fx) {
  const dom = (fx.participants || []).find((p) => p.meta && p.meta.location === "home");
  const ext = (fx.participants || []).find((p) => p.meta && p.meta.location === "away");
  return [dom, ext];
}

/**
 * Points disciplinaires UEFA (art. 20.03 du règlement UCL) : plus le total est
 * bas, mieux l'équipe est classée. Un seul décompte par joueur et par match.
 *
 *   carton jaune ................................... 1 pt
 *   expulsion pour deux cartons jaunes ............. 3 pts
 *   carton rouge direct ............................ 3 pts
 *   carton jaune + carton rouge direct ............. 4 pts
 *
 * Types SportMonks : 19 = jaune, 20 = rouge direct, 21 = jaune/rouge (2e jaune).
 */
function disciplineDepuisEvents(fixtures) {
  const total = {};
  for (const fx of fixtures) {
    const parJoueur = {};
    for (const ev of fx.events || []) {
      if (ev.rescinded) continue;
      const t = ev.type_id;
      if (t !== 19 && t !== 20 && t !== 21) continue;
      const qui = ev.player_id != null ? "p" + ev.player_id : "c" + ev.coach_id;
      const cle = ev.participant_id + ":" + qui;
      const o = parJoueur[cle] || (parJoueur[cle] = { equipe: ev.participant_id, j: 0, r: 0, jr: 0 });
      if (t === 19) o.j++;
      else if (t === 20) o.r++;
      else o.jr++;
    }
    for (const cle in parJoueur) {
      const o = parJoueur[cle];
      let pts = 0;
      if (o.jr >= 1) pts = 3;               // 2e jaune : le premier jaune n'est pas compté en plus
      else if (o.r >= 1 && o.j >= 1) pts = 4; // jaune puis rouge direct
      else if (o.r >= 1) pts = 3;
      else if (o.j >= 1) pts = 1;
      total[o.equipe] = (total[o.equipe] || 0) + pts;
    }
  }
  return total;
}

/* ------------------------------------------------------------ Phase finale */

// Libellé SportMonks des stages de phase finale → clé interne.
const KO_STAGES = [
  [/play-?off/i,        "po"],
  [/(1\/8|8th|last 16|round of 16)/i, "r16"],
  [/(1\/4|quarter)/i,   "qf"],
  [/(1\/2|semi)/i,      "sf"],
  [/final/i,            "f"]
];

function cleDeStage(nom) {
  for (const [re, cle] of KO_STAGES) {
    // « Final » matcherait « Quarter-final » : on teste du plus précis au moins précis.
    if (re.test(nom)) return cle;
  }
  return null;
}

/* ---------------------------------------------------------------- Écriture */

async function main() {
  if (!FORCE && !aRelever()) {
    console.log("Aucun match à relever — aucun appel à SportMonks.");
    return;
  }
  console.log("→ Stages de la saison…");
  const saison = (await getJSON(
    `${BASE}/seasons/${SEASON_ID}?api_token=${API_TOKEN}&include=stages;rounds`
  )).data;

  const rounds = {};
  for (const r of saison.rounds || []) {
    if (r.stage_id === LEAGUE_STAGE_ID) rounds[r.id] = { n: Number(r.name), start: r.starting_at, end: r.ending_at };
  }
  const nbJournees = Object.keys(rounds).length;
  console.log(`  ${nbJournees} journées de phase de ligue.`);

  // Stages de phase finale déjà créés par SportMonks (tirages faits).
  const stagesKO = (saison.stages || [])
    .filter((s) => s.id !== LEAGUE_STAGE_ID && s.starting_at && s.starting_at >= KO_FROM)
    .map((s) => ({ id: s.id, nom: s.name, cle: cleDeStage(s.name), start: s.starting_at }))
    .filter((s) => s.cle);
  console.log(stagesKO.length
    ? `  Phase finale publiée : ${stagesKO.map((s) => s.nom).join(", ")}.`
    : "  Phase finale pas encore tirée — l'arbre sera projeté depuis le classement.");

  console.log("→ Matchs de la phase de ligue…");
  const fixtures = await getAll(
    `${BASE}/fixtures?api_token=${API_TOKEN}` +
    `&filters=fixtureSeasons:${SEASON_ID};fixtureStages:${LEAGUE_STAGE_ID}` +
    `&include=participants;scores;state;events;venue.country&per_page=50&page=1`
  );
  console.log(`  ${fixtures.length} rencontres.`);

  const inconnus = new Set();
  for (const fx of fixtures) for (const p of fx.participants || []) if (!TEAMS[p.id]) inconnus.add(`${p.id} ${p.name}`);
  if (inconnus.size) {
    console.error("✗ Clubs absents de teams.js :", [...inconnus].join(", "));
    process.exit(1);
  }

  const discipline = disciplineDepuisEvents(fixtures);

  // --- Journées ---
  // Les stades sont sortis dans un dictionnaire : 36 enceintes pour
  // 144 rencontres, les répéter dans chaque match ferait grossir le JSON
  // pour rien.
  const venues = {};
  const parJournee = new Map();
  for (const fx of fixtures) {
    const r = rounds[fx.round_id];
    if (!r) continue;
    const [dom, ext] = cotes(fx);
    if (!dom || !ext) continue;
    const g = scoresDe(fx);
    const st = statutDe(fx);
    const v = venueDe(fx);
    if (v) venues[v.id] = { n: v.n, c: v.c, cc: v.cc };
    // Le score n'est publié que pour un match terminé : jamais de score partiel
    // dans le JSON, même si l'API en renvoie un pour une rencontre en cours.
    const m = {
      id: fx.id,
      v: v ? v.id : null,
      iso: new Date(fx.starting_at.replace(" ", "T") + "Z").toISOString(),
      st,
      h: TEAMS[dom.id].code,
      a: TEAMS[ext.id].code,
      hg: st === "FT" && g[dom.id] != null ? g[dom.id] : null,
      ag: st === "FT" && g[ext.id] != null ? g[ext.id] : null
    };
    if (!parJournee.has(r.n)) parJournee.set(r.n, { n: r.n, start: r.start, end: r.end, matches: [] });
    parJournee.get(r.n).matches.push(m);
  }
  const matchdays = [...parJournee.values()].sort((a, b) => a.n - b.n);
  for (const j of matchdays) j.matches.sort((a, b) => a.iso.localeCompare(b.iso) || a.h.localeCompare(b.h));

  // --- Phase finale réelle (si tirée) ---
  const knockout = {};
  for (const s of stagesKO) {
    const fxs = await getAll(
      `${BASE}/fixtures?api_token=${API_TOKEN}` +
      `&filters=fixtureSeasons:${SEASON_ID};fixtureStages:${s.id}` +
      `&include=participants;scores;state&per_page=50&page=1`
    );
    const ties = new Map();
    for (const fx of fxs) {
      const [dom, ext] = cotes(fx);
      if (!dom || !ext || !TEAMS[dom.id] || !TEAMS[ext.id]) continue;
      const g = scoresDe(fx);
      const cle = fx.aggregate_id || fx.id;
      const t = ties.get(cle) || { legs: [] };
      const stLeg = statutDe(fx);
      t.legs.push({
        id: fx.id,
        iso: new Date(fx.starting_at.replace(" ", "T") + "Z").toISOString(),
        st: stLeg,
        leg: fx.leg || "1/1",
        h: TEAMS[dom.id].code, a: TEAMS[ext.id].code,
        hg: stLeg === "FT" && g[dom.id] != null ? g[dom.id] : null,
        ag: stLeg === "FT" && g[ext.id] != null ? g[ext.id] : null
      });
      ties.set(cle, t);
    }
    for (const t of ties.values()) t.legs.sort((a, b) => a.iso.localeCompare(b.iso));
    knockout[s.cle] = [...ties.values()];
  }

  // --- Un fichier par langue ---
  const dossier = __dirname;
  for (const lang of LANGS) {
    const teams = {};
    for (const id in TEAMS) {
      const t = TEAMS[id];
      teams[t.code] = {
        name: t[lang], short: t.short, logo: LOGO(t.uefa),
        light: t.light, dark: t.dark,
        disc: discipline[id] || 0
      };
    }
    const data = {
      updatedAt: new Date().toISOString(),
      season: { id: SEASON_ID, label: "2026/2027" },
      teams,
      venues,
      matchdays,
      knockout,
      koDrawn: Object.keys(knockout).length > 0,
      calendar: Object.fromEntries(Object.entries(KO_CALENDAR).map(([k, v]) => [k, v[lang]]))
    };
    const nom = lang === "fr" ? "data.json" : `data-${lang}.json`;
    fs.writeFileSync(path.join(dossier, nom), JSON.stringify(data));
    console.log(`✓ ${nom}`);
  }

  const joues = matchdays.flatMap((j) => j.matches).filter((m) => m.st === "FT").length;
  const reportes = matchdays.flatMap((j) => j.matches).filter((m) => m.st === "OFF").length;
  console.log(`\n${joues} matchs terminés sur ${fixtures.length}` + (reportes ? `, ${reportes} reporté(s).` : "."));
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
