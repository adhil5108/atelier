# Atelier studio walkthrough

A React, Vite and Three.js application with real architectural geometry and the twelve original studio photographs as complete designed wall faces. No artwork is generated. A few restrained physical pieces (`src/furnishingsData.js`) give the space depth: a timber portrait bench by the terracotta set, a softbox stand beside the sweep aimed at the set, and a makeup vanity counter, wall mirror and stool in the makeup recess. None stands in front of a photograph showing the same kind of piece, and none blocks a tour camera's view of its photograph.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

`npm run preview` serves the production build. On PowerShell systems that disable npm's script shim, use `npm.cmd` instead. No backend, API keys or paid services are required. If an old browser tab still shows the procedural scene, hard-refresh it with Ctrl+Shift+R; the live tab was found holding that old scene during verification.

## Reference authority and scope

- **`public/references/first floor plan.jpeg`** supplies the real building arrangement and approximate overall scale. Its four-by-three shop grid is not a set of required studio partitions. The labeled **120 cm verandah and 120 cm parapet**, stair flights, toilet block and central access are retained as building context.
- **`public/references/actual-floor-plan.png`** identifies the selected **Room 1** area and its two lower-right steps. Room 1 remains the walkable studio and guided-tour area. Room 2 is modeled alongside it, without placing studio sets inside it.
- **`public/references/canva placement.png`** is the user-supplied **modified placement plan**, a 582 × 582 image replacing the previous hyphenated export. This guides photo assignments only; the original building plan remains the boundary authority. It requires a clockwise quarter-turn to match the building drawing. Its visible structural grid and stepped Room 2 boundary are used for registration; the screenshot edges clip part of the building width and must not be stretched to the outer footprint. All twelve thumbnail centres have been re-registered against this file.

As explicitly clarified by the user, the collage's thumbnails are **placement references, not intended image or room measurements**. Display widths are chosen to fit the building and preserve open circulation. Door alignment, ceiling height, thicknesses, stair risers and unmeasured dimensions remain approximate. No survey accuracy is claimed.

## Every photo and its zone

All twelve original interior JPEGs and both original plan files are present. No reference image is missing. The common filename prefix below is `WhatsApp Image 2026-10-25 at ` and the extension is `.jpeg`; files are in `public/references/`.

| Filename suffix | Canva-aligned location | Original visual content |
| --- | --- | --- |
| `7.26.04 PM` | Front-left reception | Lounge, entrance, floral arch and wall decoration |
| `7.26.04 PM (1)` | Front photography-studio area beside reception | Sweep, rolls, softboxes and lighting |
| `7.26.04 PM (2)` | Inner Room 1 passage before Room 2, facing into the studio | Makeup walkway, shelving, doors and vanity |
| `7.26.04 PM (3)` | Right side near the upper Room 2 step | Ivory fireplace, mouldings, window and chandelier |
| `7.26.05 PM` | Back-right corner, next to the bench reference | Olive curtains, mirror, plants and stool |
| `7.26.06 PM` | Back-right | Bench, sheer curtains, baskets and pampas |
| `7.26.06 PM (1)` | Back-middle | Terracotta set, linen sofa, cushions and pendant |
| `7.26.06 PM (2)` | Back-left of centre | Original crimson backdrop and folds |
| `7.26.07 PM` | Back-left corner | Cane seating, arches, table and greenery |
| `7.26.07 PM (1)` | Left wall near the cane seating | Console, stools and brown curtains |
| `7.26.08 PM` | Middle-left | Curved ivory sofa and daylight window |
| `7.26.08 PM (1)` | Existing left wall beside the sofa, explicitly confirmed by the user | Cane swing and window arrangement |

Each original is used once in the 3D scene, with its complete UV area and original image scale. No artwork or furniture is generated, repeated to conceal gaps, cropped or recolored. Reception and Room 04 each map one complete photograph across two adjoining wall faces, using equal scale on both faces. Original baked lighting is retained with untone-mapped photo materials.

