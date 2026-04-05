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

const conditionInfo = {
  explanation: { group: 'original', label: 'Explanation only', defaultProduct: 'usb' },
  steering: { group: 'original', label: 'Steering control', defaultProduct: 'usb' },
  recourse: { group: 'original', label: 'Recourse', defaultProduct: 'usb' },
  both: { group: 'original', label: 'Steering + recourse', defaultProduct: 'usb' },
  expressive: { group: 'followup', label: 'Expressive recourse', defaultProduct: 'wine' },
  corrective: { group: 'followup', label: 'Corrective recourse', defaultProduct: 'wine' }
};

const app = document.getElementById('app');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const saveModalBtn = document.getElementById('saveModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

const state = {
  step: 'setup',
  product: 'wine',
  condition: 'corrective',
  directResponses: {},
  profileResponses: {},
  sliderValue: 50,
  inference: {},
  inferenceNarrative: '',
  editedInference: null,
  expressiveFeedback: [],
  recommendations: [],
  selectedItem: null,
  log: []
};

function isFollowup() {
  return ['expressive', 'corrective'].includes(state.condition);
}

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  const product = params.get('product');
  const condition = params.get('condition');
  if (product && directFields[product]) state.product = product;
  if (condition && conditionInfo[condition]) {
    state.condition = condition;
    if (!product) state.product = conditionInfo[condition].defaultProduct;
  }
}

function updateQuery() {
  const params = new URLSearchParams();
  params.set('product', state.product);
  params.set('condition', state.condition);
  history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
}

function logEvent(type, detail = {}) {
  state.log.push({ type, detail, time: new Date().toISOString() });
}

function resetState() {
  state.step = 'setup';
  state.product = 'wine';
  state.condition = 'corrective';
  state.directResponses = {};
  state.profileResponses = {};
  state.sliderValue = 50;
  state.inference = {};
  state.inferenceNarrative = '';
  state.editedInference = null;
  state.expressiveFeedback = [];
  state.recommendations = [];
  state.selectedItem = null;
  state.log = [];
  updateQuery();
  render();
}

function scoreItem(product, item, attrs, sliderValue = 50) {
  let match = 0;
  directFields[product].forEach(field => {
    if (item[field.key] === attrs[field.key]) match += 3;
  });
  if (product === 'wine') {
    if (sliderValue > 65 && item.body === attrs.body) match += 1;
    if (sliderValue < 35 && item.budget === attrs.budget) match += 1;
  } else {
    if (sliderValue > 65 && item.speed === attrs.speed) match += 1;
    if (sliderValue < 35 && item.budget === attrs.budget) match += 1;
  }
  return match;
}

