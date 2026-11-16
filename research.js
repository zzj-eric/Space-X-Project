(() => {
  'use strict';
  const data = window.SPACE_X_RESEARCH;
  if (!data || !document.querySelector('#research-scorecards')) return;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const fmt = value => Number(value).toFixed(2);
  const signed = value => `${value < 0 ? '−' : '+'}${fmt(Math.abs(value))}`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ev = data.evolution;
  let currentSample = 9;
  let timer = null;
  const selected = new Set(ev.categories.map(c => c.id));
  const phaseColors = ['#e5edf6','#eee8f5','#e2f0ef','#f1edde'];
  const scoreColors = {viewspatial:'#b4477e',spar:'#355c89'};
  const chartEl = $('#growth-chart');
  let chart = null;
  if (window.echarts) chart = window.echarts.init(chartEl, null, {renderer:'svg'});
  else chartEl.textContent = 'The growth chart is unavailable. The complete recorded scores are in the table below.';

  function phaseAt(position) { return ev.phases.findIndex(p => position <= p.end); }
  function phaseAreas() {
    return ev.phases.map((p,i) => [{xAxis:i ? ev.phases[i-1].end : 0, itemStyle:{color:phaseColors[i]}}, {xAxis:p.end}]);
  }
  function axis(min, max, interval, gridIndex) {
    return {type:'value', min, max, interval, gridIndex, axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{color:'#526d80',fontFamily:'Manrope',fontSize:10},
      splitLine:{show:true,lineStyle:{color:'#cbd9e3',type:'dashed'}}};
  }
  function tooltip(params) {
    if (!Array.isArray(params)) params = [params];
    const valid = params.filter(p => p.data && Array.isArray(p.data));
    if (!valid.length) return '';
    const score = valid.some(p => ['ViewSpatial','SPAR'].includes(p.seriesName));
    const x = valid[0].data[0];
    return `<div style="font:12px Manrope,sans-serif;line-height:1.9;color:#284c62"><b>${score ? 'Recorded evaluation' : 'Optimization progress'} · ${Math.round(x)} / 575</b>${valid.map(p => `<div>${p.marker}${escape(p.seriesName)} <b style="float:right;padding-left:22px">${score ? fmt(p.data[1]) : p.data[1]}</b></div>`).join('')}</div>`;
  }
  function renderGrowth() {
    const point = ev.scores[currentSample];
    const maxPosition = point.position;
    const candidateIndex = Math.floor(maxPosition + 1e-6);
    const row = ev.cumulative[candidateIndex];
    const phase = phaseAt(maxPosition);
    $('#growth-count').textContent = candidateIndex;
    $('#growth-viewspatial').textContent = fmt(point.viewspatial);
    $('#growth-spar').textContent = fmt(point.spar);
    $('#growth-sample-label').textContent = `${currentSample + 1} / 10`;
    $('#growth-sample').value = currentSample;
    $('#growth-sample').setAttribute('aria-valuetext', `Evaluation ${currentSample + 1} of 10, ViewSpatial ${fmt(point.viewspatial)}, SPAR ${fmt(point.spar)}`);
    $('#growth-phase-name').textContent = ev.phases[phase].name;
    $('#growth-phase-copy').textContent = ev.phases[phase].note;
    $$('[data-growth-phase]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.growthPhase) === phase)));
    ev.categories.forEach((c,i) => {
      const b = document.querySelector(`[data-growth-series="${c.id}"]`);
      b.querySelector('b').textContent = row[i+1];
      b.setAttribute('aria-pressed', String(selected.has(c.id)));
    });
    if (!chart) return;
    const narrow = chartEl.clientWidth < 650;
    const topHeight = narrow ? 195 : 235;
    const secondTop = narrow ? 260 : 295;
    const series = ev.categories.map((c,i) => ({
      name:c.name, type:'line', xAxisIndex:0, yAxisIndex:0, smooth:false, showSymbol:false,
      data:selected.has(c.id) ? ev.cumulative.filter(r => r[0] <= candidateIndex).map(r => [r[0],r[i+1]]) : [],
      lineStyle:{width:2.5,color:c.color}, itemStyle:{color:c.color},
      emphasis:{focus:'series',lineStyle:{width:3.5}},
      ...(i === 0 ? {markArea:{silent:true,label:{show:false},data:phaseAreas()},
        markLine:{silent:true,symbol:['none','none'],label:{show:false},lineStyle:{color:'#6b879d',type:'dashed',width:1},data:[{xAxis:maxPosition}]}} : {})
    }));
    for (const [key,name] of [['viewspatial','ViewSpatial'],['spar','SPAR']]) {
      series.push({name,type:'line',xAxisIndex:1,yAxisIndex:1,smooth:false,
        data:ev.scores.slice(0,currentSample+1).map(p => [p.position,p[key]]),
        showSymbol:true,symbol:key === 'spar' ? 'diamond' : 'circle',symbolSize:6,
        lineStyle:{type:'dashed',width:2.5,color:scoreColors[key]},itemStyle:{color:scoreColors[key],borderColor:'#f3f7fa',borderWidth:1.2},
        emphasis:{focus:'series',scale:1.4},
        ...(key === 'viewspatial' ? {markArea:{silent:true,label:{show:false},data:phaseAreas()},
          markLine:{silent:true,symbol:['none','none'],label:{show:false},lineStyle:{color:'#6b879d',type:'dashed',width:1},data:[{xAxis:maxPosition}]}} : {})
      });
    }
    chart.setOption({animation:!reducedMotion.matches,animationDuration:450,animationDurationUpdate:300,
      textStyle:{fontFamily:'Manrope'},aria:{enabled:true},
      tooltip:{trigger:'axis',confine:true,backgroundColor:'#f7fafc',borderColor:'#a5bdce',borderWidth:1,padding:12,formatter:tooltip,extraCssText:'box-shadow:none;border-radius:7px;'},
      grid:[{left:narrow?37:48,right:narrow?16:26,top:18,height:topHeight},
            {left:narrow?37:48,right:narrow?16:26,top:secondTop,height:narrow?118:137}],
      xAxis:[{...axis(0,575,100,0),axisLabel:{show:false},splitLine:{show:false}},
             {...axis(0,575,100,1),name:'Optimization sequence',nameLocation:'middle',nameGap:29,nameTextStyle:{color:'#527083',fontSize:11},splitLine:{show:false}}],
      yAxis:[axis(0,200,50,0),axis(50,80,10,1)],
      axisPointer:{link:[{xAxisIndex:'all'}],label:{backgroundColor:'#416c83'}},
      graphic:[{type:'text',left:narrow?38:49,top:secondTop-28,style:{text:'SPATIAL REASONING PERFORMANCE',fill:'#3e6077',font:'600 10px Manrope'}}],series
    },true);
  }
  $('#growth-legend').innerHTML = ev.categories.map(c => `<button type="button" data-growth-series="${c.id}" aria-pressed="true" style="--series-color:${c.color}"><i aria-hidden="true"></i>${c.name}<b>${c.final}</b></button>`).join('');
  $('#growth-phases').innerHTML = ev.phases.map((p,i) => `<button type="button" data-growth-phase="${i}" aria-pressed="${i===3}">${p.name}</button>`).join('');
  function stopReplay() { clearInterval(timer); timer = null; $('#growth-replay').innerHTML = icon('play') + '<span>Replay evolution</span>'; }
  $('#growth-sample').addEventListener('input', e => { stopReplay(); currentSample = Number(e.target.value); renderGrowth(); });
  $('#growth-reset').addEventListener('click', () => { stopReplay(); currentSample = 9; renderGrowth(); });
  $('#growth-replay').addEventListener('click', () => {
    if (timer) { stopReplay(); return; }
    if (currentSample === 9) currentSample = 0;
    renderGrowth();
    $('#growth-replay').innerHTML = icon('repeat') + '<span>Pause replay</span>';
    timer = setInterval(() => { currentSample++; renderGrowth(); if (currentSample === 9) stopReplay(); }, 850);
  });
  $$('[data-growth-series]').forEach(b => b.addEventListener('click', () => {
    if (selected.has(b.dataset.growthSeries)) selected.delete(b.dataset.growthSeries);
    else selected.add(b.dataset.growthSeries);
    renderGrowth();
  }));
  $$('[data-growth-phase]').forEach(b => b.addEventListener('click', () => {
    stopReplay(); const index = Number(b.dataset.growthPhase);
    const start = index ? ev.phases[index-1].end : 0;
    const choices = ev.scores.map((p,i) => ({...p,index:i})).filter(p => p.position > start && p.position <= ev.phases[index].end);
    currentSample = choices.length ? choices[choices.length-1].index : 0;
    renderGrowth();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopReplay(); });
  if (chart && window.ResizeObserver) new ResizeObserver(() => { chart.resize(); renderGrowth(); }).observe(chartEl);
  else window.addEventListener('resize', () => { if (chart) { chart.resize(); renderGrowth(); } });
  renderGrowth();

  function renderJoint() {
    const index = Number($('#joint-benchmark').value);
    const rows = data.experiments.joint;
    $('#joint-chart').innerHTML = rows.map(r => `<div class="insight-bar-row"><span>${r.name}</span><div class="insight-bar-track"><i style="--value:${r.scores[index]}%"></i></div><b>${fmt(r.scores[index])}</b></div>`).join('');
    $('#joint-gain').textContent = `${signed(rows[3].scores[index] - rows[1].scores[index])} pts`;
  }
  $('#joint-benchmark').addEventListener('change', renderJoint);
  renderJoint();
  $('#memory-proof-trail').innerHTML = data.experiments.memory.map((r,i) => `<div>${fmt(r.delivery)}%<small>${['Flat records','Linked evidence','+ Memory'][i]}</small></div>`).join('');
  function renderAdaptation() {
    const item = data.experiments.adaptation[Number($('#adaptation-model').value)];
    $('#adaptation-scores').innerHTML = data.experiments.benchmarks.map((b,i) => `<div class="adaptation-score-row"><span>${b}</span><b>${fmt(item.before[i])} → ${fmt(item.after[i])}</b><em>${signed(item.after[i]-item.before[i])}</em></div>`).join('');
  }
  $('#adaptation-model').addEventListener('change', renderAdaptation);
  renderAdaptation();
})();
