# Space-X: English research overview

Duration: 00:03:32 | 1920 x 1080 | 24 fps

Narration: standard American English male neural voice (en-US-AndrewNeural).

## 00:00:00 - The central idea

**On screen:** From spatial clues to reliable answers

Space-X is a self-evolving framework for spatial reasoning. Its central idea is simple: better reasoning comes from connecting evidence, not merely from adding tools.

## 00:00:11 - Why evidence chains matter

**On screen:** More tools do not guarantee better reasoning

Tool-augmented agents can miss a crucial observation, mix object identities or reference frames, and decide before the evidence is complete. A correct tool output only becomes useful when it supports the question being asked.

## 00:00:26 - Dual-agent self-evolution

**On screen:** One agent reasons. The other improves how.

An execution agent constructs an evidence chain for each task. A control agent studies execution traces and evaluation feedback, then improves the surrounding harness. Tools, interfaces, skills, memory, and decision rules evolve together.

## 00:00:42 - The task-time architecture

**On screen:** Acquire. Associate. Judge.

The question determines what evidence is needed. Source-aware tools acquire observations and geometry. The harness binds results to objects, sources, and reference frames, then checks whether the key claims have sufficient support. Every decision stays connected to its evidence.

## 00:01:00 - Case study | surface distance

**On screen:** Measure the right objects. Measure the right relation.

Consider the distance between the closest surfaces of a stool and a toilet. Segmentation identifies the objects, and depth supplies geometry from the same source. The harness selects the requested surface-to-surface measurement and produces an answer of zero point eight six meters.

## 00:01:18 - Case study | changing viewpoint

**On screen:** A target in one image. An answer in another frame.

A mural is visible in one image, but the question refers to a different camera. Space-X associates the target with shared geometry and transforms it into the requested camera frame. The resulting relation is behind, rather than an answer based on image position alone.

## 00:01:35 - Memory makes evidence reusable

**On screen:** Remember connections, not just observations

Five role-specific memories preserve the working state, observations, spatial relations, execution history, and reusable procedures. For counting, repeated sightings are associated with physical instances. In this example, eight accepted sightings support two monitors, rather than eight separate objects.

## 00:01:55 - Results across four base models

**On screen:** The same models. Stronger spatial reasoning.

Across ViewSpatial, SPAR, MMSI, and VSI, all four base models improve with Space-X. For GPT-6-sol, ViewSpatial rises from fifty-three point one nine to seventy-nine point nine nine. For Gemini Flash, VSI rises from fifty-three point zero nine to sixty-six point four two, using ten initial frames.

## 00:02:19 - What the ablation reveals

**On screen:** The gain is in the coordination

The ablation makes the central insight concrete. On ViewSpatial, evolving tools alone reaches sixty-eight point one five, while jointly evolving tools and evidence rules reaches seventy-nine point nine nine. The key is to make different tool outputs work together as evidence.

## 00:02:37 - Accumulating reusable capabilities

**On screen:** Self-evolution builds a coordinated harness

The development sequence contains five hundred and seventy-five optimization candidates across five categories. As tools, skills, memory, evidence links, and control improve together, spatial reasoning performance increases. Capabilities accumulate through their connections.

## 00:02:55 - X-SFT | adapt rather than rebuild

**On screen:** Transfer the harness. Refine the fit.

The harness also transfers across models. With X-SFT, the target model continues self-evolution from the inherited structure, reusing the original development data. Fifteen iterations further improve all three target models, providing a lower-cost route than rebuilding from scratch.

## 00:03:15 - Space-X

**On screen:** Self-evolution is the method. Reliable evidence is the goal.

Space-X turns fragmented spatial clues into traceable, derivable answers. Its contribution is not a larger collection of settings, but a harness whose components learn to work together. Explore the paper, project page, and visual cases.

