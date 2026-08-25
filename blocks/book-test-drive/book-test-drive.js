// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', description: "Dacia's largest C-segment SUV, available with a full hybrid powertrain.", price: 'de la 20.490 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/oveview/dacia-bigster-db3l1-ph1-055-mobile.jpg.ximg.xsmall.jpg/4b67d90d3c.jpg' },
  { name: 'Dacia Duster', description: 'Rugged compact SUV offered in hybrid and eco-G (LPG) versions.', price: 'de la 17.100 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Duster%20GPL.jpg.ximg.large.webp/589927f26b.webp' },
  { name: 'Dacia Jogger', description: 'Versatile family car with 5 or 7 seats and a full hybrid option.', price: 'de la 16.650 EUR', category: 'Family MPV', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/5224fc9270.jpg' },
  { name: 'Dacia Spring', description: 'Compact all-electric city car with strong urban range.', price: 'de la 13.590 EUR', category: 'Electric city car', image_url: 'https://cdn.group.renault.com/dac/ro/gama-dacia/spring-desktop.jpg.ximg.largex2.webp/846b547c33.webp' },
  { name: 'Dacia Sandero', description: 'Stylish 5-seat city hatchback available with hybrid, eco-G, and TCe engines.', price: 'de la 13.541 EUR', category: 'City car', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero/sandero-bi1-ph2/herozone-banners/sandero-bi1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/0e69ac9dc8.jpg' },
  { name: 'Dacia Sandero Stepway', description: 'Crossover-styled supermini now offered with a hybrid 155 powertrain.', price: 'de la 13.741 EUR', category: 'Crossover', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-background-desktop-001.jpg.ximg.large.jpg/48eb89e802.jpg' },
  { name: 'Dacia Logan', description: 'Spacious and affordable family sedan with modern equipment.', price: 'de la 12.741 EUR', category: 'Sedan', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg' },
];

const MODELS = ['Dacia Bigster', 'Dacia Duster', 'Dacia Jogger', 'Dacia Spring', 'Dacia Sandero', 'Dacia Sandero Stepway', 'Dacia Logan'];

// Brand palette from the action payload — used to derive the header background.
const PALETTE = ['#646b52'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#646b52', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

const FIELDS = [
  { name: 'full_name', label: 'Full Name', type: 'text', placeholder: "Customer's full name.", required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Contact email address.', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: 'Contact phone number.', required: true },
  { name: 'model', label: 'Model', type: 'select', placeholder: 'Dacia model to test drive.', required: true, options: MODELS },
  { name: 'dealer_location', label: 'Dealer Location', type: 'text', placeholder: 'Preferred dealer or city for the test drive.', required: false },
  { name: 'preferred_date', label: 'Preferred Date', type: 'date', placeholder: 'Preferred test-drive date.', required: false },
];

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // Confirmation concept — structuredContent holds the flat booking result.
      const _result = await bridge.toolResult;
      confirmation = _result?.structuredContent || null;
    }
  }

  block.textContent = '';
  renderForm(block, confirmation, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderForm(block, confirmation, bridge) {
  const hero = SAMPLE_DATA[0];

  const card = document.createElement('div');
  card.className = 'book-test-drive-card';

  // Hero image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'book-test-drive-hero';
  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (hero.image_url) {
    const img = document.createElement('img');
    img.src = hero.image_url;
    img.alt = hero.name || 'Dacia';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(colorDiv());
  }
  card.appendChild(imgWrap);

  // Header block (palette-colored)
  const header = document.createElement('div');
  header.className = 'book-test-drive-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'book-test-drive-title';
  title.textContent = 'Book a Test Drive';
  header.appendChild(title);
  const sub = document.createElement('p');
  sub.className = 'book-test-drive-sub';
  sub.textContent = 'Schedule a test drive at your nearest dealer and feel your next Dacia on the road.';
  header.appendChild(sub);
  card.appendChild(header);

  if (confirmation && (confirmation.confirmation_id || confirmation.message)) {
    card.appendChild(buildConfirmation(confirmation));
    block.appendChild(card);
    return;
  }

  // Form body
  const form = document.createElement('form');
  form.className = 'book-test-drive-form';
  const inputs = {};

  FIELDS.forEach((f) => {
    const group = document.createElement('div');
    group.className = 'book-test-drive-group';

    const label = document.createElement('label');
    label.className = 'book-test-drive-label';
    label.textContent = f.required ? `${f.label} *` : f.label;
    label.setAttribute('for', `btd-${f.name}`);
    group.appendChild(label);

    let field;
    if (f.type === 'select') {
      field = document.createElement('select');
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = 'Select a model';
      ph.disabled = true;
      ph.selected = true;
      field.appendChild(ph);
      f.options.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        field.appendChild(o);
      });
    } else {
      field = document.createElement('input');
      field.type = f.type;
      field.placeholder = f.placeholder;
    }
    field.id = `btd-${f.name}`;
    field.className = 'book-test-drive-input';
    if (f.required) field.required = true;
    inputs[f.name] = field;
    group.appendChild(field);
    form.appendChild(group);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'book-test-drive-submit';
  submit.textContent = 'Programează Test Drive';
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    Object.keys(inputs).forEach((k) => { data[k] = inputs[k].value.trim(); });
    if (!data.full_name || !data.email || !data.phone || !data.model) return;
    const parts = [
      `Book a test drive for the ${data.model}.`,
      `Name: ${data.full_name}.`,
      `Email: ${data.email}.`,
      `Phone: ${data.phone}.`,
    ];
    if (data.dealer_location) parts.push(`Dealer/location: ${data.dealer_location}.`);
    if (data.preferred_date) parts.push(`Preferred date: ${data.preferred_date}.`);
    if (bridge) bridge.sendMessage(parts.join(' '));
  });

  card.appendChild(form);
  block.appendChild(card);
}

function buildConfirmation(confirmation) {
  const wrap = document.createElement('div');
  wrap.className = 'book-test-drive-confirm';

  const check = document.createElement('div');
  check.className = 'book-test-drive-check';
  check.textContent = '✓';
  wrap.appendChild(check);

  const status = document.createElement('div');
  status.className = 'book-test-drive-status';
  status.textContent = confirmation.status || 'Confirmed';
  wrap.appendChild(status);

  if (confirmation.message) {
    const msg = document.createElement('p');
    msg.className = 'book-test-drive-msg';
    msg.textContent = confirmation.message;
    wrap.appendChild(msg);
  }

  if (confirmation.confirmation_id) {
    const ref = document.createElement('div');
    ref.className = 'book-test-drive-ref';
    ref.textContent = `Ref: ${confirmation.confirmation_id}`;
    wrap.appendChild(ref);
  }

  return wrap;
}
