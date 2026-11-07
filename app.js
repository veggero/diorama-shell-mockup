// Diorama interactive mockup: the shell. Only window management is interactive; app content is a picture.
// Every item is always in exactly one place: a window (wins), a recent dialog (left), a pinned dialog (right),
// a pill (pillsL / pillsR), or History. A place holds a slot: one item, or a group of tabs.
// Clicking a pill turns it into a dialog; closing a dialog turns it back into a pill, in the spot it left.
// Windows are never moved or resized: one window sits in the middle, two share that area half and half.

let nextId = 1;
const slot = (...tabs) => ({ id: nextId++, tabs, on: 0, pinned: false });
const HOME = { x: 400, y: 176, w: 1120, h: 700 };
// the desktop starts as items.js lays it out
const slots = (rows, pinned) => rows.map(tabs => ({ ...slot(...tabs), pinned }));
const S = {
    wins: slots(LAYOUT.wins, false), focus: 0,
    left: slots(LAYOUT.left, false),
    right: slots(LAYOUT.right, true),
    // rows are in screen order, left to right; new pills land at the inner end of their row
    pillsL: slots(LAYOUT.pillsL, false),
    pillsR: slots(LAYOUT.pillsR, true),
    history: LAYOUT.history.map(h => ({ slot: slot(...h.tabs), when: h.when })),
    hq: '', pillH: 32,
    // maximized is one state for the whole desktop, not a window's: whatever is the window fills the screen
    full: false,
};
// Claude's footer under each window is hidden for now
const FOOTER = false;
// each move button is a tiny map of the screen showing where the item goes
const MAPS = {
    dialog: ['Reduce to dialog', '<rect class="d" x="2.8" y="5.4" width="5.2" height="6.8" rx="1"/>'],
    unpin: ['Unpin', '<rect class="d" x="2.8" y="5.4" width="5.2" height="6.8" rx="1"/>'],     // a pinned item goes back to the left
    pill: ['Minimize', '<rect class="d" x="2.8" y="11.2" width="8" height="2.2" rx="1.1"/>'],
    pillR: ['Minimize', '<rect class="d" x="11.2" y="11.2" width="8" height="2.2" rx="1.1"/>'],     // a pinned item folds to the right
    pin: ['Minimize to pinned dialog', '<rect class="d" x="14" y="5.4" width="5.2" height="6.8" rx="1"/>'],
    full: ['Full screen', '<rect class="d" x="2.8" y="2.8" width="16.4" height="10.4" rx="1"/>'],
    window: ['Open as a window', '<rect class="d" x="5.8" y="3.8" width="10.4" height="7.4" rx="1"/>'],
};
const glyph = d => `<svg class="map" viewBox="0 0 22 16"><rect class="f" x="0.6" y="0.6" width="20.8" height="14.8" rx="2.6"/>${MAPS[d][1]}</svg>`;

ITEMS.history = {
    title: 'History', icon: 'actions/16/document-open-recent', dialog: () => historyBody(),
    chat: { reply: 'Pills that no longer fit end up here.', tools: [] },
};

const it = id => ITEMS[id];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const listOf = where => ({ wins: S.wins, left: S.left, right: S.right, pillsL: S.pillsL, pillsR: S.pillsR })[where];
// what is on screen: S itself, or while dragging, S with the dragged thing already where it would land
let shown = null;
const shownOf = where => shown[where];
const parse = spec => { const [where, i, t] = spec.split(':'); return { where, i: +i, t: t === undefined ? null : t }; };
const titleOf = id => it(id).title;
const pillTitleOf = id => { const p = it(id).pillTitle; return typeof p === 'function' ? p() : (p || it(id).title); };
const busy = id => !!(it(id).busy && it(id).busy());
const icon16 = id => it(id).icon ? ico(it(id).icon) : '';
const icon22 = id => !it(id).icon ? '' : it(id).icon.includes('/16/') ? ico(it(id).icon, 'ico22" style="padding: 3px;') : ico(it(id).icon, 'ico22');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fullRect = () => ({ x: 24, y: 56, w: 1872, h: 1080 - 56 - S.pillH - 36 });
const halves = g => { const w = Math.round((g.w - 16) / 2); return [{ ...g, w }, { ...g, x: g.x + w + 16, w: g.w - 16 - w }]; };
// v: S, or a drag preview of it; maximized, two windows still share the screen half and half
const geomOf = (s, v) => { const g = v.full ? fullRect() : { ...HOME }; return v.wins.length === 2 ? halves(g)[v.wins.indexOf(s)] : g; };

// ---------- pieces ----------
// an item whose pill shows a moving number names it with pillLive, so the ticker can update it in place
function pillLabel(id) {
    const live = it(id).pillLive;
    return `<span${it(id).pillSemi ? ' class="semi"' : ''}${live ? ` data-live="${live}"` : ''}>${esc(pillTitleOf(id))}</span>`;
}

// while carried, the dragged thing leaves a gap where it would land; a tab being torn off leaves its group
const ghostly = s => op && op.ph === s ? ' dragsrc' : '';
const tornTab = (s, j) => op && op.tab === j && op.slot === s ? ' dragsrc' : '';

// a pill's parts: one segment per item, then the controls of items that have them (music)
const pillSegs = ids => ids.map((id, j) => `<div class="seg" data-seg="${j}">${icon16(id)}${pillLabel(id)}${busy(id) ? '<span class="spinner"></span>' : ''}</div>`).join('')
    + ids.flatMap(id => (it(id).pillCtl ? it(id).pillCtl() : []).map(([a, icon, title]) => `<div class="seg ctl" data-ctl="${id}:${a}" data-tip="${title}">${ico(icon)}</div>`)).join('');

// an unpinned pill can be deleted (to History): while hovered, a delete segment slides open at its end
function pillHTML(s, where, idx) {
    const deletable = where === 'pillsL' && !s.tabs.includes('history');
    const trash = deletable ? `<div class="seg trash" data-trash="${where}:${idx}" data-tip="Delete">${ico('actions/16/window-close')}</div>` : '';
    return `<div class="pill${ghostly(s)}" data-k="${s.id}" data-pill="${where}:${idx}" data-drag="${where}:${idx}" data-tip="Click to open dialog, double click to open window">${pillSegs(s.tabs)}${trash}</div>`;
}

function dialogHTML(s, where, idx) {
    const id = s.tabs[s.on];
    // the same screen maps as a window's pill: to the other column, and to a pill on this side
    const other = where === 'left' ? 'pin' : 'unpin', fold = where === 'left' ? 'pill' : 'pillR';
    const pin = `<div class="xbtn" data-pin="${where}:${idx}" data-tip="${other === 'pin' ? 'Pin dialog' : MAPS[other][0]}">${glyph(other)}</div>`
        + `<div class="xbtn" data-open="${where}:${idx}" data-tip="${MAPS.window[0]}">${glyph('window')}</div>`;
    const close = `<div class="xbtn" data-close="${where}:${idx}" data-tip="${MAPS[fold][0]}">${glyph(fold)}</div>`;
    const head = s.tabs.length > 1
        ? `<div class="row" style="padding: 9px 10px 8px; gap: 4px; flex: none;"><div class="dtabs">${s.tabs.map((t, j) => `<div class="tab${j === s.on ? ' on' : ''}${tornTab(s, j)}" data-tab="${where}:${idx}:${j}" data-drag="${where}:${idx}:${j}" data-tip="${esc(titleOf(t))}">${icon16(t)}<span>${esc(pillTitleOf(t))}</span></div>`).join('')}</div>${pin}${close}</div>`
        : `<div class="dhead" style="flex: none;"><span class="h3 grow">${esc(titleOf(id))}</span>${pin}${close}</div>`;
    // the outer edge stays on the screen edge, so a dialog grows inward and upward
    const side = where === 'left' ? 'e' : 'w';
    const rz = ['n', side, 'n' + side].map(d => `<div class="rz ${d}" data-drz="${where}:${idx}:${d}"></div>`).join('');
    const size = `width: ${s.dw || 320}px;${s.dh ? ` height: ${s.dh}px;` : ''}`;
    return `<div class="item"><div class="dialog frost-strong${ghostly(s)}" data-k="${s.id}" data-open="${where}:${idx}" data-drag="${where}:${idx}" style="${size}">${head}<div class="dscroll">${it(id).dialog()}</div>${rz}</div></div>`;
}

