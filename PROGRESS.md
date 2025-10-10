# Project Progress

## Status Summary (auto-updated manually during work)

- Branch: healthcare-desert-pivot
- Last Update: 2025-10-10 06:56:11

## Milestones
- [x] Create pivot branch and clean repo
- [x] Scaffold notebooks and Python pipeline stubs
- [x] Implement ACS fetch utility and GeoJSON exporter
- [ ] Collect IGS data (tract-level) for MS/AL
- [ ] Download healthcare facilities (CMS/HRSA) and tract boundaries
- [ ] Compute accessibility metrics (nearest facility distance/drive-time)
- [ ] Build Health Desert Index and baseline model
- [ ] Prepare final GeoJSON and wire React Mapbox choropleth

## Data Inventory
- ACS (2023): acs_ms_al_2023.csv — status: real data (via API)
- IGS: igs_ms_al.csv — status: MISSING (needs portal download)
- Facilities: facilities_ms_al.geojson — status: MISSING (use CMS/HRSA)
- Tract boundaries: tracts_ms_al.geojson — status: MISSING (Census TIGER/Line)

## Mock vs Real
- React map data: will point to processed GeoJSON — status: MOCK pending real export
- Accessibility metrics: placeholder functions — status: MOCK until OSRM/matrix added

## Risks / Blockers
- IGS portal access required
- Facility datasets may need cleaning/geocoding

## Next Actions
- Fetch CMS hospitals and HRSA health centers for MS/AL
- Download tract boundaries and create centroids
- Compute nearest facility distance and save draft GeoJSON

