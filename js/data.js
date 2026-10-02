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
 * against the notebook output for the 2026-10-02 snapshot (171 listings),
 * after the verification pass that rebuilt the position classes from each
 * listing's own description (notebooks/position_overrides.csv) and renamed
 * the areas (The Hangout and Hwy 59 sit at the west end of East Beach).
 * With 171 listings many location x size cells are thin; the tables mute
 * anything under 8 homes and the prose says so where it leans on them.
 */
function photo(relPath, alt, caption) {
  return { file: "assets/" + relPath, alt: alt, caption: caption };
}
const MARKET_NAME = "Gulf Shores, AL";
const _ls = (s, l) => LOCATION.locSize[s][l];
const _area = (name) => LOCATION.areas.find((a) => a.name === name);
const _lad = (s) => LOCATION.ladder.find((r) => r.size === s);
const _x = (c) => fmtX(c.idx);
const WEST = "Far West Beach", CENTRAL = "Central Gulf Shores", EAST = "East Beach";

// ---------------------------------------------------------------------------
// Overview (top of page)
// ---------------------------------------------------------------------------
const HERO = {
  title: "In Gulf Shores, size sets the rate; location is the tie-breaker",
  sub: (() => {
    const b = _lad("5BR+"), f = _lad("4BR"), t = LOCATION.top10BySize, total = Object.values(t).reduce((a, c) => a + c, 0);
    const lo = Math.min(...LOCATION.areas.map((a) => a.idx)), hi = Math.max(...LOCATION.areas.map((a) => a.idx));
    return "Nearly every home in this market is a short walk from the beach, so bedroom count does most of the work: a 5BR+ earns about " + fmtK(b.median) + " against " + fmtK(f.median) +
      " for a 4BR, and " + t["5BR+"] + " of the " + total + " Top 10% listings are 5BR+. Size for size, the three stretches of beach earn " + fmtX(lo) + "–" + fmtX(hi) +
      " typical overall (wider at some sizes, such as East Beach 4BRs at " + fmtX(_area(EAST).bySize["4BR"].idx) + "), and the first row on the Gulf pays most clearly, mainly for Far West Beach 3–4BR houses and on few homes. " +
      "This page covers the market, location by bedroom size, why guests choose each part of the beach, and who they are. Buy boxes come next.";
  })(),
};

const FOOTER_NOTE = () =>
  "Preliminary. No property has been underwritten and no buy box has been set. Revenue figures are gross Revenue Potential benchmarks from the market dataset (" +
  MARKET_STATS.n + " entire-home listings in the Gulf Shores ZIP code 36542, <span class=\"nowrap\">" + MARKET_STATS.snapshot + "</span> snapshot), not a full underwriting model. Small sample: read any cell under 8 homes as directional.";

// ---------------------------------------------------------------------------
// Section 2 — Market context (MARKET_OVERVIEW is in the research section below)
// ---------------------------------------------------------------------------
const DISTRIBUTION_NOTE = () => {
  const t = LOCATION.top10BySize;
  const total = Object.values(t).reduce((a, b) => a + b, 0);
  return "Most listings earn under " + fmtK(REVENUE_DISTRIBUTION.p75) + "; the Top 10% starts at " + fmtCurrency(REVENUE_DISTRIBUTION.p90) + ". That tail is almost entirely large homes: " +
    t["5BR+"] + " of the " + total + " Top 10% listings are 5BR+ and the other " + t["4BR"] + " are 4BRs. No home with 3 or fewer bedrooms reaches it.";
};

const LADDER_NOTE = () => {
  const s = _lad("1-2BR"), f = _lad("4BR"), b = _lad("5BR+");
  return "Revenue climbs steadily from 1–2BR (" + fmtK(s.median) + ") to 4BR (" + fmtK(f.median) + "), then roughly doubles at 5BR+ (" + fmtK(b.median) +
    "), where the nightly rate jumps to " + fmtCurrency(b.adr) + ". Occupancy stays near 60% at every size. Because size moves revenue this much, every location comparison below is made within the same size.";
};

const DRIVERS_NOTE =
  "<strong>Screening signals, not proven uplift.</strong> Each row compares listings with and without a feature on two measures: how often they reach the top quarter <em>for their size</em>, and what they earn against a typical home their size (1.00× = typical). With 171 listings, rows with fewer than 15 homes on either side are marked \"few homes\".";