The original floor plan supplies the physical boundaries; its dashed shop grid is not a set of solid partitions. The unsupported central swing wall (formerly 3.9 m wide) has been removed. The user explicitly confirmed moving the swing photograph onto the existing left perimeter wall beside the sofa. Its viewpoint, guided-tour target and map marker follow that location.

The photo-wall generator has been deleted, including backing walls, infill strips, join boxes, projecting end caps and photo-specific colliders. Photos now sit 2 mm ahead of existing masonry to prevent depth flicker; they create no second wall. Uncovered intervals retain that same wall's finish. The redundant makeup-recess right return has been removed because the Room 2 boundary already supplies that side, and the left/rear join no longer overlaps. Duplicate toilet boundaries are removed: the first cubicle reuses the Room 1 wall, and its shared divider is emitted once.

The main finished ceiling remains 3 m, with the existing 2.8 m entry, approximately 2.92 m sofa and 2.88 m makeup soffits. These are visualization fits, not surveyed heights. The complete swing photo fits its available existing wall at approximately 2.84 by 2.18 m, floor-aligned. Its upper area remains painted rather than enlarging the physical wall or cropping the image. Other valid photo assignments, the floor, ceiling and lighting remain unchanged.

Reception wraps onto the front-left exterior wall. Cane seating and console meet at the rear-left corner; bench and olive curtains meet at the rear-right. Room 04 retains its glazed door return on the right exterior wall. The sofa and swing now occupy adjacent stretches of the same left perimeter wall.

### Intentionally plain finished surfaces

These areas have no corresponding supplied wall photograph, so they retain plain finishes rather than duplicated artwork:

- Structural columns, door reveals, narrow wall joints, skirting and ceilings.
- The existing wall above the fitted swing photo and small circulation intervals beside reception, finished in muted green.
- The short exterior-wall interval between the olive-curtain corner and Room 04's glazed door, including its structural column, finished warm ivory.
- The stepped Room 2 boundary and makeup-recess side/rear faces, finished in a restrained tone from the makeup reference.
- Room 2, stair/toilet and verandah context, which remain outside the Room 1 studio tour.

These are intentional undecorated architecture, not missing photo assets. The source photographs also contain their own white columns and mouldings; those original pixels remain intact. No supplied reference defines unseen walls or the inside of the photographed closed doors.

### Room 04 exterior door return

The arched glazed door belongs to the left side of `WhatsApp Image 2026-10-25 at 7.26.04 PM (3).jpeg`, the ivory-salon reference. Its door portion now covers the formerly blank exterior wall adjoining the fireplace wall. One original texture spans both faces, with a continuous UV seam at the approximate photographed corner (22% of image width). No pixels are discarded or duplicated, and both faces use identical image scale. The door return meets the floor and 3 m ceiling; its collision and minimap line follow the same corner. The shared main bay remains 3 m by 3 m. Room 04's camera/tour destination, the actual building entrance and makeup passage remain unchanged. This is the photographed glazed door, not a newly opened passage through the exterior shell.

The corner seam is a visual interpretation of the photo, not a measured door width. Original perspective remains baked into the image. The affected corner was rendered and inspected from the tour camera, a door-facing view and two oblique approaches; `.qa/ivory-door-corner.png` records that review.

### Makeup entrance: plan interpretation and limits

The local plan assets are `first floor plan.jpeg`, `actual-floor-plan.png` and the newly supplied **`canva placement.png`**. The user explicitly identified the last file as the different modified plan. After aligning its grid and stepped boundary with the building drawing, the makeup thumbnail joins the front reception/studio group, on the Room 1 side immediately before Room 2. This supports the current inward-facing approach, rather than a sideways mounting on the east/Room 2 wall. The user's explicit instruction that this is an **inner entrance** fixes which side is approached.

The modified thumbnail lies close to the front edge. Because thumbnail sizes and centres are illustrative, the modeled recess remains inset to preserve the physical building entrance and its clear route to reception. The new plan therefore confirms the existing corrected orientation and zone; it does not justify relocating the entrance onto the outside wall or narrowing the entry gallery. Its source link and all placement metadata now use the replacement file, not the unavailable old export.

