/**
 * Les 36 clubs de la phase de ligue de l'UEFA Europa League 2026-27.
 *
 * Clé = identifiant SportMonks (stable, contrairement aux libellés qui varient
 * d'une source à l'autre : « Olympique Lyonnais » chez SportMonks, « Lyon » à
 * l'UEFA).
 *
 * Les identifiants UEFA n'ont pas été rapprochés par le nom mais par
 * l'empreinte du calendrier : les 8 couples (coup d'envoi, domicile/extérieur)
 * de chaque club sont uniques. Résultat : 36 clubs sur 36 appariés sans
 * ambiguïté, et les 144 rencontres identiques entre SportMonks et l'API UEFA —
 * affiche, date et heure.
 *
 *   code   : code interne à 3 lettres
 *   uefa   : identifiant du CDN écussons UEFA (logos officiels, en couleur)
 *   short  : libellé court pour le mobile et le bracket
 *   light  : couleur du club lisible sur fond clair
 *   dark   : couleur du club lisible sur fond sombre
 *   fr/en/es/pt/it : nom du club dans chaque langue
 */
const TEAMS = {
  113:    { code:"MIL", uefa:"50058",   light:"#C8102E", dark:"#FF6B6E", short:"Milan",
            fr:"AC Milan",               en:"AC Milan",              es:"AC Milan",              pt:"AC Milan",              it:"Milan" },
  52:     { code:"BOU", uefa:"2601124", light:"#DA291C", dark:"#FF6B6E", short:"Bournemouth",
            fr:"Bournemouth",            en:"Bournemouth",           es:"Bournemouth",           pt:"Bournemouth",           it:"Bournemouth" },
  61:     { code:"AZA", uefa:"52327",   light:"#C8102E", dark:"#FF6B7E", short:"AZ",
            fr:"AZ Alkmaar",             en:"AZ Alkmaar",            es:"AZ Alkmaar",            pt:"AZ Alkmaar",            it:"AZ Alkmaar" },
  2555:   { code:"AND", uefa:"50074",   light:"#4F2D7F", dark:"#B39DDB", short:"Anderlecht",
            fr:"Anderlecht",             en:"Anderlecht",            es:"Anderlecht",            pt:"Anderlecht",            it:"Anderlecht" },
  132649: { code:"ARA", uefa:"2610304", light:"#1A2F6B", dark:"#E8B84A", short:"Ararat",
            fr:"Ararat-Armenia",         en:"Ararat-Armenia",        es:"Ararat-Armenia",        pt:"Ararat-Armenia",        it:"Ararat-Armenia" },
  3321:   { code:"B04", uefa:"50109",   light:"#E32221", dark:"#FF6B6E", short:"Leverkusen",
            fr:"Bayer Leverkusen",       en:"Bayer Leverkusen",      es:"Bayer Leverkusen",      pt:"Bayer Leverkusen",      it:"Bayer Leverkusen" },
  605:    { code:"BEN", uefa:"50147",   light:"#E30613", dark:"#FF6B6E", short:"Benfica",
            fr:"Benfica",                en:"Benfica",               es:"Benfica",               pt:"Benfica",               it:"Benfica" },
  554:    { code:"BJK", uefa:"50157",   light:"#1A1A1A", dark:"#E8EAED", short:"Beşiktaş",
            fr:"Beşiktaş",               en:"Beşiktaş",              es:"Beşiktaş",              pt:"Beşiktaş",              it:"Beşiktaş" },
  1114:   { code:"CLJ", uefa:"59030",   light:"#0B4EA2", dark:"#FDB913", short:"Celje",
            fr:"NK Celje",               en:"Celje",                 es:"Celje",                 pt:"Celje",                 it:"Celje" },
  36:     { code:"CEV", uefa:"53043",   light:"#3A7BBF", dark:"#8EC5F5", short:"Celta",
            fr:"Celta Vigo",             en:"Celta Vigo",            es:"Celta de Vigo",         pt:"Celta de Vigo",         it:"Celta Vigo" },
  53:     { code:"CLT", uefa:"50050",   light:"#018749", dark:"#3FCB78", short:"Celtic",
            fr:"Celtic",                 en:"Celtic",                es:"Celtic",                pt:"Celtic",                it:"Celtic" },
  51:     { code:"CRY", uefa:"52916",   light:"#1B458F", dark:"#6E9BEF", short:"Crystal Palace",
            fr:"Crystal Palace",         en:"Crystal Palace",        es:"Crystal Palace",        pt:"Crystal Palace",        it:"Crystal Palace" },
  674:    { code:"DIN", uefa:"50164",   light:"#0B3E8C", dark:"#6E9BEF", short:"Dinamo Zagreb",
            fr:"Dinamo Zagreb",          en:"Dinamo Zagreb",         es:"Dinamo de Zagreb",      pt:"Dínamo Zagreb",         it:"Dinamo Zagabria" },
  112:    { code:"FTC", uefa:"52298",   light:"#007A3D", dark:"#3FCB78", short:"Ferencváros",
            fr:"Ferencváros",            en:"Ferencváros",           es:"Ferencváros",           pt:"Ferencváros",           it:"Ferencváros" },
  516:    { code:"HBS", uefa:"59340",   light:"#C8102E", dark:"#FF6B6E", short:"Beer-Sheva",
            fr:"Hapoël Beer-Sheva",      en:"Hapoel Beer-Sheva",     es:"Hapoel Beer Sheva",     pt:"Hapoel Beer Sheva",     it:"Hapoel Beer Sheva" },
  890:    { code:"JAG", uefa:"2600277", light:"#C8102E", dark:"#FFD400", short:"Jagiellonia",
            fr:"Jagiellonia Białystok",  en:"Jagiellonia Białystok", es:"Jagiellonia Białystok", pt:"Jagiellonia Białystok", it:"Jagiellonia Białystok" },
  625:    { code:"JUV", uefa:"50139",   light:"#1A1A1A", dark:"#E8EAED", short:"Juventus",
            fr:"Juventus",               en:"Juventus",              es:"Juventus",              pt:"Juventus",              it:"Juventus" },
  302:    { code:"LPO", uefa:"64227",   light:"#0B4EA2", dark:"#5AA9E8", short:"Lech",
            fr:"Lech Poznań",            en:"Lech Poznań",           es:"Lech Poznań",           pt:"Lech Poznań",           it:"Lech Poznań" },
  3223:   { code:"LVS", uefa:"50044",   light:"#0B4EA2", dark:"#5AA9E8", short:"Levski",
            fr:"Levski Sofia",           en:"Levski Sofia",          es:"Levski Sofía",          pt:"Levski Sofia",          it:"Levski Sofia" },
  2510:   { code:"LSM", uefa:"52314",   light:"#1A1A1A", dark:"#FFD400", short:"Lillestrøm",
            fr:"Lillestrøm",             en:"Lillestrøm",            es:"Lillestrøm",            pt:"Lillestrøm",            it:"Lillestrøm" },
  494:    { code:"NEC", uefa:"52330",   light:"#C8102E", dark:"#3FCB78", short:"NEC",
            fr:"NEC Nimègue",            en:"NEC Nijmegen",          es:"NEC Nijmegen",          pt:"NEC Nijmegen",          it:"NEC Nijmegen" },
  118:    { code:"OFI", uefa:"52953",   light:"#1A1A1A", dark:"#E8EAED", short:"OFI",
            fr:"OFI Crète",              en:"OFI Crete",             es:"OFI Creta",             pt:"OFI Creta",             it:"OFI Creta" },
  602:    { code:"OLY", uefa:"2610",    light:"#C8102E", dark:"#FF6B6E", short:"Olympiakos",
            fr:"Olympiakos",             en:"Olympiacos",            es:"Olympiacos",            pt:"Olympiacos",            it:"Olympiakos" },
  79:     { code:"LYO", uefa:"5312",    light:"#1B3F8B", dark:"#E8637A", short:"Lyon",
            fr:"Olympique Lyonnais",     en:"Lyon",                  es:"Olympique de Lyon",     pt:"Lyon",                  it:"Lione" },
  44:     { code:"OMR", uefa:"52748",   light:"#0E7EB0", dark:"#4FC3F7", short:"OM",
            fr:"Olympique de Marseille", en:"Marseille",             es:"Olympique de Marsella", pt:"Olympique de Marselha", it:"Marsiglia" },
  368:    { code:"OMO", uefa:"50077",   light:"#007A3D", dark:"#3FCB78", short:"Omonia",
            fr:"Omonia Nicosie",         en:"Omonia Nicosia",        es:"Omonia Nicosia",        pt:"Omonia Nicósia",        it:"Omonia Nicosia" },
  594:    { code:"RSO", uefa:"50123",   light:"#0B4EA2", dark:"#5AA9E8", short:"Real Sociedad",
            fr:"Real Sociedad",          en:"Real Sociedad",         es:"Real Sociedad",         pt:"Real Sociedad",         it:"Real Sociedad" },
  598:    { code:"REN", uefa:"55031",   light:"#C8102E", dark:"#FF6B6E", short:"Rennes",
            fr:"Stade Rennais",          en:"Rennes",                es:"Rennes",                pt:"Rennes",                it:"Rennes" },
  49:     { code:"SAL", uefa:"50030",   light:"#C8102E", dark:"#FF6B7E", short:"Salzburg",
            fr:"RB Salzbourg",           en:"RB Salzburg",           es:"RB Salzburgo",          pt:"RB Salzburg",           it:"Salisburgo" },
  2727:   { code:"SPR", uefa:"50033",   light:"#8E1F2F", dark:"#F0A05A", short:"Sparta",
            fr:"Sparta Prague",          en:"Sparta Prague",         es:"Sparta de Praga",       pt:"Sparta Praga",          it:"Sparta Praga" },
  3357:   { code:"STG", uefa:"50111",   light:"#1A1A1A", dark:"#E8EAED", short:"Sturm Graz",
            fr:"Sturm Graz",             en:"Sturm Graz",            es:"Sturm Graz",            pt:"Sturm Graz",            it:"Sturm Graz" },
  3:      { code:"SUN", uefa:"53360",   light:"#C8102E", dark:"#FF6B6E", short:"Sunderland",
            fr:"Sunderland",             en:"Sunderland",            es:"Sunderland",            pt:"Sunderland",            it:"Sunderland" },
  2726:   { code:"HOF", uefa:"2600431", light:"#1C63B7", dark:"#6E9BEF", short:"Hoffenheim",
            fr:"Hoffenheim",             en:"Hoffenheim",            es:"Hoffenheim",            pt:"Hoffenheim",            it:"Hoffenheim" },
  7067:   { code:"TOR", uefa:"2603107", light:"#0B3E8C", dark:"#6E9BEF", short:"Torreense",
            fr:"Torreense",              en:"Torreense",             es:"Torreense",             pt:"Torreense",             it:"Torreense" },
  3958:   { code:"USG", uefa:"64125",   light:"#1A1A1A", dark:"#FFD400", short:"Union SG",
            fr:"Union Saint-Gilloise",   en:"Union Saint-Gilloise",  es:"Union Saint-Gilloise",  pt:"Union Saint-Gilloise",  it:"Union Saint-Gilloise" },
  3545:   { code:"VPL", uefa:"64388",   light:"#C8102E", dark:"#FF6B6E", short:"Plzeň",
            fr:"Viktoria Plzeň",         en:"Viktoria Plzeň",        es:"Viktoria Plzeň",        pt:"Viktoria Plzeň",        it:"Viktoria Plzeň" }
};

// Écussons officiels UEFA, en couleur. 100×100 pour couvrir les écrans 3× :
// l'écusson s'affiche entre 22 et 30 px.
const LOGO = (uefa) => `https://img.uefa.com/imgml/TP/teams/logos/100x100/${uefa}.png`;

module.exports = { TEAMS, LOGO };
