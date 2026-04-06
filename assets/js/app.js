const state = {
  product: 'wine',
  cond: 'none',
  page: 'landing',
  qIndex: 0,
  answers: {},
  inference: null,
  recs: [],
  selected: null,
  expressiveReasons: [],
  correctiveValues: {},
  log: []
};

const products = {
  wine: {
    brand: 'Wine Shop',
    title: 'Wine recommendations',
    questions: [
      { key:'occasion', title:'What best describes the situation?', options:[
        ['casual','A relaxed, everyday bottle'],
        ['dinner','Something for a dinner or pairing'],
        ['gift','Something that feels a bit more special']
      ]},
      { key:'style', title:'Which general style sounds most like you?', options:[
        ['classic','Classic, familiar, food-friendly'],
        ['adventurous','A bit more adventurous or bold'],
        ['easy','Easygoing and approachable']
      ]},
      { key:'price', title:'How do you usually think about price?', options:[
        ['value','Value first'],
        ['balanced','A balanced choice'],
        ['premium','Premium if it feels worth it']
      ]}
    ],
    catalog: [
      {id:'w1', name:'Valley Pinot Noir', price:'$22', cue:'Balanced red · approachable', tags:{persona:'classic', feel:'balanced', spend:'balanced'}},
      {id:'w2', name:'Riverside Cabernet', price:'$27', cue:'Bold red · dinner-friendly', tags:{persona:'adventurous', feel:'bold', spend:'premium'}},
      {id:'w3', name:'Coastal Sauvignon Blanc', price:'$18', cue:'Fresh white · easygoing', tags:{persona:'easy', feel:'light', spend:'value'}},
      {id:'w4', name:'Harvest Rosé', price:'$20', cue:'Relaxed rosé · versatile', tags:{persona:'easy', feel:'balanced', spend:'balanced'}},
      {id:'w5', name:'Reserve Merlot', price:'$31', cue:'Round red · special meal', tags:{persona:'classic', feel:'bold', spend:'premium'}},
      {id:'w6', name:'Garden White Blend', price:'$16', cue:'Soft white · casual', tags:{persona:'easy', feel:'light', spend:'value'}}
    ],
    expressivePrompt: 'What feels a little off about these suggestions?',
    expressiveOptions: [
      ['occasion','They do not feel quite right for the occasion.'],
      ['price','They feel a bit outside what I had in mind on price.'],
      ['taste','They do not quite match my usual taste.'],
      ['intensity','They feel bolder or lighter than I expected.']
    ],
    correctiveFields: [
      {key:'persona', label:'Which style sounds more like you?', options:[['classic','Classic and familiar'],['adventurous','More adventurous'],['easy','Easygoing and approachable']]},
      {key:'feel', label:'What overall feel sounds closer?', options:[['light','Lighter and easier'],['balanced','Balanced'],['bold','Bolder and more structured']]},
      {key:'spend', label:'How do you want us to think about price?', options:[['value','Value-oriented'],['balanced','Balanced'],['premium','Premium-leaning']]}
    ]
  },
  usb: {
    brand: 'USB Shop',
    title: 'USB recommendations',
    questions: [
      { key:'usage', title:'What best describes your typical use?', options:[
        ['everyday','Everyday transfer and convenience'],
        ['performance','Bigger files and faster transfer'],
        ['storage','More capacity for keeping things stored']
      ]},
      { key:'preference', title:'Which overall style sounds most like you?', options:[
        ['practical','Practical and straightforward'],
        ['fast','Performance-oriented'],
        ['capacity','Capacity-focused']
      ]},
      { key:'price', title:'How do you usually think about price?', options:[
        ['value','Value first'],
        ['balanced','A balanced choice'],
        ['premium','Premium if clearly better']
      ]}
    ],
    catalog: [
      {id:'u1', name:'SecureDrive 64GB', price:'$18', cue:'Everyday use · durable', tags:{persona:'practical', feel:'steady', spend:'value'}},
      {id:'u2', name:'HyperFlash 128GB', price:'$24', cue:'Fast transfer · balanced', tags:{persona:'fast', feel:'balanced', spend:'balanced'}},
      {id:'u3', name:'StoreMore 256GB', price:'$32', cue:'Large capacity · premium', tags:{persona:'capacity', feel:'expanded', spend:'premium'}},
      {id:'u4', name:'FlexStick 128GB', price:'$20', cue:'Portable · simple', tags:{persona:'practical', feel:'balanced', spend:'balanced'}},
      {id:'u5', name:'SpeedKey 64GB', price:'$28', cue:'Fast and compact', tags:{persona:'fast', feel:'steady', spend:'premium'}},
      {id:'u6', name:'ArchivePro 256GB', price:'$27', cue:'Capacity-minded · value', tags:{persona:'capacity', feel:'expanded', spend:'balanced'}}
    ],
    expressivePrompt: 'What feels a little off about these suggestions?',
    expressiveOptions: [
      ['usage','They do not feel like the right fit for my use.'],
      ['price','They feel a bit outside what I had in mind on price.'],
      ['style','They do not quite match my usual preference.'],
      ['intensity','They feel more advanced or more limited than I expected.']
    ],
    correctiveFields: [
      {key:'persona', label:'Which style sounds more like you?', options:[['practical','Practical and everyday'],['fast','Performance-oriented'],['capacity','Capacity-focused']]},
      {key:'feel', label:'What overall fit sounds closer?', options:[['steady','Straightforward and reliable'],['balanced','Balanced'],['expanded','More specialized or extended']]},
      {key:'spend', label:'How should we think about price?', options:[['value','Value-oriented'],['balanced','Balanced'],['premium','Premium-leaning']]}
    ]
  }
};

