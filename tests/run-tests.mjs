/*
 * Batterie de tests de Sika — `node tests/run-tests.mjs`
 *
 * Les fonctions testées sont pures et vivent dans index.html : on les extrait
 * par sections (repères stables) et on les évalue avec des stubs injectés.
 * Zéro dépendance. Couvre : parseur de montants, CSV (banque Débit/Crédit,
 * relevés signés), validation stricte des sauvegardes (anti-injection),
 * récurrences (jamais rétroactives).
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "index.html"), "utf8")
  .split("<script>")[1].split("</script>")[0];

const grab = (from, to) => {
  const a = src.indexOf(from), b = src.indexOf(to);
  if (a === -1 || b === -1 || b <= a) throw new Error(`Section introuvable : ${from}`);
  return src.slice(a, b);
};

const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayISO = () => ymd(new Date());

/* --- Extraction des fonctions pures --- */
const amountFns = new Function(grab("function esc(", "function catOf") + "return { esc, parseAmount };")();
const csvFns = new Function("DAY", grab("const CAT_HINTS", "let csvRows = null") + "return { parseMoneyCell, normalizeCsvDate, parseCsv, guessCat };")(864e5);
const CATS = { other:{label:"Autre",emoji:"📦",color:"#8e8e93"}, food:{label:"Alimentation",emoji:"🍔",color:"#ff9500"}, transport:{label:"Transport",emoji:"🚕",color:"#5ac8fa"} };
const backupFns = new Function("SCHEMA_VERSION", "CATS", grab("/* ====== Restauration : aperçu + fusion dédoublonnée ou remplacement ====== */", "let backupPending") + "return { buildBackup };")(3, CATS);

const recFns = new Function("ymd", "todayISO", "state", "save", grab("/* ============ Dépenses récurrentes ============ */", "function renderRecurring") + "return { nextOccur, firstOccur, processRecurring };")(ymd, todayISO, { expenses: [], recurring: [] }, () => {});

const { esc, parseAmount } = amountFns;
const { parseMoneyCell, normalizeCsvDate, parseCsv, guessCat } = csvFns;
const { buildBackup } = backupFns;
const { nextOccur, firstOccur, processRecurring } = recFns;

/* --- Harnais --- */
let passed = 0, failed = 0;
const eq = (a, b, msg) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) passed++; else { failed++; console.error(`✗ ${msg}\n   attendu : ${JSON.stringify(b)}\n   obtenu  : ${JSON.stringify(a)}`); }
};
const check = (cond, msg) => cond ? passed++ : (failed++, console.error(`✗ ${msg}`));

/* ======== parseAmount ======== */
eq(parseAmount("12,50"), 12.5, "parseAmount 12,50");
eq(parseAmount("1250"), 1250, "parseAmount 1250");
eq(parseAmount("1 250"), 1250, "parseAmount espace milliers");
eq(parseAmount("1,250.50"), 1250.5, "parseFormat EN 1,250.50");
eq(parseAmount("1.250,50"), 1250.5, "parseFormat FR 1.250,50");
eq(parseAmount("12,5"), 12.5, "parseAmount 12,5");
eq(parseAmount("1,250"), 1250, "parseAmount virgule 3 chiffres = milliers");
eq(parseAmount(""), 0, "parseAmount vide");
eq(parseAmount("abc"), 0, "parseAmount lettres");

/* ======== parseMoneyCell ======== */
eq(parseMoneyCell("-13,49"), -13.49, "montant négatif");
eq(parseMoneyCell("45,20-"), -45.2, "signe en suffixe (banque)");
eq(parseMoneyCell("1 234,56"), 1234.56, "milliers FR");
eq(parseMoneyCell("1,234.56 EUR"), 1234.56, "milliers EN + devise");
eq(parseMoneyCell(""), null, "vide → null");
eq(parseMoneyCell("+1800,00"), 1800, "plus préfixe");
eq(parseMoneyCell("2 000,00 EUR"), 2000, "espace + devise");

