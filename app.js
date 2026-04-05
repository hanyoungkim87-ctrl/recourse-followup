
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
  none: { label: 'No recourse', defaultProduct: 'wine' },
  expressive: { label: 'Expressive recourse', defaultProduct: 'wine' },
  corrective: { label: 'Corrective recourse', defaultProduct: 'wine' }
};

const prompts = {
  wine: [
    { key: 'occasion', label: 'What best describes the situation?', options: ['casual weekend', 'dinner pairing', 'gift or special meal'] },
    { key: 'style', label: 'Which general style sounds most like you?', options: ['bold red', 'crisp white', 'easygoing sipper'] },
    { key: 'spend', label: 'How do you usually think about price?', options: ['value first', 'balanced', 'premium if worth it'] }
  ],
  usb: [
    { key: 'usage', label: 'How do you mainly use USB drives?', options: ['everyday transfer', 'large file storage', 'rugged carry-around use'] },
    { key: 'priority', label: 'Which trade-off sounds most like you?', options: ['value first', 'balanced', 'speed first'] },
    { key: 'spend', label: 'How do you usually think about price?', options: ['under $20', '$20–30', '$30 if clearly better'] }
  ]
};

const correctiveFields = {
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
  condition: 'none',
  qIndex: 0,
  answers: {},
  inference: null,
  summary: '',
  recommendations: [],
  editedInference: null,
  expressiveFeedback: [],
  note: '',
  selectedItem: null,
  log: []
};

const app = document.getElementById('app');

function log(type, detail={}){ state.log.push({type, detail, time:new Date().toISOString()}); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

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
  history.replaceState({},'', location.pathname + '?' + params.toString());
}

function startOver(){
  state.page = 'setup'; state.qIndex = 0; state.answers = {}; state.inference = null; state.summary='';
  state.recommendations=[]; state.editedInference=null; state.expressiveFeedback=[]; state.note=''; state.selectedItem=null; state.log=[];
  render();
}

function inferProfile(product, answers){
  if(product==='wine'){
    const attrs = { type:'red', sweetness:'dry', body:'medium', budget:'$20–30' };
    let narrative = 'you seem to prefer classic, food-friendly wines';
    if(answers.style==='crisp white'){ attrs.type='white'; attrs.sweetness='dry'; attrs.body='light'; narrative='you seem to prefer fresher, crisper wines with a lighter feel'; }
    else if(answers.style==='easygoing sipper'){ attrs.type='rosé'; attrs.sweetness='medium'; attrs.body='light'; narrative='you appear to prefer more relaxed, easygoing wines'; }
    if(answers.occasion==='gift or special meal'){ attrs.body='full'; narrative += ' for more special occasions'; }
    else if(answers.occasion==='casual weekend'){ attrs.body = attrs.body==='light' ? 'light' : 'medium'; }
    if(answers.spend==='value first') attrs.budget='Under $20';
    else if(answers.spend==='premium if worth it') attrs.budget='$30+';
    return { attrs, narrative };
  }
  const attrs = { capacity:'128GB', speed:'medium', durability:'medium', budget:'$20–30' };
  let narrative = 'you seem to prefer dependable everyday storage';
  if(answers.usage==='large file storage'){ attrs.capacity='256GB'; attrs.speed='high'; narrative='you seem to prefer larger, faster drives for heavier files'; }
  else if(answers.usage==='rugged carry-around use'){ attrs.durability='high'; attrs.capacity='64GB'; narrative='you seem to prioritize durable drives for frequent carry-around use'; }
  if(answers.priority==='value first'){ attrs.budget='Under $20'; attrs.speed = attrs.speed==='high' ? 'medium' : attrs.speed; }
  else if(answers.priority==='speed first'){ attrs.speed='high'; narrative += ' with strong speed performance'; }
  if(answers.spend==='under $20') attrs.budget='Under $20';
  else if(answers.spend==='$30 if clearly better') attrs.budget='$30+';
  return { attrs, narrative };
}

function scoreProduct(product, attrs){
  let s = 0;
  for(const [k,v] of Object.entries(attrs)) if(product[k]===v) s += 2;
  if(product.budget===attrs.budget) s += 1;
  return s;
}

