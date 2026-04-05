
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

const fields = {
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

const objectionReasons = {
  wine: [
    { key: 'sweetness', label: 'The recommendation misses my preferred sweetness level.' },
    { key: 'body', label: 'The recommendation has the wrong body or intensity.' },
    { key: 'type', label: 'The recommendation is the wrong wine type.' },
    { key: 'budget', label: 'The recommendation does not fit my budget.' }
  ],
  usb: [
    { key: 'capacity', label: 'The recommendation does not meet my storage needs.' },
    { key: 'speed', label: 'The recommendation has the wrong transfer speed.' },
    { key: 'durability', label: 'The recommendation has the wrong durability profile.' },
    { key: 'budget', label: 'The recommendation does not fit my budget.' }
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

const state = {
  step: 'setup',
  product: 'wine',
  condition: 'corrective',
  preferences: {},
  sliderValue: 50,
  inference: {},
  editedInference: null,
  expressiveReasons: [],
  recommendations: [],
  selectedItem: null,
  log: []
};

const app = document.getElementById('app');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const saveModalBtn = document.getElementById('saveModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const resetBtn = document.getElementById('resetBtn');

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  const product = params.get('product');
  const condition = params.get('condition');
  if (product && fields[product]) state.product = product;
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
  state.preferences = {};
  state.sliderValue = 50;
  state.inference = {};
  state.editedInference = null;
  state.expressiveReasons = [];
  state.recommendations = [];
  state.selectedItem = null;
  state.log = [];
  updateQuery();
  render();
}

function validatePreferences() {
  const missing = fields[state.product].filter(f => !state.preferences[f.key]).map(f => f.label);
  if (!missing.length) return true;
  alert(`Please complete: ${missing.join(', ')}`);
  return false;
}

function scoreItem(item, inference, sliderValue = 50) {
  let match = 0;
  fields[state.product].forEach(field => {
    if (item[field.key] === inference[field.key]) match += 3;
  });
  if (state.product === 'wine') {
    if (sliderValue > 65 && item.body === inference.body) match += 1;
    if (sliderValue < 35 && item.budget === inference.budget) match += 1;
  } else {
    if (sliderValue > 65 && item.speed === inference.speed) match += 1;
    if (sliderValue < 35 && item.budget === inference.budget) match += 1;
  }
  return match;
}

function buildRecommendations(product, inference, sliderValue = 50) {
  return [...catalog[product]]
    .map(item => ({ ...item, score: scoreItem(item, inference, sliderValue) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function summaryText(product, inference) {
  if (product === 'wine') {
    return `Based on your inputs, we inferred that you prefer ${inference.sweetness}, ${inference.body}-bodied ${inference.type} wines in the ${inference.budget.toLowerCase()} range.`;
  }
  return `Based on your inputs, we inferred that you prefer ${inference.capacity} USB drives with ${inference.speed} transfer speed, ${inference.durability} durability, and a budget of ${inference.budget}.`;
}

function rerankFromObjections(product, inference, reasons, sliderValue = 50) {
  const penalties = new Set(reasons);
  return [...catalog[product]]
    .map(item => {
      let score = scoreItem(item, inference, sliderValue);
      reasons.forEach(reasonKey => {
        if (item[reasonKey] === inference[reasonKey]) score -= 4;
      });
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
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
        <p class="section-text">This prototype keeps the original USB and wine interfaces and adds the follow-up comparison between expressive and corrective recourse.</p>
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
        <div class="btn-row">
          <button id="startBtn">Start prototype</button>
        </div>
      </section>
      <aside class="panel card">
        <h3 class="section-title">Condition logic</h3>
        <dl class="kv">
          <dt>Explanation only</dt><dd>Recommendation logic is explained, but users cannot modify the process after seeing the output.</dd>
          <dt>Steering control</dt><dd>Users can adjust how the recommendation is generated before the output is shown.</dd>
          <dt>Recourse</dt><dd>Users can correct the system's interpretation after the recommendation is shown; both the explanation and the list update.</dd>
          <dt>Expressive recourse</dt><dd>Users can object to the recommendation and receive an updated list, but they cannot directly revise the system's interpretation.</dd>
          <dt>Corrective recourse</dt><dd>Users can correct the system's interpretation of their preferences, which updates both the explanation and the recommendations.</dd>
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
  const productFields = fields[state.product];
  const title = state.product === 'wine' ? 'Tell us about your wine preferences' : 'Tell us about your USB preferences';
  const help = state.product === 'wine'
    ? 'Your inputs will be used to build a preference profile and explain why certain wines are recommended.'
    : 'Your inputs will be used to build a preference profile and explain why certain USB drives are recommended.';
  app.innerHTML = `
    <section class="panel card">
      <h2 class="section-title">${title}</h2>
      <p class="section-text">${help}</p>
      <div class="preference-grid">
        ${productFields.map(field => `
          <div class="control-group">
            <div class="label">${field.label}</div>
            <div class="radio-list">
              ${field.options.map(option => `
                <label class="pill">
                  <input type="radio" name="${field.key}" value="${option}" ${state.preferences[field.key] === option ? 'checked' : ''} />
                  <span>${option}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      ${(state.condition === 'steering' || state.condition === 'both') ? `
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
  productFields.forEach(field => {
    document.querySelectorAll(`input[name="${field.key}"]`).forEach(el => {
      el.addEventListener('change', e => { state.preferences[field.key] = e.target.value; });
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
    if (!validatePreferences()) return;
    state.inference = { ...state.preferences };
    state.editedInference = null;
    state.expressiveReasons = [];
    state.recommendations = buildRecommendations(state.product, state.inference, state.sliderValue);
    logEvent('preferences_submitted', { preferences: state.preferences, sliderValue: state.sliderValue });
    state.step = 'recommendations';
    render();
  });
}

function renderRecommendations() {
  const currentSummary = summaryText(state.product, state.editedInference || state.inference);
  const info = conditionInfo[state.condition];
  const showSteeringNote = ['steering', 'both'].includes(state.condition);
  const recourseType =
    (state.condition === 'recourse' || state.condition === 'both' || state.condition === 'corrective') ? 'corrective' :
    (state.condition === 'expressive' ? 'expressive' : null);

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
          <p class="section-text">The system combines your stated preferences with product information to generate recommendations.</p>
          <div class="summary-line" id="summaryLine">${currentSummary}</div>
          ${showSteeringNote ? `<div class="small-text" style="margin-top:12px;">Source balance used at recommendation time: <strong>${state.sliderValue}</strong> / 100</div>` : ''}
          ${recourseType === 'expressive' ? `
            <div class="btn-row">
              <button id="expressiveBtn" class="secondary">This recommendation does not fit me</button>
            </div>
            <div id="expressiveAlert" class="alert hidden"></div>
          ` : ''}
          ${recourseType === 'corrective' ? `
            <div class="btn-row">
              <button id="correctiveBtn" class="secondary">Review or correct preference interpretation</button>
            </div>
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
      logEvent('item_selected', { itemId: item.id, name: item.name, condition: state.condition, product: state.product });
      state.step = 'summary';
      render();
    });
  });

  if (recourseType === 'expressive') {
    document.getElementById('expressiveBtn').addEventListener('click', openExpressiveModal);
  }
  if (recourseType === 'corrective') {
    document.getElementById('correctiveBtn').addEventListener('click', openCorrectiveModal);
  }
}

function openExpressiveModal() {
  modalTitle.textContent = 'Tell us what felt off';
  modalBody.innerHTML = `
    <p class="section-text">You can indicate why the current recommendation does not fit. The recommender will use this feedback to update the recommendation list, but the current preference interpretation remains unchanged.</p>
    <div class="checkbox-list">
      ${objectionReasons[state.product].map(reason => `
        <label class="pill">
          <input type="checkbox" name="reason" value="${reason.key}" ${state.expressiveReasons.includes(reason.key) ? 'checked' : ''} />
          <span>${reason.label}</span>
        </label>
      `).join('')}
    </div>
  `;
  saveModalBtn.textContent = 'Update recommendations';
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'false');

  saveModalBtn.onclick = () => {
    const selected = [...document.querySelectorAll('input[name="reason"]:checked')].map(el => el.value);
    if (!selected.length) {
      alert('Please select at least one reason.');
      return;
    }
    state.expressiveReasons = selected;
    state.recommendations = rerankFromObjections(state.product, state.inference, selected, state.sliderValue);
    logEvent('expressive_recourse_submitted', { reasons: selected });
    closeModal();
    renderRecommendations();
    const alertEl = document.getElementById('expressiveAlert');
    if (alertEl) {
      alertEl.textContent = 'The recommendation list was updated based on your feedback. The current explanation remains unchanged.';
      alertEl.classList.remove('hidden');
    }
  };
}

function openCorrectiveModal() {
  modalTitle.textContent = 'Review or correct preference interpretation';
  const current = { ...(state.editedInference || state.inference) };
  modalBody.innerHTML = `
    <p class="section-text">Does our understanding of your preferences look right? Update any part of the current interpretation to refresh both the explanation and the recommendation list.</p>
    ${fields[state.product].map(field => `
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
  modalBackdrop.setAttribute('aria-hidden', 'false');

  saveModalBtn.onclick = () => {
    const updated = {};
    fields[state.product].forEach(field => {
      updated[field.key] = document.getElementById(`modal_${field.key}`).value;
    });
    state.editedInference = updated;
    state.recommendations = buildRecommendations(state.product, updated, state.sliderValue);
    logEvent('corrective_recourse_submitted', { updatedInference: updated });
    closeModal();
    renderRecommendations();
    const alertEl = document.getElementById('correctiveAlert');
    if (alertEl) {
      alertEl.textContent = 'Your recommendations have been updated based on your revised preferences.';
      alertEl.classList.remove('hidden');
    }
  };
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'true');
}

function renderSummary() {
  const finalSummary = summaryText(state.product, state.editedInference || state.inference);
  app.innerHTML = `
    <div class="summary-grid">
      <section class="panel card">
        <h2 class="section-title">Final choice submitted</h2>
        <p class="section-text">The selected item appears below. You can export the full session log for piloting or handoff.</p>
        <div class="product-card">
          <div class="product-top">
            <div>
              <span class="badge pick">Selected option</span>
              <h3 class="product-title">${state.selectedItem?.name || 'No item selected'}</h3>
            </div>
          </div>
          <div class="meta"><span>${state.selectedItem?.price || ''}</span><span>${state.selectedItem?.cue || ''}</span></div>
        </div>
        <div class="summary-box" style="margin-top: 16px;">
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
          preferences: state.preferences,
          editedInference: state.editedInference,
          expressiveReasons: state.expressiveReasons,
          recommendationsAtEnd: state.recommendations,
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
    preferences: state.preferences,
    editedInference: state.editedInference,
    expressiveReasons: state.expressiveReasons,
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
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});
resetBtn.addEventListener('click', resetState);

parseParams();
updateQuery();
render();
