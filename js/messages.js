// ============ MESSAGE TYPE REGISTRY ============
// Registers each message type's data factory + renderBody. New types should
// add an entry here and a corresponding js/types/<name>.js file.
const MESSAGE_TYPES = {
  text:          { label: '文字訊息',     make: makeTextData,     renderBody: renderTextBody },
  image:         { label: '圖片訊息',     make: makeImageData,    renderBody: renderImageBody },
  video:         { label: '影片訊息',     make: makeVideoData,    renderBody: renderVideoBody },
  audio:         { label: '音訊訊息',     make: makeAudioData,    renderBody: renderAudioBody },
  sticker:       { label: '貼圖訊息',     make: makeStickerData,  renderBody: renderStickerBody },
  carousel:      { label: '多頁訊息',     make: makeCarouselData, renderBody: renderCarouselBody },
  'carousel-v2': { label: '多頁訊息 v2',  make: makeCarouselData, renderBody: renderCarouselV2Body },
  'carousel-v3': { label: '多頁訊息 v3',  make: makeCarouselData, renderBody: renderCarouselV3Body },
  'carousel-v4': { label: '多頁訊息',     make: makeCarouselData, renderBody: renderCarouselV4Body },
  'multi-image': { label: '多圖訊息',     make: makeMultiImageData, renderBody: renderMultiImageBody },
  imagemap:      { label: '圖文訊息',     make: makeImagemapData, renderBody: renderImagemapBody },
};

// ============ CRUD ============
function makeMessage(type) {
  const def = MESSAGE_TYPES[type];
  return { id: newMsgId(), type, collapsed: false, data: def.make() };
}

function addMessage(type) {
  if (!MESSAGE_TYPES[type]) return;
  const msg = makeMessage(type);
  state.messages.push(msg);
  state.activeMessageId = msg.id;
  renderMessages();
}

function deleteMessage(id) {
  closeButtonColorOverlay();
  state.messages = state.messages.filter(m => m.id !== id);
  if (state.activeMessageId === id) state.activeMessageId = null;
  renderMessages();
}

function duplicateMessage(id) {
  const idx = state.messages.findIndex(m => m.id === id);
  if (idx < 0) return;
  const original = state.messages[idx];
  const copy = {
    id: newMsgId(),
    type: original.type,
    collapsed: false,
    data: JSON.parse(JSON.stringify(original.data)),
  };
  state.messages.splice(idx + 1, 0, copy);
  state.activeMessageId = copy.id;
  renderMessages();
}

function moveMessage(id, dir) {
  const idx = state.messages.findIndex(m => m.id === id);
  if (idx < 0) return;
  const swap = idx + dir;
  if (swap < 0 || swap >= state.messages.length) return;
  [state.messages[idx], state.messages[swap]] = [state.messages[swap], state.messages[idx]];
  renderMessages();
}

// ============ RENDER ============
function renderMessages() {
  const container = $('#messagesContainer');
  container.innerHTML = '';
  state.messages.forEach((msg, idx) => {
    const card = renderMessageCard(msg, idx);
    container.appendChild(card);
  });
  if (typeof renderPreview === 'function') renderPreview();
}

function renderMessageCard(msg, idx) {
  const def = MESSAGE_TYPES[msg.type];
  const card = document.createElement('article');
  card.className = 'msg-card';
  card.dataset.msgId = msg.id;
  card.dataset.type = msg.type;

  // ---- Header ----
  const header = document.createElement('div');
  header.className = 'msg-card-header';

  const title = document.createElement('div');
  title.className = 'msg-card-title';
  title.textContent = def.label;
  header.appendChild(title);

  const badge = document.createElement('div');
  badge.className = 'msg-card-badge';
  badge.textContent = '1';
  header.appendChild(badge);

  const actions = document.createElement('div');
  actions.className = 'msg-card-actions';

  const upBtn = makeCardActionBtn('上移',
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`);
  upBtn.disabled = idx === 0;
  upBtn.addEventListener('click', () => moveMessage(msg.id, -1));

  const downBtn = makeCardActionBtn('下移',
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`);
  downBtn.disabled = idx === state.messages.length - 1;
  downBtn.addEventListener('click', () => moveMessage(msg.id, 1));

  const copyBtn = makeCardActionBtn('複製',
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`);
  copyBtn.addEventListener('click', () => duplicateMessage(msg.id));

  const delBtn = makeCardActionBtn('刪除',
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`);
  delBtn.classList.add('danger');
  delBtn.addEventListener('click', () => deleteMessage(msg.id));

  actions.appendChild(upBtn);
  actions.appendChild(downBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(delBtn);
  header.appendChild(actions);
  card.appendChild(header);

  // ---- Body ----
  const body = document.createElement('div');
  body.className = 'msg-card-body';
  card.appendChild(body);

  // Carousel internals query the DOM via $c() which reads _activeCardEl.
  // Set both pointers BEFORE renderBody so any setup it does (color popovers,
  // hero render, etc.) targets this card's subtree.
  setActiveCardEl(card);
  state.activeMessageId = msg.id;
  def.renderBody(msg, body);

  return card;
}

function makeCardActionBtn(title, svgHtml) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'msg-card-action-btn';
  btn.title = title;
  btn.innerHTML = svgHtml;
  return btn;
}

// ============ UPLOAD HELPERS ============
// Shared file input is on document body. setActive + click; main.js's change
// handler dispatches based on the active message's type.
function triggerUpload(msg, accept) {
  state.activeMessageId = msg.id;
  const fi = $('#fileInput');
  fi.accept = accept;
  fi.click();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============ ADD-MESSAGE PANEL ============
$('#addMsgPanel').addEventListener('click', (e) => {
  const card = e.target.closest('.add-msg-card[data-msg-type]');
  if (!card) return;
  addMessage(card.dataset.msgType);
});
