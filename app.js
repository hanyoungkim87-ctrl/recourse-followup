
const catalog = {
  wine: [
    { id: 'w1', name: 'Riverside Cabernet', price: '$24', cue: 'Dry · Full-bodied · Red', type: 'red', sweetness: 'dry', body: 'full', budget: '$20–30' },
    { id: 'w2', name: 'Valley Pinot Noir', price: '$22', cue: 'Dry · Medium-bodied · Red', type: 'red', sweetness: 'dry', body: 'medium', budget: '$20–30' },
    { id: 'w3', name: 'Suncrest Rosé', price: '$18', cue: 'Medium · Light-bodied · Rosé', type: 'rosé', sweetness: 'medium', body: 'light', budget: 'Under $20' },
    { id: 'w4', name: 'Coastal Sauvignon Blanc', price: '$19', cue: 'Dry · Light-bodied · White', type: 'white', sweetness: 'dry', body: 'light', budget: 'Under $20' },
    { id: 'w5', name: 'Reserve Merlot', price: '$31', cue: 'Medium · Full-bodied · Red', type: 'red', sweetness: 'medium', body: 'full', budget: '$30+' },
    { id: 'w6', name: 'Harvest Riesling', price: '$17', cue: 'Sweet · Light-bodied · White', type: 'white', sweetness: 'sweet', body: 'light', budget: 'Under $20' }
  ],
  usb: [
    { id: 'u1', name: 'HyperFlash 128GB', price: '$24', cue: '128GB · High speed · Medium durability', capacity: '128GB', speed: 'high', durability: 'medium', budget: '$20–30' },
    { id: 'u2', name: 'SecureDrive 64GB', price: '$18', cue: '64GB · Medium speed · High durability', capacity: '64GB', speed: 'medium', durability: 'high', budget: 'Under $20' },
    { id: 'u3', name: 'StoreMore 256GB', price: '$32', cue: '256GB · High speed · Medium durability', capacity: '256GB', speed: 'high', durability: 'medium', budget: '$30+' },
    { id: 'u4', name: 'FlexStick 128GB', price: '$20', cue: '128GB · Low speed · Standard durability', capacity: '128GB', speed: 'low', durability: 'standard', budget: '$20–30' },
    { id: 'u5', name: 'ShieldKey 64GB', price: '$16', cue: '64GB · Low speed · High durability', capacity: '64GB', speed: 'low', durability: 'high', budget: 'Under $20' },
    { id: 'u6', name: 'UltraMove 256GB', price: '$29', cue: '256GB · Medium speed · Standard durability', capacity: '256GB', speed: 'medium', durability: 'standard', budget: '$20–30' }
  ]
};

const conditionInfo = {
  explanation: { label: 'Explanation only', kind: 'base', defaultProduct: 'usb' },
  steering: { label: 'Steering control', kind: 'base', defaultProduct: 'usb' },
  recourse: { label: 'Recourse', kind: 'base', defaultProduct: 'usb' },
  both: { label: 'Steering + recourse', kind: 'base', defaultProduct: 'usb' },
  expressive: { label: 'Expressive recourse', kind: 'followup', defaultProduct: 'wine' },
  corrective: { label: 'Corrective recourse', kind: 'followup', defaultProduct: 'wine' }
};

const inferencePrompts = {
  wine: [
    { key: 'occasion', label: 'What best describes the situation?', options: ['casual weekend', 'dinner pairing', 'gift or special meal'] },
    { key: 'style', label: 'Which general style sounds most like you?', options: ['bold red', 'crisp white', 'easygoing sipper'] },
    { key: 'spend', label: 'How do you usually think about price?', options: ['value first', 'balanced', 'premium if worth it'] }
  ],
  usb: [
    { key: 'usage', label: 'How do you mainly use USB drives?', options: ['everyday transfer', 'large file storage', 'rugged carry-around use'] },
    { key: 'priority', label: 'Which trade-off sounds most like you?', options: ['value first', 'balanced', 'speed first'] },
    { key: 'scale', label: 'How much space do you usually need?', options: ['basic files', 'mixed use', 'large media files'] }
  ]
};

