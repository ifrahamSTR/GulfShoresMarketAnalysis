// Browser tests for the Gulf Shores & Orange Beach, AL underwriting page (the rendered page,
// real clicks, real clipboard).
//   NODE_PATH=<dir with playwright-core's node_modules> node tests/test_underwritten_browser.mjs
// Uses the system Chrome (CHROME=/path/to/chrome to override) and serves this folder on a
// free local port. No request leaves the machine except map tiles: the new listing is placed
// by hand, not looked up on OpenStreetMap. Skips, with a message, if playwright-core is missing.
//  - the page loads with no console errors: 428 comps, hero tiles, the $90k default floor
//  - Add a Zillow listing: address read from the URL, saved, pin placed by clicking the map
//    among the Fort Morgan homes
//  - the new target's card: area (cluster), position on the water from the pin; every OPEX
//    line priced, so returns compute as soon as revenue is entered
//  - Match by location: only the target's area and position on the water, bedrooms +/-1,
//    $90k+, nearest first; "Same area" off widens it; a Gulf-front waterfront type keeps
//    to Gulf-front comps; Match by amenities ranks all 428
//  - a comp popup's "Copy row" and the list's copy give the same 15-column line; adding
//    from the list puts it in the comp set; Download UW CSV keeps the template's
//    amortization block byte for byte and writes the comps in revenue order
//  - colour by position on the water, the shoreline layer, a shared #p= link, the main page's
//    Underwriting section, and a 420 px phone view without sideways scrolling
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let chromium;
try { ({ chromium } = require("playwright-core")); } catch (e) {
  console.log("SKIPPED: playwright-core not found (npm install playwright-core, then run with NODE_PATH pointing at its node_modules).");
  process.exit(0);
}
const C = require(join(ROOT, "js/underwritten/uw-csv.js"));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const UWJ = JSON.parse(readFileSync(join(ROOT, "data/underwritten.json"), "utf8"));
const TEMPLATE = readFileSync(join(ROOT, "underwriting/template", UWJ.templateFile), "utf8");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".csv": "text/csv", ".webp": "image/webp", ".png": "image/png" };

