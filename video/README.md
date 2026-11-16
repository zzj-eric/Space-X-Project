# Space-X research video

The film is embedded in the fourth section of the project homepage, after
Self-evolution and before the Evidence lab: `../index.html#research-film`.

The same video is included in the local preview and the GitHub Pages export.
It is not part of the separate Space-X-Project presentation repository.

The 1080p film uses the stock male English voice `en-US-AndrewNeural`, with
on-screen subtitles and twelve navigable chapters. The video is approximately
3 minutes 32 seconds long; it does not autoplay.

- `Space-X_research_overview_en.mp4`: complete film.
- `Space-X_narration_en.m4a`: standalone narration.
- `Space-X_research_overview_en.srt` and `.vtt`: synchronized subtitles.
- `Space-X_video_poster.jpg`: player cover image.
- `chapters.js` and `chapters.json`: chapter timing.
- `narration_and_storyboard_en.md`: narration and scene outline.
- `Space-X_video_editable_source.zip`: portable rendering source and assets.

For local preview, run `python serve.py --port 8766` from the
`light_revision` website folder, then open
`http://127.0.0.1:8766/#research-film`. The preview server supports byte ranges
for chapter seeking. The GitHub export contains only static files and does
not need a Python server.