const directFields = {
  wine: [
    { key: 'type', label: 'Wine type', options: ['red', 'white', 'rosé'] },
    { key: 'sweetness', label: 'Sweetness', options: ['dry', 'medium', 'sweet'] },
    { key: 'body', label: 'Body', options: ['light', 'medium', 'full'] },
    { key: 'budget', label: 'Budget', options: ['Under $20', '$20–30', '$30+'] }
  ],
  usb: [
    { key: 'capacity', label: 'Capacity', options: ['64GB', '128GB', '256GB'] },
    { key: 'speed', label: 'Transfer speed', options: ['low', 'medium', 'high'] },
    { key: 'durability', label: 'Durability', options: ['standard', 'medium', 'high'] },
    { key: 'budget', label: 'Budget', options: ['Under $20', '$20–30', '$30+'] }
  ]
};

const expressiveReasons = {
  wine: [
    { key: 'too_bold', label: 'This feels bolder or heavier than what I had in mind.' },
    { key: 'wrong_occasion', label: 'This seems better suited to a different occasion.' },
    { key: 'price', label: 'This feels outside my comfort zone on price.' },
    { key: 'style_miss', label: 'This does not feel like my usual wine style.' }
  ],
  usb: [
    { key: 'too_basic', label: 'This feels too basic for what I need.' },
    { key: 'too_specialized', label: 'This feels too specialized for my typical use.' },
    { key: 'price', label: 'This feels outside my comfort zone on price.' },
    { key: 'style_miss', label: 'This does not feel like my usual device preference.' }
  ]
};

const state = {
  page: 'setup',
  product: 'wine',
  condition: 'corrective',
  qIndex: 0,
  profileResponses: {},
  inference: null,
  summary: '',
  recommendations: [],
  editedInference: null,
  sliderValue: 50,
  expressiveFeedback: [],
  note: '',
  selectedItem: null,
  log: []
};

const app = document.getElementById('app');

function isSteering(){ return ['steering','both'].includes(state.condition); }
function isRecourse(){ return ['recourse','both','expressive','corrective'].includes(state.condition); }
function isFollowup(){ return ['expressive','corrective'].includes(state.condition); }
function questionCount(){ return inferencePrompts[state.product].length + (isSteering() ? 1 : 0); }

function parseParams(){
  const params = new URLSearchParams(location.search);
  const p = params.get('product');
  const c = params.get('condition');
  if (p && catalog[p]) state.product = p;
  if (c && conditionInfo[c]) state.condition = c;
}
function syncParams(){
  const params = new URLSearchParams();
  params.set('product', state.product);
  params.set('condition', state.condition);
  history.replaceState({},'', location.pathname+'?'+params.toString());
}
function log(type, detail={}){ state.log.push({type, detail, time:new Date().toISOString()}); }