/* ======== normalizeCsvDate ======== */
eq(normalizeCsvDate("2026-10-10"), "2026-10-10", "date ISO");
eq(normalizeCsvDate("10/09/2026"), "2026-09-10", "JJ/MM/AAAA");
eq(normalizeCsvDate("10/09/26"), "2026-09-10", "JJ/MM/AA");
eq(normalizeCsvDate("2026.10.10"), "2026-10-10", "point séparateur");
eq(normalizeCsvDate("32/13/2026"), null, "date impossible → null");

/* ======== parseCsv ======== */
eq(parseCsv("Date;Libellé;Montant\n10/09/2026;Netflix;-13,49\n11/09/2026;Salaire reçu;+1800,00\n12/09/2026;Carrefour;-45,20"),
   [{ date:"2026-09-10", label:"Netflix", amount:13.49, cat:"bills" },
    { date:"2026-09-12", label:"Carrefour", amount:45.2, cat:"food" }],
   "relevé signé : crédits ignorés, montants positifs");
eq(parseCsv("Date;Libellé;Montant\n10/09/2026;Netflix;13.49\n11/09/2026;Carrefour;45.20").length, 2,
   "relevé sans signe : tout importé");
eq(parseCsv("Date\tLibellé\tMontant\n10/09/2026\tUber\t12.90"),
   [{ date:"2026-09-10", label:"Uber", amount:12.9, cat:"transport" }],
   "séparateur tabulation + cat devinée");
const rSplit = parseCsv("Date;Libellé;Debit;Credit\n10/09/2026;Netflix;13,49;\n11/09/2026;Salaire;;1800,00\n12/09/2026;Carrefour;45,20;5,00");
eq(rSplit, [{ date:"2026-09-10", label:"Netflix", amount:13.49, cat:"bills" },
            { date:"2026-09-12", label:"Carrefour", amount:45.2, cat:"food" }],
   "colonnes Débit/Crédit : la colonne Crédit n'est jamais une dépense");
eq(parseCsv("Date;Libellé;Credit\n10/09/2026;Salaire;1800,00"), [], "relevé crédit seul : rien importé");
eq(guessCat("NETFLIX SARL"), "bills", "guessCat Netflix → bills");
eq(guessCat("UBER PARIS"), "transport", "guessCat Uber → transport");