function buildFromCurrent(){
  const current = state.editedInference || state.inference.attrs;
  state.summary = summaryText(state.product, current, state.inference.narrative);
  state.recommendations = [...catalog[state.product]].sort((a,b)=>scoreProduct(b,current)-scoreProduct(a,current)).slice(0,4);
}

function summaryText(product, attrs, narrative=''){
  if(product==='wine'){
    const maybeNarrative = narrative ? `${narrative}. ` : '';
    return `Based on your inputs, we inferred that ${maybeNarrative}you may prefer ${attrs.sweetness}, ${attrs.body}-bodied ${attrs.type} wines in the ${attrs.budget.toLowerCase()} range.`;
  }
  const maybeNarrative = narrative ? `${narrative}. ` : '';
  return `Based on your inputs, we inferred that ${maybeNarrative}you may prefer ${attrs.capacity} USB drives with ${attrs.speed} transfer speed, ${attrs.durability} durability, and a budget in the ${attrs.budget.toLowerCase()} range.`;
}

function rerankFromExpressive(){
  const base = [...state.recommendations];
  const reasons = new Set(state.expressiveFeedback);
  const penalized = p => {
    let penalty = 0;
    if(state.product==='wine'){
      if(reasons.has('too_bold') && p.body==='full') penalty += 5;
      if(reasons.has('wrong_occasion') && p.price==='$31') penalty += 3;
      if(reasons.has('price') && p.budget !== 'Under $20') penalty += 4;
      if(reasons.has('style_miss') && p.type === (state.inference.attrs.type||'red')) penalty += 2;
    } else {
      if(reasons.has('too_basic') && p.speed==='low') penalty += 5;
      if(reasons.has('too_specialized') && p.capacity==='256GB') penalty += 4;
      if(reasons.has('price') && p.budget !== 'Under $20') penalty += 4;
      if(reasons.has('style_miss') && p.durability === (state.inference.attrs.durability||'medium')) penalty += 2;
    }
    return penalty;
  };
  state.recommendations = [...catalog[state.product]].map(p=>({p, score: scoreProduct(p, state.inference.attrs)-penalized(p)})).sort((a,b)=>b.score-a.score).map(x=>x.p).slice(0,4);
  state.note = 'We revised the recommendation based on your feedback. Our inferred preference profile remains unchanged.';
}

function productCard(p){
  const selected = state.selectedItem===p.id ? 'selected' : '';
  const selectedLabel = state.selectedItem===p.id ? '<span class="tag">Final choice</span>' : '';
  return `<div class="product ${selected}"><div class="row"><strong>${p.name}</strong><span class="tag">${p.price}</span></div><div class="small">${p.cue}</div><div class="row"><div class="small">Recommended for you</div><div>${selectedLabel}</div></div><div class="actions"><button class="btn secondary" data-select="${p.id}">Choose this</button></div></div>`;
}

function setupScreen(){
  app.innerHTML = `<div class="container"><div class="card hero"><h1>RS Follow-up Prototype</h1><p>This version keeps the original inference-first recommender flow and focuses only on three Study 3 conditions: no recourse, expressive recourse, and corrective recourse.</p><div class="grid grid-2"><div><h3>Choose product context</h3><div class="grid">${Object.keys(catalog).map(k=>`<div class="choice-card ${state.product===k?'active':''}" data-product="${k}"><strong>${k==='wine'?'Wine recommender':'USB recommender'}</strong><span class="small">${k==='wine'?'Subjective, experience-oriented category':'More attribute-based category'}</span></div>`).join('')}</div></div><div><h3>Choose condition</h3><div class="grid">${Object.entries(conditionInfo).map(([k,v])=>`<div class="choice-card ${state.condition===k?'active':''}" data-condition="${k}"><strong>${v.label}</strong><span class="small">${k==='none'?'Recommendation shown without any post-recommendation recourse.':k==='expressive'?'Users can object to the recommendation but cannot edit the system interpretation.':'Users can directly revise the system interpretation.'}</span></div>`).join('')}</div></div></div><div class="footer-actions"><span></span><button class="btn primary" id="startBtn">Start prototype</button></div></div></div>`;
  app.querySelectorAll('[data-product]').forEach(el=>el.onclick=()=>{ state.product=el.dataset.product; render(); });
  app.querySelectorAll('[data-condition]').forEach(el=>el.onclick=()=>{ state.condition=el.dataset.condition; render(); });
  document.getElementById('startBtn').onclick=()=>{ syncParams(); state.page='intro'; log('setup',{product:state.product,condition:state.condition}); render(); };
}

