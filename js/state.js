// ============ STATE ============
// Multi-message editor: state.messages is an ordered list; each message has a
// `type` (text/image/video/sticker/carousel) and a `data` blob whose shape is
// defined by the type's makeData factory in messages.js.

let nextId = 1;
const newId = () => `b${nextId++}`;
const newMsgId = () => `m${nextId++}`;

const state = {
  messages: [],          // [{ id, type, collapsed, data }]
  activeMessageId: null, // which card currently owns the popover / fileInput / etc.
};

// ----- Carousel page factory (used by carousel type's makeData) -----
function makePage() {
  return {
    imageType: null,
    hasImage: false,
    imageUrl: '',
    promo: { active: false, text: '', bg: '#ffffff', fg: '#000000' },
    title: null,
    desc: null,
    price: null,
    cardBg: '#ffffff',
    cardText: '#333333',
    buttons: [],
  };
}

// ----- Multi-image page factory (used by multi-image type) -----
// Shares hero/promo fields with makePage so renderHero / renderPromo work as-is.
// Body fields (title/desc/price) and cardBg/cardText/buttons[] are kept null /
// empty so the shared isCompletelyEmpty / hasAnyBody helpers behave correctly
// (multi-image has no body section). Adds:
//   - imageAction: per-image click behavior (none / message / uri)
//   - button: a single optional CTA button (active toggle)
function makeImagePage() {
  return {
    imageType: null,
    hasImage: false,
    imageUrl: '',
    promo: { active: false, text: '', bg: '#ffffff', fg: '#000000' },
    title: null,
    desc: null,
    price: null,
    cardBg: '#ffffff',
    cardText: '#333333',
    buttons: [],
    imageAction: { type: 'none', value: '' },
    // Empty bg/fg means "use the multi-image default look" (semi-transparent
    // white pill with black text, applied via CSS to match Figma). Once the
    // user picks colors, these become hex strings and inline styles take over.
    button: { active: false, text: '', action: 'message', value: '', fg: '', bg: '' },
  };
}

// ----- Helpers that resolve to the active carousel's current page -----
// These are referenced by the existing pages/hero/body/buttons code paths,
// which all assume "there is one editable carousel page right now". The
// active carousel is whichever message id is in state.activeMessageId.

function activeMessage() {
  if (!state.activeMessageId) return null;
  return state.messages.find(m => m.id === state.activeMessageId) || null;
}

function activeCarousel() {
  const m = activeMessage();
  return (m && (m.type === 'carousel' || m.type === 'carousel-v2' || m.type === 'carousel-v3' || m.type === 'carousel-v4' || m.type === 'multi-image')) ? m.data : null;
}

// Right-pane-only types: bubble is display-only, editing happens via the
// editor pane. v3 introduced this pattern; v4 inherits it with a refreshed
// layout (form-line alt text, framed page list, select-button image picker).
// multi-image (the v4-styled 多圖訊息) shares the same display-only bubble
// pattern even though it uses a single CTA button + image-overlay layout.
function isRightPaneOnlyType(type) {
  return type === 'carousel-v3' || type === 'carousel-v4' || type === 'multi-image';
}

const cur = () => {
  const c = activeCarousel();
  return c ? c.pages[c.currentPage] : null;
};

// ----- Active card DOM root (set by render dispatcher / event handlers) -----
// Carousel internals (hero/body/buttons) use $c/.querySelector(scope) instead
// of document-wide selectors so multiple carousel cards can coexist.
let _activeCardEl = null;
const setActiveCardEl = (el) => { _activeCardEl = el; };
const activeCardEl = () => _activeCardEl;
const $c = (sel) => _activeCardEl ? _activeCardEl.querySelector(sel) : null;
const $$c = (sel) => _activeCardEl ? _activeCardEl.querySelectorAll(sel) : [];

// ----- Buttons (carousel page footer buttons) -----
function makeBtn() {
  const c = cur();
  if (c && c.buttons.length > 0) {
    const last = c.buttons[c.buttons.length - 1];
    return { id: newId(), text: '', action: 'message', value: '', fg: last.fg, bg: last.bg };
  }
  return { id: newId(), text: '', action: 'message', value: '', fg: '#ffffff', bg: '#000000' };
}

// Combo presets: { bg, fg }
const COMBO_PRESETS = [
  { bg: '#5b6df0', fg: '#ffffff' },
  { bg: '#3e8e3e', fg: '#ffffff' },
  { bg: '#8a7a1f', fg: '#ffffff' },
  { bg: '#d75f29', fg: '#ffffff' },
  { bg: '#1882b8', fg: '#ffffff' },
  { bg: '#b04a8e', fg: '#ffffff' },
  { bg: '#e9ebff', fg: '#5b6df0' },
  { bg: '#e1f0db', fg: '#3e8e3e' },
  { bg: '#fbf2d6', fg: '#8a7a1f' },
  { bg: '#fce4d3', fg: '#d75f29' },
  { bg: '#dcedf7', fg: '#1882b8' },
  { bg: '#f5dbe9', fg: '#b04a8e' },
];

const FIELD_META = {
  title: { max: 100, placeholder: '輸入標題', cls: 'bubble-title', label: '標題' },
  desc:  { max: 500, placeholder: '輸入文字說明', cls: 'bubble-desc', label: '說明' },
  price: { max: 20,  placeholder: 'NT$ 0', cls: 'bubble-price', label: '價格' },
};