function historyBody() {
    const q = S.hq.trim().toLowerCase();
    const rows = S.history.map((h, i) => ({ h, i }))
        .filter(({ h }) => !q || h.slot.tabs.some(t => titleOf(t).toLowerCase().includes(q)));
    const row = ({ h, i }) => `<div class="drow" data-act="hopen:${i}">${icon22(h.slot.tabs[0])}<span class="grow">${esc(h.slot.tabs.map(titleOf).join(' + '))}</span><span class="num">${h.when}</span>`
        + `<div class="ib sh" data-act="hrestore:${i}" data-tip="Back to the left">${ico('actions/16/edit-undo')}</div><div class="ib sh" data-act="hpin:${i}" data-tip="Pin">${ico('actions/16/window-pin')}</div></div>`;
    const today = rows.filter(r => r.h.when.includes(':')), week = rows.filter(r => !r.h.when.includes(':'));
    return `<div style="padding: 0 12px 4px;"><label class="field" style="color: var(--text);">${ico('actions/16/edit-find')}<input id="history-search" data-hq placeholder="Search history" value="${esc(S.hq)}" autocomplete="off" style="border: 0; outline: 0; background: transparent; font: inherit; color: inherit; flex: 1; min-width: 0;"></label></div>`
        + (today.length ? sec('Today') + list(today.map(row)) : '')
        + (week.length ? sec('Earlier') + list(week.map(row)) : '')
        + (!rows.length ? list([drow('', q ? 'Nothing matches' : 'Nothing here yet')]) : '');
}

// Claude's footer is part of the picture here: the last reply, the tools it used, and the ask field
function footHTML(id) {
    const c = it(id).chat || { reply: '', tools: [] };
    const tools = c.tools.map(([i, v, d]) => `<div class="tool">${ico(i)}<span class="verb">${v}</span>${d ? `<span class="det">${esc(d)}</span>` : ''}<img class="ok" src="icons/actions/16/dialog-ok-apply.svg" alt=""></div>`).join('');
    const ph = it(id).fresh ? 'Ask Claude for anything' : `Ask Claude to change ${titleOf(id)}`;
    return `<div class="wfoot"><div class="reply">${c.reply ? `<span class="msg">${esc(c.reply)}</span>` : ''}<div class="tools">${tools}</div></div>`
        + `<div class="askrow"><div class="field ask"><span class="grow">${esc(ph)}</span><span class="btn flat icon" style="height: 26px; width: 26px;">${ico('actions/16/document-send')}</span></div></div></div>`;
}

function windowHTML(s, i, v) {
    const g = geomOf(s, v), id = s.tabs[s.on], grouped = s.tabs.length > 1, full = v.full;
    const tabs = s.tabs.map((t, j) => `<div class="seg${grouped ? ' tabseg' + (j === s.on ? ' on' : ' off') : ''}${tornTab(s, j)}" data-tab="wins:${i}:${j}">${icon16(t)}<span class="semi">${esc(titleOf(t))}</span>${busy(t) ? '<span class="spinner"></span>' : ''}</div>`).join('');
    const moves = ['dialog', 'pill', 'pin', 'full'].map(d => {
        const m = s.pinned && d === 'pill' ? 'pillR' : s.pinned && d === 'dialog' ? 'unpin' : d;
        return `<div class="seg mv${d === 'full' && full ? ' cur' : ''}" data-mv="${i}:${d}" data-tip="${d === 'full' && full ? 'Back to normal size' : MAPS[m][0]}">${glyph(m)}</div>`;
    }).join('');
    const page = it(id).page ? it(id).page() : `<div class="page"><div class="phead"><div class="col grow"><span class="t">${esc(titleOf(id))}</span></div></div><div class="panel aspage">${it(id).dialog()}</div></div>`;
    // dialogs show on top of the windows, maximized or not
    return `<div class="pill wtab${ghostly(s)}" data-k="p${s.id}" data-winpill="${i}" data-drag="wins:${i}" style="position: absolute; left: ${g.x}px; top: ${g.y - 36}px; z-index: 6;">${tabs}${moves}</div>`
        + `<div class="window${ghostly(s)}" data-k="${s.id}" data-win="${i}" style="left: ${g.x}px; top: ${g.y}px; width: ${g.w}px; height: ${g.h}px; z-index: 2;"><div class="app" data-page="${id}">${page}</div>${FOOTER ? footHTML(id) : ''}</div>`;
}

// ---------- render: the whole desktop is rebuilt from S, then moved pieces glide from where they were ----------
const stage = document.getElementById('stage');
let scale = 1;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function desktopHTML(v) {
    let h = v.wins.map((s, i) => windowHTML(s, i, v)).join('');
    // each column sits on its own pill row, so a row that wraps only lifts the dialogs above it
    const bottom = side => `bottom: calc(var(--pillh${side}, 32px) + 32px);`;
    h += `<div class="stack left" style="${bottom('L')}">${v.left.map((s, i) => dialogHTML(s, 'left', i)).join('')}</div>`;
    h += `<div class="stack right" style="${bottom('R')}">${v.right.map((s, i) => dialogHTML(s, 'right', i)).join('')}</div>`;
    h += `<div class="pills left" style="bottom: 12px;"><div class="pillrow">${v.pillsL.map((s, i) => pillHTML(s, 'pillsL', i)).join('')}</div></div>`;
    h += `<div class="pills right" style="bottom: 12px;"><div class="pillrow">${v.pillsR.map((s, i) => pillHTML(s, 'pillsR', i)).join('')}</div></div>`;
    return h;
}

// view: while dragging, the lists as they would be after the drop; S itself is left alone until then
function render(animate = true, view = null) {
    // keep the History search caret and each page's scroll position across the rebuild
    const a = document.activeElement;
    const focus = a && a.id && stage.contains(a) ? { id: a.id, pos: a.selectionStart } : null;
    const scrolls = {};
    stage.querySelectorAll('[data-page]').forEach(el => { const p = el.querySelector('.page'); if (p) scrolls[el.dataset.page] = p.scrollTop; });
    const before = animate && !reduceMotion ? snapshot() : null;

    // whatever overflows is handed on and the desktop drawn again, so it all glides from the same starting point
    shown = view || S;
    for (let n = 0; n < 20; n++) {
        stage.innerHTML = desktopHTML(shown);
        if (!layoutPass(shown, !!view)) break;
    }
    if (op && op.ghost) stage.appendChild(op.ghost);
    // a grouped dialog whose tabs don't fit shows only the open tab's name
    stage.querySelectorAll('.dtabs').forEach(d => { const on = d.querySelector('.tab.on span'); if (on && on.scrollWidth > on.clientWidth + 1) d.classList.add('compact'); });
    // a finger on a dialog carries it, unless what is under it scrolls
    stage.querySelectorAll('.dscroll').forEach(d => d.classList.toggle('scrolls', d.scrollHeight > d.clientHeight + 1));

    stage.querySelectorAll('[data-page]').forEach(el => { const p = el.querySelector('.page'); if (p && scrolls[el.dataset.page]) p.scrollTop = scrolls[el.dataset.page]; });
    if (focus) { const el = document.getElementById(focus.id); if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(focus.pos, focus.pos); } catch (e) {} } }
    keepTip();
    if (before) flip(before, !!view);
}

// Keeps everything on screen. A dialog stack that grows past the top hands its oldest dialog to the pill row;
// a pill row that grows past two lines hands its farthest pill to History. Returns true when v changed.
// A drag preview does the same to its own copy of the lists, so the drop lands exactly as previewed.
// What was just placed (the dragged thing) is never the one handed on.
let placed = null;
function layoutPass(v, preview) {
    const rows = [...stage.querySelectorAll('.pills')];
    stage.style.setProperty('--pillhL', rows[0].offsetHeight + 'px');
    stage.style.setProperty('--pillhR', rows[1].offsetHeight + 'px');
    const ph = Math.max(...rows.map(p => p.offsetHeight));
    if (!preview && ph !== S.pillH) { S.pillH = ph; if (S.full && S.wins.length) return true; }
    const keep = preview ? op.ph : placed;
    const fold = (from, k) => {
        const s = v[from].splice(k, 1)[0], where = from === 'left' ? 'pillsL' : 'pillsR';
        if (preview) v[where].splice(rowSpot(s, v[where], where), 0, s);
        else { s.pinned = from === 'right'; toRow(s); }
    };
    for (const side of ['left', 'right']) {
        const k = v[side].findIndex(s => s !== keep);
        if (v[side].length > 1 && k >= 0 && stage.querySelector(`.stack.${side}`).offsetTop < 24) { fold(side, k); return true; }
    }
    const toHistory = (where, k) => {
        const s = v[where].splice(k, 1)[0];
        if (!preview) S.history.unshift({ slot: s, when: clock() });
        return true;
    };
    const twoLines = 32 * 2 + 8 + 1;
    if (rows[0].offsetHeight > twoLines) {
        const k = v.pillsL.findIndex(s => !s.tabs.includes('history') && s !== keep);
        if (k >= 0) return toHistory('pillsL', k);
    }
    if (rows[1].offsetHeight > twoLines) {
        for (let k = v.pillsR.length - 1; k >= 0; k--) {
            if (v.pillsR[k] !== keep && !v.pillsR[k].tabs.every(t => SYSTEM.includes(t))) return toHistory('pillsR', k);
        }
    }
    return false;
}