const DRIVER_ROWS = [
  { key: "Gulf-front", label: "Gulf-front (first row)", group: "Location", note: "The strongest location signal, mostly through Far West Beach first-row homes, on few homes." },
  { key: "Lagoon / canal", label: "On Little Lagoon or a canal", group: "Location · frontage or a dock", note: "No premium: these homes earn about the same as homes off the water." },
  { key: "Far West Beach", label: "Far West Beach", group: "Location · area", note: "Slightly ahead of the rest of the strip, partly through its first-row homes." },
  { key: "East Beach", label: "East Beach", group: "Location · area", note: "Slightly behind the rest of the strip." },
  { key: "Condo (vs. house)", label: "Condo rather than a house", group: "Product", note: "No real difference once size is held fixed." },
  { key: "pool_heater", label: "Heated pool", group: "Amenity", note: "A signal; a heated pool can extend the swim season into spring and fall." },
  { key: "pool", label: "Pool", group: "Amenity", note: "Expected: three in four homes have one; those without lag at 1–3BR, not at 4BR." },
  { key: "hot_tub", label: "Hot tub", group: "Amenity", note: "Only 23 homes have one; they reach the top quarter more than twice as often, but the lift is at 1–2BR; little difference at 4BR." },
  { key: "fire_pit", label: "Fire pit", group: "Amenity", note: "A signal, mostly among 3–4BRs (few homes at each size)." },
  { key: "game_room", label: "Game room", group: "Amenity", note: "Only 17 homes have one; a signal among 3–4BRs, on few homes." },
  { key: "Superhost", label: "Superhost", group: "Operations", note: "Same typical revenue for size, but only 1 of the 15 non-Superhosts reaches the top quarter (a small group)." },
];

// ---------------------------------------------------------------------------
// Section 3 — Location by bedroom size
// ---------------------------------------------------------------------------
const MAP_CONFIG = {
  lede:
    "Bedroom count sets the baseline; location can nudge a home above or below it. Every comparison here is within the same size: <strong>1.00× = what a typical Gulf Shores home that size earns</strong> (1BRs and 2BRs are each measured against their own bedroom count). The market is a narrow beach strip, so the location question is <strong>where the home sits on the water</strong> (first row on the Gulf, on Little Lagoon or a canal, or neither; classified from each listing's own title and description, with borderline listings reviewed one by one) and <strong>which stretch of beach</strong> it is on (Far West Beach, Central, East Beach).",
  marketInterpretation:
    "In the bottom-left panel (tap “show” on a phone), <strong>untick all but one bedroom size</strong> to see where that size earns. Green = top quarter for its size, gold = middle half, grey = bottom quarter; bigger dots = more bedrooms. Click an area outline for its numbers by size. The three areas are clusters of listing coordinates, used as reference geography only. Airbnb shows approximate locations, and a whole complex often shares one dot.",
};

const LOC_READS = {
  "1-2BR": "Location barely matters at this size: first-row homes (few) and lagoon homes earn a little above typical.",
  "3BR": "The first row pays, on just a few homes (two are halves of one duplex); off the first row, position and stretch barely matter.",
  "4BR": "The biggest first-row premium in the data, on very few homes, mostly in Far West Beach. Off the first row, 4BRs earn about typical.",
  "5BR+": (() => {
    const g = _ls("5BR+", "Gulf-front"), o = _ls("5BR+", "Off the water");
    return "No clear position premium: Gulf-front 5BR+ earn a little more (" + fmtK(g.median) + " vs " + fmtK(o.median) + " off the water), on few homes.";
  })(),
  "All sizes": "The × figures are size-adjusted; the dollar figures are not, and partly reflect bigger homes on the Gulf.",
};

const AREA_GRID_NOTE = () => {
  const w = _area(WEST), c = _area(CENTRAL), e = _area(EAST);
  return "<strong>Overall, the stretches of beach earn within about 10% of each other</strong> (wider at some sizes, such as East Beach 4BRs at " + fmtX(e.bySize["4BR"].idx) + "): Far West Beach " + fmtX(w.idx) + " typical for its sizes, Central " + fmtX(c.idx) + ", East Beach " + fmtX(e.idx) +
    ". The bigger difference is the mix: East Beach is " + e.smallShare + "% 1–2BRs, while Far West Beach holds " + w.bySize["5BR+"].n + " of the market's " + _lad("5BR+").n + " 5BR+ homes. Many Central homes also advertise themselves as West Beach; the areas here follow the map outlines. Figures in grey, tagged \"few homes\", rest on fewer than 8 homes.";
};

