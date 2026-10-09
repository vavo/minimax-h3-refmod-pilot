# RefMod Pilot

Simple ComfyUI workflows for MiniMax H3 character references, by LoRA Pilot.

The inference canvas has four elements:

1. **CHARACTERS**: choose up to three RefMods and their strengths.
2. **EDIT SCENE HERE**: prompt, aspect ratio, resolution, custom width/height, seconds, seed and steps.
3. **OUTPUT**: preview and save the video with audio.
4. **READ ME**: instructions beside the controls.

Model loading, reference encoding, sampling and decoding live inside native ComfyUI subgraphs. Open a subgraph to reach the advanced settings. RefMod Pilot is a workflow kit, not another custom Python node.

## Install

Use a current ComfyUI with native MiniMax H3 support and subgraphs. Development targets ComfyUI 0.34.0 and frontend 1.49.6.

Install these custom-node packs through ComfyUI Manager, including their dependencies, then restart ComfyUI:

- [ComfyUI-MiniMaxH3Mod](https://github.com/Luisacaotica/ComfyUI-MiniMaxH3Mod): RefMod creation, loading and reference-aware text encoding. The inspected revision is `f9462081e28794389b5a6c5067eb327412ad8ee7`; upstream interfaces are evolving.
- [ComfyUI-KJNodes](https://github.com/kijai/ComfyUI-KJNodes): H3 memory-saving attention and feed-forward nodes used in inference. The creator does not need this pack.

RefMod Python dependencies are `torch`, `safetensors`, `numpy` and `Pillow`. **Keep the CUDA-compatible PyTorch supplied by your working ComfyUI installation.** The requirements file lists the remaining packages; it does not install ComfyUI, custom-node packs, or model weights.

If the packages are missing, run this with ComfyUI's Python:

```sh
python -m pip install -r requirements.txt
```

For the standard LoRA Pilot pod environment:

```sh
/opt/venvs/core/bin/python -m pip install -r requirements.txt
```

KJNodes has its own requirements, installed by its installer/Manager. Optional video-file inputs to the folder creator may require `opencv-python` or `imageio`; still-image creation does not need them.

Download these weights from [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3) into the corresponding ComfyUI model folders:

| Folder | File |
| --- | --- |
| `models/diffusion_models` | `minimax_h3_ref2va_pruned_int8_convrot.safetensors` |
| `models/text_encoders` | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` |
| `models/vae` | `minimax_h3_video_vae_fp16.safetensors` |
| `models/vae` | `minimax_h3_audio_vae_fp32.safetensors` |

The creator only needs the video VAE. The inference workflow needs all four files and saved RefMods under `models/refmods/`. Model licenses and requirements belong to their upstream projects.

## Create a character

Open [Character-RefMod-Creator.json](workflows/Character-RefMod-Creator.json) in ComfyUI.

1. Put 5–8 selected photos of one character directly in a folder. One image also works. Captions are unnecessary.
2. Enter the folder path and a unique character name. Reusing a name replaces its saved RefMod.
3. Run. The file saves under `ComfyUI/models/refmods/` (normally `/workspace/models/refmods/` on LoRA Pilot).

The loader takes the first eight media files alphabetically; it does not rank image quality. Use still images with similar aspect ratios and keep faces inside the crop. The simple creator crops references to the first photo's aspect ratio and stacks them into one video-kind reference when using multiple photos.

Full Reference mode preserves the VAE reference rather than compressing it to a small grid. No LoRA or H3 model weights are trained. More reference photos increase the cost of subsequent video generation.

## Generate a video

Open [RefMod-Pilot-Inference.json](workflows/RefMod-Pilot-Inference.json).

1. Select your RefMods in **CHARACTERS**. Public downloads start with empty slots.
2. Update the character tags and scene in **EDIT SCENE HERE**. Choose size and seconds.
3. Run. Results appear in **OUTPUT** and save under `ComfyUI/output/video/RefModPilot*` (the pod may map output elsewhere).

### Size and duration

- **Aspect ratio + Resolution (megapixels)** calculate dimensions in preset mode. Square, landscape, portrait and ultrawide presets are available. Start at 0.4 MP.
- **Custom size** switches to the Width and Height fields; aspect ratio and megapixels are then ignored. Dimensions round to multiples of 32.
- **Duration** is entered in seconds, limited to 5–15 seconds, and rounded upward onto H3's frame grid at 24 fps. Five seconds produces 124 frames (~5.17 s), ten produces 243 (~10.13 s), and fifteen produces 362 (~15.08 s).
- **Seed** repeats a take; **Steps** defaults to 20. Increasing resolution, reference count or duration can substantially increase memory and runtime.

### Reference labels matter

RefMod files may contain one picture, several independent pictures, or a stacked video reference. The three slot numbers are not necessarily the three picture numbers.

Open the Scene subgraph and inspect **Reference map** after encoding. Use its `<Picture n>` and `<Video n>` labels in your prompt. For example, three multi-photo files from the supplied creator normally use `<Video 1>`, `<Video 2>` and `<Video 3>`. Separate-image bundles use picture labels for each view. The example prompt's picture labels are placeholders to replace for your files.

## Validation status

Development preview. The original generation path passed live text/vision encoding with three bundles (24 independent images). This does not establish video likeness or identity separation. The compact subgraph workflow's validation results are recorded in [VALIDATION.md](VALIDATION.md).

## Credits

Built on [ComfyUI](https://github.com/Comfy-Org/ComfyUI), [ComfyUI-MiniMaxH3Mod](https://github.com/Luisacaotica/ComfyUI-MiniMaxH3Mod) by Luisacaotica, and [ComfyUI-KJNodes](https://github.com/kijai/ComfyUI-KJNodes). RefMod Pilot supplies workflow configuration and usability guidance; the RefMod implementation comes from upstream. No upstream Python implementation or model weights are vendored here.
