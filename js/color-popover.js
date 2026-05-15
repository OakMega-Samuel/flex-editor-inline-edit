// ============ COMBO COLOR POPOVER ============
let comboState = { bg: '#ffffff', fg: '#333333', onChange: null };

const COMBO_RECENTS_KEY = 'comboRecents';
const COMBO_RECENTS_MAX = 6;

function readComboRecents() {
  try {
    const raw = localStorage.getItem(COMBO_RECENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.filter(x => x && typeof x.bg === 'string' && typeof x.fg === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeComboRecents(list) {
  try {
    localStorage.setItem(COMBO_RECENTS_KEY, JSON.stringify(list));
  } catch {}
}

function isComboPreset(bg, fg) {
  const b = bg.toLowerCase(), f = fg.toLowerCase();
  return COMBO_PRESETS.some(p => p.bg.toLowerCase() === b && p.fg.toLowerCase() === f);
}

function recordComboRecent(bg, fg) {
  if (!bg || !fg) return;
  if (isComboPreset(bg, fg)) return;
  const b = bg.toLowerCase(), f = fg.toLowerCase();
  const list = readComboRecents().filter(p =>
    !(p.bg.toLowerCase() === b && p.fg.toLowerCase() === f)
  );
  list.unshift({ bg, fg });
  writeComboRecents(list.slice(0, COMBO_RECENTS_MAX));
}

function openComboPopover(anchorEl, title, currentBg, currentFg, onChange) {
  const pop = $('#colorPopover');
  const backdrop = $('#backdrop');
  $('#popoverTitle').textContent = title;

  comboState.bg = currentBg;
  comboState.fg = currentFg;
  comboState.onChange = onChange;

  // Mark whichever swatch (preset or recent) matches the given combo
  const setSelected = (bg, fg) => {
    const b = bg.toLowerCase(), f = fg.toLowerCase();
    pop.querySelectorAll('.combo-preset').forEach(el => {
      const match = el.dataset.bg?.toLowerCase() === b && el.dataset.fg?.toLowerCase() === f;
      el.classList.toggle('selected', match);
    });
  };

  const fgHex = $('#fgHex'); const fgNative = $('#fgNative');
  const bgHex = $('#bgHex'); const bgNative = $('#bgNative');

  const applyCombo = (bg, fg) => {
    comboState.bg = bg;
    comboState.fg = fg;
    bgHex.value = bg.toUpperCase();
    bgNative.value = bg;
    fgHex.value = fg.toUpperCase();
    fgNative.value = fg;
    setSelected(bg, fg);
    onChange(bg, fg);
  };

  // Build presets
  const grid = $('#comboPresets');
  grid.innerHTML = '';
  COMBO_PRESETS.forEach(({ bg, fg }) => {
    const el = document.createElement('div');
    el.className = 'combo-preset';
    el.dataset.bg = bg;
    el.dataset.fg = fg;
    el.style.background = bg;
    el.style.color = fg;
    el.textContent = 'A';
    el.addEventListener('click', () => applyCombo(bg, fg));
    grid.appendChild(el);
  });

  // Build recents
  const recentsWrap = $('#comboRecentsWrap');
  const recentsGrid = $('#comboRecents');
  const recents = readComboRecents();
  recentsGrid.innerHTML = '';
  if (recents.length === 0) {
    recentsWrap.hidden = true;
  } else {
    recentsWrap.hidden = false;
    recents.forEach(({ bg, fg }) => {
      const el = document.createElement('div');
      el.className = 'combo-preset';
      el.dataset.bg = bg;
      el.dataset.fg = fg;
      el.style.background = bg;
      el.style.color = fg;
      el.textContent = 'A';
      el.addEventListener('click', () => applyCombo(bg, fg));
      recentsGrid.appendChild(el);
    });
  }

  // Init custom inputs
  fgHex.value = currentFg.toUpperCase();
  fgNative.value = currentFg;
  bgHex.value = currentBg.toUpperCase();
  bgNative.value = currentBg;
  setSelected(currentBg, currentFg);

  fgHex.oninput = () => {
    const v = fgHex.value.trim();
    if (isValidHex(v)) {
      const c = normalizeHex(v);
      comboState.fg = c;
      fgNative.value = c;
      setSelected(comboState.bg, c);
      onChange(comboState.bg, c);
    }
  };
  fgNative.oninput = () => {
    const c = fgNative.value;
    comboState.fg = c;
    fgHex.value = c.toUpperCase();
    setSelected(comboState.bg, c);
    onChange(comboState.bg, c);
  };

  bgHex.oninput = () => {
    const v = bgHex.value.trim();
    if (isValidHex(v)) {
      const c = normalizeHex(v);
      comboState.bg = c;
      bgNative.value = c;
      setSelected(c, comboState.fg);
      onChange(c, comboState.fg);
    }
  };
  bgNative.oninput = () => {
    const c = bgNative.value;
    comboState.bg = c;
    bgHex.value = c.toUpperCase();
    setSelected(c, comboState.fg);
    onChange(c, comboState.fg);
  };

  $('#comboSwap').onclick = () => {
    applyCombo(comboState.fg, comboState.bg);
  };

  // Position — clamp to viewport on all sides so the popover never overflows
  const rect = anchorEl.getBoundingClientRect();
  pop.style.visibility = 'hidden';
  pop.style.top = '0px';
  pop.style.left = '0px';
  pop.classList.add('open');
  const popRect = pop.getBoundingClientRect();
  const margin = 8;

  let top = rect.bottom + 6 + window.scrollY;
  let left = rect.right + window.scrollX - popRect.width;

  const maxLeft = window.scrollX + window.innerWidth - popRect.width - margin;
  const minLeft = window.scrollX + margin;
  if (left > maxLeft) left = maxLeft;
  if (left < minLeft) left = minLeft;

  if (top + popRect.height > window.innerHeight + window.scrollY - margin) {
    const flipped = rect.top + window.scrollY - popRect.height - 6;
    top = flipped >= window.scrollY + margin ? flipped : (window.scrollY + window.innerHeight - popRect.height - margin);
  }

  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
  pop.style.visibility = '';
  backdrop.classList.add('open');
}

function closePopover() {
  if (comboState.onChange && comboState.bg && comboState.fg) {
    recordComboRecent(comboState.bg, comboState.fg);
  }
  $('#colorPopover').classList.remove('open');
  $('#backdrop').classList.remove('open');
}

// ============ INLINE COMBO PICKER ============
// Renders the same content as #colorPopover (presets + recents + custom hex
// inputs + swap) into an arbitrary container, e.g. inside an accordion body.
// `getCurrent()` returns the live `{ bg, fg }` (so external state changes,
// like switching pages, can be reflected via the returned `sync` callback).
// `onChange(bg, fg)` runs on every interaction. Recent combos are recorded
// after the user pauses, mirroring popover behavior.
const INLINE_COMBO_TEMPLATE = `
  <div class="inline-combo-picker">
    <div class="combo-presets"></div>
    <div class="combo-recents-wrap" hidden>
      <div class="popover-subtitle">常用</div>
      <div class="combo-recents"></div>
    </div>
    <div class="combo-customs">
      <div class="combo-custom-block">
        <div class="label">文字顏色</div>
        <div class="combo-custom-input">
          <input type="color" class="native-color-input ic-fg-native">
          <input type="text" class="hex-input ic-fg-hex" maxlength="7" placeholder="#000000">
        </div>
      </div>
      <div class="combo-custom-block">
        <div class="label">背景顏色</div>
        <div class="combo-custom-input">
          <input type="color" class="native-color-input ic-bg-native">
          <input type="text" class="hex-input ic-bg-hex" maxlength="7" placeholder="#FFFFFF">
        </div>
      </div>
      <button type="button" class="combo-swap-btn ic-swap" title="反轉文字／背景顏色" aria-label="反轉顏色">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      </button>
    </div>
  </div>
`;

function renderInlineComboPicker(container, getCurrent, onChange) {
  container.innerHTML = INLINE_COMBO_TEMPLATE;

  const presets = container.querySelector('.combo-presets');
  const recentsWrap = container.querySelector('.combo-recents-wrap');
  const recentsGrid = container.querySelector('.combo-recents');
  const fgHex = container.querySelector('.ic-fg-hex');
  const fgNative = container.querySelector('.ic-fg-native');
  const bgHex = container.querySelector('.ic-bg-hex');
  const bgNative = container.querySelector('.ic-bg-native');
  const swap = container.querySelector('.ic-swap');

  const setSelected = (bg, fg) => {
    const b = bg.toLowerCase(), f = fg.toLowerCase();
    container.querySelectorAll('.combo-preset').forEach(el => {
      const match = el.dataset.bg?.toLowerCase() === b && el.dataset.fg?.toLowerCase() === f;
      el.classList.toggle('selected', match);
    });
  };

  let recordTimer = null;
  const scheduleRecord = (bg, fg) => {
    if (recordTimer) clearTimeout(recordTimer);
    recordTimer = setTimeout(() => recordComboRecent(bg, fg), 700);
  };

  const apply = (bg, fg) => {
    bgHex.value = bg.toUpperCase();
    bgNative.value = bg;
    fgHex.value = fg.toUpperCase();
    fgNative.value = fg;
    setSelected(bg, fg);
    onChange(bg, fg);
    scheduleRecord(bg, fg);
  };

  COMBO_PRESETS.forEach(({ bg, fg }) => {
    const el = document.createElement('div');
    el.className = 'combo-preset';
    el.dataset.bg = bg;
    el.dataset.fg = fg;
    el.style.background = bg;
    el.style.color = fg;
    el.textContent = 'A';
    el.addEventListener('click', () => apply(bg, fg));
    presets.appendChild(el);
  });

  const recents = readComboRecents();
  if (recents.length === 0) {
    recentsWrap.hidden = true;
  } else {
    recentsWrap.hidden = false;
    recents.forEach(({ bg, fg }) => {
      const el = document.createElement('div');
      el.className = 'combo-preset';
      el.dataset.bg = bg;
      el.dataset.fg = fg;
      el.style.background = bg;
      el.style.color = fg;
      el.textContent = 'A';
      el.addEventListener('click', () => apply(bg, fg));
      recentsGrid.appendChild(el);
    });
  }

  const init = getCurrent();
  fgHex.value = init.fg.toUpperCase();
  fgNative.value = init.fg;
  bgHex.value = init.bg.toUpperCase();
  bgNative.value = init.bg;
  setSelected(init.bg, init.fg);

  fgHex.addEventListener('input', () => {
    const v = fgHex.value.trim();
    if (isValidHex(v)) {
      const c = normalizeHex(v);
      const { bg } = getCurrent();
      fgNative.value = c;
      setSelected(bg, c);
      onChange(bg, c);
      scheduleRecord(bg, c);
    }
  });
  fgNative.addEventListener('input', () => {
    const c = fgNative.value;
    const { bg } = getCurrent();
    fgHex.value = c.toUpperCase();
    setSelected(bg, c);
    onChange(bg, c);
    scheduleRecord(bg, c);
  });
  bgHex.addEventListener('input', () => {
    const v = bgHex.value.trim();
    if (isValidHex(v)) {
      const c = normalizeHex(v);
      const { fg } = getCurrent();
      bgNative.value = c;
      setSelected(c, fg);
      onChange(c, fg);
      scheduleRecord(c, fg);
    }
  });
  bgNative.addEventListener('input', () => {
    const c = bgNative.value;
    const { fg } = getCurrent();
    bgHex.value = c.toUpperCase();
    setSelected(c, fg);
    onChange(c, fg);
    scheduleRecord(c, fg);
  });
  swap.addEventListener('click', (e) => {
    e.stopPropagation();
    const { bg, fg } = getCurrent();
    apply(fg, bg);
  });

  return function syncInlineComboPicker() {
    const { bg, fg } = getCurrent();
    if (document.activeElement !== fgHex) fgHex.value = fg.toUpperCase();
    if (document.activeElement !== bgHex) bgHex.value = bg.toUpperCase();
    fgNative.value = fg;
    bgNative.value = bg;
    setSelected(bg, fg);
  };
}
