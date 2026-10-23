/**
 * Content/config layer for the Gulf Shores, AL market & location page
 * (Sections 2-5; no buy boxes yet). Same template as the Galveston and Bend
 * sites, organised around bedroom size: every location comparison is made
 * within a size bucket ("vs. typical" = revenue / median for that size;
 * 1BRs and 2BRs are each measured against their own bedroom count).
 *
 * Prose and config only. Every number shown is read from js/region_data.js
 * (generated from notebooks/gulfshores_overview.ipynb); prose that quotes a
 * number computes it from that data. Qualitative statements were checked
 * against the notebook output for the 2026-10-22 snapshot: 428 entire homes
 * in Gulf Shores (ZIP 36542, which includes the Fort Morgan peninsula) and
 * Orange Beach (ZIP 36561), in three revenue clusters along the coast (Fort
 * Morgan, main Gulf Shores, Orange Beach). Position on the water comes from
 * each listing's own title and description (46 listings reviewed one by one
 * in notebooks/position_overrides.csv). Thin cells (under 8 homes) are muted
 * in the tables and the prose says so where it leans on them.
 */
function photo(relPath, alt, caption) {
  return { file: "assets/" + relPath, alt: alt, caption: caption };
}
const MARKET_NAME = "Gulf Shores, AL";
const _ls = (s, l) => LOCATION.locSize[s][l];
const _area = (name) => LOCATION.areas.find((a) => a.name === name);
const _lad = (s) => LOCATION.ladder.find((r) => r.size === s);
const _x = (c) => fmtX(c.idx);
const FM = "Fort Morgan", GS = "Gulf Shores", OB = "Orange Beach", WATER = "Bay / lagoon / canal";
const _pct = (a, b) => Math.round((a / b - 1) * 100);

// ---------------------------------------------------------------------------
// Overview (top of page)
// ---------------------------------------------------------------------------
const HERO = {
  title: "On the Alabama coast, size sets the rate and the first row is the lever",
  sub: (() => {
    const b = _lad("5BR+"), f = _lad("4BR"), t = LOCATION.top10BySize, total = Object.values(t).reduce((a, c) => a + c, 0);
    const g = _ls("All sizes", "Gulf-front"), fm = _area(FM), ob = _area(OB);
    return "Three clusters of homes run along this coast: Fort Morgan at the far west end, main Gulf Shores around Hwy 59 and the airport, and Orange Beach. Bedroom count does most of the work: a 5BR+ earns about " + fmtK(b.median) + " against " + fmtK(f.median) +
      " for a 4BR, and " + t["5BR+"] + " of the " + total + " Top 10% listings are 5BR+. The first row on the Gulf is the clear location premium (" + fmtX(g.idx) + " typical for its size, " + g.n + " homes), and Fort Morgan earns a little more for its sizes (" + fmtX(fm.idx) + ") than Orange Beach (" + fmtX(ob.idx) + "). " +
      "This page covers the market, location by bedroom size, why guests choose each part of the coast, and who they are. Buy boxes come next.";
  })(),
};

const FOOTER_NOTE = () =>
  "Preliminary. No buy box has been set. Revenue figures are gross Revenue Potential benchmarks from the market dataset (" +
  MARKET_STATS.n + " entire-home listings in Gulf Shores ZIP 36542, which includes the Fort Morgan peninsula, and Orange Beach ZIP 36561, <span class=\"nowrap\">" + MARKET_STATS.snapshot + "</span> snapshot), not a full underwriting model. Read any cell under 8 homes as directional.";

// ---------------------------------------------------------------------------
// Section 2 — Market context (MARKET_OVERVIEW is in the research section below)
// ---------------------------------------------------------------------------
const DISTRIBUTION_NOTE = () => {
  const t = LOCATION.top10BySize;
  const total = Object.values(t).reduce((a, b) => a + b, 0);
  const rest = ["4BR", "3BR"].filter((k) => t[k]).map((k) => t[k] + " " + k + (t[k] === 1 ? "" : "s"));
  return "Most listings earn under " + fmtK(REVENUE_DISTRIBUTION.p75) + "; the Top 10% starts at " + fmtCurrency(REVENUE_DISTRIBUTION.p90) + ". That tail is mostly large homes: " +
    t["5BR+"] + " of the " + total + " Top 10% listings are 5BR+, the rest " + rest.join(" and ") + (t["1-2BR"] ? "." : ". No 1–2BR reaches it.");
};