// where each piece is, how it looks and the node itself, so a piece that changes shape can fade out of its old self.
// A piece still morphing counts from where its box is now; the carried pill counts as 'ghost'.
const kindOf = el => el.classList.contains('window') ? 'window' : el.classList.contains('dialog') ? 'dialog' : 'pill';
const layerOf = el => +getComputedStyle(el.closest('.stack, .pills') || el).zIndex || 0;
function lookOf(el) {
    const c = getComputedStyle(el), bg = el.classList.contains('window') ? getComputedStyle(el.querySelector('.app')) : c;
    return { borderRadius: c.borderTopLeftRadius, backgroundColor: bg.backgroundColor, boxShadow: c.boxShadow };
}
function snapshot() {
    const m = new Map();
    stage.querySelectorAll('[data-k]').forEach(el => m.set(el.dataset.k, { r: el.getBoundingClientRect(), el, look: lookOf(el), z: layerOf(el) }));
    stage.querySelectorAll('.morph[data-mk]').forEach(c => { const e = m.get(c.dataset.mk); if (e) e.r = c.getBoundingClientRect(); });
    const g = stage.querySelector('.ghost');
    if (g) m.set('ghost', { r: g.getBoundingClientRect(), el: g, look: lookOf(g), z: 100 });
    return m;
}

// Pieces that only move slide straight there. A piece that changes shape (a pill opening into a dialog, a window
// folding into a pill) morphs: one frosted box travels on an arc while its size changes, the old content fading out
// of it and the new content fading in, each scaled evenly to the box's width so nothing is ever stretched.
// A dialog that only grows or shrinks (another tab, a row less) changes its real height and stays clickable.
// Frosted pieces are only ever moved by left/top/width/height: a transform animation lifts them onto a layer of
// their own, where browsers draw the blur behind them differently until a while after it ends.
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const ease = (() => {
    const bez = (t, p1, p2) => 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
    return x => { let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (bez(m, 0.2, 0.2) < x) lo = m; else hi = m; } return bez((lo + hi) / 2, 0.8, 1); };
})();

function flip(before, preview) {
    const sr = stage.getBoundingClientRect();
    const box = r => ({ x: (r.left - sr.left) / scale, y: (r.top - sr.top) / scale, w: r.width / scale, h: r.height / scale });
    const now = new Map([...stage.querySelectorAll('[data-k]')].map(el => [el.dataset.k, el]));
    const near = (a, b) => Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1 && Math.abs(a.h - b.h) < 1;
    // a window's pill grows out of, or folds into, the top of what the window was or becomes
    const head = (r, pill) => r.h < 40 ? r : { x: r.x, y: r.y, w: Math.min(pill.w, r.w), h: pill.h };

    // dialogs that only change height first: the stack then moves along with them by itself
    now.forEach((el, k) => {
        const a = before.get(k);
        if (!a || kindOf(el) !== 'dialog' || kindOf(a.el) !== 'dialog' || a.el.classList.contains('dragsrc')) return;
        const ab = box(a.r), b = box(el.getBoundingClientRect());
        if (Math.abs(ab.w - b.w) >= 1 || Math.abs(ab.h - b.h) < 1) return;
        el.classList.add('sizing');
        el.animate([{ height: `${ab.h}px` }, { height: `${b.h}px` }], { duration: 300, easing: EASE }).onfinish = () => el.classList.remove('sizing');
    });

    // A pill carried out of a row leaves only a gap there, since the carried pill stands for it. Where a dialog or
    // window would land shows faded, and glides from spot to spot like anything else; where it first shows up, or
    // fills a gap, it grows out of the carried pill. Dropped onto its faded preview, it just firms up.
    const ghost = before.get('ghost');
    const gap = n => n.classList.contains('dragsrc') && !!n.closest('.pills');
    const morphs = [];
    now.forEach((el, k) => {
        if (gap(el)) return;
        const b = box(el.getBoundingClientRect()), faded = el.classList.contains('dragsrc');
        if (!b.w || !b.h) return;
        let a = before.get(k);
        if (preview) return previewFlight(el, k, a, b);
        if (a && gap(a.el) || faded && !a) a = ghost;
        const dim = [a && a.el.classList.contains('dragsrc') ? 0.35 : 1, faded ? 0.35 : 1];
        if (a === ghost && a && k[0] === 'p') return morphs.push([k, null, box(a.r), el, b, layerOf(el), [0.3, 0.8], dim]);
        if (!a) {
            const was = k[0] === 'p' && before.get(k.slice(1));
            if (was) return morphs.push([k, null, head(box(was.r), b), el, b, Math.max(was.z, layerOf(el)), [0.45, 0.9], dim]);
            return morphs.push([k, null, { ...b, y: b.y + 10 }, el, b, layerOf(el), undefined, dim]);
        }
        const ab = box(a.r);
        if (near(ab, b) && dim[0] === dim[1]) return;
        const reshaped = Math.abs(ab.w / b.w - 1) > 0.05 || Math.abs(ab.h / b.h - 1) > 0.05 || kindOf(a.el) !== kindOf(el);
        if ((reshaped || dim[0] !== dim[1]) && !el.classList.contains('sizing')) return morphs.push([k, a, ab, el, b, Math.max(a.z, layerOf(el)), undefined, dim]);
        // a window has no blur behind it, so it can slide on the GPU; frosted pieces move by left/top
        if (kindOf(el) === 'window') return el.animate([{ transform: `translate(${ab.x - b.x}px, ${ab.y - b.y}px)` }, { transform: 'none' }], { duration: 260, easing: EASE });
        const c = getComputedStyle(el), x = parseFloat(c.left) || 0, y = parseFloat(c.top) || 0;
        el.animate([{ left: `${x + ab.x - b.x}px`, top: `${y + ab.y - b.y}px` }, { left: `${x}px`, top: `${y}px` }], { duration: 260, easing: EASE });
    });
    // a window's pill that leaves with its window folds into what the window became
    before.forEach((a, k) => {
        if (preview) return previewLeave(a, k);
        // a pill deleted from its row drops off the bottom of the screen, faster and faster
        if (!now.has(k) && k !== 'ghost' && a.el.closest('.pills') && !a.el.classList.contains('dragsrc')) {
            const ab = box(a.r), n = a.el;
            n.removeAttribute('data-k');
            n.querySelectorAll('.trash').forEach(t => Object.assign(t.style, { transition: 'none', maxWidth: '40px', padding: '0 8px' }));
            Object.assign(n.style, { position: 'absolute', left: `${ab.x}px`, top: `${ab.y}px`, width: `${ab.w}px`, margin: '0', zIndex: a.z, pointerEvents: 'none' });
            stage.appendChild(n);
            n.animate([{ top: `${ab.y}px` }, { top: '1110px' }], { duration: 280, easing: 'cubic-bezier(0.55, 0, 0.9, 0.45)' }).onfinish = () => n.remove();
            return;
        }
        if (k[0] !== 'p' || now.has(k) || !now.has(k.slice(1))) return;
        const to = now.get(k.slice(1)), ab = box(a.r);
        const dim = a.el.classList.contains('dragsrc') ? 0.35 : 1;
        morphs.push([k, a, ab, null, head(box(to.getBoundingClientRect()), ab), Math.max(a.z, layerOf(to)), [0, 0.25], [dim, dim]]);
    });
    // While dragging, the previews keep the original flight: each piece itself flies on the arc, scaled from its old
    // box to its new one. A faded preview grows out of the gap it leaves in a row (or out of the carried pill), and
    // shrinks back into that gap.
    function previewFlight(el, k, a, b) {
        let from = a ? box(a.r) : null, fades = null;
        if (!a && el.classList.contains('dragsrc') && ghost) from = box(ghost.r);
        if (!a && k[0] === 'p' && before.get(k.slice(1))) { from = head(box(before.get(k.slice(1)).r), b); fades = [0.45, 0.9, 0, 1]; }
        if (!from) return el.classList.add('appear');
        if (near(from, b)) return;
        const reshaped = Math.abs(from.w / b.w - 1) > 0.05 || Math.abs(from.h / b.h - 1) > 0.05;
        if (!reshaped && kindOf(el) !== 'window') {
            const c = getComputedStyle(el), x = parseFloat(c.left) || 0, y = parseFloat(c.top) || 0;
            return el.animate([{ left: `${x + from.x - b.x}px`, top: `${y + from.y - b.y}px` }, { left: `${x}px`, top: `${y}px` }], { duration: 260, easing: EASE });
        }
        fly(el, from, b, b, reshaped, fades);
    }
    function previewLeave(a, k) {
        const el = now.get(k), into = el && gap(el) && !gap(a.el) && a.el.classList.contains('dragsrc');
        const pill = k[0] === 'p' && !el && now.get(k.slice(1));
        if ((!into && !pill) || a.el.isConnected) return;
        const ab = box(a.r), to = into ? box(el.getBoundingClientRect()) : head(box(pill.getBoundingClientRect()), ab);
        const n = a.el;
        n.removeAttribute('data-k');
        n.querySelectorAll('[id]').forEach(i => i.removeAttribute('id'));
        Object.assign(n.style, { position: 'absolute', left: `${ab.x}px`, top: `${ab.y}px`, width: `${ab.w}px`, height: `${ab.h}px`, margin: '0', zIndex: a.z, pointerEvents: 'none' });
        stage.appendChild(n);
        fly(n, ab, to, ab, true, into ? [0.5, 1, 1, 0] : [0, 0.25, 1, 0]).onfinish = () => n.remove();
    }

    // window pills last, so they stay on top of their windows
    morphs.sort((p, q) => (p[0][0] === 'p') - (q[0][0] === 'p')).forEach(m => morph(...m));
}

