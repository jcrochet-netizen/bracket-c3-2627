#!/usr/bin/env node
/**
 * Génère les quatre variantes traduites à partir du master FR.
 *
 * Le widget embarque déjà les cinq jeux de libellés (objet `L10N`) : passer
 * d'une langue à l'autre ne demande que de changer `data-lang` et le fichier
 * de données lu. Ce script ne touche donc qu'à l'en-tête du document (langue,
 * titre, méta) et à ces deux attributs — jamais au corps du widget, qui reste
 * strictement identique d'une langue à l'autre.
 *
 *   node build-langs.js
 *
 * Modifier l'interface = modifier bracket-c3.html (le master FR), puis relancer.
 */

const fs = require("fs");
const path = require("path");

const MASTER = path.join(__dirname, "bracket-c3.html");

const META = {
  en: {
    htmlLang: "en", ogLocale: "en_GB",
    title: "2026-27 Europa League: fixtures, results, table and bracket",
    desc: "All eight league-phase matchdays of the 2026-27 UEFA Europa League, the results, the 36-club table and the knockout bracket projected as it stands.",
    ogTitle: "2026-27 Europa League — fixtures, table and bracket",
    ogDesc: "Matchday-by-matchday fixtures and results, the 36-club table and a knockout bracket that updates itself."
  },
  es: {
    htmlLang: "es", ogLocale: "es_ES",
    title: "Liga Europa 2026-2027: partidos, resultados, clasificación y cuadro",
    desc: "Las 8 jornadas de la fase de liga de la Liga Europa 2026-2027, los resultados, la clasificación de los 36 clubes y el cuadro de la fase final.",
    ogTitle: "Liga Europa 2026-2027 — partidos, clasificación y cuadro",
    ogDesc: "Partidos jornada a jornada, resultados, clasificación de los 36 clubes y cuadro de la fase final actualizado automáticamente."
  },
  pt: {
    htmlLang: "pt-BR", ogLocale: "pt_BR",
    title: "Liga Europa 2026-2027: jogos, resultados, classificação e chaveamento",
    desc: "As 8 rodadas da fase de liga da Liga Europa 2026-2027, os resultados, a classificação dos 36 clubes e o chaveamento do mata-mata.",
    ogTitle: "Liga Europa 2026-2027 — jogos, classificação e chaveamento",
    ogDesc: "Jogos rodada a rodada, resultados, classificação dos 36 clubes e chaveamento do mata-mata atualizado automaticamente."
  },
  it: {
    htmlLang: "it", ogLocale: "it_IT",
    title: "Europa League 2026-2027: partite, risultati, classifica e tabellone",
    desc: "Le 8 giornate della fase campionato di Europa League 2026-2027, i risultati, la classifica delle 36 squadre e il tabellone della fase finale.",
    ogTitle: "Europa League 2026-2027 — partite, classifica e tabellone",
    ogDesc: "Partite giornata per giornata, risultati, classifica delle 36 squadre e tabellone della fase finale aggiornato in automatico."
  }
};

function remplacerUnique(src, motif, valeur, lang) {
  const trouve = src.match(motif);
  if (!trouve) throw new Error(`[${lang}] motif introuvable dans le master : ${motif}`);
  if (src.match(new RegExp(motif.source, motif.flags + "g")).length !== 1) {
    throw new Error(`[${lang}] motif ambigu (plusieurs occurrences) : ${motif}`);
  }
  return src.replace(motif, valeur);
}

const master = fs.readFileSync(MASTER, "utf8");

for (const lang of Object.keys(META)) {
  const m = META[lang];
  let out = master;
  out = remplacerUnique(out, /<html lang="fr">/, `<html lang="${m.htmlLang}">`, lang);
  out = remplacerUnique(out, /<title>[^<]*<\/title>/, `<title>${m.title}</title>`, lang);
  out = remplacerUnique(out, /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${m.desc}">`, lang);
  out = remplacerUnique(out, /<meta property="og:locale" content="[^"]*">/,
    `<meta property="og:locale" content="${m.ogLocale}">`, lang);
  out = remplacerUnique(out, /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${m.ogTitle}">`, lang);
  out = remplacerUnique(out, /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${m.ogDesc}">`, lang);
  out = remplacerUnique(out, /data-lang="fr"/, `data-lang="${lang}"`, lang);
  out = remplacerUnique(out, /data-src="data\.json"/, `data-src="data-${lang}.json"`, lang);

  const nom = `bracket-c3-${lang}.html`;
  fs.writeFileSync(path.join(__dirname, nom), out);
  console.log(`✓ ${nom}`);
}
console.log("\nMaster FR : bracket-c3.html — c'est le seul fichier à modifier.");