const LADDER_NOTE = () => {
  const s = _lad("1-2BR"), f = _lad("4BR"), b = _lad("5BR+");
  const occ = LOCATION.ladder.map((r) => r.occ);
  return "Revenue climbs steadily from 1–2BR (" + fmtK(s.median) + ") to 4BR (" + fmtK(f.median) + "), then nearly doubles at 5BR+ (" + fmtK(b.median) +
    "), where the nightly rate jumps to " + fmtCurrency(b.adr) + ". Occupancy stays between " + Math.min(...occ) + "% and " + Math.max(...occ) + "% at every size. Because size moves revenue this much, every location comparison below is made within the same size.";
};

const DRIVERS_NOTE =
  "<strong>Screening signals, not proven uplift.</strong> Each row compares listings with and without a feature on two measures: how often they reach the top quarter <em>for their size</em>, and what they earn against a typical home their size (1.00× = typical). With " + MARKET_STATS.n + " listings, rows with fewer than 15 homes on either side are marked \"few homes\".";

const DRIVER_ROWS = [
  { key: "Gulf-front", label: "Gulf-front (first row)", group: "Location", note: "The strongest signal in the data: first-row homes reach the top quarter for their size nearly three times as often, with the biggest lift at 3–4BR." },
  { key: WATER, label: "On a bay, lagoon, bayou or canal", group: "Location · frontage or a dock", note: "No premium: these homes earn a little less than homes off the water." },
  { key: FM, label: "Fort Morgan", group: "Location · area", note: "A little ahead of the rest for its sizes, helped by its first-row homes and large houses." },
  { key: OB, label: "Orange Beach", group: "Location · area", note: "Behind for its sizes: mostly houses off the water, and few large homes." },
  { key: "Condo (vs. house)", label: "Condo rather than a house", group: "Product", note: "No real difference once size is held fixed." },
  { key: "pool_heater", label: "Heated pool", group: "Amenity", note: "A signal; a heated pool can extend the swim season into spring and fall." },
  { key: "pool", label: "Pool", group: "Amenity", note: "Expected: two in three homes have one, and on its own it shows no lift." },
  { key: "hot_tub", label: "Hot tub", group: "Amenity", note: "A signal: homes with one reach the top quarter for their size half again as often." },
  { key: "game_room", label: "Game room", group: "Amenity", note: "A signal, on a smaller group of homes." },
  { key: "fire_pit", label: "Fire pit", group: "Amenity", note: "No signal on its own." },
  { key: "Superhost", label: "Superhost", group: "Operations", note: "Superhosts earn a little more for their size, and reach the top quarter more often than the rest." },
];

// ---------------------------------------------------------------------------
// Section 3 — Location by bedroom size
// ---------------------------------------------------------------------------
const MAP_CONFIG = {
  lede:
    "Bedroom count sets the baseline; location can nudge a home above or below it. Every comparison here is within the same size: <strong>1.00× = what a typical home that size earns in this market</strong> (1BRs and 2BRs are each measured against their own bedroom count). Nearly every home is close to the water, so the location questions are <strong>where the home sits on it</strong> (first row on the Gulf, on a bay, lagoon, bayou or canal, or neither; classified from each listing's own title and description, with borderline listings reviewed one by one) and <strong>which of the three clusters</strong> it is in (Fort Morgan, main Gulf Shores, Orange Beach).",
  marketInterpretation:
    "In the bottom-left panel (tap “show” on a phone), <strong>untick all but one bedroom size</strong> to see where that size earns. Green = top quarter for its size, gold = middle half, grey = bottom quarter; bigger dots = more bedrooms. Click an area outline for its numbers by size. The three areas are the market's three clusters of listings along the coast. Airbnb shows approximate locations, and a whole complex often shares one dot.",
};