// the centre turns around whichever corner between start and end lies farther out toward the screen's edge,
// bending halfway from the straight line toward it; near an edge the box runs along it instead of through it.
// Returns the box at eased progress e.
function arcPath(a, b, bend) {
    const pa = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, pb = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    const outward = p => Math.max(Math.abs(p.x - 960) / 960, Math.abs(p.y - 540) / 540);
    const k1 = { x: pa.x, y: pb.y }, k2 = { x: pb.x, y: pa.y }, mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
    const corner = outward(k1) >= outward(k2) ? k1 : k2;
    const turn = { x: mid.x + (corner.x - mid.x) * bend, y: mid.y + (corner.y - mid.y) * bend };
    const lim = { l: Math.min(12, a.x, b.x), t: Math.min(12, a.y, b.y), r: Math.max(1908, a.x + a.w, b.x + b.w), b: Math.max(1068, a.y + a.h, b.y + b.h) };
    const keep = (v, half, lo, hi) => lo + half > hi - half ? v : clamp(v, lo + half, hi - half);
    return e => {
        const u = 1 - e, w = a.w + (b.w - a.w) * e, h = a.h + (b.h - a.h) * e;
        const cx = keep(u * u * pa.x + 2 * u * e * turn.x + e * e * pb.x, w / 2, lim.l, lim.r);
        const cy = keep(u * u * pa.y + 2 * u * e * turn.y + e * e * pb.y, h / 2, lim.t, lim.b);
        return { x: cx - w / 2, y: cy - h / 2, w, h };
    };
}

// flies an element laid out at `base` from box a to box b by transform; fades: [t0, t1, from, to] opacity multipliers
function fly(el, a, b, base, reshaped, fades = null) {
    const N = 16, at = arcPath(a, b, reshaped ? 0.5 : 0), o = parseFloat(getComputedStyle(el).opacity);
    const frames = [];
    for (let i = 0; i <= N; i++) {
        const t = i / N, r = at(ease(t));
        const f = { offset: t, transformOrigin: '0 0', transform: `translate(${r.x - base.x}px, ${r.y - base.y}px) scale(${r.w / base.w}, ${r.h / base.h})` };
        if (fades) f.opacity = o * (fades[2] + (fades[3] - fades[2]) * clamp((t - fades[0]) / (fades[1] - fades[0]), 0, 1));
        frames.push(f);
    }
    return el.animate(frames, { duration: reshaped ? 340 : 260, easing: 'linear' });
}

// fades: when the box itself fades in (nothing before) or out (nothing after), over that part of the time;
// a window's pill shows up late, near its window, and goes early, so it never flies about on its own
// dim: how faded the box is at the start and at the end (a drag preview is faded)
function morph(k, from, a, el, b, z, fades = from ? [0.55, 1] : [0, 0.3], dim = [1, 1]) {
    const N = 20, ms = 380;
    // a window is opaque, so a box going to or from one needs no blur behind it:
    // blurring a window-sized area every frame is what drops frames
    const solid = [from && from.el, el].some(n => n && n.classList.contains('window'));
    const c = document.createElement('div');
    c.className = solid ? 'morph solid' : 'morph';
    c.dataset.mk = k;
    c.style.zIndex = z;
    // the carried pill is still needed while dragging: a copy of it goes into the box
    const take = n => { if (n.isConnected) n = n.cloneNode(true); n.removeAttribute('data-k'); n.style.visibility = ''; n.querySelectorAll('[id]').forEach(i => i.removeAttribute('id')); n.classList.remove('dragsrc', 'ghost', 'back'); c.appendChild(n); return n; };
    const out = from && take(from.el), inn = el && take(el.cloneNode(true));
    stage.appendChild(c);
    if (el) el.style.visibility = 'hidden';

    const at = arcPath(a, b, 0.5);
    const fade = (t, t0, t1) => clamp((t - t0) / (t1 - t0), 0, 1);

    // shrinking, the old content stays a while, getting smaller; growing, it makes room for the new one at once;
    // about the same size (a carried pill landing), the new content comes in first, so nothing looks washed out
    const same = Math.abs(b.w / a.w - 1) < 0.25 && Math.abs(b.h / a.h - 1) < 0.25;
    // a window resized has opaque content: the new one comes in on top first, the old one goes from under it
    const shrink = b.w * b.h < a.w * a.h, wins = from && el && kindOf(el) === 'window' && from.el.classList.contains('window');
    const oa = same || wins ? [0.2, 0.45] : shrink ? [0.05, 0.45] : [0, 0.2], ia = same ? [0, 0.25] : wins ? [0, 0.35] : shrink ? [0.3, 0.75] : [0.15, 0.6];
    const box = [], fo = [], fi = [];
    for (let i = 0; i <= N; i++) {
        const t = i / N, e = ease(t), r = at(e), w = r.w, h = r.h;
        // a box with nothing in it at one end fades in or out at that end
        const o = !from ? fade(t, ...fades) : !el ? 1 - fade(t, ...fades) : 1;
        box.push({ offset: t, left: `${r.x}px`, top: `${r.y}px`, width: `${w}px`, height: `${h}px`, opacity: o * (dim[0] + (dim[1] - dim[0]) * e) });
        fo.push({ offset: t, transform: `scale(${Math.min(1, w / a.w)})`, opacity: 1 - fade(t, ...oa) });
        fi.push({ offset: t, transform: `scale(${Math.min(1, w / b.w)})`, opacity: fade(t, ...ia) });
    }
    const la = from ? from.look : lookOf(el), lb = el ? lookOf(el) : from.look;
    const anim = c.animate(box, { duration: ms, easing: 'linear' });
    c.animate([la, lb], { duration: ms, easing: EASE });
    if (out) out.animate(fo, { duration: ms, easing: 'linear', fill: 'forwards' });
    if (inn) inn.animate(fi, { duration: ms, easing: 'linear', fill: 'forwards' });
    anim.onfinish = () => { c.remove(); if (el) el.style.visibility = ''; };
}

// timers only touch the numbers that move, so nothing under the pointer is rebuilt
function updateLive() {
    const { text, bars } = live();
    stage.querySelectorAll('[data-live]').forEach(el => { const k = el.dataset.live; if (k in text && el.textContent !== text[k]) el.textContent = text[k]; });
    stage.querySelectorAll('[data-bar]').forEach(el => { const k = el.dataset.bar; if (k in bars) el.style.width = bars[k] + '%'; });
}

// ---------- moving things between places ----------
const demote = s => (s.pinned ? S.right : S.left).push(s);

// A pill that leaves its row remembers its neighbours, so when it folds back it lands in the same spot.
// A pill that never had a spot lands at the inner end of its row.
function leaveRow(where, i) {
    const list = listOf(where), s = list.splice(i, 1)[0];
    s.home = { where, prev: list[i - 1] || null, next: list[i] || null, i };
    return s;
}
function rowSpot(s, list, where) {
    const h = s.home;
    if (!h || h.where !== where) return where === 'pillsR' ? 0 : list.length;
    if (list.includes(h.prev)) return list.indexOf(h.prev) + 1;
    if (list.includes(h.next)) return list.indexOf(h.next);
    return Math.min(h.i, list.length);
}
function toRow(s) {
    const where = s.pinned ? 'pillsR' : 'pillsL', list = listOf(where);
    list.splice(rowSpot(s, list, where), 0, s);
    delete s.home;
}

// a dialog or pill that becomes the window takes the focused window's place; that window steps back
function toWindow(s) {
    if (!S.wins.length) { S.wins.push(s); S.focus = 0; return; }
    const i = clamp(S.focus, 0, S.wins.length - 1), old = S.wins[i];
    demote(old);
    S.wins[i] = s;
    S.focus = i;
}

// Maximizing folds every dialog into its pill; dialogs opened afterwards show on top of the windows.
// It stays on while windows come and go, until it is turned off.
function setFull(on) {
    S.full = on;
    if (on) for (const where of ['left', 'right']) listOf(where).splice(0).forEach(s => { s.pinned = where === 'right'; toRow(s); });
}

