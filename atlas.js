/* Curated appendix explorer. Runs locally; reads no evaluation directories. */
(() => {
  'use strict';
  const data = window.SPACE_X_ATLAS;
  if (!data) return;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const byId = new Map(data.cases.map(c => [c.id,c]));
  const categories = new Map(data.categories.map(c => [c.id,c]));
  const state = {theme:'A',query:'',id:'A1',step:0,source:0,mode:'path'};
  let pool=[], filtered=[], toastTimeout, dialogOrigin;
  const modal = $('#source-dialog');
  const picture = (name,caption) => ({src:`assets/atlas/${name}.webp`,caption});
  const extraMedia = {
    metric: [picture('stool_mask_focus','SAM3 / stool candidate'),picture('toilet_mask_focus','SAM3 / toilet candidate'),picture('stool_depth_luminous','DA3 / stool depth'),picture('toilet_depth_luminous','DA3 / toilet depth')],
    shower: [picture('bin_close','Target / garbage can'),picture('shower_close','Observer position / shower'),picture('towels_close','Facing landmark / towels')],
    temporal: [picture('temporal_plant_crop','Plant / supporting crop'),picture('temporal_blanket_crop','Blanket / supporting crop'),picture('temporal_trash_can_crop','Trash can / supporting crop'),picture('temporal_microwave_crop','Microwave / supporting crop')]
  };
  function collectMedia(item) {
    const all=[...item.media,...item.steps.flatMap(s=>s.media||[]),...(extraMedia[item.key]||[])];
    if(item.comparison) all.push(...item.comparison.before_media,...item.comparison.after_media);
    return [...new Map(all.map(m=>[m.src,m])).values()];
  }
  function shortAnswer(answer) { return answer.replace(/^[A-D]:\s*/, ''); }
  function toast(text) {
    clearTimeout(toastTimeout);$('#atlas-toast').textContent=text;$('#atlas-toast').hidden=false;
    toastTimeout=setTimeout(()=>{$('#atlas-toast').hidden=true;},3000);
  }
  function updateHash() {
    try { const url=new URL(location.href);url.hash=`case-${state.id}`;history.replaceState(null,'',url); } catch (_) { /* local-file history may be restricted */ }
  }
  function jumpToReader() {
    const target=$('#atlas-reader');
    requestAnimationFrame(()=>{
      const top=window.scrollY+target.getBoundingClientRect().top-(window.innerWidth<700?80:95);
      window.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      $('#atlas-case-title').focus({preventScroll:true});
    });
  }
  function renderFilters() {
    const filters=[{id:'all',label:'All themes',icon:'eye'},...data.categories];
    $('#atlas-filters').innerHTML=filters.map(c=>`<button type="button" data-atlas-filter="${c.id}" aria-pressed="${state.theme===c.id}">${icon(c.icon)}<span>${esc(c.label)}</span><span class="filter-count">${c.id==='all'?data.cases.length:data.cases.filter(i=>i.category===c.id).length}</span></button>`).join('');
    $('#case-atlas').dataset.theme=state.theme;
    const theme=categories.get(state.theme)||{question:'One collection, five complementary perspectives',headline:'Choose the connection you want to explore.',description:data.note};
    $('#atlas-theme-question').textContent=theme.question;
    $('#atlas-theme-title').textContent=theme.headline;
    $('#atlas-theme-description').textContent=theme.description;
  }
  function applyFilter({keepSelection=true}={}) {
    const query=state.query.trim().toLowerCase();
    filtered=data.cases.filter(item=>(state.theme==='all'||item.category===state.theme)&&(!query||JSON.stringify(item).toLowerCase().includes(query)));
    renderFilters();
    const unique=new Set(filtered.map(i=>i.key)).size;
    $('#atlas-count').textContent=`${filtered.length} ${filtered.length===1?'analysis':'analyses'} · ${unique} distinct ${unique===1?'question':'questions'}`;
    $('#atlas-empty').hidden=filtered.length>0;
    $('#atlas-reader').hidden=!filtered.length;
    if(filtered.length&&(!keepSelection||!filtered.some(c=>c.id===state.id))) {
      state.id=filtered[0].id;state.step=0;state.source=0;state.mode=defaultMode(filtered[0]);
    }
    renderCards();
    if(filtered.length) renderReader();
  }
  function renderCards() {
    $('#atlas-cards').innerHTML=filtered.map(item=>`<button type="button" class="atlas-card" data-atlas-case="${item.id}" aria-pressed="${item.id===state.id}" aria-controls="atlas-reader"><span class="atlas-card-media"><img src="${item.media[0].src}" alt="${esc(item.media[0].caption)}" width="260" height="160" loading="lazy"><span class="atlas-card-code">${item.id}</span><span class="atlas-card-check">${icon('check')}</span></span><span class="atlas-card-content"><span class="atlas-card-label">${esc(item.tag)}</span><span class="atlas-card-title">${esc(item.title)}</span><span class="atlas-card-result"><span>${esc(shortAnswer(item.before))}</span>${icon('arrow')}<strong>${esc(shortAnswer(item.after))}</strong></span><span class="atlas-card-hint">Inspect the evidence ${icon('diagonal')}</span></span></button>`).join('');
  }
  function defaultMode(item) { return item.category==='C'?'compare':['D','E'].includes(item.category)?'insight':'path'; }
  function selectCase(id,{scroll=false,hash=true}={}) {
    const item=byId.get(id);if(!item)return;
    state.id=id;state.step=0;state.source=0;state.mode=defaultMode(item);
    renderCards();renderReader();if(hash)updateHash();if(scroll)jumpToReader();
  }
  function setMode(mode) {
    state.mode=mode;
    $$('[data-atlas-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasMode===mode)));
    $('#atlas-path').hidden=mode!=='path';$('#atlas-comparison').hidden=mode!=='compare';$('#atlas-insight').hidden=mode!=='insight';
  }
  function renderReader() {
    const item=byId.get(state.id);
    pool=collectMedia(item);state.source=Math.min(state.source,pool.length-1);
    $('#atlas-case-id').textContent=item.id;
    $('#atlas-case-tag').textContent=item.tag;
    $('#atlas-case-title').textContent=item.title;
    $('#atlas-question').textContent=item.question;
    $('#atlas-takeaway').textContent=item.takeaway;
    $('#atlas-reference').textContent=shortAnswer(item.reference);
    $('#atlas-reader-position').textContent=`${filtered.findIndex(c=>c.id===item.id)+1} / ${filtered.length} in this selection`;
    $('#atlas-thumbs').innerHTML=pool.map((m,i)=>`<button type="button" class="atlas-thumb" data-atlas-source="${i}" aria-pressed="${i===state.source}" aria-label="Show source ${i+1}: ${esc(m.caption)}"><img src="${m.src}" alt="" width="72" height="48" loading="lazy"><span>Source ${i+1}</span></button>`).join('');
    renderSource();renderStep();renderLedger(item);renderComparison(item);renderInsight(item);renderSpecial(item);setMode(state.mode);
  }
  function renderSource() {
    const m=pool[state.source];if(!m)return;
    $('#atlas-source-image').src=m.src;$('#atlas-source-image').alt=m.caption;
    $('#atlas-source-caption').textContent=m.caption;
    $('#atlas-source-count').textContent=`${state.source+1} / ${pool.length} sources`;
    $('#atlas-expand-source').setAttribute('aria-label',`Enlarge source: ${m.caption}`);
    $$('[data-atlas-source]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.atlasSource)===state.source)));
    if(modal.open) renderSourceModal();
  }
  function chooseImage(src) {
    const i=pool.findIndex(m=>m.src===src);if(i>=0){state.source=i;renderSource();}
  }
  function renderStep() {
    const item=byId.get(state.id),step=item.steps[state.step];
    $('#atlas-chain').style.setProperty('--steps',item.steps.length);
    $('#atlas-chain').innerHTML=item.steps.map((s,i)=>`<button type="button" data-atlas-step="${i}" aria-pressed="${i===state.step}"><span>${i+1}</span><span>${esc(s.title)}</span>${item.links&&item.links[i]?`<small>${esc(item.links[i])}</small>`:''}</button>`).join('');
    $('#atlas-step-label').textContent=`${item.category==='B'?'EVIDENCE LINK':'RECORDED STEP'} ${state.step+1} / ${item.steps.length}`;
    $('#atlas-step-title').textContent=step.title;
    $('#atlas-step-body').textContent=step.body;
    $('#atlas-step-counter').textContent=`${state.step+1} / ${item.steps.length}`;
    $('#atlas-prev-step').disabled=state.step===0;
    $('#atlas-next-step').innerHTML=(state.step===item.steps.length-1?'Replay chain':'Next link')+icon(state.step===item.steps.length-1?'repeat':'arrow');
  }
  function chooseStep(index) {
    const item=byId.get(state.id);state.step=index;renderStep();
    if(item.steps[index].media?.length)chooseImage(item.steps[index].media[0].src);
    else if(item.key==='metric'&&index===1)chooseImage('assets/atlas/stool_mask_focus.webp');
    else chooseImage(item.media[Math.min(index,item.media.length-1)].src);
  }
  function renderLedger(item) {
    const ledgers={
      metric:[['Operands','White stool + adult toilet'],['Readout','Minimum 0.85935 m; robust near 0.86360 m'],['Later proposals','0.86 m → 0.10 m → 0.86 m']],
      mural:[['Source roles','Target in photo 3; observer in photo 1'],['Camera-frame point','Approximately (2.70, −1.00, −2.96)'],['Final relation','Behind / negative forward component']],
      monitors:[['Selection','10 views from the same 32-frame bank'],['Inventory','8 accepted sightings → 2 identities'],['Later agreement','Draft 2; independent reinspection 2']],
      temporal:[['Early sightings','Plant 0 s; blanket 17.6 s'],['Later sightings','Trash can 128.9 s; microwave 152.3 s'],['Review','82 s microwave candidate not established']],
      depth:[['Question anchor','Ladder depth: 2.1 m'],['Source depths','Ladder 0.31545; whiteboard 0.76518'],['Recorded calculation','5.0939 m → final 5.1 m']],
      shower:[['Semantic roles','Bin / shower position / towel-facing'],['Source operation','Retrieve observer and action landmarks'],['Later answer','Left in the person-defined frame']],
      sofa:[['Continuity','5 source-linked observation notes'],['Context delivery','10 originals delivered; 6 entries restored'],['Later proposals','C → D → C / front-left']],
      telephone:[['Review context','7 originals explicitly requested'],['Closure reserve','2 optional note packets deferred'],['Later proposals','Apple → telephone → telephone']],
      keyboards:[['Identities','Telephone, adjacent, rear workstations'],['Later proposals','5 → 3 → 3'],['Final inventory','3 physical keyboards']],
      delivery:[['Question frame','At the bed, facing the TV'],['Changed handoff','Requested originals enter the next context'],['Later proposals','Both support front-left']],
      signs:[['Source evidence','Original assembly + saved detail crops'],['Earlier execution','Final 2 despite a review alternative of 3'],['Later proposals','3 → 3 → 3 left-pointing signs']],
      doors:[['Retained instances','Two wooden doorways'],['Excluded instance','White equipment cabinet'],['Later proposals','3 → 2 → 2']],
      pillow:[['Observed objects','Couch pillows already recognized'],['Question contract','Concise category name'],['Generation','pillows → pillow / native EM 0 → 1']],
      towel:[['Source roles','Towel in photo 3; range from camera 1'],['Recorded range','0.92416 m'],['Later proposals','0.9 m → 1.5 m → 0.9 m']]
    };
    $('#atlas-evidence-ledger').innerHTML=`<div class="ledger-heading">${icon('link')}<span>Recorded evidence anchors</span></div><dl>${ledgers[item.key].map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
  }
  function renderComparison(item) {
    const c=item.comparison;
    const beforeTitle=c?.before_title||'Earlier recorded execution';
    const afterTitle=c?.after_title||'Later evidence-supported execution';
    const beforeBody=c?.before_text||`The earlier execution returns ${shortAnswer(item.before)}. Compare the evidence path to see the link examined in this analysis.`;
    const afterBody=c?.after_text||`The later execution returns ${shortAnswer(item.after)}. ${item.observed||item.takeaway}`;
    const changeTitle=c?.change_title||item.tag;
    const changeBody=c?.change_text||(item.control?item.control.lever:item.evolution?item.evolution.artifact:item.steps[1].body);
    $('#atlas-comparison').innerHTML=`<div class="compare-arms"><section class="compare-arm"><span class="micro-label">EARLIER EXECUTION</span><div class="compare-answer">${esc(shortAnswer(item.before))}</div><h4>${esc(beforeTitle)}</h4><p>${esc(beforeBody)}</p><button type="button" class="arm-media-button" data-arm="before">${icon('eye')} Inspect sources</button></section><section class="compare-arm after"><span class="micro-label">IMPROVED EXECUTION</span><div class="compare-answer">${esc(shortAnswer(item.after))}</div><h4>${esc(afterTitle)}</h4><p>${esc(afterBody)}</p><button type="button" class="arm-media-button" data-arm="after">${icon('eye')} Inspect sources</button></section></div><div class="compare-change">${icon('tool')}<div><h4>${esc(changeTitle)}</h4><p>${esc(changeBody)}</p></div></div>`;
  }
  function renderInsight(item) {
    let html='';
    if(item.evolution) {
      const e=item.evolution;
      html=`<p class="insight-kicker">FROM EXECUTION FEEDBACK TO A RETAINED METHOD</p><h4>${esc(e.method)}</h4><p>${esc(e.diagnosis)}</p><div class="artifact-card"><span class="micro-label">RETAINED STRUCTURAL CHANGE</span><h5>${esc(e.artifact)}</h5><ul>${e.fields.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></div><div class="study-check"><span>${esc(e.check_title)}</span><strong>${esc(e.check_value)}</strong><p>${esc(e.check_note)}</p><p>${esc(e.case_result)}</p></div>`;
    } else if(item.control) {
      const c=item.control;
      html=`<p class="insight-kicker">HISTORICAL PAIRED DESIGN CONTROL</p><h4>${esc(c.lever)}</h4><div class="held-fixed"><span class="micro-label">SHARED CONDITIONS</span><div class="fixed-pills">${c.fixed.split('|').map(v=>`<span>${esc(v.trim())}</span>`).join('')}</div></div><div class="compare-arms"><section class="compare-arm"><span class="micro-label">CONTROL</span><h4>${esc(c.left_title)}</h4><p>${esc(c.left_text)}</p></section><section class="compare-arm after"><span class="micro-label">CHANGED DECISION</span><h4>${esc(c.right_title)}</h4><p>${esc(c.right_text)}</p></section></div><p class="control-outcome">${esc(c.observable)}</p>`;
    } else {
      const category=categories.get(item.category);
      html=`<p class="insight-kicker">${esc(category.label.toUpperCase())} / DESIGN RATIONALE</p><h4>${esc(item.tag)}</h4><p>${esc(item.takeaway)}</p><div class="artifact-card"><span class="micro-label">THE PRACTICE MADE VISIBLE</span><h5>${esc(item.category==='B'?'Maintain the evidence connection':item.category==='C'?'Repair the link behind the earlier error':item.capability?.[1]||item.tag)}</h5><p>${esc(item.comparison?.change_text||item.steps[1].body)}</p></div><div class="lens-discussion"><span class="micro-label">WHAT TO LOOK FOR IN THE CASE</span><p>${esc(item.category==='B'?'Follow the provenance, identity, and interpretation of each intermediate result. The key operation is the link between outputs, not the presence of the outputs alone.':item.category==='C'?'Read the earlier outcome together with the changed decision and later evidence. The paired example makes the repaired interface, interpretation, or review step visible.':'Relate the final answer to the specific observations and quantities that support it. A reusable capability includes both acquiring a result and interpreting it under the question\'s conditions.')}</p></div><div class="study-check"><span>RECORDED CASE OUTCOME</span><strong>${esc(shortAnswer(item.after))}</strong><p>${esc(item.metric)} · Reference: ${esc(shortAnswer(item.reference))}</p></div>`;
    }
    $('#atlas-insight').innerHTML=html;
  }
  function instrument(title,body,note='') {
    return `<div class="instrument"><div class="instrument-title">${icon('target')} ${title}</div>${body}${note?`<p>${note}</p>`:''}</div>`;
  }
  function renderSpecial(item) {
    let html='';
    if(item.key==='metric') {
      html=instrument('Inspect the region-to-source binding',`<div class="mask-compare" id="mask-compare" style="--reveal:50%"><img src="assets/atlas/stool_rgb.webp" alt="Original stool image"><img class="mask-overlay" src="assets/atlas/stool_mask_focus.webp" alt="SAM3 candidate overlay on the same image"><span class="mask-divider" aria-hidden="true"></span></div><div class="mask-control"><label for="mask-reveal">Reveal mask</label><input type="range" id="mask-reveal" min="0" max="100" value="50"><output for="mask-reveal" id="mask-output">50%</output></div>`,'Drag to compare the same source before and after the candidate-mask overlay. This is a tool visualization, not two different executions.');
    } else if(item.key==='temporal') {
      html=instrument('Follow the first documented sightings',`<div class="timeline-picker" role="group" aria-label="Inspect sampled event times">${[['Plant','0','temporal_plant'],['Blanket','17.6','temporal_blanket'],['Trash can','128.9','temporal_trash_can'],['Microwave','152.3','temporal_microwave']].map(([label,time,name],i)=>`<button type="button" data-event-image="${name}" aria-pressed="${i===0}"><strong>${time} s</strong><span>${label}</span></button>`).join('')}</div>`,'Click a timestamp to inspect its original frame. These are first documented sampled sightings, not continuous-video onset times.');
    } else if(item.key==='depth') {
      html=instrument('A numeric readout with the right semantics','<div class="numeric-readout">2.1 × 0.76518 / 0.31545<br>= <strong>5.0939 m</strong></div><details class="readout-details"><summary>Where do these quantities come from?</summary><p>2.1 m is the supplied ladder-depth anchor. The saved source-view reconstruction depths are 0.31545 for the ladder and 0.76518 for the whiteboard. The answer rounds to 5.1 m; reference: 4.9 m.</p></details>');
    } else if(item.key==='shower') {
      html=instrument('Inspect the three semantic roles',`<div class="role-strip" role="group" aria-label="Inspect observer-relative roles">${[['Target','Garbage can','bin_close'],['Position','Shower','shower_close'],['Facing','Towels','towels_close']].map(([role,name,src])=>`<button type="button" data-role-image="${src}" aria-pressed="false"><small>${role}</small><strong>${name}</strong></button>`).join('')}</div>`,'Click a role to inspect its source crop. Together they define the requested observer frame.');
    } else if(item.key==='sofa') {
      html=instrument('Memory and delivery stay connected','<div class="instrument-badges"><div><strong>5</strong><span>source-linked notes</span></div><div><strong>10</strong><span>originals delivered</span></div><div><strong>6</strong><span>missing entries restored</span></div></div>','The recorded intervention also reserves capacity for drafting, review, and reconciliation.');
    } else if(item.key==='signs') {
      html=instrument('Zoom into the evidence that sets the count',`<div class="sign-inspect" role="group" aria-label="Inspect sign details">${[['Original','signs_original'],['Arrow detail A','signs_crop0'],['Arrow detail B','signs_crop2']].map(([label,src],i)=>`<button type="button" data-detail-image="${src}" aria-pressed="${i===0}">${label}</button>`).join('')}</div>`,'These detail images are regenerated from the saved crop boxes on the original sign assembly.');
    } else if(['telephone','keyboards','doors'].includes(item.key)) {
      const values={telephone:['apple','telephone','telephone'],keyboards:['5','3','3'],doors:['3','2','2']}[item.key];
      html=instrument('Later execution / proposal sequence',`<div class="proposal-track">${values.map((v,i)=>`${i?icon('arrow'):''}<span><small>${['Draft','Reinspect','Reconcile'][i]}</small>${v}</span>`).join('')}</div>`,'The later trajectory may revise an initial proposal. The final answer is checked against the sources.');
    } else if(item.key==='monitors') {
      html=instrument('Sightings grouped into physical instances','<div class="numeric-readout">{s1, s2, s4, s5, s7} → <strong>Monitor A</strong><br>{s3, s6, s8} → <strong>Monitor B</strong></div>','Eight accepted sightings support two object hypotheses. Repeated observations contribute support, not additional objects.');
    } else if(item.key==='mural') {
      html=instrument('Keep the requested camera frame','<div class="numeric-readout">Target XYZ ≈ (2.70, −1.00, −2.96)<br>Negative forward component → <strong>behind</strong></div>','The target is grounded in photo 3 and read in the original camera-1 frame.');
    } else if(item.key==='towel') {
      html=instrument('Use the camera-to-target quantity','<div class="numeric-readout">Camera-1 range: <strong>0.92416 m</strong><br>Final: 0.9 m · Reference: 1.0 m</div>','The recovered source query refers to the red-point towel in photo 3, measured from camera 1.');
    } else if(item.key==='delivery') {
      html=instrument('A successful request must reach the context','<div class="proposal-track"><span><small>Request</small>Original IDs</span>'+icon('arrow')+'<span><small>Delivery</small>API images</span>'+icon('arrow')+'<span><small>Use</small>Viewpoint claim</span></div>','Explanatory handoff diagram. The changed source-focus rule uses requested originals as the next API attachments.');
    } else if(item.key==='pillow') {
      html=instrument('Preserve observation detail; match the answer type','<div class="proposal-track"><span><small>Observation</small>pillows</span>'+icon('arrow')+'<span><small>Question</small>category</span>'+icon('arrow')+'<span><small>Answer</small>pillow</span></div>','Recognition stays the same. The difference is the generation-time semantic contract.');
    }
    $('#atlas-special').innerHTML=html;
  }
  function renderSourceModal() {
    const m=pool[state.source];$('#source-dialog-title').textContent=`${state.id} · Source inspector`;
    $('#source-dialog-image').src=m.src;$('#source-dialog-image').alt=m.caption;
    $('#source-dialog-caption').textContent=m.caption;
    $('#source-dialog-count').textContent=`${state.source+1} / ${pool.length}`;
  }
  function moveCase(direction) {
    if(!filtered.length)return;
    const index=filtered.findIndex(c=>c.id===state.id);
    selectCase(filtered[(index+direction+filtered.length)%filtered.length].id,{scroll:true});
  }
  $('#atlas-filters').addEventListener('click',event=>{
    const b=event.target.closest('[data-atlas-filter]');if(!b)return;
    state.theme=b.dataset.atlasFilter;applyFilter({keepSelection:false});if(filtered.length)updateHash();$(`[data-atlas-filter="${state.theme}"]`).focus({preventScroll:true});
  });
  $('#atlas-search').addEventListener('input',event=>{state.query=event.target.value;applyFilter();});
  $('#atlas-reset').addEventListener('click',()=>{state.theme='all';state.query='';$('#atlas-search').value='';applyFilter({keepSelection:false});$('#atlas-search').focus();});
  $('#atlas-cards').addEventListener('click',event=>{const b=event.target.closest('[data-atlas-case]');if(b)selectCase(b.dataset.atlasCase,{scroll:true});});
  $$('[data-atlas-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.atlasMode)));
  $('#atlas-chain').addEventListener('click',event=>{const b=event.target.closest('[data-atlas-step]');if(b)chooseStep(Number(b.dataset.atlasStep));});
  $('#atlas-prev-step').addEventListener('click',()=>{if(state.step>0)chooseStep(state.step-1);});
  $('#atlas-next-step').addEventListener('click',()=>chooseStep((state.step+1)%byId.get(state.id).steps.length));
  $('#atlas-thumbs').addEventListener('click',event=>{const b=event.target.closest('[data-atlas-source]');if(b){state.source=Number(b.dataset.atlasSource);renderSource();}});
  $('#atlas-special').addEventListener('input',event=>{if(event.target.id==='mask-reveal'){$('#mask-compare').style.setProperty('--reveal',`${event.target.value}%`);$('#mask-output').textContent=`${event.target.value}%`;}});
  $('#atlas-special').addEventListener('click',event=>{
    const b=event.target.closest('[data-event-image],[data-role-image],[data-detail-image]');if(!b)return;
    const key=b.dataset.eventImage?'eventImage':b.dataset.roleImage?'roleImage':'detailImage';
    chooseImage(`assets/atlas/${b.dataset[key]}.webp`);
    [...b.parentNode.querySelectorAll('button')].forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  });
  $('#atlas-comparison').addEventListener('click',event=>{
    const b=event.target.closest('[data-arm]');if(!b)return;
    const item=byId.get(state.id),sources=item.comparison?.[`${b.dataset.arm}_media`]||item.media;
    chooseImage(sources[0].src);toast(`${b.dataset.arm==='before'?'Earlier':'Later'} source selected in the inspector.`);
  });
  $('#atlas-prev-case').addEventListener('click',()=>moveCase(-1));$('#atlas-next-case').addEventListener('click',()=>moveCase(1));
  $('#atlas-expand-source').addEventListener('click',()=>{dialogOrigin=document.activeElement;renderSourceModal();modal.showModal();document.body.style.overflow='hidden';});
  $('#close-source-dialog').addEventListener('click',()=>modal.close());
  $('#source-dialog-prev').addEventListener('click',()=>{state.source=(state.source-1+pool.length)%pool.length;renderSource();});
  $('#source-dialog-next').addEventListener('click',()=>{state.source=(state.source+1)%pool.length;renderSource();});
  modal.addEventListener('close',()=>{document.body.style.overflow='';dialogOrigin?.focus({preventScroll:true});});
  modal.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();$('#source-dialog-next').click();}else if(event.key==='ArrowLeft'){event.preventDefault();$('#source-dialog-prev').click();}});
  modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}});
  $('#atlas-copy-link').addEventListener('click',async()=>{
    updateHash();const link=location.href;
    try {
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(link);
      else {const t=document.createElement('textarea');t.value=link;t.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.append(t);t.select();const copied=document.execCommand('copy');t.remove();if(!copied)throw new Error('Clipboard unavailable');$('#atlas-copy-link').focus({preventScroll:true});}
      toast(location.protocol==='file:'?'Local case link copied; it works with the same local files.':'Case link copied.');
    }catch(_){toast('Case selected in the address bar. Copy its address to share.');}
  });
  function fromHash(scroll) {
    const match=location.hash.match(/^#case-([A-E][1-5])$/);if(!match||!byId.has(match[1]))return false;
    state.theme=byId.get(match[1]).category;state.query='';$('#atlas-search').value='';state.id=match[1];state.step=0;state.source=0;state.mode=defaultMode(byId.get(state.id));applyFilter();if(scroll)jumpToReader();return true;
  }
  window.addEventListener('hashchange',()=>fromHash(true));
  if(!fromHash(false))applyFilter();
  else window.addEventListener('load',()=>jumpToReader(),{once:true});
})();
