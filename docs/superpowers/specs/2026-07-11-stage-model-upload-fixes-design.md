# Stage Boundary, Piano Scale, and GLB Upload Fixes

## Goal

Fix three studio problems without changing unrelated scene behavior:

- The seasonal ground must remain inside the visible glass container boundary.
- The autumn preset piano must appear approximately three times its current visual size while remaining floor-aligned.
- Uploaded GLB models must be recognized as 3D assets and remain draggable from the uploaded-assets panel onto the stage.

## Architecture

Keep container geometry measurements in `lib/studio-geometry.ts` so rendering and drag constraints share one source of truth. Keep file classification in a small pure helper that converts a browser `File` into the correct `LibraryAsset` shape. Scene rendering continues to dispatch by `ProjectItem.kind`, with uploaded models using the existing `Model3D` and `useGLTF` path.

## Container Ground Boundary

Add a container-specific ground footprint helper. `SeasonalFloor` will consume this helper instead of embedding its own radii and dimensions. The jar footprint will use a conservative radius below the inner glass profile at the configured floor height, removing the green crescent visible outside the jar. Existing cuboid, sphere, and pedestal dimensions will remain visually unchanged unless the shared configuration exposes an existing mismatch.

Drag clamping remains separate from the visible ground footprint because an item's origin can safely approach a different boundary than a filled ground mesh. Both values will nevertheless live in the same geometry module and be covered by unit tests.

## Piano Scale

The piano is currently scaled twice: `item.scale` is applied inside `Model3D`, and `item.scale3` is applied by `SceneItemNode`. The autumn preset supplies `0.6` to both, producing an effective factor of `0.36` after model normalization.

The preset will use one intentional uniform scale path and a value chosen to produce approximately three times the current visual dimensions. Its position and rotation remain unchanged unless visual verification shows that the enlarged bounding box crosses the cuboid wall; in that case only its horizontal position will be minimally adjusted. The existing bottom-offset normalization continues to keep the piano on the floor.

## Upload Classification and Drag Flow

Uploaded files will be classified case-insensitively:

- `.glb` and `.gltf`: `kind: "model-3d"`, blob URL assigned to `modelUrl`, `sourceType: "upload"`.
- Supported raster images: `kind: "upload-plane"`, blob URL assigned to `previewUrl`, `sourceType: "upload"`.
- Unsupported extensions: rejected with a user-visible toast instead of being added as a broken image plane.

The uploaded-assets browser and existing drag payload remain unchanged because they already pass the complete `LibraryAsset` object. `addItemFromAsset` will preserve `kind`, `modelUrl`, and `sourceType`, allowing `ItemMesh` to select `Model3D` and `useGLTF` after the drop.

Blob URLs are session-scoped. Persisted stale blob-backed assets must not crash the whole canvas: existing item error isolation remains in place, and invalid restored upload entries may render the current error fallback. Durable cross-refresh binary storage is explicitly outside this fix.

## Error Handling

- A mixed upload selection adds supported files and reports how many unsupported files were skipped.
- A GLB parser/load failure is contained to that item by the scene item error boundary.
- Empty file selections remain a no-op.
- Extension checks are case-insensitive.

## Testing

Use Vitest unit tests for pure behavior:

- Jar ground footprint is smaller than its safe inner boundary and differs from the drag clamp radius.
- `.glb`, uppercase `.GLB`, `.gltf`, and supported image files produce the correct asset kind and URL field.
- Unsupported files are rejected.
- The autumn piano preset has a single effective scale approximately three times the previous `0.36` factor.

Then run the focused tests, the complete test suite, TypeScript/ESLint checks, and the production build. Finally inspect the jar scene, autumn piano scene, and an uploaded GLB drag in the browser.

## Success Criteria

- No green ground is visible outside the jar glass at the demonstrated camera angle or during normal orbiting.
- The autumn piano appears approximately three times larger than in the supplied screenshot and remains on the stage floor.
- Selecting a GLB creates an uploaded 3D asset; dragging it to the stage loads the model rather than an image plane or unknown fallback.
- Invalid or unsupported uploads do not crash the studio.
- Existing automated checks and the Next.js production build pass.

## Non-Goals

- Persisting uploaded binary files across browser restarts.
- Automatic semantic sizing for every possible third-party model.
- Redesigning the asset browser or container shell.