`MAKEUP_ENTRANCE` in `src/layout.js` supplies the opening, recess walls, photo plane, camera/tour target and minimap position. The opening now faces toward the main Room 1 interior (negative Z). A short, walkable recess leads to the complete original photograph of the closed makeup-room door. The existing Room 2 boundary supplies the right side of the recess; only its left and rear walls are generated. It remains closed to Room 2. The old sideways bay, redundant right return and photo-specific colliders are removed.

The drawings do **not** provide a door-swing symbol, measured makeup-room perimeter, precise opening width or recess depth. The approximately **2.4 m-wide approach and 1 m recess** are visualization allowances for the full corridor photograph, not claimed door-leaf dimensions. The source photo remains a closed-door visual endpoint; no unseen makeup-room interior or operating door is invented. The physical building entrance remains at the same location. Reset starts just past its left turn, looking into the open studio rather than at the recess's rear wall.

## Architecture and navigation

- Room 1 has a continuous stepped tiled floor, ceiling, cream perimeter walls and open entrance. A clipped tile-joint grid, skirting, shallow ceiling coves, recessed light fittings and shared warm fill lights give the shell a consistent finish. No extra enclosed rooms or maze of partitions have been introduced.
- Solid plan marks supply the structural columns. Architectural collision barriers total **18**: nine Room 1 boundaries, seven columns and two retained makeup-recess walls. Each physical furnishing adds its own footprint (four more). The center is open; photo placements cannot create invisible barriers.
- The minimap reads shared wall and photo coordinates. Thin photo strokes identify finishes rather than additional thick partitions. The swing waypoint is updated to the confirmed left-wall location; other camera destinations and controls are retained. All original pixels and aspect ratios remain intact.
- Room 2, the three verandah strips, parapets, L-shaped stair flights and three toilet cubicles are real context geometry. Cubicles have openings. These surroundings are also drawn in the existing mini map and enlarged floor plan. They are not additional studio destinations.
- The building drawing's lower central access is used for the entry. Exact studio-door alignment is not dimensioned by the collage and remains an assumption. The entrance/reset camera looks into the open studio; the Reception shortcut uses a separate viewpoint facing its correctly placed photograph. Both are deliberately kept away from panels.
- WASD / arrow keys walk; Shift walks faster. Drag to look, or select **Step inside** for pointer-lock mouse-look. Escape releases the mouse. Touch arrows remain available on touch devices.
- **R / Reset view** returns to the entry gallery. Sidebar and mini-map selections visit the corresponding photo viewpoints. The guided tour follows the same collision boundaries and reserves a 0.5 m routing radius around columns and reveal edges; manual movement retains its existing body radius. Pause/resume, previous/next and end controls are retained. Manual walking ends the tour, and switching tabs pauses it.
- Floor-plan, inspiration, settings, quality, lighting and full-screen controls retain the existing UI. The floor-plan dialog links to both plans and the inspected Canva export.

The main room's dimensions are derived approximately from the first-floor bay labels; the highlighted screenshot's small area labels are not used to claim a measured area. The supplied building image is cropped at the bottom, so the visible stair geometry and vertical rise are approximate; unseen continuation is not invented. All walking and tour movement stays within Room 1, as requested.

### Dimensions and assumptions