function parseParams(){
  const p = new URLSearchParams(location.search);
  const product = p.get('product');
  const cond = p.get('cond') || p.get('condition');
  if(products[product]) state.product = product;
  if(['none','expressive','corrective'].includes(cond)) state.cond = cond;
}

function setParamState(){
  const p = new URLSearchParams(location.search);
  p.set('product', state.product);
  p.set('cond', state.cond);
  history.replaceState({}, '', 'app.html?' + p.toString());
}

function log(type, detail={}){ state.log.push({type, detail, t:new Date().toISOString()}); }

function inferProfile(){
  const cfg = products[state.product];
  if(state.product === 'wine'){
    const persona = state.answers.style || 'classic';
    const spend = state.answers.price || 'balanced';
    let feel = 'balanced';
    if(state.answers.occasion === 'gift' || state.answers.style === 'adventurous') feel = 'bold';
    if(state.answers.occasion === 'casual' || state.answers.style === 'easy') feel = 'light';
    state.inference = {persona, spend, feel};
  } else {
    const persona = state.answers.preference || 'practical';
    const spend = state.answers.price || 'balanced';
    let feel = 'balanced';
    if(state.answers.usage === 'performance' || state.answers.preference === 'fast') feel = 'expanded';
    if(state.answers.usage === 'everyday' || state.answers.preference === 'practical') feel = 'steady';
    state.inference = {persona, spend, feel};
  }
  state.correctiveValues = {...state.inference};
}

function profileText(inf){
  if(state.product === 'wine'){
    const personaText = {classic:'a classic-leaning wine shopper', adventurous:'a more adventurous wine shopper', easy:'an easygoing wine shopper'}[inf.persona];
    const feelText = {light:'lighter, easy-drinking choices', balanced:'balanced choices', bold:'bolder, more structured choices'}[inf.feel];
    const spendText = {value:'good value', balanced:'a balanced price–quality tradeoff', premium:'something a bit more premium'}[inf.spend];
    return `Based on your inputs, we inferred that you seem to be ${personaText} who tends to prefer ${feelText} and values ${spendText}.`;
  }
  const personaText = {practical:'a practical everyday user', fast:'a performance-oriented user', capacity:'a capacity-focused user'}[inf.persona];
  const feelText = {steady:'straightforward, reliable options', balanced:'balanced options', expanded:'more extended or specialized options'}[inf.feel];
  const spendText = {value:'good value', balanced:'a balanced price–quality tradeoff', premium:'something more premium when justified'}[inf.spend];
  return `Based on your inputs, we inferred that you seem to be ${personaText} who tends to prefer ${feelText} and values ${spendText}.`;
}

function profileTags(inf){
  return [inf.persona, inf.feel, inf.spend].map(v=>`<span class="tag">${labelize(v)}</span>`).join('');
}

function whyText(){
  return state.product==='wine'
    ? 'These recommendations reflect the style, feel, and price orientation that the system inferred from your answers.'
    : 'These recommendations reflect the usage style, overall fit, and price orientation that the system inferred from your answers.';
}

function labelize(v){
  const map = {
    classic:'Classic', adventurous:'Adventurous', easy:'Easygoing',
    light:'Lighter feel', balanced:'Balanced', bold:'Bolder feel',
    value:'Value-oriented', premium:'Premium-leaning',
    practical:'Practical', fast:'Performance-oriented', capacity:'Capacity-focused',
    steady:'Straightforward fit', expanded:'Extended fit'
  };
  return map[v] || v;
}