const LOC_READS = {
  "1-2BR": (() => {
    const g = _ls("1-2BR", "Gulf-front"), w = _ls("1-2BR", WATER);
    return "Position barely matters at this size: first-row homes earn about typical (" + fmtX(g.idx) + "), bay and lagoon homes a little below (" + fmtX(w.idx) + ").";
  })(),
  "3BR": (() => {
    const g = _ls("3BR", "Gulf-front"), o = _ls("3BR", "Off the water");
    return "The first row pays strongly: Gulf-front 3BRs earn " + fmtK(g.median) + " against " + fmtK(o.median) + " off the water, on " + g.n + " homes. Off the first row, position barely matters.";
  })(),
  "4BR": (() => {
    const g = _ls("4BR", "Gulf-front"), o = _ls("4BR", "Off the water");
    return "The biggest first-row premium in the data: Gulf-front 4BRs earn " + fmtK(g.median) + ", " + fmtX(g.idx) + " typical (" + g.n + " homes). Off the first row, 4BRs earn about typical (" + fmtK(o.median) + ").";
  })(),
  "5BR+": (() => {
    const g = _ls("5BR+", "Gulf-front"), o = _ls("5BR+", "Off the water");
    return "A smaller first-row premium: Gulf-front 5BR+ earn " + fmtK(g.median) + " against " + fmtK(o.median) + " off the water (" + g.n + " and " + o.n + " homes).";
  })(),
  "All sizes": "The × figures are size-adjusted; the dollar figures are not, and partly reflect bigger homes on the Gulf.",
};

const AREA_GRID_NOTE = () => {
  const f = _area(FM), g = _area(GS), o = _area(OB);
  return "<strong>Fort Morgan earns a little more for its sizes and Orange Beach a little less</strong>: Fort Morgan " + fmtX(f.idx) + " typical, main Gulf Shores " + fmtX(g.idx) + ", Orange Beach " + fmtX(o.idx) +
    ". The mix differs too: Fort Morgan holds " + f.bySize["5BR+"].n + " of the market's " + _lad("5BR+").n + " 5BR+ homes, main Gulf Shores has the most 1–2BRs (" + g.smallShare + "% of its homes), and Orange Beach has only " + o.bySize["5BR+"].n + " homes with 5 or more bedrooms. Figures in grey, tagged \"few homes\", rest on fewer than 8 homes.";
};