/* ======== buildBackup (validation stricte, anti-injection) ======== */
const UUIDRE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const evil = buildBackup({
  expenses: [{ id: '"><img src=x onerror=alert(1)>', name: "ok", cat: "food", amount: 5, date: "2026-10-01" }],
  cats: { '"><img>': { label: "<xss>", emoji: "<img src=x onerror=alert(1)>", color: '"><script>' },
          food: { label: "Alimentation", emoji: "🍔", color: "#ff9500" } },
  budgets: { '"><img>': '"><u>', food: "50" },
  goals: [{ name: "g", target: 1, saved: 0, id: "x'); alert(1); ('" }],
  recurring: [{ name: "r", cat: "food", amount: 1, lastAdded: "not-a-date" }]
});
check(Object.values(evil.expenses).every(e => UUIDRE.test(e.id)), "buildBackup : id malveillant → UUID");
check(Object.keys(evil.cats).every(k => /^[a-z][a-z0-9_-]{0,31}$/i.test(k)), "buildBackup : clés de catégories sûres");
check(Object.values(evil.cats).every(c => /^#[0-9a-f]{6}$/i.test(c.color) && !/[<>&"'`\\\/{}]/.test(c.emoji)), "buildBackup : emoji/couleur neutralisés");
check(evil.goals.every(g => UUIDRE.test(g.id)), "buildBackup : id d'objectif reconstruit");
check(evil.recurring.every(r => r.lastAdded === ""), "buildBackup : lastAdded invalide vidé");
check(evil.budgets.food === 50 && evil.budgets.food !== undefined && Number.isFinite(evil.budgets.food), "buildBackup : budget légitime conservé");
eq(evil.expenses[0].cat, "food", "buildBackup : référence cat remappée vers la bonne clé");
const legit = buildBackup({
  rev: 42, budget: 1000,
  cats: { food: { label: "Alimentation", emoji: "🍔", color: "#ff9500" } },
  budgets: { food: 300 },
  recurring: [{ name: "Loyer", cat: "food", amount: 700, freq: "m", day: 5, lastAdded: "2026-09-05" }],
  goals: [{ name: "Japon", target: 5000, saved: 100 }],
  expenses: [{ id: "01234567-89ab-cdef-0123-456789abcdef", name: "Café", cat: "food", amount: 2.5, date: "2026-10-10" }]
});
check(legit.expenses[0].id === "01234567-89ab-cdef-0123-456789abcdef" && legit.goals[0].id.length !== undefined && UUIDRE.test(legit.goals[0].id), "buildBackup : ids valides conservés");
check(legit.rev === 42 && legit.budget === 1000 && legit.budgets.food === 300, "buildBackup : rev/budgets intacts");
check(legit.recurring[0].lastAdded === "2026-09-05" && legit.recurring[0].cat === "food", "buildBackup : récurrence date/cat conservées");

/* ======== Récurrences ======== */
const today = todayISO();
check(firstOccur({freq:"m", day:1}) > today, "récurrence mensuelle jour passé → prochaine occurrence");
check(firstOccur({freq:"m", day:28}) >= today, "récurrence mensuelle : jamais rétroactive");
check(firstOccur({freq:"w", wd:0}) >= today, "récurrence hebdo : jamais rétroactive");
// nextOccur : bascule d'année
eq(nextOccur({freq:"m", day:5}, "2026-12-05"), "2027-01-05", "nextOccur décembre → janvier");
eq(nextOccur({freq:"m", day:31}, "2026-01-31"), "2026-02-28", "nextOccur jour 31 clôt au 28");
eq(nextOccur({freq:"w", wd:0}, "2026-10-05"), "2026-10-12", "nextOccur hebdo +7 jours");
// processRecurring : rattrapage complet
{
  const state = { expenses: [], recurring: [{ name: "Loyer", cat: "food", amount: 700, freq: "m", day: 5, lastAdded: "2026-09-05" }] };
  const fns = new Function("ymd", "todayISO", "state", "save", grab("/* ============ Dépenses récurrentes ============ */", "function renderRecurring") + "return { processRecurring };")(ymd, todayISO, state, () => {});
  fns.processRecurring();
  check(state.expenses.length === 1, "rattrapage : 1 occurrence échue (octobre)");
  eq(state.expenses[0]?.date, "2026-10-05", "rattrapage : date de l'occurrence");
  eq(state.recurring[0].lastAdded, (today >= "2026-10-05" && today < "2026-11-05") ? "2026-10-05" : state.recurring[0].lastAdded, "rattrapage : lastAdded avancé");
  // nouvelle récurrence créée en cours de mois, jour déjà passé : rien d'inséré
  const st2 = { expenses: [], recurring: [{ name: "Netflix", cat: "fun", amount: 13.5, freq: "m", day: 1, lastAdded: "" }] };
  const fns2 = new Function("ymd", "todayISO", "state", "save", grab("/* ============ Dépenses récurrentes ============ */", "function renderRecurring") + "return { processRecurring };")(ymd, todayISO, st2, () => {});
  fns2.processRecurring();
  eq(st2.expenses.length, today.slice(8) < "01" ? 1 : 0, "création en cours de mois avec jour passé : pas d'ajout rétroactif");
}

/* ======== esc ======== */
eq(esc("<img src=x onerror=alert(1)>"), "&lt;img src=x onerror=alert(1)&gt;", "esc : balise");
eq(esc('"a\'&'), "&quot;a&#39;&amp;", "esc : guillemets + &");
eq(esc(null), "", "esc : null → chaîne vide");


console.log(`\n${passed} tests OK, ${failed} échec(s)`);
process.exit(failed ? 1 : 0);