function buildRecommendations(product, attrs, sliderValue = 50) {
  return [...catalog[product]]
    .map(item => ({ ...item, score: scoreItem(product, item, attrs, sliderValue) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function inferProfile(product, responses) {
  if (product === 'wine') {
    const attrs = { type: 'red', sweetness: 'dry', body: 'medium', budget: '$20–30' };
    let narrative = 'you tend to gravitate toward classic, food-friendly wines';
    if (responses.style === 'crisp white') {
      attrs.type = 'white'; attrs.sweetness = 'dry'; attrs.body = 'light';
      narrative = 'you seem to prefer fresher, crisper wines with a lighter feel';
    } else if (responses.style === 'easygoing sipper') {
      attrs.type = 'rosé'; attrs.sweetness = 'medium'; attrs.body = 'light';
      narrative = 'you seem to prefer approachable wines that are easy to enjoy casually';
    } else {
      attrs.type = 'red'; attrs.sweetness = 'dry'; attrs.body = 'full';
      narrative = 'you seem to prefer fuller, more structured wines';
    }
    if (responses.occasion === 'casual weekend') attrs.body = attrs.body === 'full' ? 'medium' : attrs.body;
    if (responses.occasion === 'gift or special meal') { attrs.body = 'full'; narrative += ' and that suit a more deliberate occasion'; }
    if (responses.spend === 'value first') attrs.budget = 'Under $20';
    if (responses.spend === 'premium if worth it') attrs.budget = '$30+';
    return { attrs, narrative };
  }
  const attrs = { capacity: '128GB', speed: 'medium', durability: 'medium', budget: '$20–30' };
  let narrative = 'you seem to prefer dependable USB drives for everyday use';
  if (responses.usage === 'large file storage') {
    attrs.capacity = '256GB'; attrs.speed = 'high'; attrs.durability = 'medium';
    narrative = 'you seem to prioritize storage-heavy use and smoother file handling';
  } else if (responses.usage === 'rugged carry-around use') {
    attrs.capacity = '64GB'; attrs.speed = 'medium'; attrs.durability = 'high';
    narrative = 'you seem to value durability and dependable everyday carry';
  }
  if (responses.priority === 'value first') { attrs.budget = 'Under $20'; attrs.speed = attrs.speed === 'high' ? 'medium' : attrs.speed; }
  if (responses.priority === 'speed first') { attrs.speed = 'high'; attrs.budget = '$20–30'; }
  if (responses.scale === 'basic files') attrs.capacity = '64GB';
  if (responses.scale === 'large media files') attrs.capacity = '256GB';
  return { attrs, narrative };
}

function summaryText(product, attrs, narrative, corrected = false) {
  const prefix = corrected ? 'Updated understanding:' : 'Based on your inputs, we inferred that';
  if (product === 'wine') {
    return `${prefix} ${narrative}; specifically, ${attrs.sweetness}, ${attrs.body}-bodied ${attrs.type} wines in the ${attrs.budget.toLowerCase()} range.`;
  }
  return `${prefix} ${narrative}; specifically, ${attrs.capacity} USB drives with ${attrs.speed} transfer speed, ${attrs.durability} durability, and a budget of ${attrs.budget}.`;
}

function rerankFromExpressive(product, baseAttrs, reasons, sliderValue = 50) {
  const alt = { ...baseAttrs };
  if (product === 'wine') {
    if (reasons.includes('too_bold')) alt.body = baseAttrs.body === 'full' ? 'light' : 'medium';
    if (reasons.includes('wrong_occasion')) alt.type = baseAttrs.type === 'red' ? 'white' : 'red';
    if (reasons.includes('price')) alt.budget = baseAttrs.budget === '$30+' ? '$20–30' : 'Under $20';
    if (reasons.includes('style_miss')) alt.sweetness = baseAttrs.sweetness === 'dry' ? 'medium' : 'dry';
  } else {
    if (reasons.includes('too_basic')) { alt.capacity = '256GB'; alt.speed = 'high'; }
    if (reasons.includes('too_specialized')) { alt.capacity = '128GB'; alt.speed = 'medium'; }
    if (reasons.includes('price')) alt.budget = 'Under $20';
    if (reasons.includes('style_miss')) alt.durability = baseAttrs.durability === 'high' ? 'standard' : 'high';
  }
  return buildRecommendations(product, alt, sliderValue);
}

function validateResponses() {
  const needed = isFollowup() ? inferencePrompts[state.product] : directFields[state.product];
  const source = isFollowup() ? state.profileResponses : state.directResponses;
  const missing = needed.filter(f => !source[f.key]).map(f => f.label);
  if (!missing.length) return true;
  alert(`Please complete: ${missing.join(', ')}`);
  return false;
}

function render() {
  if (state.step === 'setup') return renderSetup();
  if (state.step === 'preferences') return renderPreferences();
  if (state.step === 'recommendations') return renderRecommendations();
  if (state.step === 'summary') return renderSummary();
}

function renderSetup() {
  app.innerHTML = `
    <div class="setup-grid">
      <section class="panel card">
        <h2 class="section-title">Select a context and condition</h2>
        <p class="section-text">Original USB and wine conditions are preserved. The follow-up conditions keep the same inference-based RS flow and compare expressive versus corrective recourse.</p>
        <div class="control-group">
          <label class="label" for="productSelect">Product context</label>
          <select id="productSelect" class="select">
            <option value="wine" ${state.product === 'wine' ? 'selected' : ''}>Wine</option>
            <option value="usb" ${state.product === 'usb' ? 'selected' : ''}>USB drive</option>
          </select>
        </div>
        <div class="control-group">
          <label class="label" for="conditionSelect">Condition</label>
          <select id="conditionSelect" class="select">
            <optgroup label="Original study conditions">
              <option value="explanation" ${state.condition === 'explanation' ? 'selected' : ''}>Explanation only</option>
              <option value="steering" ${state.condition === 'steering' ? 'selected' : ''}>Steering control</option>
              <option value="recourse" ${state.condition === 'recourse' ? 'selected' : ''}>Recourse</option>
              <option value="both" ${state.condition === 'both' ? 'selected' : ''}>Steering + recourse</option>
            </optgroup>
            <optgroup label="Follow-up conditions">
              <option value="expressive" ${state.condition === 'expressive' ? 'selected' : ''}>Expressive recourse</option>
              <option value="corrective" ${state.condition === 'corrective' ? 'selected' : ''}>Corrective recourse</option>
            </optgroup>
          </select>
        </div>
        <div class="btn-row"><button id="startBtn">Start prototype</button></div>
      </section>
      <aside class="panel card">
        <h3 class="section-title">Condition logic</h3>
        <dl class="kv">
          <dt>Original conditions</dt><dd>Keep the existing direct-preference RS structure from the USB and wine studies.</dd>
          <dt>Expressive recourse</dt><dd>Users can say what feels off about the recommendation and receive an updated list, but the system’s inferred interpretation remains unchanged.</dd>
          <dt>Corrective recourse</dt><dd>Users can correct the system’s inferred interpretation, which updates both the explanation and the recommendation list.</dd>
        </dl>
        <p class="footer-note">Deep link example: <code>?product=wine&condition=corrective</code></p>
      </aside>
    </div>
  `;
  document.getElementById('productSelect').addEventListener('change', e => { state.product = e.target.value; updateQuery(); });
  document.getElementById('conditionSelect').addEventListener('change', e => { state.condition = e.target.value; updateQuery(); });
  document.getElementById('startBtn').addEventListener('click', () => {
    state.step = 'preferences';
    logEvent('setup_start', { product: state.product, condition: state.condition });
    render();
  });
}

function renderPreferences() {
  const useFollowup = isFollowup();
  const questions = useFollowup ? inferencePrompts[state.product] : directFields[state.product];
  const responses = useFollowup ? state.profileResponses : state.directResponses;
  const title = useFollowup
    ? (state.product === 'wine' ? 'Tell us a bit about your wine preferences and situation' : 'Tell us a bit about your USB preferences and usage')
    : (state.product === 'wine' ? 'Tell us about your wine preferences' : 'Tell us about your USB preferences');
  const help = useFollowup
    ? 'The system will use these inputs to infer the style of products that may fit you, and then explain why the recommendation was generated.'
    : 'Your inputs will be used to build a preference profile and explain why certain products are recommended.';

  app.innerHTML = `
    <section class="panel card">
      <h2 class="section-title">${title}</h2>
      <p class="section-text">${help}</p>
      <div class="preference-grid">
        ${questions.map(field => `
          <div class="control-group">
            <div class="label">${field.label}</div>
            <div class="radio-list">
              ${field.options.map(option => `
                <label class="pill">
                  <input type="radio" name="${field.key}" value="${option}" ${responses[field.key] === option ? 'checked' : ''} />
                  <span>${option}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      ${(!useFollowup && (state.condition === 'steering' || state.condition === 'both')) ? `
        <div class="slider-box">
          <div class="label">Adjust how the recommender balances different information sources</div>
          <div class="slider-labels"><span>More similar users</span><span>More product attributes</span></div>
          <input id="balanceSlider" type="range" min="0" max="100" value="${state.sliderValue}" />
          <div class="small-text">Current balance: <strong id="sliderValue">${state.sliderValue}</strong></div>
        </div>
      ` : ''}
      <div class="btn-row">
        <button id="continueBtn">See recommendations</button>
        <button id="backBtn" class="secondary">Back</button>
      </div>
    </section>
  `;

  questions.forEach(field => {
    document.querySelectorAll(`input[name="${field.key}"]`).forEach(el => {
      el.addEventListener('change', e => {
        if (useFollowup) state.profileResponses[field.key] = e.target.value;
        else state.directResponses[field.key] = e.target.value;
      });
    });
  });

  const slider = document.getElementById('balanceSlider');
  if (slider) {
    slider.addEventListener('input', e => {
      state.sliderValue = Number(e.target.value);
      document.getElementById('sliderValue').textContent = state.sliderValue;
    });
  }

  document.getElementById('backBtn').addEventListener('click', () => { state.step = 'setup'; render(); });
  document.getElementById('continueBtn').addEventListener('click', () => {
    if (!validateResponses()) return;
    if (useFollowup) {
      const inferred = inferProfile(state.product, state.profileResponses);
      state.inference = inferred.attrs;
      state.inferenceNarrative = inferred.narrative;
      logEvent('inference_inputs_submitted', { profileResponses: state.profileResponses, inferred });
    } else {
      state.inference = { ...state.directResponses };
      state.inferenceNarrative = state.product === 'wine'
        ? 'you prefer wines that match the style profile you specified'
        : 'you prefer devices that match the performance profile you specified';
      logEvent('preferences_submitted', { preferences: state.directResponses, sliderValue: state.sliderValue });
    }
    state.editedInference = null;
    state.expressiveFeedback = [];
    state.recommendations = buildRecommendations(state.product, state.inference, state.sliderValue);
    state.step = 'recommendations';
    render();
  });
}

function renderRecommendations() {
  const attrs = state.editedInference || state.inference;
  const currentSummary = summaryText(state.product, attrs, state.inferenceNarrative, Boolean(state.editedInference));
  const info = conditionInfo[state.condition];
  const showSteeringNote = ['steering', 'both'].includes(state.condition);
  const recourseType = (state.condition === 'expressive') ? 'expressive' : (['recourse', 'both', 'corrective'].includes(state.condition) ? 'corrective' : null);

  app.innerHTML = `
    <div class="recommendation-grid">
      <section class="panel card">
        <h2 class="section-title">Recommended ${state.product === 'wine' ? 'wine' : 'USB'} options</h2>
        <p class="section-text">Review the recommendations below. If a response tool is available, use it before making your final choice.</p>
        <div class="recommendation-list">
          ${state.recommendations.map((item, idx) => `
            <article class="product-card">
              <div class="product-top">
                <div>
                  <span class="badge ${idx === 0 ? '' : 'warn'}">${idx === 0 ? 'Top recommendation' : 'Alternative'}</span>
                  <h3 class="product-title">${item.name}</h3>
                </div>
                <span class="product-rank">${idx + 1}</span>
              </div>
              <div class="meta"><span>${item.price}</span><span>${item.cue}</span></div>
              <button class="chooseBtn" data-id="${item.id}">Select this option</button>
            </article>
          `).join('')}
        </div>
      </section>
      <aside class="panel card">
        <div class="summary-box">
          <h3>Why these recommendations?</h3>
          <p class="section-text">The system inferred a style profile from your inputs and used it to generate recommendations.</p>
          <div class="summary-line">${currentSummary}</div>
          ${showSteeringNote ? `<div class="small-text" style="margin-top:12px;">Source balance used at recommendation time: <strong>${state.sliderValue}</strong> / 100</div>` : ''}
          ${recourseType === 'expressive' ? `
            <div class="btn-row"><button id="expressiveBtn" class="secondary">This doesn't feel right</button></div>
            <div id="expressiveAlert" class="alert hidden"></div>
          ` : ''}
          ${recourseType === 'corrective' ? `
            <div class="btn-row"><button id="correctiveBtn" class="secondary">Review or correct preference interpretation</button></div>
            <div id="correctiveAlert" class="alert hidden"></div>
          ` : ''}
        </div>
        <p class="footer-note">Condition: <strong>${info.label}</strong></p>
      </aside>
    </div>
  `;

  document.querySelectorAll('.chooseBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const item = state.recommendations.find(p => p.id === e.currentTarget.dataset.id);
      state.selectedItem = item;
      logEvent('item_selected', { itemId: item.id, condition: state.condition, product: state.product });
      state.step = 'summary';
      render();
    });
  });

  if (recourseType === 'expressive') document.getElementById('expressiveBtn').addEventListener('click', openExpressiveModal);
  if (recourseType === 'corrective') document.getElementById('correctiveBtn').addEventListener('click', openCorrectiveModal);
}

function openExpressiveModal() {
  modalTitle.textContent = 'Tell us what felt off';
  modalBody.innerHTML = `
    <p class="section-text">You can indicate what seems off about the recommendation. The recommender will revise the current list, but the current inferred preference interpretation will remain unchanged.</p>
    <div class="checkbox-list">
      ${expressiveReasons[state.product].map(reason => `
        <label class="pill">
          <input type="checkbox" name="reason" value="${reason.key}" ${state.expressiveFeedback.includes(reason.key) ? 'checked' : ''} />
          <span>${reason.label}</span>
        </label>
      `).join('')}
    </div>
  `;
  saveModalBtn.textContent = 'Update recommendations';
  modalBackdrop.classList.remove('hidden');
  saveModalBtn.onclick = () => {
    const selected = [...document.querySelectorAll('input[name="reason"]:checked')].map(el => el.value);
    if (!selected.length) return alert('Please select at least one response.');
    state.expressiveFeedback = selected;
    state.recommendations = rerankFromExpressive(state.product, state.inference, selected, state.sliderValue);
    logEvent('expressive_recourse_submitted', { reasons: selected });
    closeModal();
    renderRecommendations();
    const alertEl = document.getElementById('expressiveAlert');
    if (alertEl) {
      alertEl.textContent = 'The recommendation list was updated based on your feedback. The current interpretation summary remains unchanged.';
      alertEl.classList.remove('hidden');
    }
  };
}

function openCorrectiveModal() {
  modalTitle.textContent = 'Review or correct preference interpretation';
  const current = { ...(state.editedInference || state.inference) };
  modalBody.innerHTML = `
    <p class="section-text">Does our understanding of your preferences look right? Update the interpretation below to refresh both the explanation and the recommendation list.</p>
    ${directFields[state.product].map(field => `
      <div class="control-group">
        <label class="label" for="modal_${field.key}">${field.label}</label>
        <select id="modal_${field.key}" class="select">
          ${field.options.map(opt => `<option value="${opt}" ${current[field.key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>
    `).join('')}
  `;
  saveModalBtn.textContent = 'Save changes';
  modalBackdrop.classList.remove('hidden');
  saveModalBtn.onclick = () => {
    const updated = {};
    directFields[state.product].forEach(field => { updated[field.key] = document.getElementById(`modal_${field.key}`).value; });
    state.editedInference = updated;
    state.recommendations = buildRecommendations(state.product, updated, state.sliderValue);
    logEvent('corrective_recourse_submitted', { updatedInference: updated });
    closeModal();
    renderRecommendations();
    const alertEl = document.getElementById('correctiveAlert');
    if (alertEl) {
      alertEl.textContent = 'Your interpretation summary and recommendations were updated based on your corrections.';
      alertEl.classList.remove('hidden');
    }
  };
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
}

function renderSummary() {
  const attrs = state.editedInference || state.inference;
  const finalSummary = summaryText(state.product, attrs, state.inferenceNarrative, Boolean(state.editedInference));
  app.innerHTML = `
    <div class="summary-grid">
      <section class="panel card">
        <h2 class="section-title">Final choice submitted</h2>
        <p class="section-text">The selected item appears below. You can export the session log for piloting or handoff.</p>
        <div class="product-card">
          <div class="product-top">
            <div>
              <span class="badge pick">Selected option</span>
              <h3 class="product-title">${state.selectedItem?.name || 'No item selected'}</h3>
            </div>
          </div>
          <div class="meta"><span>${state.selectedItem?.price || ''}</span><span>${state.selectedItem?.cue || ''}</span></div>
        </div>
        <div class="summary-box" style="margin-top:16px;">
          <h3>Final explanation summary</h3>
          <div class="summary-line">${finalSummary}</div>
        </div>
        <div class="btn-row">
          <button id="downloadBtn">Download session JSON</button>
          <button id="restartBtn" class="secondary">Run another condition</button>
        </div>
      </section>
      <aside class="panel card">
        <h3 class="section-title">Session log</h3>
        <pre class="log">${JSON.stringify({
          product: state.product,
          condition: state.condition,
          directResponses: state.directResponses,
          profileResponses: state.profileResponses,
          inference: state.inference,
          editedInference: state.editedInference,
          expressiveFeedback: state.expressiveFeedback,
          selectedItem: state.selectedItem,
          log: state.log
        }, null, 2)}</pre>
      </aside>
    </div>
  `;
  document.getElementById('downloadBtn').addEventListener('click', downloadLog);
  document.getElementById('restartBtn').addEventListener('click', resetState);
}

function downloadLog() {
  const data = {
    product: state.product,
    condition: state.condition,
    directResponses: state.directResponses,
    profileResponses: state.profileResponses,
    inference: state.inference,
    editedInference: state.editedInference,
    expressiveFeedback: state.expressiveFeedback,
    recommendationsAtEnd: state.recommendations,
    selectedItem: state.selectedItem,
    log: state.log
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.product}-${state.condition}-session.json`;
  a.click();
  URL.revokeObjectURL(url);
}

closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
document.getElementById('resetBtn').addEventListener('click', resetState);

parseParams();
updateQuery();
render();
