# Bracket — UEFA Europa League 2026-2027

Même widget que le [bracket Ligue des champions 2026-27](../../Champions%20League/Bracket2627),
transposé à l'Europa League. Auto-alimenté par l'API **SportMonks**, cinq langues. Trois
blocs empilés :

1. **Les matchs, journée par journée** — les 18 rencontres de chacune des 8 journées, avec
   leur résultat. Repliées par défaut derrière « Voir tous les résultats ».
2. **Le classement** — les 36 clubs, avec les zones de qualification.
3. **L'arbre de la phase finale** — barrages, 8es, quarts, demies, finale, projeté d'après le
   classement, avec le bouton **« 🎲 Simuler le tirage »** et les pronostics au clic.

```
SportMonks API ──> fetch-data.js ──> data-<lang>.json ──> bracket-c3*.html
  (token secret)    (GitHub Action)    (5 fichiers)        (lit le JSON, jamais le token)
```

## Données

| | |
| --- | --- |
| Ligue SportMonks | `5` (Europa League) |
| Saison | `27913` (2026/2027) |
| Stage phase de ligue | `77484116` (« League Stage ») |
| Journées (rounds) | `424631` à `424638` |
| Rencontres | 144 — 8 journées × 18 matchs |

**Recoupement** : les 144 rencontres SportMonks ont été comparées une à une à l'API publique
de l'UEFA (`match.uefa.com/v5/matches?competitionId=14&seasonYear=2027`). **144 sur 144
identiques** — affiche, date et heure.

Les coups d'envoi sont le **jeudi à 18h45 et 21h00** (heure de Paris), sauf la 1re journée
dont neuf rencontres se jouent le **mercredi 16 septembre 2026**.

### Les 36 clubs

`teams.js` associe chaque identifiant SportMonks à un code, un écusson UEFA, deux couleurs
et un nom dans les cinq langues.

Les identifiants UEFA (écussons) **n'ont pas été rapprochés par le nom** — « Olympique
Lyonnais » chez SportMonks, « Lyon » à l'UEFA, « Ferencvárosi » contre « Ferencváros » —
mais par **l'empreinte du calendrier** : les 8 couples (coup d'envoi, domicile/extérieur)
de chaque club sont uniques. 36 clubs sur 36 appariés sans ambiguïté.

Clubs français engagés : Olympique Lyonnais, Olympique de Marseille, Stade Rennais.

## Le classement : article 18

Identique à la Ligue des champions — **article 18 du règlement UEL 2026/27**, vérifié sur
documents.uefa.com. À égalité de points :

1. différence de buts
2. buts marqués
3. buts marqués à l'extérieur
4. victoires
5. victoires à l'extérieur
6. points cumulés des adversaires de phase de ligue
7. différence de buts cumulée des adversaires
8. buts marqués cumulés des adversaires
9. points disciplinaires (le plus bas passe devant)
10. coefficient de club UEFA

Les critères 6 à 8 portent sur les **huit adversaires tirés au sort**, joués ou non. Le 10e
n'étant publié par aucune API, l'égalité parfaite retombe sur l'ordre alphabétique.

## Le bracket : annexe B

L'Europa League utilise **le même arbre** que la Ligue des champions. Vérifié sur deux
sources : la procédure de tirage des barrages UEL publiée par l'UEFA, qui cite l'article
19.02 (« clubs 9 or 10 against clubs 23 or 24, clubs 11 or 12 against clubs 21 or 22, clubs
13 or 14 against clubs 19 or 20, and clubs 15 or 16 against clubs 17 or 18 »), et le format
de la phase finale UEL 2025-26 (8es : 1/2 contre la branche 15/16-17/18, 3/4 contre
13/14-19/20, 5/6 contre 11/12-21/22, 7/8 contre 9/10-23/24 ; quarts {1/2 v 7/8} et
{3/4 v 5/6}).

| Classement | Sort |
| --- | --- |
| 1er-8e | qualifiés directement pour les 8es |
| 9e-24e | barrages aller-retour |
| 25e-36e | éliminés, sans repêchage en Ligue Conférence |