const SIZE_GUIDE = {
  "1-2BR": {
    head: "Anywhere on the strip; position barely matters at this size.",
    look: "Central Gulf Shores (the east end of West Beach Blvd), the strongest stretch for this size, led by its high-rise condos, or Far West Beach. A second bedroom matters more than position.",
    avoid: "One-bedrooms that sleep only a few: a 2BR earns far more wherever it sits.",
    proof: () => "First row " + fmtK(_ls("1-2BR", "Gulf-front").median) + " (" + _ls("1-2BR", "Gulf-front").n + " homes) · lagoon / canal " + fmtK(_ls("1-2BR", "Lagoon / canal").median) + " · off the water " + fmtK(_ls("1-2BR", "Off the water").median),
  },
  "3BR": {
    head: "The first row if you can find it; off the first row, location barely matters.",
    look: "Gulf-front first (few homes); otherwise any stretch, where 3BRs off the first row earn about typical.",
    avoid: "Paying a premium for lagoon frontage at this size.",
    proof: () => "Gulf-front " + fmtK(_ls("3BR", "Gulf-front").median) + " (" + _ls("3BR", "Gulf-front").n + " homes, two of them one duplex) · lagoon / canal " + fmtK(_ls("3BR", "Lagoon / canal").median) + " · off the water " + fmtK(_ls("3BR", "Off the water").median),
  },
  "4BR": {
    head: "The first row is the lever; East Beach is the weak spot.",
    look: "Gulf-front 4BRs, rare and far ahead (mostly in Far West Beach); otherwise Far West Beach or Central, where 4BRs earn about typical.",
    avoid: "East Beach 4BRs, which earn below typical for their size.",
    proof: () => "Gulf-front " + fmtK(_ls("4BR", "Gulf-front").median) + " (" + _ls("4BR", "Gulf-front").n + " homes) · lagoon / canal " + fmtK(_ls("4BR", "Lagoon / canal").median) + " · off the water " + fmtK(_ls("4BR", "Off the water").median) + " · East Beach " + fmtK(areaCellOf(EAST, "4BR").median),
  },
  "5BR+": {
    head: "Size does the work; position adds little.",
    look: "Large homes anywhere on the strip. Far West Beach has the most of them.",
    avoid: (() => {
      const g = _ls("5BR+", "Gulf-front"), o = _ls("5BR+", "Off the water");
      return "Paying much extra for a position: Gulf-front 5BR+ earn only about " + Math.round((g.median / o.median - 1) * 100) + "% more than those off the water, on few homes.";
    })(),
    proof: () => "Gulf-front " + fmtK(_ls("5BR+", "Gulf-front").median) + " (" + _ls("5BR+", "Gulf-front").n + " homes) · off the water " + fmtK(_ls("5BR+", "Off the water").median) + " (" + _ls("5BR+", "Off the water").n + ")",
  },
};

// ---------------------------------------------------------------------------
// Section 5 — Demographics (area comparisons within the same size)
// ---------------------------------------------------------------------------
const DEMOGRAPHICS_NOTE = () => {
  const b = DEMOGRAPHICS.byBedroom, small = b.find((r) => r.label === "1-2BR"), big = b.find((r) => r.label === "5BR+");
  const A = DEMOGRAPHICS.byAreaSize, w = A[WEST], e = A[EAST], r = (v) => Math.round(v);
  return "These are review-derived signals, not verified demographics. Gulf Shores is a family market: on the average listing, " + r(DEMOGRAPHICS.marketWide.kids) + "% of reviews come from stays with kids and " +
    r(DEMOGRAPHICS.marketWide.group) + "% from group trips. Group trips climb with size, from " + r(small.group) + "% at 1–2BR to " + r(big.group) + "% at 5BR+, and stays not tagged as family, group or pet trips (the \"Other\" share) are the largest group at 1–2BR (" +
    r(small.other) + "%). Compared size for size, Far West Beach 3–4BRs draw more families than East Beach ones (" + r(w["3BR"].kids) + "% vs " + r(e["3BR"].kids) + "% kids at 3BR, " + r(w["4BR"].kids) + "% vs " + r(e["4BR"].kids) +
    "% at 4BR; small samples), while at 1–2BR the two stretches look alike.";
};

