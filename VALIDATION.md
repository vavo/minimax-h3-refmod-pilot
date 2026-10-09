# Validation

Checked on 2026-10-09 using ComfyUI 0.34.0, frontend 1.49.6 and
ComfyUI-MiniMaxH3Mod revision `f9462081e28794389b5a6c5067eb327412ad8ee7`.

## Passed

- Opened the inference workflow in ComfyUI and inspected the four-element canvas:
  Characters, Edit Scene Here, Output and Read Me.
- Saved through the frontend and checked subgraph links, output types and required
  inputs against the running server's node definitions.
- Executed the duration and resolution controls on the server:

  | Input | Result |
  | --- | --- |
  | 5 seconds | 124 frames |
  | 7.5 seconds | 192 frames |
  | 10 seconds | 243 frames |
  | 15 seconds | 362 frames |
  | Below 5 / above 15 seconds | Clamped to 124 / 362 frames |
  | Square, 0.4 MP | 640 × 640 |
  | Wide, 0.4 MP | 864 × 480 |
  | Portrait, 0.4 MP | 480 × 864 |
  | Custom 863 × 481 | Rounded to 864 × 480 |

- Flattened the saved subgraphs and ran the text/vision encoding path with three
  existing RefMods containing 24 independent images. Encoding completed without
  node errors. The reference map contained all 24 entries.
- Checked the actual inputs feeding the video latent node: 864 × 480, 124 frames
  with the default wide, 0.4 MP, 5-second settings.
- Checked public workflow files for personal reference filenames and pod URLs.
  The public inference download has three empty character slots.

## Not yet established

- The new compact workflow has not completed a full diffusion/video render.
  Encoding success does not verify output quality, likeness, identity separation,
  peak sampling memory or total generation time.
- The supplied creator workflow has not been independently verified end to end
  in this validation pass. Multi-photo creator output uses a stacked video-kind
  reference, unlike the independent-image bundles used in the encoding check.
- Compatibility with other ComfyUI and custom-node revisions remains untested.

Personal photos, prompts, RefMods and raw execution logs are excluded from this
repository.

## Prepared consistent robot creator

- Opened `Orange-Robot-RefMod-Creator.json` on the pod and checked the folder,
  selected H3 VAE, Full Reference mode, 768 px resolution, zero refinement steps,
  save setting and distinct output name in the UI.
- The source folder is deliberately `SET_CONSISTENT_ROBOT_DATASET_HERE`, not an
  empty string (which would select ComfyUI's input directory).
- Graph links and required inputs were checked against the installed node schema.
- No dataset has been selected and this prepared workflow has not been executed.

## Canvas polish and loader controls

- Replaced the character subgraph with the original RefMod loader, retaining the
  same selected files, strengths and connection to the Scene subgraph.
- Tested Add RefMod, removed the temporary empty slots, refreshed the file list,
  and opened the library successfully (five files listed on the test pod).
- Inspected the four different node colors in ComfyUI.
- Verified the linked LoRA Pilot OG image rendered at its source size of
  1730 × 909 pixels inside the Markdown README node.
- No additional dependency or full video render was required for these UI changes.
- The original loader exposes its advanced fields; in the tested Nodes 2.0 UI,
  unused slot fields can also remain visible. Add/remove updates the slot state,
  but this upstream display behavior makes the loader taller.

## Browser photo upload

- Installed the RefMod Pilot frontend extension on the pod and verified its
  registration after restarting ComfyUI. Opened a fresh browser page to load it.
- Used the Upload photos file picker to upload two non-personal test images. The
  UI reported two photos ready, populated an isolated relative input folder, and
  set max_items to two. No RefMod extraction was run for these test images.
- Selected an unreadable PNG and confirmed a visible error with the previous
  folder preserved. Restored the robot template's unset folder and count of eight.
- Six automated tests passed with `node --test tests/upload.test.mjs`, covering
  validation, duplicate filenames, partial failure, destination checks,
  cancellation and supported extensions.
- Inspected the upload button/drop area in the live creator and updated its
  README screenshot. File-picker interaction was tested in the Codex in-app
  browser; OS drag-and-drop and Chrome/Edge/Firefox/Safari were not separately
  exercised. The extension uses standard file APIs, without a browser add-on.
