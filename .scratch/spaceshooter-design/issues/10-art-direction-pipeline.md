# Art direction and hi-fi pipeline

Type: `research`
Status: resolved
Blocked by: 01, 03

## Question

How should the design specify high-fidelity sci-fi presentation for a web R3F game?

Research and recommend: asset formats and budgets; PBR/material expectations; lighting and cinematic post stack feasible in-browser; silhouette/readability constraints for arcade combat; what belongs in an art direction section vs production asset list. Produce a short linked summary the design can cite.

## Answer

**Art direction and hi-fi pipeline (locked)**

- **Direction:** hi-fi sci-fi PBR, dark void + emissive tech; readability over beauty; cyan player / warm enemy / gold-green pickups.
- **Post (Run):** bloom (selective/emissive) + light vignette; no DOF/SSR in Run; quality tiers Low/Med/High; 60fps Medium intent.
- **Authoring (user override):** **Tripo → GLB**; concepts/refs via **GPT-image-2**. Generation **prompt templates** live in the research doc (global suffix, ship/enemy/VFX, Tripo text-to-3D + image-to-3D path, post checklist).
- **Engine:** GLB + Draco/Meshopt, KTX2 when practical; poly budgets as researched; instanced bullets/fodder.
- **DESIGN.md** holds rules; prompts + pipeline detail in research asset.

**Asset:** [docs/design/research/art-pipeline.md](../../../docs/design/research/art-pipeline.md)

Confirmed by user (batch accept + Tripo/GPT-image-2 authoring + prompts in docs).
