#!/usr/bin/env node
/**
 * Sort en code 0 si au moins un data*.json diffère de la version committée
 * autrement que par son horodatage `updatedAt`, en code 1 sinon.
 * Utilisé par le workflow pour n'écrire un commit que sur un vrai changement.
 */
const fs = require("fs");
const { execFileSync } = require("child_process");

const fichiers = fs.readdirSync(process.cwd()).filter((f) => /^data(-[a-z]{2})?\.json$/.test(f));
if (!fichiers.length) { console.error("aucun data*.json"); process.exit(1); }

const sansDate = (txt) => {
  const o = JSON.parse(txt);
  delete o.updatedAt;
  return JSON.stringify(o);
};

for (const f of fichiers) {
  let ancien;
  try {
    ancien = execFileSync("git", ["show", `HEAD:${f}`], { encoding: "utf8", maxBuffer: 64e6 });
  } catch (e) {
    console.log(`${f} : nouveau fichier`);
    process.exit(0);
  }
  if (sansDate(ancien) !== sansDate(fs.readFileSync(f, "utf8"))) {
    console.log(`${f} : contenu modifié`);
    process.exit(0);
  }
}
process.exit(1);