const SIZE_GUIDE = {
  "1-2BR": {
    head: "Anywhere; position barely matters at this size.",
    look: "Fort Morgan 1–2BRs lead (" + fmtX(_area(FM).bySize["1-2BR"].idx) + " typical); in main Gulf Shores and Orange Beach they earn a little below typical. A second bedroom matters more than position.",
    avoid: "One-bedrooms that sleep only a few: a 2BR earns far more wherever it sits.",
    proof: () => "First row " + fmtK(_ls("1-2BR", "Gulf-front").median) + " (" + _ls("1-2BR", "Gulf-front").n + " homes) · bay / lagoon / canal " + fmtK(_ls("1-2BR", WATER).median) + " · off the water " + fmtK(_ls("1-2BR", "Off the water").median),
  },
  "3BR": {
    head: "The first row if you can find it; off it, main Gulf Shores or Fort Morgan.",
    look: "Gulf-front 3BRs, few and far ahead; off the first row, main Gulf Shores (" + fmtX(_area(GS).bySize["3BR"].idx) + ") and Fort Morgan (" + fmtX(_area(FM).bySize["3BR"].idx) + ") earn about typical.",
    avoid: "Orange Beach 3BRs (" + fmtX(_area(OB).bySize["3BR"].idx) + "), and paying extra for bay or lagoon frontage (" + fmtX(_ls("3BR", WATER).idx) + ").",
    proof: () => "Gulf-front " + fmtK(_ls("3BR", "Gulf-front").median) + " (" + _ls("3BR", "Gulf-front").n + " homes) · bay / lagoon / canal " + fmtK(_ls("3BR", WATER).median) + " · off the water " + fmtK(_ls("3BR", "Off the water").median),
  },
  "4BR": {
    head: "The first row is the lever; Orange Beach is the weak spot.",
    look: "Gulf-front 4BRs, far ahead (" + fmtX(_ls("4BR", "Gulf-front").idx) + " typical); otherwise Fort Morgan (" + fmtX(_area(FM).bySize["4BR"].idx) + ") or main Gulf Shores (" + fmtX(_area(GS).bySize["4BR"].idx) + ").",
    avoid: "Orange Beach 4BRs, which earn below typical for their size (" + fmtX(_area(OB).bySize["4BR"].idx) + ").",
    proof: () => "Gulf-front " + fmtK(_ls("4BR", "Gulf-front").median) + " (" + _ls("4BR", "Gulf-front").n + " homes) · bay / lagoon / canal " + fmtK(_ls("4BR", WATER).median) + " · off the water " + fmtK(_ls("4BR", "Off the water").median) + " · Orange Beach " + fmtK(areaCellOf(OB, "4BR").median),
  },
  "5BR+": {
    head: "Size does most of the work; the first row adds a little.",
    look: "Main Gulf Shores (" + fmtX(_area(GS).bySize["5BR+"].idx) + " typical) or Fort Morgan, which has most of the large homes (" + _area(FM).bySize["5BR+"].n + " of " + _lad("5BR+").n + ").",
    avoid: (() => {
      const g = _ls("5BR+", "Gulf-front"), o = _ls("5BR+", "Off the water");
      return "Paying a large first-row premium at this size: Gulf-front 5BR+ earn about " + _pct(g.median, o.median) + "% more than those off the water. Orange Beach has only " + _area(OB).bySize["5BR+"].n + " homes this size.";
    })(),
    proof: () => "Gulf-front " + fmtK(_ls("5BR+", "Gulf-front").median) + " (" + _ls("5BR+", "Gulf-front").n + " homes) · off the water " + fmtK(_ls("5BR+", "Off the water").median) + " (" + _ls("5BR+", "Off the water").n + ")",
  },
};

// ---------------------------------------------------------------------------
// Section 5 — Demographics (area comparisons within the same size)
// ---------------------------------------------------------------------------
const DEMOGRAPHICS_NOTE = () => {
  const b = DEMOGRAPHICS.byBedroom, small = b.find((r) => r.label === "1-2BR"), big = b.find((r) => r.label === "5BR+");
  const A = DEMOGRAPHICS.byAreaSize, f = A[FM], g = A[GS], r = (v) => Math.round(v);
  return "These are review-derived signals, not verified demographics. This is a family market: on the average listing, " + r(DEMOGRAPHICS.marketWide.kids) + "% of reviews come from stays with kids and " +
    r(DEMOGRAPHICS.marketWide.group) + "% from group trips. Group trips climb with size, from " + r(small.group) + "% at 1–2BR to " + r(big.group) + "% at 5BR+, and stays not tagged as family, group or pet trips (the \"Other\" share) are the largest group at 1–2BR (" +
    r(small.other) + "%). Compared size for size, Fort Morgan draws fewer group trips than main Gulf Shores (" + r(f["3BR"].group) + "% vs " + r(g["3BR"].group) + "% at 3BR, " + r(f["4BR"].group) + "% vs " + r(g["4BR"].group) +
    "% at 4BR): the far west end is the quieter stay.";
};