function recommend(inf){
  const items = products[state.product].catalog.map(item=>{
    let score = 0;
    if(item.tags.persona === inf.persona) score += 3;
    if(item.tags.feel === inf.feel) score += 2;
    if(item.tags.spend === inf.spend) score += 1;
    return {...item, score};
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
  state.recs = items.slice(0,4);
}

function refreshAfterExpressive(reason){
  const all = products[state.product].catalog.map(item=>({ ...item, score: item.score || 0 }));
  const baseInf = state.inference;
  const rescored = all.map(item=>{
    let score = 0;
    if(item.tags.persona === baseInf.persona) score += 3;
    if(item.tags.feel === baseInf.feel) score += 2;
    if(item.tags.spend === baseInf.spend) score += 1;
    if(reason === 'price' && item.tags.spend !== 'value') score -= 3;
    if(reason === 'occasion' && item.tags.feel === 'bold') score -= 2;
    if(reason === 'taste' && item.tags.persona === baseInf.persona) score -= 1;
    if(reason === 'intensity' && item.tags.feel === 'bold') score -= 3;
    if(reason === 'usage' && item.tags.feel === 'expanded') score -= 2;
    if(reason === 'style' && item.tags.persona === baseInf.persona) score -= 1;
    return {...item, score};
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
  state.recs = rescored.slice(0,4);
}

function refreshAfterCorrective(){
  recommend(state.correctiveValues);
}

function render(){
  document.getElementById('brandTitle').textContent = products[state.product].brand;
  document.getElementById('landingTitle').textContent = products[state.product].title;
  document.getElementById('productSelect').value = state.product;
  document.getElementById('condSelect').value = state.cond;

  const landing = document.getElementById('landing');
  const backdrop = document.getElementById('backdrop');
  const quiz = document.getElementById('modalQuiz');
  const results = document.getElementById('modalResults');
  const done = document.getElementById('modalDone');
  landing.classList.toggle('hidden', state.page !== 'landing');
  backdrop.classList.toggle('hidden', state.page === 'landing');
  quiz.classList.toggle('hidden', state.page !== 'quiz');
  results.classList.toggle('hidden', state.page !== 'results');
  done.classList.toggle('hidden', state.page !== 'done');

  if(state.page === 'quiz') renderQuiz();
  if(state.page === 'results') renderResults();
  if(state.page === 'done') renderDone();
}

function renderQuiz(){
  const cfg = products[state.product];
  const q = cfg.questions[state.qIndex];
  const answered = state.answers[q.key];
  const percent = ((state.qIndex) / cfg.questions.length) * 100;
  document.getElementById('quizProgressBar').style.width = percent + '%';
  document.getElementById('quizStep').innerHTML = `
    <div class="step-card">
      <div class="small">Question ${state.qIndex + 1} of ${cfg.questions.length}</div>
      <div class="q-title">${q.title}</div>
      <div class="choice-list">
        ${q.options.map(([value,label]) => `
          <label class="choice ${answered===value?'selected':''}" data-value="${value}">
            <input type="radio" name="q" ${answered===value?'checked':''} />
            <span>${label}</span>
          </label>
        `).join('')}
      </div>
    </div>`;
  document.querySelectorAll('.choice').forEach(el=>el.onclick=()=>{
    state.answers[q.key] = el.dataset.value;
    renderQuiz();
  });
  document.getElementById('quizBack').disabled = state.qIndex===0;
  document.getElementById('quizNext').disabled = !state.answers[q.key];
  document.getElementById('quizNext').textContent = state.qIndex === cfg.questions.length-1 ? 'See recommendations' : 'Next';
}

function renderResults(){
  document.getElementById('profileSummary').textContent = profileText(state.correctiveValues);
  document.getElementById('profileTags').innerHTML = profileTags(state.correctiveValues);
  document.getElementById('whyText').textContent = whyText();
  document.getElementById('recsGrid').innerHTML = state.recs.map(item=>`
    <div class="product ${state.selected===item.id?'selected':''}">
      <div class="row"><div class="product-title">${item.name}</div><span class="tag">${item.price}</span></div>
      <div class="muted">${item.cue}</div>
      <div class="actions"><button class="btn btn-secondary" data-pick="${item.id}">Choose this</button></div>
    </div>`).join('');
  document.querySelectorAll('[data-pick]').forEach(btn=>btn.onclick=()=>{
    state.selected = btn.dataset.pick;
    document.getElementById('btnContinue').disabled = false;
    renderResults();
  });

  const exp = document.getElementById('expressiveAnchor');
  const cor = document.getElementById('correctiveAnchor');
  exp.innerHTML = '';
  cor.innerHTML = '';

  if(state.cond === 'expressive'){
    exp.innerHTML = `
      <div class="rec-box expressive">
        <h4>Not quite right?</h4>
        <p class="muted">Tell us what feels a little off, and we’ll refresh the suggestions.</p>
        <div class="option-grid">
          ${products[state.product].expressiveOptions.map(([k,label])=>`<div class="option-card ${state.expressiveReasons[0]===k?'active':''}" data-exp="${k}">${label}</div>`).join('')}
        </div>
        <div class="repair-footer">
          <button id="applyExpressive" class="btn btn-primary" ${state.expressiveReasons.length?'':'disabled'}>Refresh recommendation</button>
        </div>
        <div id="expStatus" class="status ${state.note?'':'hidden'}">${state.note}</div>
      </div>`;
    document.querySelectorAll('[data-exp]').forEach(el=>el.onclick=()=>{
      state.expressiveReasons=[el.dataset.exp];
      state.note='';
      renderResults();
    });
    const btn = document.getElementById('applyExpressive');
    if(btn) btn.onclick=()=>{
      refreshAfterExpressive(state.expressiveReasons[0]);
      state.note='Thanks — we’ve refreshed the suggestions based on your feedback.';
      log('expressive_recourse',{reason:state.expressiveReasons[0]});
      renderResults();
    };
  }

  if(state.cond === 'corrective'){
    cor.innerHTML = `
      <div class="rec-box corrective">
        <h4>Refine this understanding</h4>
        <p class="muted">If this summary feels slightly off, you can refine it before continuing.</p>
        ${products[state.product].correctiveFields.map(field=>`
          <div class="field">
            <label class="label" for="field_${field.key}">${field.label}</label>
            <select id="field_${field.key}">${field.options.map(([v,l])=>`<option value="${v}" ${state.correctiveValues[field.key]===v?'selected':''}>${l}</option>`).join('')}</select>
          </div>`).join('')}
        <div class="repair-footer"><button id="applyCorrective" class="btn btn-primary">Update understanding</button></div>
        <div id="corStatus" class="status ${state.note?'':'hidden'}">${state.note}</div>
      </div>`;
    document.getElementById('applyCorrective').onclick=()=>{
      products[state.product].correctiveFields.forEach(f=>{
        state.correctiveValues[f.key] = document.getElementById(`field_${f.key}`).value;
      });
      refreshAfterCorrective();
      state.note='Thanks — we’ve updated how we understand your preferences and refreshed the suggestions.';
      log('corrective_recourse',{profile:{...state.correctiveValues}});
      renderResults();
    };
  }
}

function renderDone(){
  document.getElementById('logPreview').textContent = JSON.stringify({product:state.product, condition:state.cond, answers:state.answers, inference:state.inference, finalProfile:state.correctiveValues, selected:state.selected, log:state.log}, null, 2);
}

function downloadLog(){
  const payload = {product:state.product, condition:state.cond, answers:state.answers, inference:state.inference, finalProfile:state.correctiveValues, selected:state.selected, log:state.log};
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `followup-${state.product}-${state.cond}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function init(){
  parseParams();
  document.getElementById('productSelect').addEventListener('change', e=>{ state.product = e.target.value; setParamState(); render(); });
  document.getElementById('condSelect').addEventListener('change', e=>{ state.cond = e.target.value; setParamState(); render(); });
  document.getElementById('btnStart').addEventListener('click', ()=>{
    state.page='quiz'; state.qIndex=0; state.answers={}; state.selected=null; state.note=''; state.log=[]; state.expressiveReasons=[];
    setParamState(); log('start',{product:state.product, condition:state.cond}); render();
  });
  document.getElementById('quizClose').addEventListener('click', ()=>{ state.page='landing'; render(); });
  document.getElementById('resultsClose').addEventListener('click', ()=>{ state.page='landing'; render(); });
  document.getElementById('quizBack').addEventListener('click', ()=>{ if(state.qIndex>0){ state.qIndex--; renderQuiz(); } else { state.page='landing'; render(); } });
  document.getElementById('quizNext').addEventListener('click', ()=>{
    const total = products[state.product].questions.length;
    if(state.qIndex < total-1){ state.qIndex++; renderQuiz(); return; }
    inferProfile(); recommend(state.inference); state.correctiveValues = {...state.inference}; state.page='results'; state.note=''; render();
  });
  document.getElementById('btnContinue').addEventListener('click', ()=>{ log('continue',{selected:state.selected}); state.page='done'; render(); });
  document.getElementById('btnDownload').addEventListener('click', downloadLog);
  render();
}

document.addEventListener('DOMContentLoaded', init);