// ---------------------------------------------------------------------------
// Section 2 — Market context. Researched 2026-10-02 and fact-checked against
// the sources: Gulf Shores & Orange Beach Tourism (2025 annual report, Tourism
// Summit release, DGI monthly summary, Key Data vacation-rental trend chart,
// accommodations inventory), City of Gulf Shores, NWS Mobile, Outdoor
// Alabama and local news. Destination-wide figures cover Gulf Shores, Orange
// Beach and Fort Morgan together; no Gulf Shores-only series is published.
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
    { label: "16% Lodging Tax in City Limits" },
  ],
  attractions: [
    "<strong>The beach</strong>: part of the Alabama Gulf Coast's 32 miles of white sand, with the main public beach at Gulf Place, by Hwy 59 and The Hangout.",
    "<strong>Gulf State Park</strong>: 6,150 acres with 3.5 miles of beach, the 1,540-ft fishing pier (reopened in 2024 after Hurricane Sally repairs), the 32-plus-mile paved Backcountry Trail and the 350-room Lodge.",
    "<strong>Little Lagoon</strong>: a calm 10-mile lagoon behind West Beach for kayaking and fishing (trout, flounder, redfish).",
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
    "📋 <strong>Zoning decides where you can rent.</strong> City zoning (§6-18, last amended by Ord. 2201 in February 2026) allows licensed vacation rentals only in the vacation-rental overlay, the business, tourist-business and Intracoastal Waterway districts, and designated multi-family developments. They are barred in the R-1 to R-5 residential zones outside the overlay, apart from grandfathered units and some R-3/R-4 condos approved by permit.",
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
const DEST_LEDE = "Why guests choose each stretch of the Gulf Shores beach, and why size matters more than which stretch. Click an area.";
const DEST_RESEARCHED = "2026-10-02";
const DEST_KIND = {
  centre: ["Town centre, events & state park", "#2E7D6B"],
  mid: ["Between the lagoon pass and the town centre", "#C0473F"],
  west: ["Far West Beach", "#3C6E9E"],
  lagoon: ["Lagoon", "#D07A1F"],
};
function DEST_AREAS() {
  const w = _area(WEST), c = _area(CENTRAL), e = _area(EAST);
  return [
    {
      id: "east", name: "East Beach: from The Hangout to Gulf State Park", kind: "centre", tags: ["Town centre & events", "Most 1–2BRs of any stretch"],
      zones: [{ lat: 30.2480, lng: -87.6890, r: 650, tip: "Hwy 59 & The Hangout", tipShort: "Hangout", dir: "top" }, { lat: 30.2505, lng: -87.6800, r: 800, tip: "East Beach", dir: "bottom", off: [0, 26] }, { lat: 30.2520, lng: -87.6560, r: 1500, tip: "Gulf State Park", tipShort: "State park", dir: "bottom" }],
      why: "The main public beach at Gulf Place and Hwy 59, The Hangout, the Embassy Suites (opened 2025) and restaurants; east of them, Gulf State Park's 3.5 miles of beach, the fishing pier, the Backcountry Trail and the Lodge.",
      season: "Peak summer weeks, spring break and event weekends (NCAA beach volleyball in May, the Shrimp Festival in October, Hangout Fest when it runs), plus spring and fall trips for biking and fishing.",
      matters: "Being next to the town centre doesn't lift rates: East Beach earns slightly below typical for its sizes (" + fmtX(e.idx) + "), nearly half its homes are 1–2BRs (" + e.smallShare + "%), and 4BRs are its weak spot (" + fmtX(e.bySize["4BR"].idx) + ").",
    },
    {
      id: "central", name: "Central Gulf Shores (east end of West Beach Blvd)", kind: "mid", tags: ["Strongest stretch for 1–2BR"],
      zones: [{ lat: 30.2456, lng: -87.7095, r: 1400, tip: "Central", dir: "left" }],
      why: "Beach homes and high-rise condos along the east end of West Beach Blvd, a short walk or bike ride west of the public beach and The Hangout.",
      season: "Summer family weeks, spring break and spring and fall shoulder trips.",
      matters: "About typical for its sizes (" + fmtX(c.idx) + "); the strongest stretch for 1–2BRs (" + fmtX(c.bySize["1-2BR"].idx) + "), with few large homes (" + c.bySize["5BR+"].n + " of the market's " + _lad("5BR+").n + " 5BR+).",
    },
    {
      id: "west", name: "Far West Beach", kind: "west", tags: ["Most of the 5BR+ supply", "Strongest first-row homes"],
      zones: [{ lat: 30.2405, lng: -87.7505, r: 2300, tip: "Far West Beach", tipShort: "Far West", dir: "bottom", off: [0, 10] }],
      why: "Beach homes and condos on the narrow strip between the Gulf and Little Lagoon: quieter than the centre and still a short drive from Hwy 59.",
      season: "Summer family weeks and spring and fall shoulder trips.",
      matters: "Slightly ahead of the rest of the strip (" + fmtX(w.idx) + " typical for its sizes), partly through its first-row homes: its 3BRs lead (" + fmtX(w.bySize["3BR"].idx) + ") only because of two Gulf-front duplex halves. It holds " + w.bySize["5BR+"].n + " of the market's " + _lad("5BR+").n + " 5BR+ homes.",
    },
    {
      id: "lagoon", name: "Little Lagoon", kind: "lagoon", tags: ["Lagoon / canal"],
      zones: [{ lat: 30.2485, lng: -87.7700, r: 1600, tip: "Little Lagoon", dir: "top" }],
      why: "A calm 10-mile lagoon behind West Beach Blvd: kayaking from Little Lagoon Pass, and fishing for trout, flounder and redfish.",
      season: "Spring through fall paddling and fishing stays.",
      matters: "Lagoon or canal frontage neither helps nor hurts: these homes earn " + fmtX(_ls("All sizes", "Lagoon / canal").idx) + " typical for their sizes overall, about the same as homes off the water (" + fmtX(_ls("All sizes", "Off the water").idx) + ").",
    },
  ];
}
// Context markers (lat, lng, label, color).
const DEST_POINTS = [
  [30.2473, -87.6898, "Gulf Shores Public Beach", "#2E7D6B"], [30.248, -87.689, "The Hangout", "#2E7D6B"], [30.2469, -87.6931, "Gulf Place", "#2E7D6B"],
  [30.2488, -87.691, "Embassy Suites (opened 2025)", "#2E7D6B"], [30.2478, -87.6673, "Gulf State Park Pier", "#2E7D6B"],
  [30.2507, -87.6653, "The Lodge at Gulf State Park", "#2E7D6B"], [30.2415, -87.7379, "Little Lagoon Pass Park (kayak launch)", "#D07A1F"],
  [30.2588, -87.6862, "Waterville USA", "#3C6E9E"], [30.2775, -87.6869, "Hwy 59 bridge (Intracoastal Waterway)", "#3C6E9E"],
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
  ["Along the whole strip, guests come for the beach, and almost every home is a short walk from it.", "Bedroom count does most of the work: underwrite on size, not on a particular stretch of beach."],
  ["The first row is where the clearest premium shows, mostly in Far West Beach.", "Worth seeking out for 3–4BRs, though it rests on very few homes; lagoon frontage adds nothing on its own."],
];
const DEST_SOURCES = [
  { label: "GSOBT DGI summary (monthly lodging revenue)", url: "https://www.gulfshores.com/sites/default/files/2026-09/DGI%20Summary%20-%20September%202026.pdf" },
  { label: "GSOBT (Gulf State Park)", url: "https://www.gulfshores.com/things-to-do/gulf-state-park-alabama/" },
  { label: "GSOBT (Little Lagoon Trail)", url: "https://www.gulfshores.com/little-lagoon-trail/" },
  { label: "GSOBT (Shrimp Festival)", url: "https://www.gulfshores.com/event-categories/annual-events-and-festivals/shrimp-festival/" },
  { label: "FOX10 (NCAA beach volleyball, May 2026)", url: "https://www.fox10tv.com/2026/05/03/national-championship-sports-gulf-shores-sunday/" },
  { label: "Peachtree Group (Embassy Suites opening)", url: "https://www.peachtreegroup.com/news-insights/embassy-suites-by-hilton-gulf-shores-beach-resort-opens-on-the-alabama-gulf-coast" },
  { label: "Gulf Coast Media (Hangout Fest 2026)", url: "https://gulfcoastmedia.com/stories/hangout-fest-sand-in-my-boots-will-not-return-in-2026,304017" },
];
