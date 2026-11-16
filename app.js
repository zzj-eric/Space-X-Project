(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const svgNS = 'http://www.w3.org/2000/svg';
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // These points and endpoints come from the preserved projection NPZ.
  // Scaling is uniform; the browser performs no reconstruction or measurement.
  const points = window.SPACE_X_POINTS;
  function makeSvg(tag, attributes, parent) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    parent.appendChild(element);
    return element;
  }
  if (points) {
    const all = [...points.stool, ...points.toilet];
    const minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0]));
    const minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
    const scale = Math.min(380 / (maxX-minX), 155 / (maxY-minY));
    const project = (point) => [280 + (point[0]-(minX+maxX)/2)*scale, 102-(point[1]-(minY+maxY)/2)*scale];
    [['stool','#point-cloud-a','#148f81'],['toilet','#point-cloud-b','#8664b6']].forEach(([key, selector, color]) => {
      points[key].forEach((p, i) => {
        const [cx,cy] = project(p);
        makeSvg('circle',{cx:cx.toFixed(2),cy:cy.toFixed(2),r:i%7===0?1.5:1,fill:color,opacity:i%4===0?.95:.65},$(selector));
      });
    });
    const a = project(points.endpoint_stool), b = project(points.endpoint_toilet);
    makeSvg('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'url(#metric-line)','stroke-width':1.5,'stroke-dasharray':'4 4'},$('#cloud-measure'));
    [a,b].forEach(p => {makeSvg('circle',{cx:p[0],cy:p[1],r:6,fill:'#fff',stroke:'#186e79','stroke-width':1.4},$('#cloud-measure'));makeSvg('circle',{cx:p[0],cy:p[1],r:2,fill:'#137c80'},$('#cloud-measure'));});
  }

  const layers = {
    rgb: ['stool_rgb','toilet_rgb','Original stool source view','Original toilet source view'],
    mask: ['stool_mask_focus','toilet_mask_focus','Saved SAM3 stool candidate mask','Saved SAM3 toilet candidate mask'],
    depth: ['stool_depth_luminous','toilet_depth_luminous','Saved DA3 stool depth visualization','Saved DA3 toilet depth visualization']
  };
  $$('[data-layer]').forEach(button => button.addEventListener('click', () => {
    $$('[data-layer]').forEach(b => b.setAttribute('aria-pressed',String(b===button)));
    const layer = layers[button.dataset.layer];
    ['a','b'].forEach((suffix,i) => {const img = $(`#hero-source-${suffix}`);img.src=`assets/cases/${layer[i]}.webp`;img.alt=layer[i+2];});
    $$('.target-outline').forEach(frame => frame.hidden = button.dataset.layer !== 'rgb');
  }));

  let currentCase = 'metric', currentStep = 0;
  const visuals = {
    metric: `<img src="assets/metric-cloud-light.svg" alt="Saved projection of stool and toilet candidate point sets"><div class="readout"><span>CLOSEST SURFACE READOUT</span><strong>0.859 m</strong></div>`,
    mural: `<div class="coordinate-view"><svg viewBox="0 0 230 135" role="img" aria-label="Illustration of the target in negative camera-forward Z"><path d="M80 115V13M18 46H202" stroke="#668a9e" stroke-width="1.5" fill="none"></path><path d="m75 20 5-8 5 8m110 21 8 5-8 5" fill="none" stroke="#668a9e" stroke-width="1.5"></path><text x="86" y="20" fill="#507284" font-size="10">+Z / forward</text><text x="205" y="50" fill="#507284" font-size="10">X</text><path d="M80 46 159 107" stroke="#12847c" stroke-dasharray="4 3"></path><circle cx="80" cy="46" r="4" fill="#315e76"></circle><circle cx="159" cy="107" r="5" fill="#12847c"></circle><text x="93" y="126" fill="#12847c" font-size="11">Mural / negative Z</text></svg><div class="coordinate-copy"><span>REQUESTED CAMERA FRAME</span><strong>Behind</strong><span>Target Z ≈ −2.96</span></div></div>`,
    monitors: `<div class="sighting-groups"><div class="sighting-group"><strong>Physical monitor A</strong><div class="sighting-dots">${[1,2,4,5,7].map(n=>`<span>s${n}</span>`).join('')}</div></div>${icon('link')}<div class="sighting-group"><strong>Physical monitor B</strong><div class="sighting-dots">${[3,6,8].map(n=>`<span>s${n}</span>`).join('')}</div></div></div>`,
    sofa: `<div class="memory-relay"><div class="relay-block"><strong>5</strong><span>source-linked notes</span></div>${icon('arrow')}<div class="relay-block"><strong>10</strong><span>originals delivered</span></div>${icon('arrow')}<div class="relay-block"><strong>6</strong><span>missing entries restored</span></div></div>`
  };
  function renderCase() {
    const item = window.SPACE_X_CASES[currentCase], step = item.steps[currentStep];
    $('#case-category').textContent=item.category.toUpperCase();
    $('#case-question').textContent=item.question;
    $('#case-before').textContent=item.before;
    $('#case-after').textContent=item.after;
    $('#case-takeaway').textContent=item.takeaway;
    $('#case-caveat').textContent=item.caveat;
    $('#step-kicker').textContent=step.kicker;
    $('#step-title').textContent=step.title;
    $('#step-body').textContent=step.body;
    $('#step-tokens').innerHTML=step.tokens.map(token=>`<span>${escape(token)}</span>`).join('');
    $('#case-images').innerHTML=step.images.map(([src,caption])=>`<figure><img src="assets/cases/${src}.webp" alt="${escape(caption)}" width="504" height="336"><figcaption>${escape(caption)}</figcaption></figure>`).join('');
    $('#case-visual-detail').innerHTML=visuals[step.visual];
    $('#case-media-caption').textContent=step.caption;
    $('#step-count').textContent=`0${currentStep+1} / 03`;
    $('#next-step').innerHTML=(currentStep===2?'Replay this chain':'Next connection')+' '+icon(currentStep===2?'repeat':'arrow');
    $$('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===currentCase)));
    $$('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===currentStep)));
  }
  $$('[data-case]').forEach(button=>button.addEventListener('click',()=>{currentCase=button.dataset.case;currentStep=0;renderCase();}));
  $$('[data-step]').forEach(button=>button.addEventListener('click',()=>{currentStep=Number(button.dataset.step);renderCase();}));
  $('#next-step').addEventListener('click',()=>{currentStep=(currentStep+1)%3;renderCase();});
  renderCase();

  function renderMemory(key) {
    const m=window.SPACE_X_MEMORIES[key];
    $('#memory-number').textContent=m.number;
    $('#memory-scope').textContent=m.scope;
    $('#memory-title').textContent=m.title;
    $('#memory-description').textContent=m.description;
    $('#memory-effect').textContent=m.effect;
    $('#memory-record').innerHTML='<dl>'+m.record.map(([label,value])=>`<dt>${escape(label)}</dt><dd>${escape(value)}</dd>`).join('')+'</dl>';
    $$('[data-memory]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.memory===key)));
  }
  $$('[data-memory]').forEach(button=>button.addEventListener('click',()=>renderMemory(button.dataset.memory)));
  renderMemory('work');

  let currentFigure='architecture';
  const dialog=$('#figure-dialog');
  function renderFigure(key) {
    currentFigure=key;
    const figure=window.SPACE_X_FIGURES[key];
    $('#paper-figure-image').src=`assets/figures/${key}.webp`;
    $('#paper-figure-image').alt=figure.alt;
    $('#paper-figure-caption').textContent=figure.caption;
    $('#expand-figure').setAttribute('aria-label',`Explore full figure: ${figure.title.toLowerCase()}`);
    $$('[data-figure]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===key)));
  }
  $$('[data-figure]').forEach(button=>button.addEventListener('click',()=>renderFigure(button.dataset.figure)));
  $('#expand-figure').addEventListener('click',()=>{
    const figure=window.SPACE_X_FIGURES[currentFigure];
    $('#dialog-title').textContent=figure.title;
    $('#dialog-image').src=`assets/figures/${currentFigure}.webp`;
    $('#dialog-image').alt=figure.alt;
    $('#dialog-caption').textContent=figure.caption;
    dialog.showModal();document.body.style.overflow='hidden';
  });
  $('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.style.overflow='';$('#expand-figure').focus({preventScroll:true});});

  const menu=$('.menu-button'), nav=$('#main-nav');
  function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
  $$('#main-nav a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  window.addEventListener('resize',()=>{if(window.innerWidth>700)closeMenu();});
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('#main-nav a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-18% 0px -65% 0px'});
    ['vision','evolution','evidence-lab','growth','case-atlas'].forEach(id=>observer.observe(document.getElementById(id)));
    const heroObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){$$('#main-nav a').forEach(link=>link.classList.remove('active'));}},{threshold:.45});
    heroObserver.observe($('#top'));
  }
  // Static animations respect OS reduced-motion settings; no polling or API calls.
})();
