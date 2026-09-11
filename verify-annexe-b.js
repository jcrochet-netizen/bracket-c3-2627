#!/usr/bin/env node
/**
 * Vérifie que l'arbre du widget est conforme à l'annexe B du règlement de la
 * Ligue Europa (art. 19.02 à 19.04).
 *
 *   node verify-annexe-b.js      # code de sortie 0 si tout est conforme
 *
 * La table `ANNEXE_B` est lue directement dans bracket-c3.html : le contrôle
 * porte donc sur ce qui est réellement servi, pas sur une copie.
 */

const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "bracket-c3.html"), "utf8");
const bloc = src.match(/var ANNEXE_B = \[([\s\S]*?)\];/);
if (!bloc) { console.error("✗ ANNEXE_B introuvable dans bracket-c3.html"); process.exit(1); }
const A = eval("[" + bloc[1] + "]");

let ko = 0;
const t = (nom, cond) => { console.log((cond ? "  ✓ " : "  ✗ ") + nom); if (!cond) ko++; };
const paireDe = (n) => Math.ceil(n / 2);

console.log("Structure");
t("8 positions de 8e de finale", A.length === 8);
t("4 côté argenté, 4 côté bleu",
  A.filter((e) => e.cote === "argent").length === 4 && A.filter((e) => e.cote === "bleu").length === 4);

console.log("\nArt. 19.02 — appariements des barrages");
const PAIRES = [[9, 10, 23, 24], [11, 12, 21, 22], [13, 14, 19, 20], [15, 16, 17, 18]];
t("chaque barrage oppose une paire tête de série à sa paire non-tête de série",
  A.every((e) => PAIRES.some((p) => p.includes(e.po[0]) && p.includes(e.po[1]))));
t("la tête de série (9-16) est en bas de l'affiche — elle reçoit au retour (§3)",
  A.every((e) => e.po[1] >= 9 && e.po[1] <= 16));
t("la non-tête de série (17-24) est en haut", A.every((e) => e.po[0] >= 17 && e.po[0] <= 24));
t("les 16 positions 9-24 servent une fois chacune",
  JSON.stringify(A.flatMap((e) => e.po).sort((a, b) => a - b)) ===
  JSON.stringify([...Array(16)].map((_, i) => i + 9)));

console.log("\nArt. 19.03 — tête de série contre la branche correspondante");
const BRANCHE = { "5,6": [11, 12, 21, 22], "3,4": [13, 14, 19, 20], "7,8": [9, 10, 23, 24], "1,2": [15, 16, 17, 18] };
t("1/2 ↔ 15/16-17/18, 3/4 ↔ 13/14-19/20, 5/6 ↔ 11/12-21/22, 7/8 ↔ 9/10-23/24",
  A.every((e) => {
    const k = Object.keys(BRANCHE).find((k) => k.split(",").map(Number).includes(e.seed));
    return BRANCHE[k].includes(e.po[0]) && BRANCHE[k].includes(e.po[1]);
  }));
t("les 8 têtes de série servent une fois chacune",
  JSON.stringify(A.map((e) => e.seed).sort((a, b) => a - b)) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8]));

console.log("\nÉquilibre des deux moitiés");
const arg = A.filter((e) => e.cote === "argent"), blu = A.filter((e) => e.cote === "bleu");
t("chaque moitié reçoit un club de chacune des 4 paires de têtes de série",
  new Set(arg.map((e) => paireDe(e.seed))).size === 4 && new Set(blu.map((e) => paireDe(e.seed))).size === 4);
t("1 et 2 dans des moitiés opposées — ils ne peuvent se croiser qu'en finale",
  arg.some((e) => e.seed === 1) !== blu.some((e) => e.seed === 1));

console.log("\nArt. 19.04 — affiches des quarts et des demies");
const qf = [[A[0].seed, A[1].seed], [A[2].seed, A[3].seed], [A[4].seed, A[5].seed], [A[6].seed, A[7].seed]];
t("quarts : {5/6 v 3/4} et {7/8 v 1/2} de chaque côté",
  JSON.stringify(qf.map((p) => p.sort((a, b) => a - b).join("v")).sort()) ===
  JSON.stringify(["1v8", "2v7", "3v6", "4v5"]));
t("demies : côté argenté 1,4,5,8 — côté bleu 2,3,6,7",
  arg.map((e) => e.seed).sort((a, b) => a - b).join() === "1,4,5,8" &&
  blu.map((e) => e.seed).sort((a, b) => a - b).join() === "2,3,6,7");

console.log(ko ? `\n✗ ${ko} écart(s) avec l'annexe B.` : "\n✓ Conforme à l'annexe B sur tous les points contrôlés.");
process.exit(ko ? 1 : 0);