function inferProfile(product, responses){
  if (product === 'wine') {
    const attrs = { type: 'red', sweetness: 'dry', body: 'medium', budget: '$20–30' };
    let narrative = 'you tend to gravitate toward classic, food-friendly wines';
    if (responses.style === 'crisp white') { attrs.type = 'white'; attrs.sweetness = 'dry'; attrs.body = 'light'; narrative = 'you seem to prefer fresher, crisper wines with a lighter feel'; }
    else if (responses.style === 'easygoing sipper') { attrs.type = 'rosé'; attrs.sweetness = 'medium'; attrs.body = 'light'; narrative = 'you seem to prefer approachable wines that are easy to enjoy casually'; }
    else { attrs.type = 'red'; attrs.sweetness = 'dry'; attrs.body = 'full'; narrative = 'you seem to prefer fuller, more structured wines'; }
    if (responses.occasion === 'casual weekend') attrs.body = attrs.body === 'full' ? 'medium' : attrs.body;
    if (responses.occasion === 'gift or special meal') { attrs.body = 'full'; narrative += ' and that suit a more deliberate occasion'; }
    if (responses.spend === 'value first') attrs.budget = 'Under $20';
    if (responses.spend === 'premium if worth it') attrs.budget = '$30+';
    return { attrs, narrative };
  }
  const attrs = { capacity: '128GB', speed: 'medium', durability: 'medium', budget: '$20–30' };
  let narrative = 'you seem to prefer dependable USB drives for everyday use';
  if (responses.usage === 'large file storage') { attrs.capacity = '256GB'; attrs.speed = 'high'; narrative = 'you seem to prioritize storage-heavy use and smoother file handling'; }
  else if (responses.usage === 'rugged carry-around use') { attrs.capacity = '64GB'; attrs.speed = 'medium'; attrs.durability = 'high'; narrative = 'you seem to value durability and dependable everyday carry'; }
  if (responses.priority === 'value first') { attrs.budget = 'Under $20'; if (attrs.speed === 'high') attrs.speed = 'medium'; }
  if (responses.priority === 'speed first') attrs.speed = 'high';
  if (responses.scale === 'basic files') attrs.capacity = '64GB';
  if (responses.scale === 'large media files') attrs.capacity = '256GB';
  return { attrs, narrative };
}
function summaryText(product, attrs, narrative, corrected=false){
  const prefix = corrected ? 'Updated understanding:' : 'Based on your inputs, we inferred that';
  if (product === 'wine') return `${prefix} ${narrative}; specifically, ${attrs.sweetness}, ${attrs.body}-bodied ${attrs.type} wines in the ${attrs.budget.toLowerCase()} range.`;
  return `${prefix} ${narrative}; specifically, ${attrs.capacity} USB drives with ${attrs.speed} transfer speed, ${attrs.durability} durability, and a budget of ${attrs.budget}.`;
}
function scoreItem(product,item,attrs,slider=50){
  let score = 0;
  directFields[product].forEach(f=>{ if(item[f.key]===attrs[f.key]) score += 3; });
  if(product==='wine'){ if(slider>65 && item.body===attrs.body) score += 1; if(slider<35 && item.budget===attrs.budget) score += 1; }
  else { if(slider>65 && item.speed===attrs.speed) score += 1; if(slider<35 && item.budget===attrs.budget) score += 1; }
  return score;
}
function buildRecommendations(product, attrs, slider=50){
  return [...catalog[product]].map(item=>({...item, score:scoreItem(product,item,attrs,slider)})).sort((a,b)=>b.score-a.score).slice(0,4);
}
function buildFromCurrent(){
  const effectiveAttrs = state.editedInference || state.inference.attrs;
  const effectiveNarrative = state.editedInference ? 'we updated our understanding based on your revision' : state.inference.narrative;
  state.summary = summaryText(state.product, effectiveAttrs, effectiveNarrative, !!state.editedInference);
  state.recommendations = buildRecommendations(state.product, effectiveAttrs, state.sliderValue);
}
function rerankFromExpressive(){
  const base = { ...state.inference.attrs };
  const reasons = state.expressiveFeedback;
  if(state.product==='wine'){
    if(reasons.includes('too_bold')) base.body = base.body==='full' ? 'light' : 'medium';
    if(reasons.includes('wrong_occasion')) base.type = base.type==='red' ? 'white' : 'red';
    if(reasons.includes('price')) base.budget = base.budget==='$30+' ? '$20–30' : 'Under $20';
    if(reasons.includes('style_miss')) base.sweetness = base.sweetness==='dry' ? 'medium' : 'dry';
  } else {
    if(reasons.includes('too_basic')) { base.capacity='256GB'; base.speed='high'; }
    if(reasons.includes('too_specialized')) { base.capacity='128GB'; base.speed='medium'; }
    if(reasons.includes('price')) base.budget='Under $20';
    if(reasons.includes('style_miss')) base.durability = base.durability==='high' ? 'standard' : 'high';
  }
  state.recommendations = buildRecommendations(state.product, base, state.sliderValue);
  state.note = 'Thanks. We revised the recommendation set based on what seemed off to you.';
}
function resetToSetup(){
  Object.assign(state,{page:'setup',qIndex:0,profileResponses:{},inference:null,summary:'',recommendations:[],editedInference:null,sliderValue:50,expressiveFeedback:[],note:'',selectedItem:null,log:[]});
  render();
}
function startStudy(){ state.page='intro'; state.qIndex=0; state.profileResponses={}; state.editedInference=null; state.expressiveFeedback=[]; state.note=''; state.selectedItem=null; syncParams(); log('start',{product:state.product,condition:state.condition}); render(); }
function nextFromIntro(){ state.page='question'; render(); }
function nextQuestion(){
  const prompts = inferencePrompts[state.product];
  if(state.qIndex < prompts.length-1){ state.qIndex += 1; render(); return; }
  if(isSteering()){ state.page='steering'; render(); return; }
  finalizeProfile();
}
function backQuestion(){ if(state.qIndex>0){ state.qIndex -= 1; render(); } else { state.page='intro'; render(); } }
function finalizeProfile(){ state.inference = inferProfile(state.product, state.profileResponses); state.editedInference = null; buildFromCurrent(); state.page='results'; log('profile_finalized',{responses:state.profileResponses, inference:state.inference}); render(); }
function startOver(){ resetToSetup(); }
function downloadLog(){
  const data = { product:state.product, condition:state.condition, profileResponses:state.profileResponses, inference:state.inference, editedInference:state.editedInference, expressiveFeedback:state.expressiveFeedback, recommendations:state.recommendations.map(r=>r.id), selectedItem:state.selectedItem, log:state.log };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${state.product}-${state.condition}-session.json`; a.click(); URL.revokeObjectURL(a.href);
}

function renderSetup(){
  app.innerHTML = `
  <div class="container">
    <div class="card hero">
      <h1>Recommender system prototype</h1>
      <p class="muted">This version follows the original study flow more closely: participants answer one question per page, then view a result page showing the system's inferred preference profile and recommendations.</p>
      <div class="grid grid-2" style="margin-top:18px">
        <div>
          <h3>Product context</h3>
          <div class="grid">
            ${['wine','usb'].map(p=>`<button class="option-card ${state.product===p?'active':''}" data-pick-product="${p}"><strong>${p==='wine'?'Wine':'USB drive'}</strong><span class="muted">${p==='wine'?'More subjective, experience-oriented evaluation':'More inspectable, attribute-based evaluation'}</span></button>`).join('')}
          </div>
        </div>
        <div>
          <h3>Condition</h3>
          <div class="grid">
            ${Object.entries(conditionInfo).map(([k,v])=>`<button class="option-card ${state.condition===k?'active':''}" data-pick-condition="${k}"><strong>${v.label}</strong><span class="muted">${k==='expressive'?'Object to the recommendation after seeing it':k==='corrective'?'Correct the system\'s preference interpretation after seeing it':k==='steering'?'Adjust weighting before recommendations are generated':k==='recourse'?'Revise interpretation after recommendations are shown':k==='both'?'Steering before + recourse after output':'Explanation only'}</span></button>`).join('')}
          </div>
        </div>
      </div>
      <div class="actions" style="margin-top:22px"><button class="btn primary" id="startBtn">Start prototype</button></div>
    </div>
  </div>`;
  app.querySelectorAll('[data-pick-product]').forEach(b=>b.onclick=()=>{state.product=b.dataset.pickProduct; renderSetup();});
  app.querySelectorAll('[data-pick-condition]').forEach(b=>b.onclick=()=>{state.condition=b.dataset.pickCondition; renderSetup();});
  document.getElementById('startBtn').onclick=startStudy;
}
function renderIntro(){
  const label = conditionInfo[state.condition].label;
  const desc = state.product==='wine' ? 'You are using a recommender to choose a bottle of wine.' : 'You are using a recommender to choose a USB drive.';
  app.innerHTML = `<div class="container"><div class="card hero"><div class="progress"><span class="pill">Introduction</span><span class="small">Condition: ${label}</span></div><h2>${desc}</h2><p>The system will first ask a few brief questions, then infer your preference profile and generate recommendations. Depending on condition, you may be able to shape the recommendation before it is shown or respond to the inferred interpretation after the recommendation appears.</p><div class="actions"><button class="btn secondary" id="backSetup">Back</button><button class="btn primary" id="beginQs">Begin questions</button></div></div></div>`;
  document.getElementById('backSetup').onclick=()=>{state.page='setup';render();};
  document.getElementById('beginQs').onclick=nextFromIntro;
}
function renderQuestion(){
  const prompts = inferencePrompts[state.product];
  const q = prompts[state.qIndex];
  const value = state.profileResponses[q.key];
  const pct = Math.round(((state.qIndex+1)/questionCount())*100);
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="topbar"><div><div class="small">Question ${state.qIndex+1} of ${questionCount()}</div><div class="progressbar"><span style="width:${pct}%"></span></div></div><div class="small">${conditionInfo[state.condition].label}</div></div><div class="question-title">${q.label}</div><div class="choices">${q.options.map(opt=>`<label class="choice ${value===opt?'selected':''}"><input type="radio" name="q" value="${opt}" ${value===opt?'checked':''}><span>${opt}</span></label>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backBtn">Back</button><button class="btn primary" id="nextBtn" ${!value?'disabled':''}>${state.qIndex===prompts.length-1 && !isSteering()?'See recommendations':'Next'}</button></div></div></div>`;
  app.querySelectorAll('input[name="q"]').forEach(inp=>inp.onchange=()=>{ state.profileResponses[q.key]=inp.value; renderQuestion(); });
  document.getElementById('backBtn').onclick=backQuestion;
  document.getElementById('nextBtn').onclick=nextQuestion;
}
function renderSteering(){
  const pct = 100;
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="topbar"><div><div class="small">Question ${questionCount()} of ${questionCount()}</div><div class="progressbar"><span style="width:${pct}%"></span></div></div><div class="small">Steering control</div></div><div class="question-title">Before we generate your recommendations, you can steer how the system balances preference signals and product characteristics.</div><div class="range-row"><div class="field"><label for="mixRange"><strong>Recommendation source balance</strong></label><input id="mixRange" type="range" min="0" max="100" step="5" value="${state.sliderValue}"><div class="kv"><span>Profile signals</span><span>Product attributes</span></div></div><div class="summary"><strong>Current setting: ${state.sliderValue}</strong><p class="muted">Lower values give more weight to broadly comparable, value-oriented options. Higher values place more emphasis on attribute fit (e.g., body/speed) in the recommendation ranking.</p></div></div><div class="footer-actions"><button class="btn secondary" id="backBtn">Back</button><button class="btn primary" id="toResults">See recommendations</button></div></div></div>`;
  document.getElementById('mixRange').oninput=(e)=>{state.sliderValue=Number(e.target.value); renderSteering();};
  document.getElementById('backBtn').onclick=()=>{ state.qIndex = inferencePrompts[state.product].length - 1; state.page='question'; render(); };
  document.getElementById('toResults').onclick=finalizeProfile;
}
function productCard(item){
  return `<div class="product ${state.selectedItem===item.id?'selected':''}"><div class="row"><strong>${item.name}</strong><span class="tag">${item.price}</span></div><div class="muted">${item.cue}</div><div class="actions"><button class="btn ghost" data-select="${item.id}">Choose this option</button></div></div>`;
}
function recourseControls(){
  if(!isRecourse()) return '';
  if(['recourse','both','corrective'].includes(state.condition)){
    return `<div class="rec-controls"><div class="inline-box"><strong>Review or correct preference interpretation</strong><p class="muted">If our understanding feels off, you can revise the interpretation that is currently driving these recommendations.</p><button class="btn primary" id="openCorrective">Correct our understanding</button></div></div>`;
  }
  if(state.condition==='expressive'){
    return `<div class="rec-controls"><div class="inline-box"><strong>Tell us what seems off</strong><p class="muted">If the recommendation does not feel right, you can indicate what seems off and the system will revise the recommendation set.</p><button class="btn primary" id="openExpressive">This doesn't feel right</button></div></div>`;
  }
  return '';
}
function renderResults(){
  app.innerHTML = `<div class="container"><div class="topbar"><div><h2 style="margin:0">Result page</h2><div class="small">${conditionInfo[state.condition].label} · ${state.product==='wine'?'Wine':'USB'}</div></div><div class="actions"><button class="btn secondary" id="restartBtn">Restart</button><button class="btn green" id="downloadBtn">Download log</button></div></div><div class="layout"><div class="panel card"><h3>Recommended options</h3><div class="product-list">${state.recommendations.map(productCard).join('')}</div>${state.note?`<div class="note">${state.note}</div>`:''}</div><div class="panel card"><div class="summary"><strong>How the system currently understands you</strong><p>${state.summary}</p></div>${recourseControls()}<div style="margin-top:16px"><h3>Session log preview</h3><div class="jsonbox">${escapeHtml(JSON.stringify({condition:state.condition, product:state.product, inference: state.editedInference || state.inference?.attrs, selectedItem:state.selectedItem}, null, 2))}</div></div></div></div></div>`;
  document.getElementById('restartBtn').onclick=startOver;
  document.getElementById('downloadBtn').onclick=downloadLog;
  app.querySelectorAll('[data-select]').forEach(btn=>btn.onclick=()=>{ state.selectedItem=btn.dataset.select; log('select',{item:state.selectedItem}); renderResults(); });
  const c = document.getElementById('openCorrective'); if(c) c.onclick = openCorrectivePanel;
  const e = document.getElementById('openExpressive'); if(e) e.onclick = openExpressivePanel;
}
function openCorrectivePanel(){
  const fields = directFields[state.product];
  const current = state.editedInference || state.inference.attrs;
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="progress"><span class="pill">Recourse</span><span class="small">Corrective</span></div><div class="question-title">Correct our understanding</div><p class="muted">Please revise any part of the inferred preference profile that does not fit you. The explanation summary and current recommendations will update accordingly.</p><div class="grid">${fields.map(f=>`<div class="field"><label><strong>${f.label}</strong></label><select data-field="${f.key}">${f.options.map(opt=>`<option value="${opt}" ${current[f.key]===opt?'selected':''}>${opt}</option>`).join('')}</select></div>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backRes">Back</button><button class="btn primary" id="applyCorr">Update recommendations</button></div></div></div>`;
  document.getElementById('backRes').onclick=renderResults;
  document.getElementById('applyCorr').onclick=()=>{
    const updated = {...current};
    app.querySelectorAll('select[data-field]').forEach(el=>updated[el.dataset.field]=el.value);
    state.editedInference = updated;
    state.note = 'Your recommendations have been updated based on your revised preference interpretation.';
    buildFromCurrent();
    log('corrective_recourse',{updated});
    renderResults();
  };
}
function openExpressivePanel(){
  const reasons = expressiveReasons[state.product];
  const selected = new Set(state.expressiveFeedback);
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="progress"><span class="pill">Recourse</span><span class="small">Expressive</span></div><div class="question-title">Tell us what seems off</div><p class="muted">Select any reasons that make the current recommendation feel off. The system will revise the recommendation set, but its current interpretation of your preference profile will remain unchanged.</p><div class="choices">${reasons.map(r=>`<label class="choice ${selected.has(r.key)?'selected':''}"><input type="checkbox" value="${r.key}" ${selected.has(r.key)?'checked':''}><span>${r.label}</span></label>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backRes">Back</button><button class="btn primary" id="applyExpr" ${selected.size===0?'disabled':''}>Revise recommendation set</button></div></div></div>`;
  app.querySelectorAll('input[type="checkbox"]').forEach(inp=>inp.onchange=()=>{
    state.expressiveFeedback = [...app.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value);
    openExpressivePanel();
  });
  document.getElementById('backRes').onclick=renderResults;
  document.getElementById('applyExpr').onclick=()=>{ rerankFromExpressive(); log('expressive_recourse',{reasons:state.expressiveFeedback}); renderResults(); };
}
function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function render(){ syncParams(); if(state.page==='setup') return renderSetup(); if(state.page==='intro') return renderIntro(); if(state.page==='question') return renderQuestion(); if(state.page==='steering') return renderSteering(); if(state.page==='results') return renderResults(); }
parseParams(); render();