// ---------------------------------------------------------------------------
// Section 2 — Market context. Researched 2026-10-02 and fact-checked against
// the sources: Gulf Shores & Orange Beach Tourism (2025 annual report, Tourism
// Summit release, DGI monthly summary, Key Data vacation-rental trend chart,
// accommodations inventory), City of Gulf Shores, NWS Mobile, Outdoor
// Alabama and local news. Destination-wide figures cover Gulf Shores, Orange
// Beach and Fort Morgan together; no Gulf Shores-only series is published.
// 2026-10-23: the data now covers Fort Morgan and Orange Beach too, so the
// lodging-tax chip and the zoning note are scoped to the City of Gulf Shores,
// and the attractions add Fort Morgan and Orange Beach (GSOBT, The Wharf).
// ---------------------------------------------------------------------------
const MARKET_OVERVIEW = {
  heroImage: photo(
    "overview/gulfshores-white-sand-beach.jpg",
    "White sand dunes with sand fencing and sea oats on the beach at Gulf Shores, Alabama, under a blue sky",
    'Dunes and sea oats on the beach at Gulf Shores. "White sand beach" by Thomas Quine, <a href="https://commons.wikimedia.org/wiki/File:White_sand_beach_(25766178781).jpg" target="_blank" rel="noopener">Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener">CC BY 2.0</a>.'
  ),
  chips: [
    { label: "Record $923M Lodging Revenue Across Alabama's Beaches (2025)" },
    { label: "Nonstop Flights Into Gulf Shores Since 2025" },
    { label: "Drive-To Market: Birmingham Is #1" },
    { label: "16% Lodging Tax in Gulf Shores City Limits" },
  ],
  attractions: [
    "<strong>The beach</strong>: part of the Alabama Gulf Coast's 32 miles of white sand, with the main public beach at Gulf Place, by Hwy 59 and The Hangout.",
    "<strong>Gulf State Park</strong>: 6,150 acres with 3.5 miles of beach, the 1,540-ft fishing pier (reopened in 2024 after Hurricane Sally repairs), the 32-plus-mile paved Backcountry Trail and the 350-room Lodge.",
    "<strong>Little Lagoon</strong>: a calm 10-mile lagoon behind West Beach for kayaking and fishing (trout, flounder, redfish).",
    "<strong>Fort Morgan and Orange Beach</strong>: at the far west end, the fort that guards the mouth of Mobile Bay (Battle of Mobile Bay, 1864) and quiet peninsula beaches; to the east, Orange Beach's Perdido Pass, back bays and The Wharf's shops, restaurants and marina.",
    "<strong>Events in the town centre</strong>: the National Shrimp Festival every October, NCAA beach volleyball in May, and Hangout Fest (none in 2026; expected back in 2027).",
  ],
  visitorStats: {
    headline: "7.14M visitors · $6.87B visitor spending (Gulf Shores, Orange Beach & Fort Morgan, 2025; tiles cover all three areas unless marked)",
    breakdown: [
      { value: "$923M", label: "Taxable Lodging Revenue, a Record (2025)" },
      { value: "37%", label: "Of 2025 Lodging Revenue Earned in June–July" },
      { value: "+8.9%", label: "Lodging Revenue, Jan–Jul 2026 vs 2025" },
      { value: "4,781", label: "Condo Units in Gulf Shores Only (Sept 2026)" },
    ],
  },
  watchOuts: [
    "🌀 <strong>Hurricane season overlaps the peak (June–November).</strong> Hurricane Sally came ashore at Gulf Shores in September 2020 as a Category 2. In July 2026, Tropical Storm Bertha's surf closed Baldwin County beaches to swimming.",
    "📉 <strong>Vacation-rental occupancy slid for four straight years.</strong> Across Gulf Shores, Orange Beach and Fort Morgan it fell every year from 59.6% (2021) to 50.1% (2025), and revenue per available night fell from $159 to $133, even as total lodging revenue hit a record in 2025. 2026 is better so far (54.9% vs 52.2% through August), but about 950 more units are planned over the next two years.",
    "🎵 <strong>No Hangout Fest in 2026</strong> (it is expected back in 2027). Across the three areas, May 2026 lodging revenue grew just 2.8%, the smallest gain of any month from January to July (others: 8–17%), possibly because of the missing festival.",
    "📋 <strong>In Gulf Shores, zoning decides where you can rent.</strong> City zoning (§6-18, last amended by Ord. 2201 in February 2026) allows licensed vacation rentals only in the vacation-rental overlay, the business, tourist-business and Intracoastal Waterway districts, and designated multi-family developments. They are barred in the R-1 to R-5 residential zones outside the overlay, apart from grandfathered units and some R-3/R-4 condos approved by permit. Orange Beach and Baldwin County (most of the Fort Morgan peninsula) set their own rules, so check which one a home is in.",
  ],
  sources: [
    { label: "GSOBT 2025 annual report", url: "https://www.gulfshores.com/sites/default/files/2026-05/AB_25AnnualReports-0526-8.pdf" },
    { label: "GSOBT 2026 Tourism Summit release", url: "https://www.gulfshores.com/media/press-release/alabamas-beaches-2026-tourism-summit/" },
    { label: "GSOBT DGI summary (Sept 2026)", url: "https://www.gulfshores.com/sites/default/files/2026-09/DGI%20Summary%20-%20September%202026.pdf" },
    { label: "GSOBT vacation-rental trend chart", url: "https://www.gulfshores.com/sites/default/files/2026-09/VR%20Trend%20Charts.pdf" },
    { label: "GSOBT accommodations inventory", url: "https://www.gulfshores.com/sites/default/files/2026-09/Accommodations%20Inventory%20-%20September%202026.pdf" },
    { label: "GSOBT Tourism Summit deck (origin markets)", url: "https://www.gulfshores.com/sites/default/files/2026-03/Beth-Tourism%20Summit%202026-%20%281%29%2012%20copy.pdf" },
    { label: "City of Gulf Shores (taxes)", url: "https://www.gulfshoresal.gov/294/Taxes" },
    { label: "City of Gulf Shores (GUF routes)", url: "https://www.gulfshoresal.gov/DocumentCenter/View/13649/111924-GUF-Route-Announcement" },
    { label: "City zoning ordinance (Ord. 2201)", url: "https://gulfshoresal.gov/DocumentCenter/View/56/Zoning-Ordinance-as-Amended-February-23-2026-Ord-2201?bidId=" },
    { label: "GSOBT (Gulf State Park)", url: "https://www.gulfshores.com/things-to-do/gulf-state-park-alabama/" },
    { label: "GSOBT (Fort Morgan)", url: "https://www.gulfshores.com/things-to-do/fort-morgan/" },
    { label: "The Wharf (Orange Beach)", url: "https://alwharf.com/" },
    { label: "Outdoor Alabama (pier reopening)", url: "https://www.outdooralabama.com/articles/gulf-state-park-pier-reopens-public" },
    { label: "NWS Mobile (Hurricane Sally)", url: "https://www.weather.gov/mob/sally" },
    { label: "FOX10 (Bertha surf, Jul 2026)", url: "https://www.fox10tv.com/2026/07/22/rough-surf-double-red-flags-close-baldwin-county-beaches-amid-tropical-storm-bertha/" },
    { label: "FOX10 (2026 tourism numbers)", url: "https://www.fox10tv.com/2026/09/06/new-tourism-impact-numbers-gulf-shores-orange-beach/" },
    { label: "Gulf Coast Media (Hangout Fest 2026)", url: "https://gulfcoastmedia.com/stories/hangout-fest-sand-in-my-boots-will-not-return-in-2026,304017" },
  ],
};