// a window that leaves a split hands the whole area to the other one
function moveWin(i, dest) {
    const s = S.wins[i];
    if (dest === 'full') { setFull(!S.full); return render(); }
    S.wins.splice(i, 1);
    S.focus = 0;
    if (dest === 'dialog') { s.pinned = false; S.left.push(s); }
    if (dest === 'pin') { s.pinned = true; S.right.push(s); }
    if (dest === 'pill') toRow(s);
    render();
}

function openSpec(spec) {
    const { where, i } = parse(spec);
    toWindow(listOf(where).splice(i, 1)[0]);
    render();
}

// closing a dialog folds it back into a pill on its own side
function closeSpec(spec) {
    const { where, i } = parse(spec);
    const s = listOf(where).splice(i, 1)[0];
    s.pinned = where === 'right';
    toRow(s);
    render();
}

// pin moves a dialog to the right column; unpin moves it back to the left
function pinSpec(spec) {
    const { where, i } = parse(spec);
    const s = listOf(where).splice(i, 1)[0];
    s.pinned = where === 'left';
    (s.pinned ? S.right : S.left).push(s);
    render();
}

// deleting a pill clears it from the desktop; it can still be found in History
function trashSpec(spec) {
    const { where, i } = parse(spec);
    S.history.unshift({ slot: listOf(where).splice(i, 1)[0], when: clock() });
    render();
}

// a pill opens as a dialog on its own side and leaves the row
function pillClick(spec, tab) {
    const { where, i } = parse(spec);
    const s = leaveRow(where, i);
    if (tab !== undefined) s.on = tab;     // a grouped pill opens on the part that was clicked
    s.pinned = where === 'pillsR';
    (s.pinned ? S.right : S.left).push(s);
    fromPill = { s, at: performance.now() };
    render();
}

function switchTab(spec) {
    const { where, i, t } = parse(spec);
    const s = listOf(where)[i];
    if (s.on === +t) return;
    s.on = +t;
    render();
}

function newChat() {
    toWindow(slot(newChatItem()));
    render();
}

function act(name) {
    const [verb, arg] = name.split(':');
    const h = S.history[+arg];
    if (!h) return;
    S.history.splice(+arg, 1);
    if (verb === 'hopen') toWindow(h.slot);
    if (verb === 'hrestore') { h.slot.pinned = false; S.left.push(h.slot); }
    if (verb === 'hpin') { h.slot.pinned = true; S.right.push(h.slot); }
    // History stays open while you pick from it: when the stack overflows, another dialog folds first
    placed = [...S.left, ...S.right].find(s => s.tabs[s.on] === 'history') || null;
    render();
    placed = null;
}

let suppressClickUntil = 0;
let fromPill = null;     // the dialog the last pill click opened, for a double click
stage.addEventListener('click', e => {
    if (performance.now() < suppressClickUntil) return;
    if (e.detail === 2 && fromPill && performance.now() - fromPill.at < 600) {
        const s = fromPill.s, list = s.pinned ? S.right : S.left;
        fromPill = null;
        if (list.includes(s)) { list.splice(list.indexOf(s), 1); toWindow(s); render(); }
        return;
    }
    const t = e.target;
    let el;
    if ((el = t.closest('[data-act]'))) return act(el.dataset.act);
    if ((el = t.closest('[data-close]'))) return closeSpec(el.dataset.close);
    if ((el = t.closest('[data-pin]'))) return pinSpec(el.dataset.pin);
    if ((el = t.closest('[data-mv]'))) { const [i, d] = el.dataset.mv.split(':'); return moveWin(+i, d); }
    if ((el = t.closest('[data-tab]'))) return switchTab(el.dataset.tab);
    if ((el = t.closest('[data-trash]'))) return trashSpec(el.dataset.trash);
    if ((el = t.closest('[data-ctl]'))) { const [id, a] = el.dataset.ctl.split(':'); it(id).ctl(a); return render(false); }
    if ((el = t.closest('[data-pill]'))) { const seg = t.closest('[data-seg]'); return pillClick(el.dataset.pill, seg ? +seg.dataset.seg : undefined); }
    if (t.closest('input, label')) return;
    if ((el = t.closest('[data-open]'))) return openSpec(el.dataset.open);
});

stage.addEventListener('input', e => {
    if ('hq' in e.target.dataset) { S.hq = e.target.value; render(false); }
});

// ---------- tooltips: one Breeze tooltip, above whatever names itself with data-tip ----------
// It lives on the stage, so nothing it sits in can clip it, and every button gets the same one.
const tip = document.createElement('div');
tip.className = 'tooltip tip';
let tipFor = null, tipTimer = 0, pointerAt = null;
function showTip(el) {
    tip.textContent = el.dataset.tip;
    stage.appendChild(tip);
    // centred just above it, as drawn now (scrolled lists included), and kept on the screen;
    // with no room above (a full-screen window's pill), just below
    const sr = stage.getBoundingClientRect(), b = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    const x = (b.left - sr.left) / scale, y = (b.top - sr.top) / scale;
    tip.style.left = `${clamp(x + b.width / scale / 2 - w / 2, 8, 1912 - w)}px`;
    tip.style.top = `${y - h - 6 >= 8 ? y - h - 6 : y + b.height / scale + 6}px`;
    tip.classList.add('on');
}
function hideTip() { clearTimeout(tipTimer); tipFor = null; tip.classList.remove('on'); tip.remove(); }
// a redraw replaces what was hovered: the same button under the pointer keeps its tooltip
function keepTip() {
    if (!tipFor) return;
    const was = tipFor.dataset.tip, shownNow = tip.classList.contains('on');
    const el = pointerAt && document.elementFromPoint(pointerAt.x, pointerAt.y);
    const now = el && el.closest('#stage [data-tip]');
    if (!now || now.dataset.tip !== was) return hideTip();
    tipFor = now;
    if (shownNow) showTip(now);
}
stage.addEventListener('pointerover', e => {
    const el = e.target.closest('[data-tip]');
    if (el === tipFor) return;
    hideTip();
    if (!el || e.pointerType === 'touch' || op || swipe) return;
    tipFor = el;
    tipTimer = setTimeout(() => { if (tipFor === el && el.isConnected) showTip(el); }, 350);
});
stage.addEventListener('pointerout', e => { if (tipFor && !tipFor.contains(e.relatedTarget)) hideTip(); });
stage.addEventListener('pointerdown', hideTip, true);
window.addEventListener('pointermove', e => { pointerAt = { x: e.clientX, y: e.clientY }; }, true);

// ---------- pointer: drag anything anywhere, resize dialogs ----------
// Dragging a window's pill, a dialog, a pill or a tab carries it as a small pill. While it is carried, everything
// already makes room for it where it would land: in a stack, in a pill row, beside a window or in its place.
// Dropping it onto a window's pill or a dialog's title adds it there as a tab.
const toStage = e => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; };
let press = null, op = null, pointer = null;     // pointer: the one finger or mouse doing the press or drag

stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    // a second finger makes it a two-finger swipe instead (see swipes)
    if (e.pointerType === 'touch' && !e.isPrimary) { press = null; if (op) dropAll(); return; }
    pointer = e.pointerId;
    const t = e.target, p = toStage(e);
    const w = t.closest('[data-win], [data-winpill]');
    if (w) S.focus = +(w.dataset.win !== undefined ? w.dataset.win : w.dataset.winpill);
    let el;
    if ((el = t.closest('[data-drz]'))) {
        const [where, i, dir] = el.dataset.drz.split(':'), d = el.closest('.dialog');
        op = { kind: 'dresize', s: listOf(where)[+i], dir, p0: p, w0: d.offsetWidth, h0: d.offsetHeight, el: d };
        return e.preventDefault();
    }
    if (t.closest('.xbtn, .mv, [data-act], [data-trash], [data-ctl], input')) return;
    if ((el = t.closest('[data-winpill]'))) {
        // the active tab carries the whole window; another tab of a group tears off on its own
        const i = +el.dataset.winpill, s = S.wins[i], seg = t.closest('[data-tab]');
        const j = seg ? +parse(seg.dataset.tab).t : s.on;
        press = s.tabs.length > 1 && j !== s.on ? { spec: `wins:${i}:${j}`, p0: p, r: layoutRect(seg) } : { spec: `wins:${i}`, p0: p, r: layoutRect(el) };
        return;
    }
    if ((el = t.closest('[data-drag]'))) press = { spec: el.dataset.drag, p0: p, r: layoutRect(el) };
});

