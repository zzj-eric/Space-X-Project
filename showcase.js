(() => {
  'use strict';
  const data = window.SPACE_X_RESEARCH;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  if (!data || !$('#capability-stage')) return;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const fmt = value => Number(value).toFixed(2);
  const signed = value => `${value < 0 ? '\u2212' : '+'}${fmt(Math.abs(value))}`;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palette = {viewspatial:'#267fa6',spar:'#7456a5',mmsi:'#148179',vsi:'#a95e37'};
  const benchIcons = {viewspatial:'target',spar:'cube',mmsi:'link',vsi:'clock'};
  let model = data.models[0].id;
  let format = 'relative';
  let focused = true;
  let benchmark = 'viewspatial';
  let selectedIndex = 0;
  let timer = null;
  let visualMode = 'evidence';

  function rangeFor(before, after) {
    if (!focused) return {min:0,max:100};
    const low = Math.min(before,after), high = Math.max(before,after);
    const pad = Math.max(2.5,(high-low)*.12);
    return {min:Math.max(0,Math.floor((low-pad)/5)*5),max:Math.min(100,Math.ceil((high+pad)/5)*5)};
  }

  function trajectory(before,after,range,accent,id) {
    const x0=55,x1=244,top=19,bottom=140;
    const y=value=>bottom-(value-range.min)/(range.max-range.min)*(bottom-top);
    const a=y(before),b=y(after),mid=(range.min+range.max)/2;
    const ticks=[range.max,mid,range.min];
    return `<svg class="score-trajectory" viewBox="0 0 280 165" role="img" data-axis-min="${range.min}" data-axis-max="${range.max}" aria-label="Benchmark score: ${fmt(before)} before, ${fmt(after)} with Space-X. Axis ${range.min} to ${range.max}.">
      <defs><linearGradient id="${id}-line" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#9bb6c5"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${accent}"/></linearGradient><linearGradient id="${id}-area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${accent}" stop-opacity=".18"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map(t=>`<path d="M38 ${y(t)}H260" class="trajectory-grid"/><text x="27" y="${y(t)+3}" text-anchor="end">${Number.isInteger(t)?t:t.toFixed(1)}</text>`).join('')}
      <path d="M${x0} ${a}L${x1} ${b}V${a}Z" fill="url(#${id}-area)"/>
      <path d="M${x0} ${a}H${x1}" class="trajectory-baseline"/>
      <path d="M${x0} ${a}L${x1} ${b}" stroke="url(#${id}-line)" class="trajectory-rise" pathLength="1"/>
      <circle cx="${x0}" cy="${a}" r="5" class="trajectory-start"/>
      <circle cx="${x1}" cy="${b}" r="12" fill="${accent}" opacity=".12" class="trajectory-halo"/>
      <circle cx="${x1}" cy="${b}" r="5.5" fill="${accent}" stroke="#f3f8fb" stroke-width="2"/>
      <text x="${x0}" y="160" text-anchor="middle">Model alone</text><text x="${x1}" y="160" text-anchor="middle">Space-X</text>
    </svg>`;
  }

  function renderScores() {
    $('#research-scorecards').innerHTML=data.benchmarks.map(bench=>{
      const pair=data.pairs[model][bench.id];
      const before=pair.baseline.score,after=pair.spacex.score;
      const range=rangeFor(before,after),accent=palette[bench.id];
      const value=format==='relative'?pair.relativeGain:pair.delta;
      return `<article class="performance-panel" data-benchmark="${bench.id}" style="--accent:${accent}">
        <div class="performance-top"><h3>${escape(bench.name)}</h3>${icon(benchIcons[bench.id])}</div>
        <div class="performance-titleline">${bench.id==='vsi'?'<span class="video-frame-pill">10 initial frames</span>':escape(bench.description)}</div>
        <div class="performance-gain"><strong>${signed(value)}</strong><span>${format==='relative'?'%':'pts'}</span></div>
        <span class="performance-unit">${format==='relative'?'relative improvement':'score improvement'}</span>
        ${trajectory(before,after,range,accent,`score-${bench.id}`)}
        <div class="performance-values"><span>${fmt(before)}</span>${icon('arrow')}<strong>${fmt(after)}</strong></div>
        <div class="performance-axis">${focused?'Focused':'Full'} score scale ${range.min}\u2013${range.max}</div>
      </article>`;
    }).join('');
    $$('[data-research-model]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.researchModel===model)));
    $$('[data-gain-format]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.gainFormat===format)));
    $('#research-live').textContent=`${data.models.find(m=>m.id===model).label}: `+data.benchmarks.map(b=>`${b.name} ${fmt(data.pairs[model][b.id].spacex.score)}`).join(', ');
    renderCapability();
  }

  function tasks() {
    return [...data.subtasks[model][benchmark]].filter(task=>task.relativeGain>10).sort((a,b)=>b.delta-a.delta);
  }

  function tag(iconName,text) {return `<span>${icon(iconName)}${escape(text)}</span>`;}
  function tile(src,caption,className='') {return `<figure class="evidence-tile ${className}"><img src="assets/atlas/${src}.webp" alt="${escape(caption)}" loading="eager"><figcaption>${escape(caption)}</figcaption></figure>`;}
  function scene(task) {
    const on=visualMode==='evidence';
    if(benchmark==='viewspatial') return `<div class="spatial-stage scene-${on?'bound':'raw'}">
      <div class="scene-grid" aria-hidden="true"></div>
      ${tile('mural_1','Reference view','scene-tile-a')}${tile('mural_3','Target view','scene-tile-b')}
      <div class="frame-compass" aria-hidden="true"><svg viewBox="0 0 220 180"><path d="M34 146 104 106 190 148 122 178Z" class="compass-ground"/><path d="M104 106V22M104 106 190 148M104 106 34 146" class="compass-axes"/><path d="m99 31 5-9 5 9m171 146 10 2-5-9M42 137l-8 9 11-1" class="compass-axes"/><text x="112" y="25">Y</text><text x="188" y="137">X</text><text x="24" y="141">Z</text><path d="M104 106 56 65" class="scene-evidence-link"/><circle cx="56" cy="65" r="8" class="target-point"/><circle cx="104" cy="106" r="5" fill="#487082"/></svg></div>
      <div class="scene-link-label">${icon('target')} ${on?'One shared reference frame':'Two visual perspectives'}</div>
      <div class="scene-tags">${tag('eye','See')}${tag('cube','Align')}${tag('check','Reason')}</div>
    </div>`;
    if(benchmark==='spar' || (benchmark==='vsi' && ['absolute-distance','object-size','room-size','relative-distance'].includes(task.id)))return `<div class="geometry-stage"><div class="scene-grid" aria-hidden="true"></div>
      ${tile(on?'stool_mask_focus':'stool_rgb',on?'Object region':'Original image','geometry-tile-a')}
      ${tile(on?'stool_depth_luminous':'toilet_rgb',on?'Depth & scale':'Second object','geometry-tile-b')}
      <div class="geometry-cloud"><img src="assets/metric-cloud-light.svg" alt="Recorded shared geometry of two object surfaces"><span class="geometry-measure">${icon('cube')} Geometry becomes evidence</span></div>
      <div class="scene-tags">${tag('target','Bind')}${tag('cube','Measure')}${tag('link','Connect')}</div>
    </div>`;
    if(benchmark==='mmsi')return `<div class="multiview-stage"><div class="scene-grid" aria-hidden="true"></div>
      <div class="multiview-tiles">${tile('sofa_1','View A')}${tile('sofa_2','View B')}${tile('sofa_3','View C')}</div>
      <svg class="multiview-links" viewBox="0 0 500 170" aria-hidden="true"><path d="M83 0C83 85 250 30 250 92M250 0V92M417 0C417 85 250 30 250 92" class="scene-evidence-link"/><circle cx="250" cy="92" r="31" class="memory-node"/><path d="M239 81h22v22h-22Zm5-9v9m12-9v9m-12 22v9m12-9v9m-26-21h9m22 0h9m-40 12h9m22 0h9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M250 123V165" class="scene-evidence-link"/></svg>
      <div class="multiview-conclusion">${icon('link')}${on?'Partial views. One connected answer.':'Three views of the same space.'}</div>
      <div class="scene-tags">${tag('eye','Observe')}${tag('memory','Remember')}${tag('link','Associate')}</div>
    </div>`;
    if(task.id==='routes')return `<div class="route-stage"><div class="scene-grid" aria-hidden="true"></div>
      <div class="route-views">${tile('sofa_1','Scene view')}${tile('sofa_3','Destination view')}</div>
      <svg class="route-map" viewBox="0 0 460 220" role="img" aria-label="Illustration of a spatial route connected across observations">
        <path d="M48 171 208 57 407 130 248 213Z" class="route-floor"/>
        <path d="M48 171V104L208 3 407 77V130M208 3V57" class="route-walls"/>
        <path d="m86 120 42-29 58 21-43 31Zm177-29 39-25 62 23-37 26Z" class="route-furniture"/>
        <path d="m103 159 69 24 77-55 43 16 52-34" class="route-underlay"/>
        <path d="m103 159 69 24 77-55 43 16 52-34" class="route-path" pathLength="1"/>
        <circle cx="103" cy="159" r="7" class="route-origin"/><circle cx="344" cy="110" r="9" class="route-target"/>
        <text x="72" y="185">Start</text><text x="353" y="106">Goal</text>
        <path d="m324 112 20-2-7 19" class="route-arrow"/>
      </svg>
      <div class="route-caption">${icon('link')}${on?'A route built from connected views.':'Recognize the place. Find the destination.'}</div>
      <div class="scene-tags">${tag('eye','Locate')}${tag('memory','Link views')}${tag('arrow','Navigate')}</div>
    </div>`;
    if(task.id==='relative-direction')return `<div class="direction-stage"><div class="scene-grid" aria-hidden="true"></div>
      ${tile('shower_1','Observer position','direction-tile-a')}${tile('towel_1','Facing landmark','direction-tile-b')}
      <div class="direction-dial"><svg viewBox="0 0 240 165" role="img" aria-label="Illustration of target direction relative to observer position and facing">
        <ellipse cx="120" cy="104" rx="94" ry="44" class="direction-plane"/>
        <path d="M27 104H213M120 147V59" class="direction-grid"/>
        <path d="M120 104 120 26m-6 9 6-9 6 9" class="direction-facing"/>
        <path d="M120 104 49 76m4 10-4-10 11 1" class="direction-target"/>
        <circle cx="120" cy="104" r="9" class="route-origin"/>
        <text x="128" y="25">Facing</text><text x="15" y="67">Target</text><text x="127" y="128">Observer</text>
      </svg></div>
      <div class="scene-tags">${tag('target','Position')}${tag('eye','Facing')}${tag('link','Direction')}</div>
    </div>`;
    const counting=task.id==='counting';
    if(counting)return `<div class="count-stage"><div class="scene-grid" aria-hidden="true"></div>
      ${tile('monitors_partial','Partial observation','count-tile-a')}${tile('monitors_pair','Both physical instances','count-tile-b')}
      <div class="instance-readout"><span class="instance-dot">A</span><span class="instance-dot">B</span><span>Link sightings.<br>Count instances.</span></div>
      <div class="scene-tags">${tag('eye','Find')}${tag('link','Match')}${tag('check','Count')}</div>
    </div>`;
    return `<div class="video-stage"><div class="scene-grid" aria-hidden="true"></div><div class="video-filmstrip">${tile('temporal_plant_crop','Plant')}${tile('temporal_blanket_crop','Blanket')}${tile('temporal_trash_can_crop','Bin')}${tile('temporal_microwave_crop','Microwave')}</div>
      <div class="video-track" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="video-sweep"></span></div>
      <div class="video-connection">${icon('clock')} ${on?'Connect the moments that matter.':'Sparse views across time.'}</div>
      <div class="scene-tags">${tag('clock','Time')}${tag('memory','Memory')}${tag('link','Relations')}</div>
    </div>`;
  }

  function shortName(task) {
    return task.name.replace('Object orientation · camera view','Camera-view orientation')
      .replace('Object orientation · person view','Person-view orientation')
      .replace('Middle · matching & viewpoints','Matching & viewpoints')
      .replace('High · spatial imagination','Spatial imagination')
      .replace('Low · spatial perception','Spatial perception');
  }

  function renderCapability() {
    const rail=$('#capability-task-rail');
    const railScroll=rail.scrollLeft;
    const railHadFocus=rail.contains(document.activeElement);
    const layerFocus=document.activeElement?.dataset.capabilityLayer;
    const rows=tasks();selectedIndex=((selectedIndex%rows.length)+rows.length)%rows.length;
    const task=rows[selectedIndex],accent=palette[benchmark];
    const name=data.benchmarks.find(b=>b.id===benchmark).name;
    // Point differences anchor the large display. Relative percentages remain
    // explicit and unmodified, including comparisons with small baselines.
    $('#capability-stage').innerHTML=`<div class="capability-canvas" data-active-subtask="${benchmark}:${task.id}" style="--accent:${accent}">
      <div class="capability-visual" data-layer="${visualMode}"><div class="visual-topline"><span>${icon(benchIcons[benchmark])} EVIDENCE IN ACTION</span><div role="group" aria-label="Illustrative evidence layers"><button type="button" data-capability-layer="sources" aria-pressed="${! (visualMode==='evidence')}">Views</button><button type="button" data-capability-layer="evidence" aria-pressed="${visualMode==='evidence'}">Connections</button></div></div>${scene(task)}<span class="scene-caption">Illustrative evidence view</span></div>
      <div class="capability-impact"><div class="capability-bench-label">${escape(name)}<span>${escape(data.models.find(m=>m.id===model).label)}</span></div><h4>${escape(shortName(task))}</h4>
        <div class="capability-big-gain"><strong>${signed(task.delta)}</strong><span>pts</span></div>
        <span class="capability-relative">${signed(task.relativeGain)}% relative improvement</span>
        <div class="capability-score-shift"><div><span>Model alone</span><strong>${fmt(task.baseline)}</strong></div>${icon('arrow')}<div><span>Space-X</span><strong>${fmt(task.spacex)}</strong></div></div>
        <a href="#case-atlas" class="capability-case-link">See the evidence ${icon('diagonal')}</a>
      </div>
    </div>`;
    $('#capability-task-rail').innerHTML=rows.map((row,i)=>`<button type="button" data-highlight-index="${i}" aria-pressed="${i===selectedIndex}"><span>${escape(shortName(row))}</span><strong>${signed(row.delta)}<small>pts</small></strong></button>`).join('');
    rail.scrollLeft=railScroll;
    if(railHadFocus)rail.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
    if(layerFocus)document.querySelector(`[data-capability-layer="${layerFocus}"]`)?.focus({preventScroll:true});
    $('#capability-counter').textContent=`${String(selectedIndex+1).padStart(2,'0')} / ${String(rows.length).padStart(2,'0')}`;
    $$('[data-subtask-benchmark]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.subtaskBenchmark===benchmark)));
    $$('[data-highlight-index]').forEach(button=>button.addEventListener('click',()=>{stop();selectedIndex=Number(button.dataset.highlightIndex);renderCapability();}));
    $$('[data-capability-layer]').forEach(button=>button.addEventListener('click',()=>{visualMode=button.dataset.capabilityLayer;renderCapability();}));
  }

  function stop() {
    clearInterval(timer);timer=null;
    $('#capability-play').setAttribute('aria-pressed','false');
    $('#capability-play').innerHTML=icon('play')+'<span>Play highlights</span>';
  }
  $$('[data-research-model]').forEach(button=>button.addEventListener('click',()=>{stop();model=button.dataset.researchModel;selectedIndex=0;renderScores();}));
  $$('[data-gain-format]').forEach(button=>button.addEventListener('click',()=>{format=button.dataset.gainFormat;renderScores();}));
  $('#research-focus-scale').addEventListener('change',event=>{focused=event.target.checked;renderScores();});
  $('#results-replay').addEventListener('click',renderScores);
  $$('[data-subtask-benchmark]').forEach(button=>button.addEventListener('click',()=>{stop();benchmark=button.dataset.subtaskBenchmark;selectedIndex=0;renderCapability();}));
  $('#capability-prev').addEventListener('click',()=>{stop();selectedIndex--;renderCapability();});
  $('#capability-next').addEventListener('click',()=>{stop();selectedIndex++;renderCapability();});
  $('#capability-play').addEventListener('click',()=>{
    if(timer){stop();return;}
    $('#capability-play').setAttribute('aria-pressed','true');
    $('#capability-play').innerHTML=icon('repeat')+'<span>Pause highlights</span>';
    timer=setInterval(()=>{selectedIndex++;renderCapability();},4200);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  motion.addEventListener('change',()=>{if(motion.matches)stop();});
  renderScores();
  // Replay the score animation once when it enters the viewport.
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){$('#research-scorecards').classList.add('is-in-view');observer.disconnect();}},{threshold:.15});observer.observe($('#research-scorecards'));}
})();