function introScreen(){
  const labels = state.product==='wine'
    ? ['You will answer a few short questions about your general preferences.','The system will infer your likely taste profile from those inputs.','You will then see the inferred profile before the recommendations.']
    : ['You will answer a few short questions about your typical USB usage.','The system will infer your likely preference profile from those inputs.','You will then see the inferred profile before the recommendations.'];
  app.innerHTML = `<div class="container"><div class="card hero"><div class="small">${conditionInfo[state.condition].label}</div><h1>${state.product==='wine'?'Wine recommender':'USB recommender'}</h1><p>This prototype follows the same inference-based flow as the original studies.</p><div class="grid">${labels.map(x=>`<div class="callout">${x}</div>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backBtn">Back</button><button class="btn primary" id="beginBtn">Begin questions</button></div></div></div>`;
  document.getElementById('backBtn').onclick=()=>{ state.page='setup'; render(); };
  document.getElementById('beginBtn').onclick=()=>{ state.page='question'; render(); };
}

function questionScreen(){
  const set = prompts[state.product];
  const q = set[state.qIndex];
  const value = state.answers[q.key];
  const pct = Math.round(((state.qIndex+1)/set.length)*100);
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="topbar"><div><div class="small">Question ${state.qIndex+1} of ${set.length}</div><div class="progressbar"><span style="width:${pct}%"></span></div></div><div class="small">${conditionInfo[state.condition].label}</div></div><div class="question-title">${q.label}</div><div class="choices">${q.options.map(opt=>`<label class="choice ${value===opt?'selected':''}"><input type="radio" name="q" value="${opt}" ${value===opt?'checked':''}><span>${opt}</span></label>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backBtn">Back</button><button class="btn primary" id="nextBtn" ${!value?'disabled':''}>${state.qIndex===set.length-1?'See recommendations':'Next'}</button></div></div></div>`;
  app.querySelectorAll('input[name="q"]').forEach(inp=>inp.onchange=()=>{ state.answers[q.key]=inp.value; render(); });
  document.getElementById('backBtn').onclick=()=>{ if(state.qIndex===0){ state.page='intro'; } else { state.qIndex -=1; } render(); };
  document.getElementById('nextBtn').onclick=()=>{
    if(state.qIndex===set.length-1){
      state.inference = inferProfile(state.product, state.answers);
      state.editedInference = null; state.expressiveFeedback = []; state.note=''; state.selectedItem=null;
      buildFromCurrent();
      state.page='results';
      log('inference_created',{answers:state.answers, inference:state.inference});
      render();
    } else { state.qIndex +=1; render(); }
  };
}

function recoursePanel(){
  if(state.condition==='none'){
    return `<div class="block locked"><div class="row"><strong>Post-recommendation response</strong><span class="badge gray">No recourse</span></div><p class="small">You can review these recommendations, but you cannot respond to or revise the recommendation process.</p></div>`;
  }
  if(state.condition==='expressive'){
    return `<div class="block expressive"><div class="row"><strong>Respond to the recommendation</strong><span class="badge amber">Expressive recourse</span></div><p class="small">You can say that the recommendation feels off. The system may revise the recommendation, but its current interpretation of your preferences will remain unchanged.</p><div class="actions"><button class="btn primary" id="openExpressive">This doesn’t feel right</button></div></div>`;
  }
  return `<div class="block corrective"><div class="row"><strong>Revise the recommendation process</strong><span class="badge green">Corrective recourse</span></div><p class="small">You can directly revise how the system interpreted your preferences. The system will update both the inferred profile and the recommendation.</p><div class="actions"><button class="btn primary" id="openCorrective">Correct our understanding</button></div></div>`;
}

function resultsScreen(){
  app.innerHTML = `<div class="container"><div class="topbar"><div><h2>Result page</h2><div class="small">${conditionInfo[state.condition].label} · ${state.product==='wine'?'Wine':'USB'}</div></div><div class="actions"><button class="btn secondary" id="restartBtn">Restart</button><button class="btn green" id="downloadBtn">Download log</button></div></div><div class="layout"><div class="panel card"><div class="row"><h3>Recommended for you</h3><span class="badge gray">Recommendation block</span></div><div class="product-list">${state.recommendations.map(productCard).join('')}</div>${state.note?`<div class="note ${state.condition==='expressive'?'amber':''}">${state.note}</div>`:''}</div><div class="panel card"><div class="block inference"><div class="row"><strong>How we understood you</strong><span class="badge ${state.condition==='corrective'?'green':state.condition==='expressive'?'amber':'gray'}">Inference block</span></div><p class="summary-text">${state.summary}</p><div class="spacer"></div><div class="small">This profile is inferred from your answers before the recommendation is generated.</div></div><div class="spacer"></div>${recoursePanel()}<div style="margin-top:16px"><h3>Session log preview</h3><div class="jsonbox">${escapeHtml(JSON.stringify({condition:state.condition, product:state.product, answers: state.answers, inference: state.editedInference || state.inference?.attrs, selectedItem: state.selectedItem}, null, 2))}</div></div></div></div></div>`;
  document.getElementById('restartBtn').onclick=startOver;
  document.getElementById('downloadBtn').onclick=downloadLog;
  app.querySelectorAll('[data-select]').forEach(btn=>btn.onclick=()=>{ state.selectedItem=btn.dataset.select; log('select',{item:state.selectedItem}); resultsScreen(); });
  const ex=document.getElementById('openExpressive'); if(ex) ex.onclick=openExpressivePanel;
  const co=document.getElementById('openCorrective'); if(co) co.onclick=openCorrectivePanel;
}

function openExpressivePanel(){
  const reasons = expressiveReasons[state.product];
  const selected = new Set(state.expressiveFeedback);
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="small">Expressive recourse</div><div class="question-title">Tell us what seems off</div><p class="muted">You can indicate why the recommendation does not fit. The system may revise the recommendation, but its current preference interpretation will remain unchanged.</p><div class="choices">${reasons.map(r=>`<label class="choice ${selected.has(r.key)?'selected':''}"><input type="checkbox" value="${r.key}" ${selected.has(r.key)?'checked':''}><span>${r.label}</span></label>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backBtn">Back</button><button class="btn primary" id="applyBtn" ${selected.size===0?'disabled':''}>Revise recommendation</button></div></div></div>`;
  app.querySelectorAll('input[type="checkbox"]').forEach(inp=>inp.onchange=()=>{
    state.expressiveFeedback=[...app.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value);
    openExpressivePanel();
  });
  document.getElementById('backBtn').onclick=resultsScreen;
  document.getElementById('applyBtn').onclick=()=>{ rerankFromExpressive(); log('expressive_recourse',{reasons:state.expressiveFeedback}); resultsScreen(); };
}

function openCorrectivePanel(){
  const fields = correctiveFields[state.product];
  const current = state.editedInference || state.inference.attrs;
  app.innerHTML = `<div class="container"><div class="card question-wrap"><div class="small">Corrective recourse</div><div class="question-title">Correct our understanding</div><p class="muted">You can revise the system’s interpretation of your preferences. The system will update both the inferred profile and the recommendation.</p><div class="grid">${fields.map(f=>`<div class="field"><label><strong>${f.label}</strong></label><select data-field="${f.key}">${f.options.map(opt=>`<option value="${opt}" ${current[f.key]===opt?'selected':''}>${opt}</option>`).join('')}</select></div>`).join('')}</div><div class="footer-actions"><button class="btn secondary" id="backBtn">Back</button><button class="btn primary" id="applyBtn">Update profile and recommendation</button></div></div></div>`;
  document.getElementById('backBtn').onclick=resultsScreen;
  document.getElementById('applyBtn').onclick=()=>{
    const updated = {...current};
    document.querySelectorAll('select[data-field]').forEach(el=>updated[el.dataset.field]=el.value);
    state.editedInference = updated;
    state.note = 'We updated both the inferred preference profile and the recommendation based on your correction.';
    buildFromCurrent();
    log('corrective_recourse',{updated});
    resultsScreen();
  };
}

function downloadLog(){
  const blob = new Blob([JSON.stringify(state.log,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rs-followup-${state.product}-${state.condition}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function render(){ syncParams(); if(state.page==='setup') return setupScreen(); if(state.page==='intro') return introScreen(); if(state.page==='question') return questionScreen(); if(state.page==='results') return resultsScreen(); }
parseParams(); render();
