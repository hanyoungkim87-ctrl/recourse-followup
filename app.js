const app = document.getElementById('app');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const saveModalBtn = document.getElementById('saveModalBtn');
const resetBtn = document.getElementById('resetBtn');

const catalog = {
  wine: [
    { id: 'w1', name: 'Oak Ridge Cabernet', type: 'red', sweetness: 'dry', body: 'full', budget: '$20–30', price: '$24', cue: 'Cabernet • dry • full-bodied' },
    { id: 'w2', name: 'Silver Creek Pinot Noir', type: 'red', sweetness: 'dry', body: 'medium', budget: '$20–30', price: '$22', cue: 'Pinot Noir • dry • medium-bodied' },
    { id: 'w3', name: 'Cloudline Sauvignon Blanc', type: 'white', sweetness: 'dry', body: 'light', budget: 'Under $20', price: '$17', cue: 'Sauvignon Blanc • dry • crisp' },
    { id: 'w4', name: 'Golden Vale Chardonnay', type: 'white', sweetness: 'medium', body: 'full', budget: '$20–30', price: '$26', cue: 'Chardonnay • round • richer body' },
    { id: 'w5', name: 'Evening Bloom Rosé', type: 'rosé', sweetness: 'medium', body: 'light', budget: 'Under $20', price: '$18', cue: 'Rosé • refreshing • easy-drinking' },
    { id: 'w6', name: 'Velvet Reserve Merlot', type: 'red', sweetness: 'medium', body: 'full', budget: '$20–30', price: '$23', cue: 'Merlot • smooth • plush' }
  ],
  usb: [
    { id: 'u1', name: 'FlashPro 128GB', capacity: '128GB', speed: 'high', durability: 'standard', budget: '$20–30', price: '$24', cue: 'USB 3.2 • fast read speed' },
    { id: 'u2', name: 'ArmorDrive 64GB', capacity: '64GB', speed: 'medium', durability: 'high', budget: 'Under $20', price: '$18', cue: 'Rugged metal body • keychain loop' },
    { id: 'u3', name: 'QuickSync 256GB', capacity: '256GB', speed: 'high', durability: 'medium', budget: '$30+', price: '$38', cue: 'High capacity • high-speed transfers' },
    { id: 'u4', name: 'PocketLite 64GB', capacity: '64GB', speed: 'medium', durability: 'standard', budget: 'Under $20', price: '$14', cue: 'Compact • everyday storage' },
    { id: 'u5', name: 'SafeStore 128GB', capacity: '128GB', speed: 'low', durability: 'high', budget: '$20–30', price: '$21', cue: 'Protective shell • reliable backup' },
    { id: 'u6', name: 'TurboStick 128GB', capacity: '128GB', speed: 'high', durability: 'medium', budget: '$20–30', price: '$27', cue: 'Fast transfer • retractable connector' }
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

const conditionInfo = {
  explanation: { study: 'original', label: 'Explanation only', productDefault: 'usb' },
  steering: { study: 'original', label: 'Steering control', productDefault: 'usb' },
  recourse: { study: 'original', label: 'Recourse', productDefault: 'usb' },
  both: { study: 'original', label: 'Steering + recourse', productDefault: 'usb' },
  outcome: { study: 'followup', label: 'Outcome flexibility', productDefault: 'wine' },
  process: { study: 'followup', label: 'Process recourse', productDefault: 'wine' }
};

const state = {
  step: 'setup',
  product: 'wine',
  condition: 'process',
  preferences: {},
  sliderValue: 50,
  inference: {},
  editedInference: null,
  recommendations: [],
  alternativesShown: false,
  selectedItem: null,
  log: []
};

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  const product = params.get('product');
  const condition = params.get('condition');
  if (product && catalog[product]) state.product = product;
  if (condition && conditionInfo[condition]) {
    state.condition = condition;
    if (!product) state.product = conditionInfo[condition].productDefault;
  }
}

function logEvent(type, detail = {}) {
  state.log.push({
    type,
    detail,
    time: new Date().toISOString()
  });
}

function resetState() {
  state.step = 'setup';
  state.product = 'wine';
  state.condition = 'process';
  state.preferences = {};
  state.sliderValue = 50;
  state.inference = {};
  state.editedInference = null;
  state.recommendations = [];
  state.alternativesShown = false;
  state.selectedItem = null;
  state.log = [];
  window.history.replaceState({}, '', window.location.pathname);
  render();
}

function setupFromParamsOrDefaults() {
  parseParams();
  if (!catalog[state.product]) state.product = 'wine';
  if (!conditionInfo[state.condition]) state.condition = 'process';
}

function updateQuery() {
  const params = new URLSearchParams();
  params.set('product', state.product);
  params.set('condition', state.condition);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

function render() {
  switch (state.step) {
    case 'setup': return renderSetup();
    case 'preferences': return renderPreferences();
    case 'recommendations': return renderRecommendations();
    case 'summary': return renderSummary();
    default: return renderSetup();
  }
}

function renderSetup() {
  app.innerHTML = `
    <div class="setup-grid">
      <section class="panel card">
        <h2 class="section-title">Select a context and condition</h2>
        <p class="section-text">This prototype preserves the original USB and wine interfaces while adding the follow-up comparison between outcome flexibility and process recourse.</p>
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
            <optgroup label="Follow-up study conditions">
              <option value="outcome" ${state.condition === 'outcome' ? 'selected' : ''}>Outcome flexibility</option>
              <option value="process" ${state.condition === 'process' ? 'selected' : ''}>Process recourse</option>
            </optgroup>
          </select>
        </div>
        <div class="btn-row">
          <button id="startBtn">Start prototype</button>
        </div>
      </section>
      <aside class="panel card">
        <h3 class="section-title">What changes across conditions?</h3>
        <dl class="kv">
          <dt>Explanation only</dt><dd>Recommendation logic is explained, but users cannot modify the process after viewing the output.</dd>
          <dt>Steering control</dt><dd>Users can adjust how the recommendation is generated before the output is shown.</dd>
          <dt>Recourse</dt><dd>Users can correct the system’s interpretation after the recommendation is shown, and the list updates.</dd>
          <dt>Outcome flexibility</dt><dd>Users can see alternative recommendations without changing the system’s current interpretation.</dd>
          <dt>Process recourse</dt><dd>Users can revise the system’s interpretation of their preferences, which updates both the explanation and the current recommendations.</dd>
        </dl>
        <p class="footer-note">Tip: You can deep-link conditions with URL parameters such as <code>?product=wine&condition=process</code>.</p>
      </aside>
    </div>
  `;

  document.getElementById('productSelect').addEventListener('change', e => {
    state.product = e.target.value;
    updateQuery();
  });
  document.getElementById('conditionSelect').addEventListener('change', e => {
    state.condition = e.target.value;
    updateQuery();
  });
  document.getElementById('startBtn').addEventListener('click', () => {
    logEvent('setup_start', { product: state.product, condition: state.condition });
    state.step = 'preferences';
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
            <div class="radio-list" data-field="${field.key}">
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
          <div class="small-text">Current balance: <span id="sliderValue">${state.sliderValue}</span></div>
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
      el.addEventListener('change', e => {
        state.preferences[field.key] = e.target.value;
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

  document.getElementById('backBtn').addEventListener('click', () => {
    state.step = 'setup';
    render();
  });

  document.getElementById('continueBtn').addEventListener('click', () => {
    if (!validatePreferences()) return;
    state.inference = { ...state.preferences };
    state.editedInference = null;
    state.alternativesShown = false;
    state.recommendations = buildRecommendations(state.product, state.inference, state.sliderValue);
    logEvent('preferences_submitted', { preferences: state.preferences, slider: state.sliderValue });
    state.step = 'recommendations';
    render();
  });
}

function validatePreferences() {
  const missing = fields[state.product].filter(f => !state.preferences[f.key]).map(f => f.label);
  if (!missing.length) return true;
  alert(`Please complete: ${missing.join(', ')}`);
  return false;
}

function scoreItem(item, inference, sliderValue = 50) {
  let match = 0;
  const productFields = fields[state.product];
  productFields.forEach(field => {
    if (item[field.key] === inference[field.key]) match += 3;
  });
  if (state.product === 'wine') {
    if (sliderValue > 65 && item.body === inference.body) match += 1;
    if (sliderValue < 35 && item.budget === inference.budget) match += 1;
  }
  if (state.product === 'usb') {
    if (sliderValue > 65 && item.speed === inference.speed) match += 1;
    if (sliderValue < 35 && item.budget === inference.budget) match += 1;
  }
  return match;
}

function buildRecommendations(product, inference, sliderValue) {
  return [...catalog[product]]
    .map(item => ({ ...item, score: scoreItem(item, inference, sliderValue) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function buildAlternativeRecommendations(product, inference) {
  return [...catalog[product]]
    .map(item => ({ ...item, score: scoreItem(item, inference, 50) }))
    .sort((a, b) => a.score - b.score)
    .reverse()
    .slice(1, 5);
}

function summaryText(product, inference) {
  if (product === 'wine') {
    return `Based on your inputs, we inferred that you prefer ${inference.sweetness}, ${inference.body}-bodied ${inference.type} wines in the ${inference.budget.toLowerCase()} range.`;
  }
  return `Based on your inputs, we inferred that you prefer ${inference.capacity} USB drives with ${inference.speed} transfer speed, ${inference.durability} durability, and a budget of ${inference.budget}.`;
}

function renderRecommendations() {
  const info = conditionInfo[state.condition];
  const showRecourse = ['recourse', 'both', 'process'].includes(state.condition);
  const showOutcomeFlex = state.condition === 'outcome';
  const showSteeringExplanation = ['steering', 'both'].includes(state.condition);
  const productLabel = state.product === 'wine' ? 'wine' : 'USB';
  const currentSummary = summaryText(state.product, state.editedInference || state.inference);

  app.innerHTML = `
    <div class="recommendation-grid">
      <section class="panel card">
        <h2 class="section-title">Recommended ${productLabel} options</h2>
        <p class="section-text">Review the recommendations below, then use the available tool before making your final choice.</p>
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
          <p class="section-text">The system combines your stated preferences with product information to recommend options that fit your needs.</p>
          <div class="summary-line" id="summaryLine">${currentSummary}</div>
          ${showSteeringExplanation ? `
            <div class="small-text" style="margin-top: 12px;">Source balance at recommendation time: <strong>${state.sliderValue}</strong> / 100</div>
          ` : ''}
          ${showOutcomeFlex ? `
            <div class="btn-row">
              <button id="outcomeBtn" class="secondary">See alternative recommendations</button>
            </div>
            <div id="outcomeAlert" class="alert warn hidden">Here are other options based on the same preference profile. The current explanation remains unchanged.</div>
          ` : ''}
          ${showRecourse ? `
            <div class="btn-row">
              <button id="processBtn" class="secondary">Review or correct preference interpretation</button>
            </div>
            <div id="processAlert" class="alert hidden"></div>
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

  if (showOutcomeFlex) {
    document.getElementById('outcomeBtn').addEventListener('click', () => {
      state.alternativesShown = true;
      state.recommendations = buildAlternativeRecommendations(state.product, state.inference);
      logEvent('outcome_flex_used');
      renderRecommendations();
      const alertEl = document.getElementById('outcomeAlert');
      alertEl.classList.remove('hidden');
    });
  }

  if (showRecourse) {
    document.getElementById('processBtn').addEventListener('click', () => openRecourseModal());
  }
}

function openRecourseModal() {
  const current = { ...(state.editedInference || state.inference) };
  modalBody.innerHTML = `
    <p class="section-text">Does our understanding of your preferences look right?</p>
    ${fields[state.product].map(field => `
      <div class="control-group">
        <label class="label" for="modal_${field.key}">${field.label}</label>
        <select id="modal_${field.key}" class="select">
          ${field.options.map(opt => `<option value="${opt}" ${current[field.key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>
    `).join('')}
  `;
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'false');

  saveModalBtn.onclick = () => {
    const updated = {};
    fields[state.product].forEach(field => {
      updated[field.key] = document.getElementById(`modal_${field.key}`).value;
    });
    state.editedInference = updated;
    logEvent('process_recourse_submitted', { updated });
    closeModal();

    if (state.condition === 'process' || state.condition === 'recourse' || state.condition === 'both') {
      state.recommendations = buildRecommendations(state.product, updated, state.sliderValue);
      renderRecommendations();
      const alertEl = document.getElementById('processAlert');
      if (alertEl) {
        alertEl.textContent = 'Your recommendations have been updated based on your revised preferences.';
        alertEl.classList.remove('hidden', 'warn');
      }
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
        <p class="section-text">The participant selected the option below. You can export the interaction log for pilot testing or handoff.</p>
        <div class="product-card">
          <div class="product-top">
            <div>
              <span class="badge">Selected option</span>
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

setupFromParamsOrDefaults();
updateQuery();
render();
