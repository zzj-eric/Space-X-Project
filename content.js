/* Editorial summaries of preserved development evidence, not live model output. */
window.SPACE_X_CASES = {
  metric: {
    category: 'Metric spatial reasoning',
    question: 'What is the closest surface-to-surface distance between the stool and the toilet?',
    before: '1.5 m', after: '0.86 m',
    takeaway: 'Measure the requested surfaces, with object identity and source correspondence intact.',
    caveat: 'Recorded development case. Reference: 0.80 m. The 0.859 m readout is a learned-geometry estimate of visible surfaces; the displayed point cloud is a saved 2D projection.',
    steps: [
      {title: 'First, identify the right objects.', kicker: 'ACQUIRE / SEMANTIC GROUNDING',
        body: 'The white step stool must be distinguished from nearby objects, and paired with the adult toilet. Original views establish the operands before any distance is interpreted.',
        tokens: ['Target: white step stool', 'Reference: adult toilet', 'Relation: closest surfaces'],
        images: [['stool_rgb', 'Original view / stool'], ['toilet_rgb', 'Original view / toilet']],
        visual: 'metric', caption: 'The requested relation fixes which objects and which measurement endpoints matter.'},
      {title: 'Connect masks to shared geometry.', kicker: 'ASSOCIATE / CROSS-TOOL BINDING',
        body: 'SAM3 candidate masks and DA3 geometry stay tied to their original views. Corresponding surface points support a conditional minimum of 0.859 m, rather than camera depth or center distance.',
        tokens: ['SAM3 candidate regions', 'DA3 geometry', 'Same-source binding'],
        images: [['stool_mask_focus', 'SAM3 / stool candidate'], ['toilet_depth_luminous', 'DA3 / toilet depth']],
        visual: 'metric', caption: 'Saved minimum: 0.85935 m. Robust-near readout: 0.86360 m.'},
      {title: 'Resolve the disagreement at its source.', kicker: 'JUDGE / SOURCE-BASED RECONCILIATION',
        body: 'The draft proposes 0.86 m; independent reinspection suggests 0.1 m. Reconciliation returns to the object identities and corresponding surfaces, retaining the supported 0.86 m answer.',
        tokens: ['Draft: 0.86 m', 'Reinspect: 0.10 m', 'Final: 0.86 m'],
        images: [['stool_rgb', 'Revisit the stool identity'], ['toilet_rgb', 'Revisit the reference object']],
        visual: 'metric', caption: 'A competing proposal triggers a premise check, rather than automatically replacing the answer.'}
    ]
  },
  mural: {
    category: 'Cross-view spatial reasoning',
    question: 'When taking photo 1, in which direction was the butterfly mural relative to the observer?',
    before: 'Right', after: 'Behind',
    takeaway: 'Find the target in one view. Read its relation in the camera frame the question actually requests.',
    caveat: 'Recorded development case. Reference: behind. The coordinate inset is an illustrative X-Z projection of the saved camera-relative point, not a new reconstruction.',
    steps: [
      {title: 'Separate target view from query view.', kicker: 'ACQUIRE / BIND THE TWO ROLES',
        body: 'The mural is identified in photo 3, but the question asks about the observer taking photo 1. Keeping these roles explicit prevents a picture-local direction from answering the wrong question.',
        tokens: ['Target source: photo 3', 'Observer: photo 1', 'Query: camera-relative direction'],
        images: [['mural_1','Photo 1 / requested observer'],['mural_3','Photo 3 / target source']],visual:'mural',
        caption:'The source of an object and the frame of a spatial question can be different.'},
      {title: 'Express the target in the requested frame.', kicker: 'ASSOCIATE / SOURCE-TO-CAMERA READOUT',
        body: 'MapAnything provides joint geometry with a typed readout in the original camera frame. The saved target point is approximately (2.70, -1.00, -2.96): its forward component is negative.',
        tokens: ['MapAnything joint geometry','Requested source camera','Forward component: -2.96'],
        images: [['mural_2','Additional scene context'],['mural_3','Grounded target identity']],visual:'mural',
        caption:'The inset shows the saved target point on the X-Z plane; negative Z places it behind the requested camera.'},
      {title: 'Review the frame behind the answer.', kicker: 'JUDGE / RECONCILE THE RELATION',
        body: 'A competing front proposal is checked against the target source and the requested observer frame. The final answer retains behind, matching the reference relation.',
        tokens: ['Target identity checked','Observer frame retained','Final: behind'],
        images: [['mural_1','Original observer view'],['mural_3','Original target source']],visual:'mural',
        caption:'Reconciliation preserves the question-defined frame rather than switching to the most convenient image.'}
    ]
  },
  monitors: {
    category: 'Multi-view instance reasoning',
    question: 'How many monitors are in this room?',
    before: '1 monitor', after: '2 monitors',
    takeaway: 'Repeated sightings support physical identities; they are not additional objects.',
    caveat: 'Recorded selector comparison. Both arms use ten views from the same 32-frame bank and the same downstream engine. View selection differs; the number of views is held fixed.',
    steps: [
      {title: 'Select views that reveal distinct instances.', kicker: 'ACQUIRE / QUESTION-RELEVANT COVERAGE',
        body: 'Ten views are selected from a shared 32-frame bank. One selected image shows both monitors simultaneously, while other views expose partial and repeated sightings.',
        tokens: ['Same 32-frame bank','Ten selected views','Joint visibility'],
        images: [['monitors_pair','Selected view / both monitors'],['monitors_partial','Another view / partial visibility']],visual:'monitors',
        caption:'Category-aware selection changes which views are shown, rather than simply supplying more images.'},
      {title: 'Turn eight sightings into two identities.', kicker: 'ASSOCIATE / INSTANCE-LEVEL MEMORY',
        body: 'The saved inventory groups eight accepted monitor sightings into two object hypotheses. A computer tower and a chair back are rejected, and repeated views reinforce the same physical instances.',
        tokens: ['Identity A: s1, s2, s4, s5, s7','Identity B: s3, s6, s8','Distractors rejected'],
        images: [['monitors_pair','Joint view anchors the identities'],['monitors_another_view','Cross-view correspondence']],visual:'monitors',
        caption:'The grouping below reproduces the accepted sighting groups from the recorded inventory.'},
      {title: 'Count supported objects, not detections.', kicker: 'JUDGE / CONSISTENT INSTANCE COUNT',
        body: 'Both the draft and independent reinspection answer two. The final count follows the consolidated object inventory, rather than the number of frames or accepted detections.',
        tokens: ['Draft: 2','Independent reinspection: 2','Reference: 2'],
        images: [['monitors_pair','Two physical monitors'],['monitors_another_view','Supporting repeated observations']],visual:'monitors',
        caption:'The earlier uniform-view arm answers one; the selected-view execution answers two.'}
    ]
  },
  sofa: {
    category: 'Cross-window evidence continuity',
    question: 'Standing at the sofa and facing the curtain, where is the picture?',
    before: 'No answer', after: 'Front-left',
    takeaway: 'Carry observations and uncertainty forward, then restore the sources needed to finish the relation.',
    caveat: 'Recorded development case. The evaluated change bundles source-linked notes, requested-image delivery, and closure scheduling. Memory records are bounded observations and hypotheses, not guaranteed facts.',
    steps: [
      {title: 'Ground the target, position, and facing.', kicker: 'ACQUIRE / OBSERVER-RELATIVE ROLES',
        body: 'The sofa defines where the imagined observer stands, the curtain defines facing, and the picture is the target. Separate views provide parts of this relation.',
        tokens: ['Position: sofa','Facing: curtain','Target: picture'],
        images: [['sofa_1','Source view / sofa'],['sofa_3','Source view / room context']],visual:'sofa',
        caption:'The necessary evidence is distributed across views and observation windows.'},
      {title: 'Carry the observation with its provenance.', kicker: 'ASSOCIATE / MEMORY AND SOURCE RESTORATION',
        body: 'Five source-linked notes preserve facts and uncertainty across windows. The next acquisition receives the notes and all ten requested originals, including six images missing from the ordinary delivery queue.',
        tokens: ['5 source-linked notes','10 originals delivered','6 missing entries restored'],
        images: [['sofa_2','Observation source / curtain context'],['sofa_3','Observation source / picture context']],visual:'sofa',
        caption:'A recorded note relates the low toy shelves to the patterned curtain while keeping the sofa relation unresolved.'},
      {title: 'Finish with the evidence still available.', kicker: 'JUDGE / MEMORY-SUPPORTED RECONCILIATION',
        body: 'The proposal connects picture, shelf, curtain, and sofa. With carried notes, original sources, and reserved closure capacity, reconciliation resolves the competing proposals and returns front-left.',
        tokens: ['Draft: C','Reinspection: D','Reconciliation: C'],
        images: [['sofa_1','Revisit observer position'],['sofa_3','Revisit target and facing context']],visual:'sofa',
        caption:'The earlier execution exhausts its budget; the improved execution completes a reference-matching answer.'}
    ]
  }
};