window.addEventListener('pointermove', e => {
    if (e.pointerId !== pointer) return;
    const p = toStage(e);
    if (!op && press) {
        if (Math.hypot(p.x - press.p0.x, p.y - press.p0.y) < (e.pointerType === 'touch' ? 10 : 5)) return;
        startDrag(press);
        press = null;
    }
    if (!op) return;
    if (op.kind === 'dresize') {
        const dx = p.x - op.p0.x, dy = p.y - op.p0.y;
        if (op.dir.includes('n')) { op.s.dh = clamp(op.h0 - dy, 110, 1080 - S.pillH - 32 - 24); op.el.style.height = `${op.s.dh}px`; }
        if (op.dir.includes('e')) { op.s.dw = clamp(op.w0 + dx, 260, 600); op.el.style.width = `${op.s.dw}px`; }
        if (op.dir.includes('w')) { op.s.dw = clamp(op.w0 - dx, 260, 600); op.el.style.width = `${op.s.dw}px`; }
        return;
    }
    carry(p);
    // which way the pointer is going, over the last 100 ms (stage px; speed in px per ms)
    const now = performance.now();
    op.trail = (op.trail || []).filter(([t]) => now - t < 100);
    op.trail.push([now, p]);
    const [t0, p0] = op.trail[0];
    op.head = { dx: p.x - p0.x, dy: p.y - p0.y, speed: now > t0 ? Math.hypot(p.x - p0.x, p.y - p0.y) / (now - t0) : 0 };
    track(p);
});

window.addEventListener('pointerup', e => {
    if (e.pointerId !== pointer) return;
    press = null;
    if (!op) return;
    suppressClickUntil = performance.now() + 80;
    if (op.kind === 'drag') { track(toStage(e), true); return endDrag(); }     // let go: wherever it is now
    op = null;
    render(false);
});
// the browser took the touch over (or a second finger came): what was carried goes back
function dropAll() {
    press = null;
    if (op && op.kind === 'drag') { op.target = null; return endDrag(); }
    op = null;
    render(false);
}
window.addEventListener('pointercancel', e => { if (e.pointerId === pointer && (op || press)) dropAll(); });

function startDrag(pr) {
    const { where, i, t } = parse(pr.spec);
    const s = listOf(where)[i];
    const tab = t !== null && s.tabs.length > 1 ? +t : null;
    const ids = tab !== null ? [s.tabs[tab]] : s.tabs;
    const ghost = document.createElement('div');
    ghost.className = 'pill ghost';
    ghost.innerHTML = pillSegs(ids);
    document.body.classList.add('dragging');
    // ph is what will land: the slot itself, or for a torn-off tab, a new slot made for it now
    const ph = tab !== null ? { ...slot(s.tabs[tab]), pinned: s.pinned } : s;
    op = { kind: 'drag', where, slot: s, tab, ph, ghost, p0: pr.p0, target: null, view: 'here', mark: null };
    render(false, viewFor(null));
    // the carried pill is lifted from where it was grabbed and keeps that grip; grabbing something bigger
    // (a dialog), the grip is kept inside the pill
    op.grip = { x: clamp(pr.p0.x - pr.r.x, 10, ghost.offsetWidth - 10), y: clamp(pr.p0.y - pr.r.y, 8, ghost.offsetHeight - 8) };
    carry(pr.p0);
}
const carry = p => {
    op.ghost.style.left = `${clamp(p.x - op.grip.x, 4, 1916 - op.ghost.offsetWidth)}px`;
    op.ghost.style.top = `${clamp(p.y - op.grip.y, 4, 1076 - op.ghost.offsetHeight)}px`;
};

