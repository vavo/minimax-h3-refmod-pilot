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
