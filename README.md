# Gulf Shores, AL — STR Market & Location Analysis

Static site (no build step), same template as the Galveston, Bend, Park City and Charlotte market sites. It covers **Sections 2–5**: Market, Location Analysis by Bedroom Size, Why Location Changes the Rate, and Traveller Demographics, plus an **underwriting map** (`underwritten.html`, linked from the Underwriting section under the hero). **No buy boxes yet.**

## Pipeline

1. `../notebooks/market_common.py` holds the market specifics:
   - workbook `../Gulf Shores - AL - Ifraham (1).xlsx` (snapshot 2026-10-22) → `Cleaned_Data`, kept to entire homes via `Base_Table.roomType` (428 of 428): Gulf Shores ZIP 36542, which includes the Fort Morgan peninsula, and Orange Beach ZIP 36561. The earlier 2026-10-02 workbook (171 homes on the Gulf Shores beach strip only) is in `../archive/`;
   - the three revenue clusters along the coast as the areas: **Fort Morgan** (the far west end), **Gulf Shores** (main Gulf Shores: the beach strip from Little Lagoon Pass to Gulf State Park and the town around Hwy 59 and the airport) and **Orange Beach**. They are Ward clusters (k=3) of the listing coordinates, named from the centroid; they fall at the two gaps in the homes, and Orange Beach is exactly ZIP 36561. They are the location filters on both pages;
   - bedroom buckets 1–2BR / 3BR / 4BR / 5BR+ (1BRs and 2BRs are each measured against their own bedroom count, via the `base` column);
   - position on the water: Gulf-front / Bay, lagoon or canal / Off the water. Gulf-front = within 100 m of the Gulf shoreline, or within 600 m when the title or description says the home is on the Gulf, unless it says "across the street", "skywalk" or similar. The shoreline is the OSM coastline from Fort Morgan to Perdido Pass (`coastline_osm_wide.json`), densified to 20 m, keeping the southern-most points per 100 m east–west slice. Bay / lagoon / canal = backs onto Little Lagoon, a canal, a bayou, the Intracoastal or Mobile / Bon Secour / Wolf / Perdido Bay, or has its own or a community dock or pier on it (phrase rules; place names such as "Jesse's on the Bay" and "Cotton Bayou Beach" don't count; a "Waterfront" title more than 600 m from the Gulf does). The Airbnb waterfront flag is not used on its own. 46 listings were reviewed one by one; their classes and evidence quotes are in `position_overrides.csv`.
2. `python ../notebooks/build_overview_notebook.py`, then `jupyter nbconvert --to notebook --execute --inplace ../notebooks/gulfshores_overview.ipynb`. This writes:
   - `region_stats.json`;
   - the interactive folium map `gulfshores_overview_map.html`.
   The builder is identical across markets.
3. `python scripts/generate_webpage_data.py` writes:
   - `js/region_data.js`;
   - `assets/overview/gulfshores_overview_map.html`;
   - `data/listings.json`.
   Don't hand-edit these files.

## Files

| File | Role |
|---|---|
| `js/data.js` | Market-specific prose and config: hero, market card (researched and fact-checked, with sources), screening-signal rows, location reads, size guide, destination areas, season strip, bridge. Prose that quotes a number computes it from `region_data.js`. |
| `js/location.js`, `js/destination.js`, `js/render.js`, `js/charts.js`, `js/main.js`, `css/styles.css` | Shared, unchanged, across the market sites. |

## Method notes

- **Location is always compared within the same bedroom size.**
  - "vs. typical" = a listing's Revenue Potential ÷ the market median for its size bucket.
  - Cells under 8 homes are muted ("few homes"); under 3 are hidden.
- **Destination-wide figures cover Gulf Shores, Orange Beach and Fort Morgan together**, the same footprint as the data; no Gulf Shores-only series exists.
- **Presentation rules:** plain English, no statistical notation, and conclusions → evidence → what to look for.

## Underwriting (`underwritten.html`, added 2026-10-23)

The same Underwritten Properties page as the Galveston, Island Park, Bozeman and Bend sites; the main page's Underwriting section links to it. There are no Gulf Shores UW sheets yet, so it starts empty: **+ Add listing** puts a Zillow listing on the map to rank its comps, build a comp set and download a UW CSV.

- **Comps:** the main page's 428 entire homes, with its areas (the three revenue clusters), positions on the water and tiers.
- **Location:** a new target takes its area from the nearest listing (right for all 428 in a leave-one-out test) and its distance to the Gulf from `data/shoreline.json` (the main page's shoreline). Its position on the water is Gulf-front within 0.1 km (0.6 km when its notes say beachfront), else bay / lagoon / canal when the notes say so, else off the water; the **Waterfront type** on the card's Property tab overrides it, since an address can't show a bay or canal frontage. **Match by location** keeps to the target's area and position on the water (two toggles), bedrooms ±1, revenue $90k+ (174 homes) and nearest first. The three areas are also the Area filter chips and the colour-by-area legend.
- **New sheets start from `underwriting/template/UW'ing - template (from Island Park 112).csv`:** only the team's financing and tax assumptions carry over; every sheet carries the five standard setup lines and all fifteen OPEX lines at Galveston file 101's amounts (OPEX rounded, $4,850 a month); revenue cases and comps start empty.
- **Pipeline:** `python scripts/build_underwritten.py` (the `str` venv; it calls `../notebooks/market_common.py` `load()`) writes `data/*.json` and runs `node tests/test_underwritten.mjs`. Browser test: `NODE_PATH=<playwright-core node_modules> node tests/test_underwritten_browser.mjs`. Drop "UW'ing - NN.csv" exports into `underwriting/source_csv/` and rebuild to add underwritten targets.
- **View control** (top right of the map): All / Hide bottom 25% / Top 25% only, and toggles for filtered-out dots, area outlines, area names, the Gulf shoreline, rank numbers and the search ring; display only, remembered in the browser (`gulfshoresUW.view`).
