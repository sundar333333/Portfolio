# Objective
Fix the 3D room model not rendering (only a book shows). The root cause is the `useGLTF` call parameters — passing `useDraco=true` when the model uses `EXT_meshopt_compression` (not Draco), and also passing a redundant custom `extendLoader` that conflicts with drei's built-in meshopt support.

# Tasks

### T001: Fix useGLTF call and model loading
- **Blocked By**: []
- **Details**:
  - In `client/src/components/Room3D.tsx`, change `useGLTF("/static/room.glb", true, true, (loader) => { loader.setMeshoptDecoder(MeshoptDecoder); })` to `useGLTF("/static/room.glb", false, true)` — disable Draco (model doesn't use it), enable meshopt (drei handles decoder automatically), remove custom extendLoader
  - Also remove the `import { MeshoptDecoder }` line since drei handles it
  - Remove the preload call or update it to match: `useGLTF.preload("/static/room.glb")`
  - Files: `client/src/components/Room3D.tsx`
  - Acceptance: All 831 meshes render in the 3D room view, not just the book

### T002: Build and test
- **Blocked By**: [T001]
- **Details**:
  - Run `rm -rf dist && npm run build`, create symlinks, restart workflow
  - Verify room.glb loads fully in browser
  - Files: none (build/deploy step)
  - Acceptance: Full room visible when clicking ENTER button