// ---------------------------------------------------------------------------
// Section 4 — Why location changes the rate (js/destination.js engine).
// "Why it matters here" lines compute from LOCATION.
// ---------------------------------------------------------------------------
const DEST_LEDE = "Why guests choose each part of the coast, from Fort Morgan to Orange Beach, and why the first row matters more than which part. Click an area.";
const DEST_RESEARCHED = "2026-10-23";
const DEST_KIND = {
  fortmorgan: ["Fort Morgan (the far west end)", "#7A5C99"],
  gulfshores: ["Main Gulf Shores", "#3C6E9E"],
  orangebeach: ["Orange Beach", "#C9822B"],
  lagoon: ["Little Lagoon", "#D07A1F"],
};
function DEST_AREAS() {
  const f = _area(FM), g = _area(GS), o = _area(OB);
  return [
    {
      id: "fortmorgan", name: "Fort Morgan: the far west end", kind: "fortmorgan", tags: ["Most of the 5BR+ supply", "Most first-row homes"],
      zones: [{ lat: 30.2280, lng: -87.9780, r: 2000, tip: "Fort Morgan", dir: "top" }, { lat: 30.2330, lng: -87.8900, r: 2600, tip: "" }],
      why: "Beach houses along the Fort Morgan peninsula between the Gulf and Mobile / Bon Secour Bay, ending at the fort that guards the mouth of Mobile Bay: quieter beaches, bay fishing, and a longer drive to restaurants and Hwy 59.",
      season: "Summer family weeks and spring and fall shoulder trips; quieter than the rest of the coast all year.",
      matters: "A little ahead for its sizes (" + fmtX(f.idx) + " typical), helped by its first-row homes and large houses: it holds " + f.bySize["5BR+"].n + " of the market's " + _lad("5BR+").n + " 5BR+ homes, and its 4BRs lead (" + fmtX(f.bySize["4BR"].idx) + ").",
    },
    {
      id: "gulfshores", name: "Main Gulf Shores: the beach strip by Hwy 59 and the airport", kind: "gulfshores", tags: ["Town centre & events", "Most 1–2BRs"],
      zones: [{ lat: 30.2480, lng: -87.6890, r: 900, tip: "Main Gulf Shores", tipShort: "Gulf Shores", dir: "bottom", off: [0, 8] }, { lat: 30.2430, lng: -87.7400, r: 2400, tip: "" }, { lat: 30.2520, lng: -87.6560, r: 1300, tip: "" }],
      why: "West and East Beach Blvd from Little Lagoon Pass to Gulf State Park: the main public beach by Hwy 59 and The Hangout, restaurants, the Embassy Suites (opened 2025), and Gulf State Park's beach, pier, trails and Lodge. Jack Edwards Airport sits just north of town.",
      season: "Peak summer weeks, spring break and event weekends (NCAA beach volleyball in May, the Shrimp Festival in October, Hangout Fest when it runs), plus spring and fall trips for biking and fishing.",
      matters: "About typical for its sizes (" + fmtX(g.idx) + "), with the most 1–2BRs (" + g.smallShare + "% of its homes) and the strongest 5BR+ homes (" + fmtX(g.bySize["5BR+"].idx) + ").",
    },
    {
      id: "orangebeach", name: "Orange Beach", kind: "orangebeach", tags: ["Back bays & boating", "Mostly off-the-water houses"],
      zones: [{ lat: 30.2780, lng: -87.5900, r: 3600, tip: "Orange Beach", dir: "top" }],
      why: "Perdido Beach Blvd's beach homes and condo towers, Perdido Pass and the back bays (Cotton Bayou, Wolf Bay) for boating and fishing, and The Wharf's shops, restaurants and marina.",
      season: "Summer family and group weeks, spring break, and spring and fall fishing and boating trips.",
      matters: "Behind for its sizes (" + fmtX(o.idx) + " typical): most of its homes in this data sit off the water, and only " + o.bySize["5BR+"].n + " have 5 or more bedrooms.",
    },
    {
      id: "lagoon", name: "Little Lagoon", kind: "lagoon", tags: ["Bay / lagoon / canal"],
      zones: [{ lat: 30.2500, lng: -87.7700, r: 1400, tip: "Little Lagoon", dir: "top", off: [-20, -6] }],
      why: "A calm 10-mile lagoon behind West Beach Blvd: kayaking from Little Lagoon Pass, and fishing for trout, flounder and redfish.",
      season: "Spring through fall paddling and fishing stays.",
      matters: "Bay, lagoon or canal frontage doesn't lift rates: these homes earn " + fmtX(_ls("All sizes", WATER).idx) + " typical for their sizes overall, about the same as homes off the water (" + fmtX(_ls("All sizes", "Off the water").idx) + ").",
    },
  ];
}
// Context markers (lat, lng, label, color).
const DEST_POINTS = [
  [30.2473, -87.6898, "Gulf Shores Public Beach", "#3C6E9E"], [30.248, -87.689, "The Hangout", "#3C6E9E"],
  [30.2488, -87.691, "Embassy Suites (opened 2025)", "#3C6E9E"], [30.2478, -87.6673, "Gulf State Park Pier", "#3C6E9E"],
  [30.2507, -87.6653, "The Lodge at Gulf State Park", "#3C6E9E"], [30.2415, -87.7379, "Little Lagoon Pass Park (kayak launch)", "#D07A1F"],
  [30.2892, -87.6662, "Jack Edwards Airport", "#3C6E9E"], [30.2775, -87.6869, "Hwy 59 bridge (Intracoastal Waterway)", "#3C6E9E"],
  [30.2299, -88.0169, "Fort Morgan State Historic Site", "#7A5C99"],
  [30.2936, -87.6254, "The Wharf", "#C9822B"], [30.2774, -87.5504, "Perdido Pass", "#C9822B"],
];
// Month bands from 2025 monthly taxable lodging revenue (Gulf Shores, Orange
// Beach and Fort Morgan combined; GSOBT DGI summary): Jun and Jul 18% each,
// May 12%, Mar/Apr/Aug/Sep/Oct 6-9%, Jan/Feb/Nov/Dec 2-5%.
const DEST_SEASON = {
  months: ["low", "low", "mid", "mid", "high", "peak", "peak", "mid", "mid", "mid", "low", "low"],
  marks: ["", "Busy, low rates", "Spring break", "School breaks", "Memorial Day", "", "July 4th", "", "Hurricane peak", "Shrimp Fest", "", ""],
  legend: [["peak", "Summer peak"], ["high", "May"], ["mid", "Shoulder months (spring, August, fall)"], ["low", "Winter: the lowest-revenue, lowest-rate months"]],
  caption: "<strong>Two things to price in:</strong> hurricane season (June–November) overlaps the peak, and the summer is short: June and July bring 37% of the year's lodging revenue, November and December 5%. Bands from 2025 monthly taxable lodging revenue for Gulf Shores, Orange Beach and Fort Morgan combined.",
};
const DEST_BRIDGE = [
  ["Along the whole coast, guests come for the beach, and almost every home is close to it.", "Bedroom count does most of the work: underwrite on size first, then on the cluster (Fort Morgan a little ahead, Orange Beach behind)."],
  ["The first row is where the clearest premium shows.", "Worth seeking out for 3–4BRs, where Gulf-front homes earn far more; bay or lagoon frontage adds nothing on its own."],
];
const DEST_SOURCES = [
  { label: "GSOBT DGI summary (monthly lodging revenue)", url: "https://www.gulfshores.com/sites/default/files/2026-09/DGI%20Summary%20-%20September%202026.pdf" },
  { label: "GSOBT (Gulf State Park)", url: "https://www.gulfshores.com/things-to-do/gulf-state-park-alabama/" },
  { label: "GSOBT (Little Lagoon Trail)", url: "https://www.gulfshores.com/little-lagoon-trail/" },
  { label: "GSOBT (Fort Morgan)", url: "https://www.gulfshores.com/things-to-do/fort-morgan/" },
  { label: "The Wharf (Orange Beach)", url: "https://alwharf.com/" },
  { label: "GSOBT (Shrimp Festival)", url: "https://www.gulfshores.com/event-categories/annual-events-and-festivals/shrimp-festival/" },
  { label: "FOX10 (NCAA beach volleyball, May 2026)", url: "https://www.fox10tv.com/2026/05/03/national-championship-sports-gulf-shores-sunday/" },
  { label: "Peachtree Group (Embassy Suites opening)", url: "https://www.peachtreegroup.com/news-insights/embassy-suites-by-hilton-gulf-shores-beach-resort-opens-on-the-alabama-gulf-coast" },
  { label: "Gulf Coast Media (Hangout Fest 2026)", url: "https://gulfcoastmedia.com/stories/hangout-fest-sand-in-my-boots-will-not-return-in-2026,304017" },
];
