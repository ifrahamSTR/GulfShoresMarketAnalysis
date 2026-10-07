# Gulf Shores, AL — STR Market & Location Analysis

Static site (no build step), same template as the Galveston, Bend, Park City and Charlotte market sites. It covers **Sections 2–5 only**: Market, Location Analysis by Bedroom Size, Why Location Changes the Rate, and Traveller Demographics. **No buy boxes yet.**

## Pipeline

1. `../notebooks/market_common.py` holds the market specifics:
   - workbook `../Gulf Shores - AL.xlsx` (supplied as `Gulf Shores - AL - Ifraham.xlsx`, snapshot 2026-10-02) → `Cleaned_Data`, kept to entire homes via `Base_Table.roomType` (171 of 171);
   - 3 Ward-clustered reference areas along the beach (Far West Beach, Central Gulf Shores at the east end of West Beach Blvd, and East Beach from The Hangout to Gulf State Park), named from centroids and checked against where listings sit;
   - bedroom buckets 1–2BR / 3BR / 4BR / 5BR+ (1BRs and 2BRs are each measured against their own bedroom count, via the `base` column);
   - position on the water: Gulf-front / Lagoon or canal / Off the water. Gulf-front = within 100 m of the Gulf shoreline, or within 600 m when the title or description says the home is on the Gulf, unless it says "across the street", "skywalk" or similar. The shoreline is the OSM coastline (`gulfshores_coastline_osm.json`), densified to 20 m, keeping the southern-most points per 100 m east–west slice. Lagoon / canal = backs onto Little Lagoon or a canal, or has its own or a community dock or pier on it (phrase rules; the Airbnb waterfront flag is not used on its own). 46 listings were reviewed one by one; their classes and evidence quotes are in `position_overrides.csv`.
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
  - With only 171 listings, cells under 8 homes are muted ("few homes"); under 3 are hidden.
- **Destination-wide figures cover more than Gulf Shores.** Visitors, lodging revenue and occupancy are published for Gulf Shores, Orange Beach and Fort Morgan together; no Gulf Shores-only series exists.
- **Presentation rules:** plain English, no statistical notation, and conclusions → evidence → what to look for.