| Item | Evidence / implementation |
| --- | --- |
| Shop bay grid | Drawing labels say **330 × 390 cm**; four by three bays give the existing approximate **13.2 × 11.7 m** envelope before resolving construction thicknesses. |
| Verandah / parapet | Both explicitly labeled **120 cm**, retained as 1.2 m width / height. |
| Toilet cubicles | Labeled **160 × 110 cm** and **110 × 110 cm** footprints retained in surrounding context. |
| Room 1 steps | Traced from the selected-room screenshot; step coordinates are approximate, not dimensioned survey points. |
| Columns | Grid positions follow solid marks, not the dashed shop partitions. The **30 cm** square section is assumed. The lower central support is aligned beside the assumed entrance jamb. |
| Shell and door | Existing **3.25 m** ceiling and **16 cm** walls are assumed. Entrance clear opening is **1.4 m × 2.7 m**, with recessed jambs; exact access alignment needs measurement. |
| Finishes | **1.2 m** floor tiles, **4 mm** joints, **11 cm** skirting are proposed finish dimensions, not information measured from photographs. Obsolete projecting panel surrounds remain removed. Uncovered intervals use the existing masonry finish, with no added infill geometry. |
| Wall dimensions / ceiling | Main finished ceiling target **3 m**. Wall widths follow complete photo aspect ratios. Entry soffit **2.8 m**, sofa soffit approximately **2.92 m**, existing makeup recess **2.4 m by 2.88 m**. The swing uses its available existing wall with painted masonry above its full-aspect image; no wall is extended to fit it. They are visualization allowances, not measured room sizes. |
| Lighting | Fitting positions and warm fill are illustrative. No lighting specification or construction design is implied. |

## Implementation

- `src/layout.js`: plans, Room 1 contour, building context, destinations, separate entrance view, collision and A* routing.
- `src/references.js`: original image dimensions, full-image surfaces, source Canva pixel centres and orientation mapping. Surface dimensions are display choices, not photographed-room sizes.
- `src/furnishingsData.js` / `src/furnishings.js`: furnishing positions, footprints (shared with collision and the minimap) and their geometry, contact shadows and materials.
- `src/scene.js`: architectural shell, unmodified photo textures, loading/error reporting, static batching and disposal. Obsolete procedural furniture, relief deformation, cropped door textures and duplicate image surfaces were removed.
- `src/architecture.js`: clipped floor joints, skirting/coves, structural supports, entry reveals, warm fittings, the retained makeup recess and a continuous main ceiling, shallow entry/sofa soffits and the existing makeup ceiling; the same physical wall/support dimensions supply collision bounds.
- `src/buildingContext.js`: Room 2, verandah/parapets, visible stair flights and toilet block.
- `src/Walkthrough.jsx`: first-person renderer, touch/keyboard/mouse controls, reset and guided tour.
- `src/App.jsx`, `src/MiniMap.jsx`, `src/styles.css`: retained responsive interface and expanded context map.

Textures are shared, static architecture is batched, and pixel ratio is capped. Photo colors are not lit a second time. All twelve local images must finish loading before the loading overlay clears; a failed request reports its exact missing path instead of substituting artwork. Resources and event handlers are released on unmount. Google Fonts is optional with system fallbacks.

## Validation and practical limits

- `npm test`: **28 tests pass**. Existing navigation, footprint, doorway and resource checks are retained. Checks enforce complete UV area, native image proportions, clean paired corners, both reception/Room 04 returns and collision-safe routes to every photograph. New regressions check the exact 18 architectural barriers plus furnishing footprints, unobstructed movement through the former central partition, and existing masonry immediately behind every photo face.
- `npm run build`: production build succeeds; Vite retains its advisory for the separately loaded Three.js chunk exceeding 500 kB.
- Visual review used actual headless-browser renders of all twelve photo walls, the entrance, makeup recess, Room 04 corner, Room 2 step, oblique views and the intentionally plain surfaces. A browser harness traversed **336 collision-checked movement steps** from the entrance through all nine tour destinations using the application's actual routing and collision functions, rendering intermediate views as well as destinations. This is a simulated first-person route, not a claim of manual keyboard/mouse testing. Review images: `.qa/plan-cleanup-shell.png`, `.qa/plan-cleanup-walls.png`, `.qa/plan-cleanup-approaches.png`, `.qa/plan-cleanup-walk.png` (excluded from the build). The UI and control handlers remain unchanged. The swing tour destination and map geometry follow its corrected position. A roof-hidden render was also inspected to verify the retained boundaries.


This is a **photo-based spatial preview**, not a 360-degree scan or a reconstruction of the pictured furniture. Photo lighting/perspective is baked in; the vanity mirror is a non-reflective silvered surface, not a live mirror. The display surfaces preserve the source imagery while the architecture and walking area follow the supplied plans. Exact construction dimensions and final door/room alignments still require measured documentation.
