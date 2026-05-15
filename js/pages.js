// ============ PAGE TABS (carousel) ============
// All queries are scoped to the active carousel card via $c (which reads
// _activeCardEl). renderPageTabs is called from renderCarouselBody after the
// active card pointer has been set.

function renderPageTabs() {
  const tabs = $c('.page-tabs');
  if (!tabs) return;
  const car = activeCarousel();
  if (!car) return;

  tabs.innerHTML = '';

  car.pages.forEach((p, idx) => {
    const tab = document.createElement('div');
    tab.className = 'page-tab' + (idx === car.currentPage ? ' active' : '');
    tab.dataset.idx = idx;
    tab.draggable = true;
    tab.textContent = String(idx + 1);

    tab.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close')) return;
      switchToPage(idx);
    });

    if (car.pages.length > 1) {
      const close = document.createElement('button');
      close.className = 'tab-close';
      close.type = 'button';
      close.title = '刪除此頁';
      close.innerHTML = '<svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      close.addEventListener('mousedown', (e) => e.preventDefault());
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        deletePage(idx);
      });
      tab.appendChild(close);
    }

    tab.addEventListener('dragstart', (e) => {
      tab.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    });
    tab.addEventListener('dragend', () => {
      tab.classList.remove('dragging');
      $$c('.page-tab').forEach(t => t.classList.remove('drag-over-left', 'drag-over-right'));
    });
    tab.addEventListener('dragover', (e) => {
      e.preventDefault();
      const r = tab.getBoundingClientRect();
      const before = e.clientX < r.left + r.width / 2;
      tab.classList.toggle('drag-over-left', before);
      tab.classList.toggle('drag-over-right', !before);
    });
    tab.addEventListener('dragleave', () => tab.classList.remove('drag-over-left', 'drag-over-right'));
    tab.addEventListener('drop', (e) => {
      e.preventDefault();
      const car2 = activeCarousel();
      if (!car2) return;
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (isNaN(fromIdx) || fromIdx === idx) return;
      const r = tab.getBoundingClientRect();
      const before = e.clientX < r.left + r.width / 2;
      const [moved] = car2.pages.splice(fromIdx, 1);
      let toIdx = idx;
      if (fromIdx < idx) toIdx = idx - 1;
      const insertAt = before ? toIdx : toIdx + 1;
      car2.pages.splice(insertAt, 0, moved);
      if (car2.currentPage === fromIdx) {
        car2.currentPage = insertAt;
      } else {
        let newCur = car2.currentPage;
        if (fromIdx < car2.currentPage) newCur--;
        if (insertAt <= newCur) newCur++;
        car2.currentPage = Math.max(0, Math.min(newCur, car2.pages.length - 1));
      }
      renderActiveCarousel();
    });

    tabs.appendChild(tab);
  });

  if (car.pages.length < 10) {
    const dup = document.createElement('button');
    dup.type = 'button';
    dup.className = 'page-tab-add page-tab-duplicate';
    dup.title = '複製當前頁';
    dup.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
    dup.addEventListener('click', () => duplicatePage(activeCarousel().currentPage));
    tabs.appendChild(dup);

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'page-tab-add';
    add.title = '新增頁';
    add.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    add.addEventListener('click', addNewPage);
    tabs.appendChild(add);
  }
}

function addNewPage() {
  const car = activeCarousel();
  if (!car || car.pages.length >= 10) return;
  const msg = activeMessage();
  car.pages.push(msg && msg.type === 'multi-image' ? makeImagePage() : makePage());
  car.currentPage = car.pages.length - 1;
  renderActiveCarousel();
}

function duplicatePage(idx) {
  const car = activeCarousel();
  if (!car || car.pages.length >= 10) return;
  const src = car.pages[idx];
  const copy = JSON.parse(JSON.stringify(src));
  if (Array.isArray(copy.buttons)) {
    copy.buttons.forEach(b => { b.id = newId(); });
  }
  if (copy.button && copy.button.active && copy.button.id) {
    copy.button.id = newId();
  }
  car.pages.splice(idx + 1, 0, copy);
  car.currentPage = idx + 1;
  renderActiveCarousel();
}

function deletePage(idx) {
  const car = activeCarousel();
  if (!car || car.pages.length <= 1) return;
  car.pages.splice(idx, 1);
  if (car.currentPage >= car.pages.length) car.currentPage = car.pages.length - 1;
  if (car.currentPage > idx) car.currentPage--;
  renderActiveCarousel();
}

function switchToPage(idx) {
  const car = activeCarousel();
  if (!car || idx === car.currentPage) return;
  car.currentPage = idx;
  renderActiveCarousel();
}
