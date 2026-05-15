// ============ TYPE: TEXT ============
const TEXT_MAX = 500;

function makeTextData() {
  return { text: '' };
}

function renderTextBody(msg, body) {
  body.classList.add('msg-text-body');

  const wrap = document.createElement('div');
  wrap.className = 'msg-text-input-wrap';

  const ta = document.createElement('textarea');
  ta.className = 'msg-text-area';
  ta.placeholder = '請輸入內容';
  ta.maxLength = TEXT_MAX;
  ta.value = msg.data.text;

  const footer = document.createElement('div');
  footer.className = 'msg-text-footer';

  const fns = document.createElement('div');
  fns.className = 'msg-text-fns';
  fns.innerHTML = `
    <button type="button" class="msg-text-fn-btn" tabindex="-1">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    </button>
    <button type="button" class="msg-text-fn-btn" tabindex="-1">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    </button>
    <button type="button" class="msg-text-fn-btn" tabindex="-1">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </button>
  `;

  const counter = document.createElement('div');
  counter.className = 'msg-text-counter';
  const countEl = document.createElement('span');
  countEl.className = 'count';
  countEl.textContent = String(msg.data.text.length);
  const sep = document.createElement('span');
  sep.className = 'sep';
  sep.textContent = '/';
  const maxEl = document.createElement('span');
  maxEl.className = 'max';
  maxEl.textContent = String(TEXT_MAX);
  counter.appendChild(countEl);
  counter.appendChild(sep);
  counter.appendChild(maxEl);

  ta.addEventListener('input', () => {
    msg.data.text = ta.value;
    countEl.textContent = String(ta.value.length);
  });

  footer.appendChild(fns);
  footer.appendChild(counter);
  wrap.appendChild(ta);
  wrap.appendChild(footer);
  body.appendChild(wrap);
}
