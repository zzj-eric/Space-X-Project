# Space-X project page

Standalone static website for GitHub Pages. Images, fonts, case data and the
chart library are included. No Python, Node.js build, model API or CDN is
required to serve the site.

## Deploy this folder as its own repository

1. Put the **contents of this folder** at the root of a GitHub repository.
   Include the hidden `.github` directory and `.nojekyll` file.
2. Open **Settings > Pages > Build and deployment** and select **GitHub Actions**.
3. Push to `main` or `master`, or run **Deploy Space-X to GitHub Pages** from
   the Actions tab. The workflow reports the published address.

For a project repository named `space-x`, the address normally has the form
`https://<username>.github.io/space-x/`. For a repository named
`<username>.github.io`, it uses `https://<username>.github.io/`.
All site assets use relative URLs and support either location.

Alternatively, select **Deploy from a branch**, choose the publication branch
and `/ (root)`. The `.nojekyll` file keeps this a plain static site.

## Preview before publishing

Open `index.html` directly, or from this folder run:

```bash
python -m http.server 8767 --bind 127.0.0.1
```

Browse `http://127.0.0.1:8767/#research-film`. For local chapter seeking,
use `light_revision/serve.py`, which supports video byte ranges. Python is
only needed for local preview, not for deployment.

## Contents

- `index.html`: method, research film, animated results, evolution and qualitative cases.
- `video/`: male-narrated 1080p film, chapter navigation, subtitles and editable source.
- `video.css`: the embedded player and chapter rail, in the fourth homepage section.
- `showcase.js` / `showcase.css`: score trajectories and the visual subtask stage.
- `benchmark-results.json`: four models, four benchmarks and subtask scores.
- `research-data.js`: self-contained browser data for the results and charts.
- `assets/`: images, local fonts, logos and the chart library with its license.
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow.

The page highlights ViewSpatial, SPAR, MMSI and VSI. VSI uses ten initial
video frames. Subtask highlights are selected by relative improvement above
10%. A visual stage pairs an illustrative spatial scene with each selected
subtask and its exact before/after scores. The focused score
axes are explicitly labeled, with an optional complete 0-100 scale.

Update this export by running `build_github_pages.py` in the local preview
folder. The exporter refreshes site files while preserving repository-specific
files such as an existing `CNAME` or `.git` directory.

## Add the paper URL

Edit `paper-link.js` in this folder and replace `const PAPER_URL = "";` with
`const PAPER_URL = "https://arxiv.org/abs/YOUR_PAPER_ID";`, using the real URL.
The homepage **Read the paper** button becomes active and its **Coming soon**
label disappears automatically. It opens the paper in a new tab.

If maintaining the local preview as the source, edit
`light_revision/paper-link.js` and rerun `build_github_pages.py` to synchronize
this folder and the deployment ZIP. Keep that source value in sync before
exporting again, as the exporter copies the local configuration.

## Add the GitHub code URL

Edit `code-link.js`, line 8, and set `CODE_URL` to the public code repository
URL, for example `https://github.com/YOUR_NAME/YOUR_CODE_REPOSITORY`.
The homepage **GitHub Code** button enables automatically and hides its
**Coming soon** label. Leave the value empty until the code is released.

To maintain both copies together, edit `light_revision/code-link.js` and
rerun `build_github_pages.py`. The paper button remains separately configured
in `paper-link.js`.