// ---------- drop targets ----------
// positions as laid out, ignoring the glide animations, so a target never flickers while things move
const layoutRect = el => { let x = 0, y = 0; for (let n = el; n && n !== stage; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
const inside = (r, p, pad = 0) => p.x >= r.x - pad && p.x < r.x + r.w + pad && p.y >= r.y - pad && p.y < r.y + r.h + pad;
const elAt = (where, i) => stage.querySelector(where === 'left' || where === 'right' ? `.stack .dialog[data-drag="${where}:${i}"]` : `.pill[data-pill="${where}:${i}"]`);
// over the faded stand-in of the dragged thing, nothing changes
const pick = (s, t) => s === op.ph ? op.target : t;

// insert next to one item of a stack or a row
function insertAt(where, anchor, after) {
    const list = shownOf(where);
    let k = list.indexOf(anchor) + (after ? 1 : 0);
    if (list[k] === op.ph) k++;
    return { kind: 'insert', where, before: list[k] || null };
}

// In a row, the carried pill takes the spot on its line whose start is nearest its own left edge. The spots are
// worked out from the line's start and the other pills' widths, so they don't depend on where the gap is now:
// passing a small neighbour takes half of that neighbour's width, and nothing flips back and forth.
// Coming from another line or from outside the row, it goes next to the nearest pill.
function rowTarget(where, p) {
    const list = shownOf(where), k = list.indexOf(op.ph);
    const g = { x: parseFloat(op.ghost.style.left), y: parseFloat(op.ghost.style.top), w: op.ghost.offsetWidth, h: op.ghost.offsetHeight };
    const r = list.map((s, i) => layoutRect(elAt(where, i)));
    if (k >= 0 && Math.abs(g.y + g.h / 2 - (r[k].y + r[k].h / 2)) < r[k].h) {
        const line = list.map((s, i) => i).filter(i => Math.abs(r[i].y - r[k].y) < 4), others = line.filter(i => i !== k);
        const gapW = parseFloat(getComputedStyle(elAt(where, k).parentElement).columnGap) || 0;
        let x = r[line[0]].x, best = 0, bd = Infinity;
        for (let j = 0; j <= others.length; j++) {
            if (Math.abs(g.x - x) < bd) { bd = Math.abs(g.x - x); best = j; }
            if (j < others.length) x += r[others[j]].w + gapW;
        }
        const before = best < others.length ? list[others[best]] : list.slice(line[line.length - 1] + 1).find(s => s !== op.ph);
        return { kind: 'insert', where, before: before || null };
    }
    return nearestIn(where, { x: g.x + g.w / 2, y: g.y + g.h / 2 }, true);
}

// nearest item in a stack (by height) or a row (by distance), for drops on and around it
function nearestIn(where, p, entering = false) {
    const row = where.startsWith('pills');
    if (row && !entering) return rowTarget(where, p);
    let best = null, bd = Infinity;
    shownOf(where).forEach((s, i) => {
        const el = elAt(where, i);
        if (!el) return;
        const r = layoutRect(el), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
        const d = row ? Math.hypot(p.x - cx, (p.y - cy) * 2) : Math.abs(p.y - cy);
        if (d < bd) { bd = d; best = { s, after: row ? p.x > cx : p.y > cy }; }
    });
    if (!best) return { kind: 'insert', where, before: null };
    return pick(best.s, insertAt(where, best.s, best.after));
}

// undefined: not over this window
function winTarget(i, p) {
    const v = shown, s = v.wins[i];
    const pill = stage.querySelector(`[data-winpill="${i}"]`), win = stage.querySelector(`[data-win="${i}"]`);
    if (inside(layoutRect(pill), p)) return pick(s, s === op.slot ? null : { kind: 'group', slot: s, el: pill });
    if (!inside(layoutRect(win), p, 8)) return undefined;
    // two windows stay: it takes this one's place. Otherwise the two share the area.
    const stay = S.wins.filter(w => op.tab !== null || w !== op.slot);
    if (stay.length === 2) return pick(s, s === op.slot ? null : { kind: 'replace', slot: s });
    const r = layoutRect(win);
    return pick(s, { kind: 'split', slot: s, half: p.x < r.x + r.w / 2 ? 'left' : 'right' });
}

function findTarget(p) {
    const v = shown;
    // The top edge of the screen maximizes: a window, or anything else as the window (a window's own pill up there
    // still takes tabs). Maximized, a window carried back toward the middle goes back to normal size.
    const win = op.where === 'wins' && op.tab === null;
    const onPill = v.wins.some((s, i) => inside(layoutRect(stage.querySelector(`[data-winpill="${i}"]`)), p));
    if (p.y < 40 && !onPill && !(S.full && win)) return { kind: 'max' };
    if (S.full && win && inside(HOME, p)) return { kind: 'unmax' };
    for (const where of ['left', 'right']) {
        for (let i = 0; i < v[where].length; i++) {
            const el = elAt(where, i), r = layoutRect(el), s = v[where][i];
            if (!inside(r, p)) continue;
            if (p.y - r.y < 44) return pick(s, s === op.slot ? null : { kind: 'group', slot: s, el });     // on its title: become a tab
            return pick(s, insertAt(where, s, p.y > r.y + r.h / 2));
        }
    }
    for (const where of ['pillsL', 'pillsR']) {
        if (inside(layoutRect(stage.querySelector(`.pills.${where === 'pillsL' ? 'left' : 'right'}`)), p, 12)) return nearestIn(where, p);
    }
    // maximized, the windows lie under the dialog columns: the sides still take dialogs (a window's pill still takes tabs)
    if (S.full && !onPill && (p.x < 424 || p.x > 1496) && p.y < 1080 - S.pillH - 28) return nearestIn(p.x < 960 ? 'left' : 'right', p);
    for (let i = 0; i < v.wins.length; i++) { const t = winTarget(i, p); if (t !== undefined) return t; }
    // empty desktop: the band above the pills, and the two dialog columns
    if (p.y > 1080 - S.pillH - 28) return nearestIn(p.x < 960 ? 'pillsL' : 'pillsR', p);
    if (p.x < 24 + 400) return nearestIn('left', p);
    if (p.x > 1920 - 24 - 400) return nearestIn('right', p);
    // the middle of a desktop with no window left: it becomes the window
    if (!S.wins.some(w => op.tab !== null || w !== op.slot)) return { kind: 'open' };
    return null;
}

// the lists as they would be after dropping on t
function viewFor(t) {
    const v = { wins: [...S.wins], left: [...S.left], right: [...S.right], pillsL: [...S.pillsL], pillsR: [...S.pillsR], full: S.full };
    if (!t || t.kind === 'group') return v;
    if (t.kind === 'unmax') { v.full = false; return v; }
    const win = op.where === 'wins' && op.tab === null;
    if (t.kind === 'max' && win) return maxView(v);
    if (op.tab === null) v[op.where] = v[op.where].filter(s => s !== op.slot);
    // anything else carried to the top becomes the window in the focused one's place, and that one a pill
    if (t.kind === 'max') {
        const i = clamp(S.focus, 0, v.wins.length - 1), old = v.wins[i];
        v.wins.splice(Math.max(i, 0), old ? 1 : 0, op.ph);
        if (old) v[old.pinned ? 'right' : 'left'].push(old);
        return maxView(v);
    }
    if (t.kind === 'insert') {
        const l = v[t.where], k = t.before ? l.indexOf(t.before) : -1;
        l.splice(k < 0 ? l.length : k, 0, op.ph);
    }
    if (t.kind === 'split') { const k = v.wins.indexOf(t.slot); v.wins.splice(t.half === 'left' ? k : k + 1, 0, op.ph); }
    if (t.kind === 'replace') { v.wins[v.wins.indexOf(t.slot)] = op.ph; v[t.slot.pinned ? 'right' : 'left'].push(t.slot); }
    if (t.kind === 'open') v.wins.push(op.ph);
    return v;
}

// maximized in a preview: the dialogs fold into their pills, as setFull does
function maxView(v) {
    v.full = true;
    for (const [from, where] of [['left', 'pillsL'], ['right', 'pillsR']]) v[from].splice(0).forEach(s => v[where].splice(rowSpot(s, v[where], where), 0, s));
    return v;
}

// a group target keeps the current picture, so the title under the pointer stays put
const viewKey = t => !t ? 'here' : t.kind === 'insert' ? `i:${t.where}:${t.before ? t.before.id : ''}`
    : t.kind === 'split' ? `s:${t.slot.id}:${t.half}` : t.kind === 'replace' ? `r:${t.slot.id}`
    : ['open', 'max', 'unmax'].includes(t.kind) ? t.kind : null;
const targetKey = t => t && t.kind === 'group' ? `g:${t.slot.id}` : viewKey(t);

// Moving fast, only the place the pointer is headed for takes the preview: crossing a window on the way to a
// dialog column, the window is passed by. A new place is taken at once when the pointer is slow or heading into
// it (its middle within 45° of the way it moves); one it is only passing through, once the pointer stays a moment.
const regionOf = t => !t ? 'none' : t.kind === 'insert' ? t.where : ['open', 'max', 'unmax'].includes(t.kind) ? t.kind
    : shown.left.includes(t.slot) ? 'left' : shown.right.includes(t.slot) ? 'right' : `w${t.slot.id}`;
function regionBox(g) {
    const zone = { x: 0, y: 0, w: 424, h: 1080 - S.pillH - 28 };
    if (g === 'left') return zone;
    if (g === 'right') return { ...zone, x: 1496 };
    if (g === 'pillsL' || g === 'pillsR') return layoutRect(stage.querySelector(`.pills.${g === 'pillsL' ? 'left' : 'right'}`));
    if (g === 'open' || g === 'unmax') return HOME;
    if (g === 'max') return { x: 0, y: 0, w: 1920, h: 40 };
    const w = g[0] === 'w' && stage.querySelector(`.window[data-k="${g.slice(1)}"]`);
    return w ? layoutRect(w) : null;
}
function headedFor(t, p) {
    const h = op.head;
    if (!h || h.speed < 0.4) return true;
    const r = regionBox(regionOf(t));
    if (!r) return false;
    const cx = r.x + r.w / 2 - p.x, cy = r.y + r.h / 2 - p.y;
    return (h.dx * cx + h.dy * cy) / (Math.hypot(h.dx, h.dy) * Math.hypot(cx, cy) || 1) > Math.SQRT1_2;
}

function track(p, settle = false) {
    const t = findTarget(p), o = op;
    clearTimeout(o.wait);
    if (t === o.target || targetKey(t) === targetKey(o.target)) return;
    if (!settle && regionOf(t) !== regionOf(o.target) && !headedFor(t, p)) {
        o.wait = setTimeout(() => { if (op === o) track(p, true); }, 160);
        return;
    }
    if (op.mark) op.mark();
    op.mark = null;
    op.target = t;
    const k = viewKey(t);
    if (k !== null && k !== op.view) { op.view = k; render(true, viewFor(t)); }
    if (t && t.kind === 'group') { t.el.classList.add('droptarget'); op.mark = () => t.el.classList.remove('droptarget'); }
}

// takes the dragged thing out of where it was and returns it as a slot
function takeDragged() {
    const s = op.slot;
    if (op.tab !== null) {
        s.tabs.splice(op.tab, 1);
        if (op.tab < s.on) s.on--;
        s.on = Math.min(s.on, s.tabs.length - 1);
        return op.ph;
    }
    const list = listOf(op.where), i = list.indexOf(s);
    if (op.where.startsWith('pills')) return leaveRow(op.where, i);
    list.splice(i, 1);
    if (op.where === 'wins') S.focus = 0;
    return s;
}

function endDrag() {
    const t = op.target;
    if (op.mark) op.mark();
    document.body.classList.remove('dragging');
    // the carried pill is still on the stage when it is redrawn, so what lands grows out of it
    if (!t) {
        // nowhere to land: it goes back to where it came from
        op = null;
        return render();
    }
    // a window carried to the top, or back to the middle, only changes maximized
    if (t.kind === 'unmax' || (t.kind === 'max' && op.where === 'wins' && op.tab === null)) {
        setFull(t.kind === 'max');
        op = null;
        return render();
    }
    const m = takeDragged();
    if (t.kind === 'max') { toWindow(m); setFull(true); }
    if (t.kind === 'group') {
        t.slot.tabs.push(...m.tabs);
        t.slot.on = t.slot.tabs.length - m.tabs.length;
        if (S.wins.includes(t.slot)) S.focus = S.wins.indexOf(t.slot);
    }
    if (t.kind === 'insert') {
        const list = listOf(t.where), k = t.before ? list.indexOf(t.before) : -1;
        m.pinned = t.where === 'right' || t.where === 'pillsR';
        if (t.where.startsWith('pills')) delete m.home;     // put in a row by hand: that is its spot now
        list.splice(k < 0 ? list.length : k, 0, m);
    }
    if (t.kind === 'split') {
        const k = S.wins.indexOf(t.slot);
        S.wins.splice(t.half === 'left' ? k : k + 1, 0, m);
        S.focus = S.wins.indexOf(m);
    }
    if (t.kind === 'replace') {
        const k = S.wins.indexOf(t.slot);
        demote(t.slot);
        S.wins[k] = m;
        S.focus = k;
    }
    if (t.kind === 'open') { S.wins.push(m); S.focus = S.wins.length - 1; }
    op = null;
    placed = m;
    render();
    placed = null;
}

// ---------- two-finger swipes ----------
// Swiping with two fingers on a window, a dialog or a pill turns it into its next form, following the fingers 1:1:
// the change is drawn by its usual animation, held where the fingers have got to. Let go past a third of the way,
// or with a flick, and it finishes; otherwise it runs back and the desktop is as it was. On the touchpad, content
// that can still scroll that way scrolls instead; on the touchscreen one finger scrolls and two always swipe.
//   window: up full screen (down back from it), left reduce to dialog, right pin, down pill
//   dialog: up or toward the middle window, down pill
//   pill:   up dialog, down delete (pinned pills stay)
const NATURAL = true;      // the touchpad scrolls naturally, as set in Plasma: the content follows the fingers
const SWIPES = false;      // switched off for now: they don't feel right yet
let swipe = null, swipeBack = null, swipeTimer = 0;

// what a swipe that way on t does: the slot that changes form and the move itself; null for nothing
function swipeAction(t, dir) {
    let el;
    if ((el = t.closest('[data-win], [data-winpill]'))) {
        const i = +(el.dataset.win !== undefined ? el.dataset.win : el.dataset.winpill), s = S.wins[i], full = S.full;
        const d = { up: full ? null : 'full', down: full ? 'full' : 'pill', left: 'dialog', right: 'pin' }[dir];
        return d ? { s, run: () => moveWin(i, d) } : null;
    }
    if ((el = t.closest('.stack .dialog'))) {
        const spec = el.dataset.open, { where, i } = parse(spec), s = listOf(where)[i];
        if (dir === 'down') return { s, run: () => closeSpec(spec) };
        if (dir === 'up' || dir === (where === 'left' ? 'right' : 'left')) return { s, run: () => openSpec(spec) };
        return null;
    }
    if ((el = t.closest('.pills .pill'))) {
        const spec = el.dataset.pill, { where, i } = parse(spec), s = listOf(where)[i];
        const seg = t.closest('[data-seg]'), trash = el.querySelector('[data-trash]');
        if (dir === 'up') return { s, run: () => pillClick(spec, seg ? +seg.dataset.seg : undefined) };
        if (dir === 'down' && trash) return { s, run: () => trashSpec(trash.dataset.trash) };
    }
    return null;
}

// whether anything from t up to the piece can still scroll that way (dx, dy: as the page would scroll)
function canScroll(t, piece, dx, dy) {
    const y = Math.abs(dy) >= Math.abs(dx), d = y ? dy : dx;
    for (let n = t; n && n !== piece.parentElement; n = n.parentElement) {
        const o = getComputedStyle(n)[y ? 'overflowY' : 'overflowX'];
        if (o !== 'auto' && o !== 'scroll') continue;
        const at = y ? n.scrollTop : n.scrollLeft, room = y ? n.scrollHeight - n.clientHeight : n.scrollWidth - n.clientWidth;
        if (d > 0 ? at < room - 1 : at > 0) return true;
    }
    return false;
}

// the desktop as it is, to put back if a swipe is let go too early: the lists, and every slot's own fields
const allSlots = () => [...S.wins, ...S.left, ...S.right, ...S.pillsL, ...S.pillsR, ...S.history.map(h => h.slot)];
const saveState = () => ({
    top: { ...S, wins: [...S.wins], left: [...S.left], right: [...S.right], pillsL: [...S.pillsL], pillsR: [...S.pillsR], history: [...S.history] },
    slots: allSlots().map(s => [s, { ...s, tabs: [...s.tabs] }]),
});
function restoreState(v) {
    Object.assign(S, v.top);
    v.slots.forEach(([s, was]) => { Object.keys(s).forEach(k => { if (!(k in was)) delete s[k]; }); Object.assign(s, was); });
}

// the animations hold at the point where the eased motion has covered p of the way, so the pieces move with the fingers
const unease = p => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (ease(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
const seek = (anims, p) => { const t = unease(clamp(p, 0, 1)); anims.forEach(a => { a.currentTime = t * a.effect.getComputedTiming().endTime; }); };

// fx, fy: how far the fingers moved, in screen pixels. The first few pixels pick the way.
function swipeFeed(t, fx, fy, src) {
    if (!swipe) {
        if (swipeBack) putBack();
        swipe = { mode: 'pending', t, src, fx: 0, fy: 0 };
    }
    const w = swipe;
    if (w.mode === 'pending') {
        w.fx += fx; w.fy += fy;
        if (Math.hypot(w.fx, w.fy) < 6) return;
        swipeBegin(w);
        [fx, fy] = [w.fx, w.fy];
    }
    if (w.mode !== 'shape') return;
    const along = { up: -fy, down: fy, left: -fx, right: fx }[w.dir] / scale;
    w.d = clamp(w.d + along, 0, w.D);
    w.hist.push([performance.now(), along]);
    if (w.d < w.D) return seek(w.anims, w.d / w.D);
    w.anims.forEach(a => a.finish());
    w.mode = 'done';
}

function swipeBegin(w) {
    w.mode = 'none';
    const piece = w.t.isConnected && w.t.closest('.window, .wtab, .stack .dialog, .pills .pill');
    if (op || press || !piece) return;
    if (w.src === 'wheel' && canScroll(w.t, piece, NATURAL ? -w.fx : w.fx, NATURAL ? -w.fy : w.fy)) { w.mode = 'scroll'; return; }
    const dir = Math.abs(w.fx) > Math.abs(w.fy) ? (w.fx < 0 ? 'left' : 'right') : (w.fy < 0 ? 'up' : 'down');
    const a = swipeAction(w.t, dir);
    if (!a) return;
    hideTip();
    const k = String(a.s.id), r0 = layoutRect(stage.querySelector(`[data-k="${k}"]`));
    const saved = saveState();
    a.run();
    const anims = stage.getAnimations({ subtree: true })
        .filter(x => !(window.CSSTransition && x instanceof CSSTransition) && isFinite(x.effect.getComputedTiming().endTime));
    anims.forEach(x => x.pause());
    // the whole way is as far as the piece itself goes, so it stays under the fingers
    const el = stage.querySelector(`[data-k="${k}"]`), r1 = el ? layoutRect(el) : { ...r0, y: r0.y + 36 };
    const D = clamp(Math.hypot(r1.x + r1.w / 2 - r0.x - r0.w / 2, r1.y + r1.h / 2 - r0.y - r0.h / 2), 160, 520);
    Object.assign(w, { mode: 'shape', dir, saved, anims, D, d: 0, hist: [] });
}

function swipeRelease() {
    clearTimeout(swipeTimer);
    const w = swipe;
    swipe = null;
    if (!w || w.mode !== 'shape') return;
    // speed toward the new form over the last 80 ms, in stage pixels per ms
    const end = w.hist.length ? w.hist[w.hist.length - 1][0] : 0;
    const v = w.hist.filter(([t]) => t > end - 80).reduce((sum, [, a]) => sum + a, 0) / 80, p = w.d / w.D;
    if ((p > 0.33 && v > -0.15) || v > 0.5) return w.anims.forEach(a => a.play());
    swipeBack = w;
    const t0 = performance.now(), ms = 120 + 180 * p;
    const step = now => {
        if (swipeBack !== w) return;
        const u = clamp((now - t0) / ms, 0, 1);
        seek(w.anims, p * (1 - ease(u)));
        if (u < 1) requestAnimationFrame(step); else putBack();
    };
    requestAnimationFrame(step);
}
function putBack() {
    const w = swipeBack;
    swipeBack = null;
    w.anims.forEach(a => a.cancel());
    restoreState(w.saved);
    render(false);
}

// the touchpad: two-finger swipes arrive as wheel events, with no sign of the fingers lifting but a pause.
// A mouse wheel (lines, or a big first step) only scrolls.
stage.addEventListener('wheel', e => {
    if (!SWIPES || e.ctrlKey) return;      // a pinch
    if (swipe && swipe.src !== 'wheel') return e.preventDefault();
    if (!swipe && (e.deltaMode !== 0 || Math.max(Math.abs(e.deltaX), Math.abs(e.deltaY)) >= 50)) return;
    swipeFeed(e.target, NATURAL ? -e.deltaX : e.deltaX, NATURAL ? -e.deltaY : e.deltaY, 'wheel');
    clearTimeout(swipeTimer);
    swipeTimer = setTimeout(swipeRelease, 160);
    if (swipe.mode !== 'scroll') e.preventDefault();
}, { passive: false });

// the touchscreen: two fingers swipe whatever is between them; one finger still carries and scrolls
let fingers = null;
const between = e => ({ x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 });
stage.addEventListener('touchstart', e => {
    if (!SWIPES || e.touches.length !== 2) return;
    e.preventDefault();
    if (op || press) dropAll();
    if (swipe) swipeRelease();
    fingers = between(e);
    fingers.t = document.elementFromPoint(fingers.x, fingers.y) || e.target;
}, { passive: false });
stage.addEventListener('touchmove', e => {
    if (!fingers || e.touches.length < 2) return;
    e.preventDefault();
    const m = between(e);
    swipeFeed(fingers.t, m.x - fingers.x, m.y - fingers.y, 'touch');
    fingers.x = m.x; fingers.y = m.y;
}, { passive: false });
const lift = e => { if (fingers && e.touches.length < 2) { fingers = null; swipeRelease(); } };
stage.addEventListener('touchend', lift);
stage.addEventListener('touchcancel', lift);

// ---------- time passes: items.js moves its jobs along and ticks the clock ----------
setInterval(() => {
    if (tick() && !op && !press && !swipe && !swipeBack) render(false); else updateLive();
}, 1000);

// ---------- fit the 1920×1080 desktop into whatever window the page is shown in ----------
function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    scale = Math.min(vw / 1920, vh / 1080);
    // whole device pixels, so hairlines don't smear across two rows
    const px = v => Math.round(v * devicePixelRatio) / devicePixelRatio;
    stage.style.transform = `translate(${px((vw - 1920 * scale) / 2)}px, ${px((vh - 1080 * scale) / 2)}px) scale(${scale})`;
}
window.addEventListener('resize', fit);
fit();
render(false);