const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, path === "/" ? "underwritten.html" : path);
    if (!(await stat(file)).isFile()) throw new Error("not a file");
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch (e) { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = "http://127.0.0.1:" + server.address().port + "/";

let failures = 0;
const check = (ok, msg) => { console.log("  " + (ok ? "ok  " : "FAIL") + " " + msg); if (!ok) failures++; };
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, locale: "en-US", permissions: ["clipboard-read", "clipboard-write"], acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error" && !/favicon|tile\.openstreetmap/.test(m.text())) errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(e.message));
// Never let the page reach Nominatim from a test.
await page.route("https://nominatim.openstreetmap.org/**", (r) => r.abort());
const ev = (f, a) => page.evaluate(f, a);
const clip = () => ev(() => navigator.clipboard.readText());

console.log("1. LOAD\n");
await page.goto(BASE + "underwritten.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.UW && UW.mapApi && UW.mapApi.map && UW.matchSet);
await page.waitForTimeout(400);
const s0 = await ev(() => ({ n: UW.listings.length, shown: UW.matchSet.size, hero: document.getElementById("uw-hero-stats").innerText, village: UW.ui.layers.village, minRev: UW.ui.filters.minRev }));
check(s0.n === 428, "428 Airbnb comps loaded (" + s0.n + ")");
check(s0.minRev === 90000 && s0.shown === 174, "default floor $90k: " + s0.shown + " of 428 pass");
check(/^428\n/.test(s0.hero) && !s0.village, "hero shows the 428 comps (no targets yet); shoreline layer off by default");

console.log("\n2. ADD A ZILLOW LISTING\n");
const URL_ = "https://www.zillow.com/homedetails/1234-Fort-Morgan-Rd-Gulf-Shores-AL-36542/99999999_zpid/";
await page.click("#uw-add-btn");
await page.fill("#f-url", URL_);
await page.dispatchEvent("#f-url", "input");
check((await page.inputValue("#f-addr")) === "1234 Fort Morgan Rd, Gulf Shores, AL 36542", "address read from the Zillow link: " + (await page.inputValue("#f-addr")));
check(/Blank sheet/.test(await page.locator("#f-tpl option:checked").innerText()), "starts from the blank sheet by default");
await page.fill("#f-price", "289000");
await page.fill("#f-beds", "3");
await page.fill("#f-baths", "2");
await page.click("details.uw-dlg__more summary");
await page.check("#f-tub");
await page.click(".uw-dlg__foot button[type=submit]");
await page.waitForSelector("#uw-place-bar:not([hidden])");
// Let the map finish flying (a click mid-animation can miss), then place the pin by the
// Fort Morgan homes (a spot a few hundred metres off the Gulf), by clicking the map there.
await page.waitForTimeout(900);
await page.waitForFunction(() => { const m = UW.mapApi.map; return !m._animatingZoom && !(m._panAnim && m._panAnim._inProgress) && !m._flyToFrame; });
const spot = await ev(() => { const l = UW.listings.find((x) => x.area === "fortmorgan" && x.beachKm > 0.3 && x.beachKm < 0.6); return [l.lat, l.lng + 0.0008]; });
await ev((spot) => { UW.mapApi.map.setView(spot, 16, { animate: false }); }, spot);
await page.waitForTimeout(200);
const pt = await ev((spot) => { const p = UW.mapApi.map.latLngToContainerPoint(spot); const r = document.getElementById("uw-leaflet").getBoundingClientRect(); return { x: r.left + p.x, y: r.top + p.y }; }, spot);
await page.mouse.click(pt.x, pt.y);
await page.waitForTimeout(300);
await page.click("#uw-place-bar [data-act=place-cancel]");
await page.waitForTimeout(400);
const pid = "z99999999";
const t1 = await ev((pid) => { const p = UW.property(pid); return p && { geo: p.geo, place: p.place, beds: p.versions[0].profile.beds, hotTub: p.versions[0].profile.flags.hot_tub, opexMissing: p.versions[0].outputs.opexMissing, checks: p.versions[0].checks.map((c) => c.kind) }; }, pid);
check(!!t1 && !!t1.geo, "the listing is saved and pinned");
const st1 = await ev((pid) => { const s = UW.property(pid).versions[0].inputs.setup; return UWRules.STANDARD_SETUP.map((x) => { const m = s.find((y) => UWRules.setupKey(y.label) === UWRules.setupKey(x.label)); return m ? m.label + " " + m.amount : "MISSING " + x.label; }); }, pid);
check(st1.every((x) => !/^MISSING|null$/.test(x)), "the new sheet carries the five standard setup lines: " + st1.join(" · "));
check(t1 && t1.place && t1.place.zone === "fortmorgan" && t1.place.loc === "Off the water" && t1.place.areaName === "Fort Morgan", "pin reads Fort Morgan, off the water: " + JSON.stringify(t1 && t1.place));
check(t1 && t1.beds === 3 && t1.hotTub === 1, "target profile: 3 bedrooms, hot tub from the notes (“Existing hot tub”)");
check(t1 && !t1.opexMissing, "OPEX starts priced (Galveston 101's amounts, rounded), so returns compute once revenue is set");

console.log("\n3. MATCH BY LOCATION / AMENITIES\n");
await ev((pid) => UW.select(pid), pid);
await page.waitForTimeout(500);
const loc = await ev((pid) => { const p = UW.property(pid); return UW.results(p).map((x) => ({ id: x.l.id, d: x.d, town: x.l.town, beds: x.l.bedrooms, rev: x.l.revenue, pos: x.l.loc })); }, pid);
const locZ = await ev((pid) => UW.results(UW.property(pid)).every((x) => x.l.zone === "fortmorgan"), pid);
check(loc.length > 0 && locZ && loc.every((x) => Math.abs(x.beds - 3) <= 1 && x.rev >= 90000 && x.pos === "Off the water"), loc.length + " location matches: all Fort Morgan, off the water, 2–4 BR, $90k+");
check(loc.every((x, i) => !i || x.d >= loc[i - 1].d), "nearest first");
const panelRows = await page.locator("#uw-p-comps .uw-near li, #uw-p-comps [data-id]").count();
check(panelRows > 0, "the panel lists the matches");
const all0 = await ev((pid) => { UW.ui.n = 50; return UW.results(UW.property(pid)).length; }, pid);
await page.click("#uw-p-comps input[data-rule=zone]");
await page.waitForTimeout(300);
const widerN = await ev((pid) => UW.results(UW.property(pid)).length, pid);
const widerTown = await ev((pid) => UW.results(UW.property(pid)).some((x) => x.l.zone !== "fortmorgan"), pid);
check(widerN > all0 && widerTown, "“Same area” off: " + widerN + " matches, other areas included (was " + all0 + ", Fort Morgan only)");
await page.click("#uw-p-comps input[data-rule=zone]");
// The waterfront type on the card: Gulf-front keeps the match to Gulf-front homes.
await ev((pid) => { UW.ui.cardTab[pid] = "property"; UW.ui.expanded.add(pid); UW.cardsApi.renderCard(pid); }, pid);
await page.waitForTimeout(300);
await page.selectOption("#uw-card-" + pid + " select[data-wf]", "Gulf-front");
await page.waitForTimeout(400);
const gf = await ev((pid) => { const p = UW.property(pid); return { wf: p.waterfront, loc: p.place.loc, all: UW.results(p).map((x) => x.l.loc) }; }, pid);
check(gf.wf === "Gulf-front" && gf.loc === "Gulf-front" && gf.all.length > 0 && gf.all.every((x) => x === "Gulf-front"), "waterfront type set to Gulf-front: " + gf.all.length + " matches, all Gulf-front");
await page.selectOption("#uw-card-" + pid + " select[data-wf]", "None");
await page.waitForTimeout(300);
await ev((pid) => { UW.ui.expanded.delete(pid); UW.cardsApi.renderCard(pid); }, pid);
await ev(() => { UW.ui.n = 12; });
await page.click('#uw-p-comps [data-act=mode][data-v=amenity]');
await page.waitForTimeout(300);
const am = await ev((pid) => { UW.ui.n = 500; return UW.results(UW.property(pid)).length; }, pid);
check(am === 428, "Match by amenities ranks all 428 homes");
await ev(() => { UW.ui.n = 12; UW.setMode("location"); });
await page.waitForTimeout(300);

console.log("\n3b. VIEW CONTROL (declutter)\n");
await page.click(".uw-viewctl [data-view=clean]");
await page.waitForTimeout(300);
const vc = await ev(() => ({ score: UW.ui.score, L: UW.ui.layers, saved: JSON.parse(localStorage.getItem("gulfshoresUW.view") || "null"), outlines: document.querySelectorAll(".uw-area-label").length }));
check(vc.score === "hideLow" && !vc.L.areas && !vc.L.labels && !vc.L.village && !vc.L.ghosts && !vc.L.ring && vc.L.ranks && vc.saved && vc.saved.score === "hideLow",
  "Clean map: bottom 25% and filtered-out dots hidden, outlines / names / shoreline / search ring off, rank numbers kept, remembered");
await page.click('.uw-viewctl [data-view=score][data-v=top]');
await page.waitForTimeout(300);
const vis = await ev(() => { const ranked = new Set(UW.mapApi.lastNearest.map((x) => x.l.id)); let lowShown = 0, rankedHidden = 0;
  UW.mapApi.map.eachLayer((m) => { if (!m.listing) return; const on = m.options.fillOpacity > 0; if (on && m.listing.sizeTier !== "Top 25% for its size" && !ranked.has(m.listing.id)) lowShown++; if (!on && ranked.has(m.listing.id)) rankedHidden++; });
  return { lowShown, rankedHidden, ranked: ranked.size, badges: document.querySelectorAll(".uw-rank").length }; });
check(vis.lowShown === 0 && vis.rankedHidden === 0 && vis.badges === vis.ranked, "Top 25% only: no other dot drawn, all " + vis.ranked + " ranked matches still shown with their numbers");
await page.click(".uw-viewctl [data-view=all]");
await page.waitForTimeout(300);
const va = await ev(() => UW.ui.score === "all" && ["areas", "labels", "ghosts", "ranks", "ring"].every((k) => UW.ui.layers[k]));
check(va, "Show everything restores every dot and marking");

console.log("\n4. COPY, ADD, DOWNLOAD\n");
const first = loc[0].id;
await ev((id) => UW.mapApi.openListing(id), first);
await page.waitForSelector(".uw-pop [data-act=pop-copy]");
await page.click(".uw-pop [data-act=pop-copy]");
await page.waitForTimeout(200);
const popLine = await clip();
check(popLine.split("\t").length === 15 && popLine.includes("/rooms/" + first) && /^\S+\t\d+\t/.test(popLine), "popup Copy row: one 15-column sheet row");
check(/\[Location match\] [\d.]+ mi from 1234 Fort Morgan Rd · /.test(popLine), "its note says how it was found and how far: " + popLine.split("\t")[14]);
await page.click(".uw-pop [data-act=pop-add]");
await page.waitForTimeout(300);
await ev(([pid, ids]) => UW.actions.addComps(pid, "Draft", ids.map((i) => UW.byId.get(i))), [pid, loc.slice(1, 4).map((x) => x.id)]);
await page.waitForTimeout(300);
const set = await ev((pid) => UW.property(pid).versions[0].comps.map((c) => c.revenue), pid);
check(set.length === Math.min(4, loc.length) && set.every((r, i) => !i || r <= set[i - 1]), "comp set holds " + set.length + " rows, revenue high to low");
await ev((pid) => UW.actions.copyComps(pid), pid);
await page.waitForTimeout(200);
const lines = (await clip()).split("\n");
check(lines.length === set.length && lines.some((l) => l.split("\t").slice(0, 14).join("\t") === popLine.split("\t").slice(0, 14).join("\t")), "Copy comps gives the same row as the popup");
const [dl] = await Promise.all([page.waitForEvent("download"), ev((pid) => UW.actions.downloadCsv(pid), pid)]);
const csv = readFileSync(await dl.path(), "utf8");
check(C.amortBlock(csv) === C.amortBlock(TEMPLATE), "Download UW CSV: amortization block byte-identical to the template");
const P = C.parse(csv), L = C.locate(P.rows);
const revs = [];
for (let i = L.comps.first; i <= L.comps.last; i++) if (P.rows[i][L.comps.col]) revs.push(+P.rows[i][L.comps.col + 1].replace(/[$,]/g, ""));
check(revs.length === set.length && revs.every((r, i) => !i || r <= revs[i - 1]), "its comp rows in revenue order (" + revs.length + ")");
check([[5, "Furniture / Decor / Essentials"], [16, "Misc"], [17, "CoHost Essentials"], [18, "Design/Project Management"], [19, "Install/Staging/Warehousing"]]
  .every(([r, lab]) => P.rows[r - 1][L.setup.col].trim() === lab && P.rows[r - 1][L.setup.col + 1].trim() !== ""), "the downloaded sheet has the five standard setup lines in rows 5 and 16–19, priced");
check(P.rows[L.price[0]][L.price[1]] === " $ 289,000 " && P.rows[L.url[0]][L.url[1]] === URL_, "price and Zillow URL written; file " + dl.suggestedFilename());

console.log("\n5. OPEX AND RETURNS\n");
await ev((pid) => { const v = UW.property(pid).versions[0]; const inp = JSON.parse(JSON.stringify(v.inputs)); inp.revenue = { low: 60000, mid: 75000, high: 90000 }; UW.setInputs(pid, "Draft", inp); }, pid);
const g1 = await ev((pid) => UW.property(pid).versions[0].outputs.cases.mid.coc, pid);
const ox = await ev((pid) => { const v = UW.property(pid).versions[0]; return { m: v.outputs.opexMonthly, lines: v.inputs.opex.filter((o) => !o.cleaning && o.amount == null).length }; }, pid);
check(g1 != null && ox.m === 4850 && ox.lines === 0, "revenue entered: cash on cash computes straight away; OPEX $" + ox.m + "/month, no empty line");
await ev((pid) => { const v = UW.property(pid).versions[0]; const inp = JSON.parse(JSON.stringify(v.inputs)); inp.opex.find((o) => /Utilities/i.test(o.label)).amount = 400; UW.setInputs(pid, "Draft", inp); }, pid);
const g2 = await ev((pid) => { const v = UW.property(pid).versions[0]; return { coc: v.outputs.cases.mid.coc, missing: !!v.outputs.opexMissing }; }, pid);
check(g2.coc != null && !g2.missing, "editing an OPEX line recalculates cash on cash (" + (g2.coc * 100).toFixed(2) + "% mid)");
await ev((pid) => { UW.ui.cardTab[pid] = "sheet"; UW.ui.expanded.add(pid); UW.cardsApi.renderCard(pid); }, pid);
await page.waitForTimeout(800);
check(await page.locator("#uw-card-" + pid).isVisible(), "the target's card renders with its Sheet tab");

console.log("\n6. LAYERS, LINKS, PHONE\n");
await ev(() => { UW.ui.colorBy = "loc"; UW.mapApi.refresh(); });
const legend = await ev(() => document.querySelector(".uw-legend").textContent);
check(/Position on the water/.test(legend) && /Gulf-front/.test(legend) && /Bay \/ lagoon \/ canal/.test(legend) && /Off the water/.test(legend), "colour by position on the water: legend lists the three positions");
await ev(() => { UW.ui.layers.village = false; UW.mapApi.layers(); UW.ui.layers.village = true; UW.mapApi.layers(); });
const hash = await ev(() => location.hash);
check(/p=z99999999/.test(hash), "the URL carries the selected target: " + hash);
const page2 = await ctx.newPage();
page2.on("pageerror", (e) => errors.push("page2: " + e.message));
await page2.goto(BASE + "underwritten.html" + hash, { waitUntil: "networkidle" });
await page2.waitForTimeout(600);
check(await page2.evaluate(() => UW.ui.selected === "z99999999"), "opening that link selects the same target (same browser)");
await page2.close();
const phone = await ctx.newPage();
await phone.setViewportSize({ width: 420, height: 860 });
phone.on("pageerror", (e) => errors.push("phone: " + e.message));
await phone.goto(BASE + "underwritten.html", { waitUntil: "networkidle" });
await phone.waitForTimeout(600);
const ph = await phone.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, mapH: document.getElementById("uw-leaflet").getBoundingClientRect().height }));
check(ph.sw <= ph.cw + 1 && ph.mapH > 250, "phone 420 px: no sideways scroll (" + ph.sw + " / " + ph.cw + "), map " + Math.round(ph.mapH) + " px tall");
await phone.close();
const main = await ctx.newPage();
main.on("pageerror", (e) => errors.push("index: " + e.message));
main.on("console", (m) => { if (m.type() === "error" && !/favicon|tile\.openstreetmap|basemaps/.test(m.text())) errors.push("index: " + m.text()); });
await main.goto(BASE + "index.html", { waitUntil: "networkidle" });
await main.waitForTimeout(1500);
const mi = await main.evaluate(() => ({ cards: document.querySelectorAll("#underwriting a[href*='underwritten.html#p=']").length, areas: LOCATION.areas.map((a) => a.name).join(), title: document.getElementById("hero-title").textContent }));
check(mi.cards >= 1 && mi.title.length > 0 && mi.areas === "Fort Morgan,Gulf Shores,Orange Beach", "main page: " + mi.cards + " underwriting card (the new listing) under the hero “" + mi.title + "”; areas " + mi.areas);
await main.close();

check(errors.length === 0, "no console errors" + (errors.length ? ": " + errors.join(" | ") : ""));
await browser.close();
server.close();
console.log(`\n${failures ? failures + " FAILURE" + (failures === 1 ? "" : "S") : "All browser checks passed"}.`);
process.exit(failures ? 1 : 0);