window.SPACE_X_MEMORIES = {
  work: {number:'01',scope:'CURRENT QUESTION',title:'Working Memory',description:'Track the premises that matter now: the question, supported relations, tentative conclusions, and the gaps that should guide the next action.',record:[['Question','Picture relative to a person at the sofa'],['Grounded','Position = sofa; facing = curtain'],['Next need','Verify the target in this observer frame']],effect:'Make the next action purposeful'},
  obs: {number:'02',scope:'ORIGINAL SOURCES',title:'Observation Memory',description:'Keep original views, crops, source identifiers, and bounded observations together. A later claim can bring its cited image back into the API context.',record:[['Observation','Low shelves lie left of the patterned curtain'],['Provenance','Original view + region reference'],['Uncertainty','Sofa relation remains unresolved']],effect:'Restore the evidence behind a claim'},
  spatial: {number:'03',scope:'OBJECTS AND RELATIONS',title:'Spatial Memory',description:'Associate object identities with compatible geometry and reference frames. Measurements keep their units and endpoints, so different tools can support the same relation.',record:[['Objects','White stool ↔ adult toilet'],['Binding','Source regions ↔ corresponding geometry'],['Quantity','Closest surface distance / meters']],effect:'Combine only compatible evidence'},
  epis: {number:'04',scope:'EXECUTION HISTORY',title:'Episodic Memory',description:'Preserve actions, failed attempts, candidate answers, and review history within the current execution. Disagreements become concrete premises to inspect.',record:[['Draft','0.86 m'],['Reinspection','0.10 m / conflicting object interpretation'],['Resolution','Revisit sources; retain 0.86 m']],effect:'Learn from the current trajectory'},
  proc: {number:'05',scope:'REUSABLE PRACTICES',title:'Procedural Memory',description:'Supply guidance retained across improvement iterations: tool validity conditions, interpretation rules, source checks, and effective ways to complete a task.',record:[['Before measuring','Bind target and reference endpoints'],['Before associating','Check source, frame, identity, and units'],['Before closing','Resolve critical gaps; preserve answer capacity']],effect:'Reuse what the evolution process learns'}
};
window.SPACE_X_FIGURES = {
  architecture:{title:'Execution architecture',alt:'Space-X architecture: inputs, tools, construction, five memory roles, and source-linked review',caption:'From input to tools to evidence construction, with five memory roles and source-linked review connecting successive API calls.'},
  evolution:{title:'Self-evolution pipeline',alt:'Dual-agent self-evolution with execution feedback, tool outputs, memory integration, and retained improvements',caption:'Task-time evidence construction informs cross-iteration improvement of tools, interfaces, memory, skills, and evidence-use rules.'},
  motivation:{title:'Motivation and failure cases',alt:'Three evidence-chain failures and the Space-X response: acquisition, association, and evidence-grounded judgment',caption:'Unfocused acquisition, inconsistent interpretation, and unsupported decisions motivate a continuous evidence-chain objective.'}
};
