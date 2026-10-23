/**
 * Location rules for underwritten.html (Gulf Shores & Orange Beach, AL), the
 * same as the Python pipeline (../notebooks/market_common.py and
 * scripts/build_underwritten.py):
 *  - distance to the Gulf: nearest point of data/shoreline.json, measured on
 *    market_common's local km projection;
 *  - area: the nearest Airbnb listing's (one of the three revenue clusters:
 *    Fort Morgan, Gulf Shores, Orange Beach; checked leave-one-out by the
 *    build); the "zone" Match by location keeps to is the area;
 *  - position on the water: Gulf-front within 0.1 km of the shoreline (0.6 km
 *    when the notes say beachfront), else bay / lagoon / canal when the notes
 *    say so, else off the water. A waterfront type set on the card wins;
 *  - Zillow address from the URL slug.
 * Runs in the browser (window.UWGeo) and in Node; tests/test_underwritten.mjs checks it
 * against the build on every point of tests/fixtures/place_check.json.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.UWGeo = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const COS = Math.cos((30.24 * Math.PI) / 180);
  const xy = (lat, lng) => [(lng + 87.7) * 111 * COS, (lat - 30.24) * 111];  // market_common._xy
  const SAYS_FRONT = /beachfront|beach front|oceanfront|ocean front|gulf[- ]?front|on the beach|on the sand/;
  const SAYS_WATER = /lagoon|canal|bayou|bay ?front|on the bay|intracoastal|boat slip|private (?:dock|pier)|\bdock\b|waterfront/;
  const WATER = "Bay / lagoon / canal";
  const CITIES = ["Gulf Shores", "Orange Beach", "Fort Morgan", "Foley", "Bon Secour", "Elberta", "Lillian", "Perdido Key"];
  // The waterfront types a card can set, and the position each one means.
  const WATERFRONT_LOC = { "Gulf-front": "Gulf-front", "Bay-lagoon-canal": WATER, None: "Off the water" };

  let shore = null, pts = null;
  function init(shoreline, listings) {
    shore = shoreline.points.map((p) => xy(p[0], p[1]));
    pts = listings.map((l) => ({ xy: xy(l.lat, l.lng), area: l.area }));
  }

  function beachKm(lat, lng) {
    const [x, y] = xy(lat, lng);
    let best = Infinity;
    for (let i = 0; i < shore.length; i++) {
      const dx = shore[i][0] - x, dy = shore[i][1] - y, d = dx * dx + dy * dy;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }

  function areaOf(lat, lng) {
    const [x, y] = xy(lat, lng);
    let best = null, bestD = Infinity;
    pts.forEach((p) => {
      const d = (p.xy[0] - x) ** 2 + (p.xy[1] - y) ** 2;
      if (d < bestD) { bestD = d; best = p.area; }
    });
    return best;
  }

  /** waterfront: "Gulf-front" | "Bay-lagoon-canal" | "None" | null (null = from the distance and the notes text). */
  function classify(lat, lng, notesText, waterfront) {
    const km = beachKm(lat, lng), area = areaOf(lat, lng);
    const t = String(notesText || "").toLowerCase();
    const auto = km <= 0.1 || (SAYS_FRONT.test(t) && km <= 0.6) ? "Gulf-front" : SAYS_WATER.test(t) ? WATER : "Off the water";
    const loc = waterfront && WATERFRONT_LOC[waterfront] ? WATERFRONT_LOC[waterfront] : auto;
    return { beachKm: Math.round(km * 1000) / 1000, area, town: false, zone: area, loc,
      waterfrontDefault: { "Gulf-front": "Gulf-front", [WATER]: "Bay-lagoon-canal" }[auto] || "None" };
  }

  // Great-circle miles, for the nearest-comp list.
  function miles(lat1, lng1, lat2, lng2) {
    const R = 3958.8, rad = Math.PI / 180;
    const a = Math.sin(((lat2 - lat1) * rad) / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function zillowAddress(url) {
    let path = "";
    try { path = new URL(url).pathname; } catch (e) { return null; }
    const m = path.match(/\/homedetails\/([^/]+)\/(\d+)_zpid/);
    if (!m) return null;
    let tok = m[1].split("-");
    let state = "AL", zip = null;
    if (tok.length >= 4 && /^[A-Z]{2}$/.test(tok[tok.length - 2]) && /^\d{5}$/.test(tok[tok.length - 1])) {
      state = tok[tok.length - 2]; zip = tok[tok.length - 1]; tok = tok.slice(0, -2);
    }
    let city = null;
    for (const c of CITIES) {
      const ct = c.split(" ");
      if (tok.slice(-ct.length).map((t) => t.toLowerCase()).join(" ") === c.toLowerCase()) { city = c; tok = tok.slice(0, -ct.length); break; }
    }
    if (!city && tok.length > 1) { city = tok[tok.length - 1]; tok = tok.slice(0, -1); }
    const st = [];
    tok.forEach((t) => { if (st.length && t === "2" && st[st.length - 1] === "1") st[st.length - 1] = "1/2"; else st.push(t); });
    const street = st.join(" ");
    return { zpid: m[2], street, city, state, zip, address: street + ", " + city + ", " + state + (zip ? " " + zip : "") };
  }

  function zillowKey(url) {
    try {
      const u = new URL(url);
      return (u.host.replace(/^www\./, "") + u.pathname.replace(/\/+$/, "")).toLowerCase();
    } catch (e) { return null; }
  }

  return { xy, init, beachKm, areaOf, classify, miles, zillowAddress, zillowKey, WATERFRONT_LOC };
});