La table `ANNEXE_B` de `bracket-c3.html` est donc la même que pour la C1, et
`verify-annexe-b.js` en contrôle les douze points :

```bash
node verify-annexe-b.js
```

Notation par paires (« 21/22 » affronte « 11/12 »), côtés argenté et bleu, club qui reçoit
au retour, simulation du tirage sur 12 pile ou face : voir le README de la C1, tout
s'applique à l'identique.

## Calendrier de la phase finale 2026-27

| Tour | Tirage | Matchs |
| --- | --- | --- |
| Barrages | 29 janvier 2027 | 18 et 25 février 2027 |
| 8es de finale | 26 février 2027 | 11 et 18 mars 2027 |
| Quarts | — | 8 et 15 avril 2027 |
| Demies | — | 29 avril et 6 mai 2027 |
| **Finale** | — | **mercredi 26 mai 2027, Waldstadion, Francfort** |

Source : page Wikipédia de l'UEFA Europa League 2026-27. Dès que SportMonks publie les
stages de phase finale, `fetch-data.js` les détecte et les vraies rencontres prennent le
dessus.

## Pas de score en direct

Comme pour la C1 : un match n'a de score que lorsqu'il est **terminé**. `fetch-data.js`
relit les heures de coup d'envoi du `data.json` précédent et **n'appelle SportMonks que s'il
existe un match sans résultat dont le coup d'envoi remonte à plus de 2 h 05**. Le cron passe
toutes les 30 minutes de 18 h à 23 h UTC, tous les jours ; la quasi-totalité des exécutions
s'arrêtent sans consommer un seul appel. Un filet quotidien forcé à 5 h 20 UTC rattrape
calendrier, reports et tirages.

## Cohabitation avec le widget C1

Les deux widgets sont servis depuis le même domaine (`jcrochet-netizen.github.io`), donc ils
partagent le même `localStorage`. Tout ce qui y est stocké est préfixé **`c3b26-`** ici et
**`c1b26-`** pour la C1 : pronostics, tirage simulé et liste repliée ne se mélangent pas.

Les iframes ont des identifiants distincts (`busa-c3b-fr`… contre `busa-c1b-fr`…) et un type
de message propre (`busa-c3b-height`) : un article peut embarquer les deux widgets.

## Multilingue

| Langue | Widget | Données | Fuseau |
| --- | --- | --- | --- |
| Français | `bracket-c3.html` | `data.json` | Europe/Paris |
| English | `bracket-c3-en.html` | `data-en.json` | Europe/London |
| Español | `bracket-c3-es.html` | `data-es.json` | Europe/Madrid |
| Português (BR) | `bracket-c3-pt.html` | `data-pt.json` | America/São Paulo |
| Italiano | `bracket-c3-it.html` | `data-it.json` | Europe/Rome |

Le master FR est `bracket-c3.html` — le seul fichier d'interface à modifier.

## Développement local

```bash
node fetch-data.js --force   # régénère les 5 data-*.json (lit .env)
node build-langs.js          # régénère les 4 variantes traduites
node build-embed.js          # régénère les blocs WordPress
node serve.js                # http://localhost:8758/bracket-c3.html
```

## Déploiement

Dépôt : `jcrochet-netizen/bracket-c3-2627` — Pages : `https://jcrochet-netizen.github.io/bracket-c3-2627/`

1. Ajouter le secret `SPORTMONKS_API_TOKEN` (Settings → Secrets and variables → Actions).
2. Activer GitHub Pages (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).
3. Coller `embed-wordpress.html` (FR complet) ou un bloc de `embed-iframes.html`.

⚠ **Aucune ligne indentée** dans les blocs WordPress : certains CMS remplacent l'espace de
début de ligne par `&nbsp;`, ce qui détruit l'iframe et casse le script. `build-embed.js`
refuse de produire un fichier indenté.

⚠ La réserve de hauteur (`min-height`) des blocs doit être **mesurée dans une page parente
réelle, une fois le site en ligne** : c'est la seule mesure fiable, l'iframe étant plus
étroite dans un article que le widget seul.
