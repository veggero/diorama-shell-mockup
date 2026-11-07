// Diorama interactive mockup: what each item looks like as a window, a dialog and a pill.
// The content is a made-up, everyday desktop: a street newsletter being written, a holiday video exporting,
// photos coming in from a phone, a hobby project's tests, music, a shared photo folder syncing, a parcel on its way.
// Every item has a full app page for its window and a compact quick view for its dialog. Numbers move on a timer (see L).

const ico = (p, c = 'ico') => `<img class="${c}" src="icons/${p}.svg" alt="">`;
const ib = (p, act, tip) => `<div class="ib">${ico(p)}</div>`;
const bar = (key, pct, color = '') => `<div class="progress"><i data-bar="${key}" style="width: ${pct}%;${color && ` background: ${color};`}"></i></div>`;
const sec = (label, action = '') => `<div class="dsec row"><span class="grow">${label}</span>${action}</div>`;
const secBtn = (icon, label, act) => `<div class="btn" style="height: 28px; padding: 0 8px; margin: -4px -6px -4px 0;">${icon ? ico(icon) : ''}${label}</div>`;
const list = rows => `<div class="dlist">${rows.join('')}</div>`;
const drow = (lead, name, val = '', tail = '', attrs = '') =>
    `<div class="drow"${attrs}>${lead}<span class="grow">${name}</span>${val !== '' ? `<span class="num">${val}</span>` : ''}${tail}</div>`;
const barRow = (lead, name, val, key, pct, tail = '', color = '') =>
    `<div class="drow">${lead}<div class="col grow" style="gap: 6px;"><div class="row"><span class="grow">${name}</span><span class="num" data-live="${key}">${val}</span></div>${bar(key, pct, color)}</div>${tail}</div>`;
const sw = (key) => `<span class="switch${L[key] ? ' on' : ''}"></span>`;
const dot = s => `<span class="dot ${s}" style="margin: 0 2px;"></span>`;
const spin = (size = 14) => `<span class="spinner" style="width: ${size}px; height: ${size}px; margin: 0 ${(18 - size) / 2 + 2}px;"></span>`;
const slider = (key, pct, steps = 0) => `<div class="slider"><i style="width: ${pct}%;"></i><b style="left: ${pct}%;"></b></div>`;

// ---------- parts of an app window ----------
const tg = on => `<span class="switch${on ? ' on' : ''}"></span>`;
const cb = on => `<span class="cb${on ? ' on' : ''}"></span>`;
const ico22 = p => ico(p, p.includes('/16/') ? 'ico22" style="padding: 3px;' : 'ico22');
// a flat toolbar action; in a half-width window it keeps only its icon
const tb = (icon, label = '', cls = '') => `<div class="btn${cls ? ' ' + cls : ''}">${icon ? ico(icon) : ''}${label ? `<span class="lbl">${label}</span>` : ''}</div>`;
const tsep = (cls = '') => `<span class="tsep${cls ? ' ' + cls : ''}"></span>`;
const cmb = (text, cls = '') => `<div class="cmb combo${cls ? ' ' + cls : ''}">${text}</div>`;
const fld = (text, icon = 'actions/16/edit-find', cls = '') => `<div class="field${cls ? ' ' + cls : ''}">${icon ? ico(icon) : ''}<span class="grow" style="white-space: nowrap; overflow: hidden;">${text}</span></div>`;
const si = (icon, label, val = '', cur = false, cls = '') =>
    `<div class="si${cur ? ' cur' : ''}${cls ? ' ' + cls : ''}">${icon ? (icon.startsWith('<') ? icon : ico(icon)) : ''}<span class="grow">${label}</span>${val !== '' ? (String(val).startsWith('<') ? val : `<span class="num">${val}</span>`) : ''}</div>`;
const sh = (label, extra = '') => `<div class="sh"><span class="grow">${label}</span>${extra}</div>`;
const kv = (k, v) => `<div class="kv"><span>${k}</span><span class="num">${v}</span></div>`;
// a stable pseudo-random 0..1 per number, so photo grids don't repeat in columns
const hash = n => ((n * 2654435761) % 4294967296) / 4294967296;
const vary = n => `filter: brightness(${(0.88 + hash(n + 11) * 0.24).toFixed(2)}) saturate(${(0.8 + hash(n + 37) * 0.5).toFixed(2)});${hash(n + 5) > 0.5 ? ' transform: scaleX(-1);' : ''}`;
const pic = (n, cls = '', style = '') => `<div class="pic s${n % 10}${cls ? ' ' + cls : ''}"${style ? ` style="${style}"` : ''}></div>`;
const av = (letter, color, cls = '') => `<span class="av${cls ? ' ' + cls : ''}" style="background: ${color};">${letter}</span>`;
// a list view: cols are its grid columns; cn / cm the columns left in a split / when maximized
const table = (cols, head, rows, { cn = '', cm = '', style = '' } = {}) =>
    `<div class="tbl" style="--cols: ${cols};${cn ? ` --cn: ${cn};` : ''}${cm ? ` --cm: ${cm};` : ''}${style}">`
    + (head ? `<div class="tr th">${head.join('')}</div>` : '') + rows.join('') + '</div>';
const tr = (cells, cls = '') => `<div class="tr${cls ? ' ' + cls : ''}">${cells.join('')}</div>`;
const c = (html, cls = '') => `<span${cls ? ` class="${cls}"` : ''}>${html}</span>`;
const ci = (icon, html, cls = '') => `<span class="c${cls ? ' ' + cls : ''}">${icon}<span>${html}</span></span>`;

// a whole app: sidebar (gone in a split), toolbar row, content, status bar
function app({ side = '', top, body, status = '', foot = '', bodyCls = '' }) {
    return `<div class="ap">${side ? `<aside class="ap-side wide-only">${side}</aside>` : ''}<div class="ap-main">`
        // the main scrolling pane is also a .page, so the shell keeps its scroll position across redraws
        + `<div class="ap-bar">${top}</div><div class="ap-body${bodyCls ? ' ' + bodyCls : ''}">${body.replace('class="ap-c"', 'class="ap-c page"')}</div>`
        + (status ? `<div class="ap-status">${status}</div>` : '') + foot + '</div></div>';
}

// ---------- live values the timer moves forward ----------
const L = {
    exp: 47, imp: 40, tests: 96, dl: 63, sync: 24, trk: 1, pos: 102, clockMin: 16 * 60 + 40,
    vol: 70, mic: 55, night: true, wifi: true, awake: false, profile: 'Balanced', paused: false,
};
const clock = () => `${String(Math.floor(L.clockMin / 60) % 24).padStart(2, '0')}:${String(L.clockMin % 60).padStart(2, '0')}`;
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const n0 = v => Math.floor(v).toLocaleString('en-GB');
const eur = v => '€' + v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- November newsletter: a word processor ----------
const OUTLINE = [['Elm Street News', 0], ['Autumn clean-up day', 1], ['New bike racks', 1], ['Welcome, new neighbours', 1], ['The book box', 1, true], ['Dates for your calendar', 1], ['Lost and found', 1], ['Recipe corner', 1], ['Get in touch', 1]];

function docPage() {
    const side = sh('Outline') + OUTLINE.map(([t, lv, cur]) => si('', t, '', cur, lv ? 'ind2' : 'semi')).join('')
        + sh('Pages') + `<div class="minis">${[1, 2, 3].map(n => `<div class="mini${n === 1 ? ' cur' : ''}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`).join('')}</div>`
        + sh('Comments') + si(av('M', '#9b59b6', 'sm'), 'Marta: add the soup?', '')
        + si(av('T', '#16a085', 'sm'), 'Tom: racks from the 23rd', '');
    const top = `<span class="t">November newsletter</span>`
        + cmb('Heading 2', 'wide-only') + tb('actions/16/format-text-bold') + tb('actions/16/format-text-italic') + tb('actions/16/format-text-underline')
        + tsep('wide-only') + tb('actions/16/format-list-unordered', '', 'wide-only') + tb('actions/16/insert-image', '', 'wide-only') + tb('actions/16/insert-link', '', 'wide-only')
        + tsep() + tb('actions/16/document-export', 'Export PDF') + tb('actions/16/document-share', 'Share');
    const page1 = `<div class="sheet docpg">
<h1>Elm Street News</h1>
<div class="row" style="gap: 8px;"><span class="semi">November 2026</span><span>·</span><span>Residents' newsletter, issue 31</span></div>
<div class="rule"></div>
${pic(2)}
<span class="cap">The park after last year's clean-up: forty bags of leaves and one very happy bench.</span>
<h2>Autumn clean-up day</h2>
<p>Saturday 14 November, from 10:00 at the park gate. Gloves, bags and hot tea are provided; bring a rake if you have one. We will finish by 13:00 with soup in the community room, so come hungry.</p>
<h2>New bike racks</h2>
<p>The council has agreed to put eight new racks outside the bakery. Work starts the week of 23 November, so the pavement will be narrow for a few days. Thank you to everyone who signed the request in the spring.</p>
<h2>Welcome, new neighbours</h2>
<p>A warm welcome to the family at number 8 and to the two students above the bakery. If you see them, say hello and tell them about the book box.</p>
<h2>The book box</h2>
<p>Thanks to everyone who keeps the book box by the bus stop full. It now holds more than sixty books, a shelf of puzzles and, since last week, a small umbrella that nobody has claimed.</p>
<p>This month's favourite is a well-worn cookbook that keeps coming back with new notes in the margins<span class="caret-i"></span></p>
</div>`;
    const page2 = `<div class="sheet docpg max-only">
<h2 style="margin-top: 0;">Dates for your calendar</h2>
<ul><li><b>Sat 14 Nov</b>, 10:00: autumn clean-up day, park gate</li><li><b>Thu 19 Nov</b>, 19:00: book club, community room</li><li><b>Sun 6 Dec</b>, 11:00: winter market on the square</li><li><b>Wed 16 Dec</b>, 18:00: carols by the tree</li></ul>
<h2>Lost and found</h2>
<p>A blue scarf and a set of two keys on a red ring were found near the playground. They are waiting at the bakery counter.</p>
${pic(7)}
<span class="cap">The new planters by the bus stop, sown in October.</span>
<h2>Recipe corner: clean-up soup</h2>
<p>For about twenty bowls: two kilos of pumpkin, four onions, a thumb of ginger, three litres of stock and a pot of cream. Roast the pumpkin first; it makes all the difference.</p>
<h2>Get in touch</h2>
<p>Ideas, notices and photos for the December issue are welcome until 30 November. Drop a note in the box by door 12, or <span class="sel">write to the newsletter team</span>.</p>
</div>`;
    return app({
        side, top,
        body: `<div class="canvas">${page1}${page2}</div>`,
        status: `<span>Page 1 of 3</span><span>936 words</span><span class="wide-only">English (UK)</span><span class="gap"></span><span class="wide-only">Saved 16:38</span><span>90%</span>`,
    });
}

// ---------- video export: a render queue ----------
const expLabel = () => L.exp >= 100 ? 'Done' : `${Math.floor(L.exp)}% · ${Math.max(1, Math.ceil((100 - L.exp) / 9))} min`;
const expFrames = () => `Frame ${n0(15840 * L.exp / 100)} of 15,840`;

function exportPage() {
    const done = L.exp >= 100;
    const rows = [
        tr([ci(pic(0, 'thumb'), 'Lake weekend.mp4'), c('MP4 · 1920 × 1080', 'wide-only'), `<span class="row" style="gap: 10px;"><span class="grow">${bar('exp', L.exp)}</span><span class="num" data-live="exp" style="width: 92px;">${expLabel()}</span></span>`, c(done ? '' : 'Rendering', 'wide-only')], 'cur'),
        tr([ci(pic(0, 'thumb'), 'Lake weekend (vertical).mp4'), c('MP4 · 1080 × 1920', 'wide-only'), c(done ? 'Rendering' : 'Next'), c('', 'wide-only')]),
        tr([ci(pic(7, 'thumb'), 'Garden timelapse.mp4'), c('MP4 · 3840 × 2160', 'wide-only'), c('Queued'), c('', 'wide-only')]),
        tr([ci(pic(9, 'thumb'), 'Birthday slideshow.mp4'), c('MP4 · 1920 × 1080', 'wide-only'), c('Done Thu, 1.1 GB'), c('', 'wide-only')]),
    ];
    const settings = `<div class="ph">Settings</div>` + kv('Format', 'MP4 · H.264') + kv('Resolution', '1920 × 1080') + kv('Frame rate', '30 fps') + kv('Quality', 'High')
        + kv('Audio', 'AAC · 256 kbit/s') + kv('Length', '8:48') + kv('Size', 'about 1.4 GB') + kv('Save to', 'Videos')
        + `<div class="ph" style="margin-top: 12px;">This computer</div>` + kv('Speed', '61 fps') + kv('Processor', '74%') + kv('Graphics', 'hardware encoder');
    return app({
        top: `<span class="t">Export: Lake weekend</span>` + tb('actions/16/media-playback-pause', 'Pause') + tb('actions/16/process-stop', 'Stop')
            + tb('actions/16/document-open-folder', 'Open folder') + tb('actions/16/list-add', 'Add to queue', 'wide-only'),
        body: `<div class="ap-c fixed"><div class="row grow" style="gap: 16px; align-items: stretch; min-height: 0;">
<div class="col grow" style="gap: 12px; min-width: 0;"><div class="vw">${pic(0, 'vframe')}<span class="tc" data-live="expFrames">${expFrames()}</span></div></div>
<div class="panel ap-pane wide-only">${settings}</div></div>
<div class="col" style="flex: none; gap: 4px;"><div class="ph" style="padding: 0 0 4px;">Queue</div>${table('minmax(0, 1fr) 170px 260px 90px', ['<span>Name</span>', '<span class="wide-only">Format</span>', '<span>Progress</span>', '<span class="wide-only">State</span>'], rows, { cn: 'minmax(0, 1fr) 190px' })}</div></div>`,
        status: `<span>Rendering 1 of 3</span><span class="wide-only">61 fps</span><span class="gap"></span>${bar('exp', L.exp)}<span class="num" data-live="exp">${expLabel()}</span>`,
    });
}

// ---------- photo import from a phone ----------
const IMP_N = 128;
const impLabel = () => L.imp >= IMP_N ? 'Imported' : `${Math.floor(L.imp)} of ${IMP_N}`;
const DAYS = [['Saturday 31 October', [0, 0, 4, 2, 0, 3, 4, 0, 2, 2, 1, 1], 64], ['Sunday 1 November', [8, 8, 9, 7, 8, 7, 9, 8], 41], ['Tuesday 3 November', [5, 6, 5, 5, 6, 7], 37]];

function photosPage() {
    let k = 0;
    const groups = DAYS.map(([day, scenes, n], g) => {
        const tiles = [];
        for (let i = 0; i < n; i++, k++) {
            const off = g === 2 && i >= 23, done = !off && k < L.imp, video = (i * 7 + g) % 11 === 5;
            tiles.push(`<div class="tile${off ? ' off' : ''}">${pic(scenes[Math.floor(hash(k + 3) * scenes.length)], '', vary(k))}${cb(!off)}${video ? `<span class="len">0:${String(12 + (i * 13) % 47).padStart(2, '0')}</span>` : ''}${done ? '<span class="em ok"></span>' : ''}</div>`);
        }
        return `<div class="grp">${cb(g < 2)}<span class="semi grow">${day}</span><span>${n} photos</span></div><div class="tiles">${tiles.join('')}</div>`;
    }).join('');
    return app({
        side: sh('Devices') + si(ico22('devices/22/smartphone'), 'Phone', '142 new', true) + si(ico22('devices/22/drive-removable-media-usb'), 'USB stick', '')
            + sh('Import to') + si(ico22('places/22/folder-pictures'), 'Pictures › 2026', '')
            + sh('While importing') + si('', 'Rename by date', tg(true)) + si('', 'Skip duplicates', tg(true)) + si('', 'Delete from phone', tg(false)) + si('', 'Make an album', tg(false)),
        top: `<span class="t">Import from Phone</span>` + cmb('New photos', 'wide-only') + tb('actions/16/edit-select-all', 'Select all') + tb('actions/16/document-import', 'Import 128'),
        body: `<div class="ap-c" style="gap: 8px;">${groups}</div>`,
        status: `<span>142 new</span><span>128 selected</span><span class="wide-only">1.2 GB</span><span class="gap"></span><span class="wide-only">Importing</span>${bar('imp', L.imp / IMP_N * 100)}<span class="num" data-live="imp">${impLabel()}</span>`,
    });
}

// ---------- tests of a hobby project ----------
const T_N = 142;
const TFILES = [['test_scan.py', 18], ['test_exif_dates.py', 24, 2], ['test_dedupe.py', 31], ['test_albums.py', 20], ['test_thumbs.py', 14], ['test_cli.py', 21], ['test_export.py', 14]];
const testsLabel = () => L.tests >= T_N ? 'Done' : `${Math.floor(L.tests)} of ${T_N}`;
const passed = () => Math.floor(L.tests) - 2;
const tstate = () => { let at = 0; return TFILES.map(([f, n, fail]) => { const s = L.tests >= at + n ? (fail ? 'fail' : 'done') : L.tests > at ? 'run' : 'todo'; at += n; return [f, n, s, fail]; }); };
const tlead = s => s === 'run' ? spin() : dot(s);

function testsPage() {
    const files = tstate();
    const log = `<span class="m">$ pytest tests</span>
platform linux, Python 3.13.2, pytest 8.4.1
collected 142 items

tests/test_scan.py <span class="m">..................</span>                                    [ 12%]
tests/test_exif_dates.py <span class="m">......</span><span class="er">F</span><span class="m">.........</span><span class="er">F</span><span class="m">.......</span>                        [ 29%]
tests/test_dedupe.py <span class="m">...............................</span>                     [ 51%]
tests/test_albums.py <span class="m">....................</span>                                [ 65%]
tests/test_thumbs.py <span class="m">...</span><span class="cur">_</span>

<span class="er">_____________________________ test_timezone_from_gps _____________________________</span>

    def test_timezone_from_gps():
        photo = load("fixtures/lake_0412.jpg")
<span class="er">&gt;       assert photo.taken == datetime(2026, 10, 31, 14, 2, 11, tzinfo=CET)
E       AssertionError: assert 13:02:11+00:00 == 14:02:11+01:00</span>

tests/test_exif_dates.py:88: AssertionError
<span class="er">_______________________________ test_dst_boundary ________________________________</span>

    def test_dst_boundary():
        photo = load("fixtures/clock_change.jpg")
<span class="er">&gt;       assert photo.taken.hour == 2
E       assert 3 == 2</span>

tests/test_exif_dates.py:104: AssertionError`;
    return app({
        side: sh('Test files') + files.map(([f, n, s]) => si(tlead(s), f, s === 'fail' ? '2 failed' : n)).join('')
            + sh('Project') + si(ico('actions/16/vcs-commit'), 'Branch', 'dates-fix') + si(ico('mimetypes/16/text-x-python'), 'Python', '3.13') + si(ico('actions/16/view-refresh'), 'Rerun on save', tg(true)),
        top: `<span class="t">Tests: photo-sorter</span>` + tb('actions/16/media-playback-start', 'Run all') + tb('actions/16/view-refresh', 'Rerun failed') + tb('actions/16/process-stop', 'Stop'),
        body: `<div class="ap-c fixed">
<div class="row" style="gap: 10px; flex: none;"><div class="panel stat"><span class="small">Passed</span><b data-live="tpass">${passed()}</b></div><div class="panel stat"><span class="small">Failed</span><b style="color: #b8293a;">2</b></div><div class="panel stat"><span class="small">Left</span><b data-live="tleft">${T_N - Math.floor(L.tests)}</b></div><div class="panel stat wide-only"><span class="small">Time</span><b>0:48</b></div></div>
<div class="panel col" style="padding: 4px 0; flex: none;"><div class="li"><span class="dot fail"></span><span class="grow">test_timezone_from_gps</span><span class="wide-only">test_exif_dates.py:88</span></div><div class="li"><span class="dot fail"></span><span class="grow">test_dst_boundary</span><span class="wide-only">test_exif_dates.py:104</span></div></div>
<div class="panel grow tlog">${log}</div></div>`,
        status: `<span>pytest · 142 tests</span><span class="wide-only">tests/test_thumbs.py</span><span class="gap"></span>${bar('tests', L.tests / T_N * 100)}<span class="num" data-live="tests">${testsLabel()}</span>`,
    });
}

// ---------- music ----------
const TRACKS = [['Harbour Lights', 245], ['Low Tide', 218], ['Paper Boats', 192], ['The Long Crossing', 321], ['Lanterns', 227], ['Salt Air', 250],
    ['Northbound', 235], ['Ferry Bells', 178], ['Quiet Deck', 284], ['Morning Port', 210], ['Home Shore', 302]];
const trackNow = () => TRACKS[L.trk];

function musicPage() {
    const [name, len] = trackNow();
    const rows = TRACKS.map(([t, s], i) => tr([c(i === L.trk ? ico('status/16/audio-volume-high') : i + 1, 'num'), c(t), c('Glass Harbour', 'wide-only'), c([12, 9, 21, 4, 7, 15, 11, 3, 6, 8, 5][i] + ' plays', 'max-only'), c(mmss(s), 'num r')], i === L.trk ? 'cur' : ''));
    const next = TRACKS.slice(L.trk + 1, L.trk + 6).map(([t, s]) => `<div class="kv"><span>${t}</span><span class="num">${mmss(s)}</span></div>`).join('');
    return app({
        side: fld('Search music') + si(ico('actions/16/media-playback-start'), 'Now playing') + si(ico('actions/16/view-media-album-cover'), 'Albums', '', true)
            + si(ico('actions/16/view-media-artist'), 'Artists') + si(ico('mimetypes/16/audio-x-generic'), 'Tracks') + si(ico('places/16/folder-music'), 'Files') + si(ico('devices/16/audio-radio'), 'Radio')
            + sh('Playlists') + si(ico('actions/16/view-media-playlist'), 'Sunday morning', '24') + si(ico('actions/16/view-media-playlist'), 'Cooking', '41') + si(ico('actions/16/view-media-playlist'), 'Running', '33'),
        top: `<span class="t">Night Ferry</span>` + tb('actions/16/media-playback-start', 'Play') + tb('actions/16/media-playlist-shuffle', 'Shuffle') + tb('actions/16/list-add', 'Add to queue', 'wide-only'),
        body: `<div class="ap-c">
<div class="row" style="gap: 22px; flex: none;"><div class="art a0" style="width: 150px; height: 150px;"></div><div class="col" style="gap: 6px; min-width: 0;"><span class="big2">Night Ferry</span><span>Glass Harbour</span><span>2025 · 11 tracks · 44 min</span></div></div>
${table('40px minmax(0, 1fr) 200px 60px', ['<span>#</span>', '<span>Title</span>', '<span class="wide-only">Artist</span>', '<span class="max-only">Played</span>', '<span class="r">Length</span>'], rows, { cn: '32px minmax(0, 1fr) 60px', cm: '40px minmax(0, 1fr) 260px 120px 60px' })}</div>
<div class="panel ap-pane max-only"><div class="ph">Up next</div>${next}<div class="ph" style="margin-top: 14px;">More by Glass Harbour</div>
<div class="row" style="gap: 12px; margin-top: 6px; align-items: flex-start;"><div class="col" style="gap: 6px; flex: 1 1 0; min-width: 0;"><div class="art a2" style="width: 100%; aspect-ratio: 1;"></div><span>Tidal</span></div><div class="col" style="gap: 6px; flex: 1 1 0; min-width: 0;"><div class="art a3" style="width: 100%; aspect-ratio: 1;"></div><span>Shoreline</span></div></div></div>`,
        foot: `<div class="ap-player"><div class="art a0" style="width: 44px; height: 44px; border-radius: 4px;"></div><div class="ttl"><span class="semi">${name}</span><span>Glass Harbour</span></div>
<div class="row" style="gap: 2px;">${tb('actions/16/media-skip-backward')}<span class="pl">${ico(`actions/16/media-playback-${L.paused ? 'start' : 'pause'}`)}</span>${tb('actions/16/media-skip-forward')}</div>
<div class="prog"><span class="num" data-live="pos">${mmss(L.pos)}</span>${bar('pos', L.pos / len * 100)}<span class="num">${mmss(len)}</span></div>
<div class="vol wide-only">${ico('status/16/audio-volume-high')}${slider('mvol', 80)}</div></div>`,
    });
}

// ---------- shared folder sync ----------
const SYNC_N = 38;
const syncLabel = () => L.sync >= SYNC_N ? 'Up to date' : `${Math.floor(L.sync)} of ${SYNC_N}`;
const SYNC_PICS = [0, 0, 3, 4, 0, 2, 1, 0, 4, 2, 3, 0, 1];

function syncPage() {
    const files = [];
    for (let i = 0; i < SYNC_N; i++) {
        const st = i < L.sync ? 'ok' : i < L.sync + 1 ? 'sy' : 'wait';
        files.push(`<div class="file${i === 6 ? ' cur' : ''}">${pic(SYNC_PICS[Math.floor(hash(i + 50) * SYNC_PICS.length)], '', vary(i + 50))}<span class="em ${st}"></span><span>IMG_${4101 + i}.jpg</span></div>`);
    }
    return app({
        side: sh('Places') + si(ico('places/16/user-home'), 'Home') + si(ico('places/16/user-desktop'), 'Desktop') + si(ico('places/16/folder-documents'), 'Documents')
            + si(ico('places/16/folder-download'), 'Downloads') + si(ico('places/16/folder-pictures'), 'Pictures') + si(ico('places/16/folder-music'), 'Music') + si(ico('places/16/folder-videos'), 'Videos')
            + si(ico('places/16/user-trash'), 'Trash') + sh('Shared') + si(ico('places/16/folder-cloud'), 'Family photos', '', true) + si(ico('places/16/folder-cloud'), 'Flat paperwork')
            + si(ico('places/16/folder-cloud'), 'Recipes') + sh('Devices') + si(ico('devices/16/drive-harddisk'), 'Backup drive'),
        top: `<span class="wide-only" style="white-space: nowrap; margin-right: 8px;">Family photos&nbsp;&nbsp;›</span><span class="t">Lake weekend</span>`
            + `<div class="segctl wide-only" style="margin-right: 6px;"><span class="on">${ico('actions/16/view-list-icons')}</span><span>${ico('actions/16/view-list-details')}</span></div>`
            + tb('actions/16/view-sort', 'Sort', 'wide-only') + tb('actions/16/document-share', 'Share') + tb('actions/16/view-refresh', 'Sync now'),
        body: `<div class="ap-c"><div class="files">${files.join('')}</div></div>
<div class="panel ap-pane max-only">${pic(0, '', 'width: 100%; height: auto; aspect-ratio: 4 / 3; border-radius: 6px;')}<div class="ph" style="margin-top: 12px;">IMG_4107.jpg</div>
${kv('Taken', 'Sat 31 Oct, 15:12')}${kv('Size', '4.2 MB')}${kv('Dimensions', '4032 × 3024')}${kv('Added by', 'Anna')}${kv('Status', 'Synced')}
<div class="ph" style="margin-top: 12px;">Shared with</div><div class="kv"><span class="row" style="gap: 8px;">${av('A', '#e67e22', 'sm')}Anna</span><span>Can edit</span></div><div class="kv"><span class="row" style="gap: 8px;">${av('M', '#2980b9', 'sm')}Marco</span><span>Can edit</span></div></div>`,
        status: `<span>38 photos, 1.6 GB</span><span class="wide-only">Shared with Anna and Marco</span><span class="gap"></span><span class="wide-only">Syncing</span>${bar('sync', L.sync / SYNC_N * 100)}<span class="num" data-live="sync">${syncLabel()}</span>`,
    });
}

// ---------- a parcel on its way ----------
const MAP = `<svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="600" height="600" fill="#eef0e6"/>
<path d="M-10 430 C 120 400, 200 470, 320 440 S 500 370, 610 400" stroke="#a8d0ea" stroke-width="30" fill="none"/>
<rect x="70" y="80" width="170" height="120" rx="14" fill="#cfe6c4"/><rect x="370" y="470" width="170" height="100" rx="14" fill="#cfe6c4"/><rect x="330" y="250" width="90" height="34" rx="6" fill="#e3e1d6"/>
<g stroke="#d9dbd1" stroke-width="6" fill="none"><path d="M0 520 H150"/><path d="M540 0 V300"/><path d="M300 360 H600"/><path d="M90 300 V0"/></g>
<g stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round"><path d="M0 300 H600"/><path d="M300 0 V600"/><path d="M0 140 L600 220"/><path d="M450 0 L430 600"/><path d="M150 600 L230 300"/></g>
<path d="M165 600 L230 300 L300 300 L300 238" stroke="#3daee9" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M300 238 L300 180 L440 199 L438 268" stroke="#3daee9" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 11"/>
<circle cx="300" cy="238" r="15" fill="#3daee9" stroke="#fff" stroke-width="4"/><rect x="292" y="232" width="16" height="12" rx="2" fill="#fff"/>
<path d="M438 290 c-13 -15 -20 -24 -20 -33 a20 20 0 0 1 40 0 c0 9 -7 18 -20 33z" fill="#da4453" stroke="#fff" stroke-width="3"/><circle cx="438" cy="257" r="7" fill="#fff"/>
</svg>`;
const PARCELS = [['Desk lamp', 'Today'], ['Running shoes', 'Tue'], ['Board game', 'Delivered'], ['Printer ink', 'Delivered']];
const PEVENTS = [['now', 'Out for delivery', 'Today 08:12'], ['done', 'Arrived at the local depot', 'Today 06:40'], ['done', 'Left the sorting centre', 'Fri 22:15'], ['done', 'Shipped', 'Thu 17:02'], ['done', 'Order placed', 'Tue 3 Nov']];

function parcelPage() {
    const steps = [['done', 'Ordered'], ['done', 'Shipped'], ['done', 'At depot'], ['now', 'Delivering'], ['todo', 'Delivered']]
        .map(([s, t]) => `<div class="step${s === 'todo' ? ' todo' : ''}"><span class="dot ${s}"></span><span${s === 'now' ? ' class="semi"' : ''}>${t}</span></div>`).join('');
    const events = PEVENTS.map(([s, t, w]) => `<div class="li" style="padding: 9px 14px;"><span class="dot ${s} sm"></span><span class="grow">${t}</span><span class="num">${w}</span></div>`).join('');
    return app({
        side: sh('On the way') + si(ico22('mimetypes/22/package-x-generic'), 'Desk lamp', 'Today', true) + si(ico22('mimetypes/22/package-x-generic'), 'Running shoes', 'Tue')
            + sh('Delivered') + si(ico22('mimetypes/22/package-x-generic'), 'Board game', 'Wed') + si(ico22('mimetypes/22/package-x-generic'), 'Printer ink', '28 Oct')
            + si(ico22('mimetypes/22/package-x-generic'), 'Bike lights', '19 Oct') + si(ico22('mimetypes/22/package-x-generic'), 'Seeds', '12 Oct'),
        top: `<span class="t">Desk lamp</span>` + tb('actions/16/edit-copy', 'Copy tracking number') + tb('actions/16/view-calendar', 'Add to calendar', 'wide-only') + tb('actions/16/internet-services', 'Open in browser'),
        body: `<div class="ap-c">
<div class="panel pad col" style="gap: 18px;"><div class="row" style="gap: 16px; flex-wrap: wrap;"><span class="big2 grow">Out for delivery</span><span class="semi">Arrives today, 17:00 – 18:00</span></div><div class="steps">${steps}</div></div>
<div class="row grow" style="gap: 16px; align-items: stretch; min-height: 260px;">
<div class="col pcol" style="gap: 8px;"><div class="ph">Tracking</div><div class="panel" style="padding: 4px 0;">${events}</div>
<div class="ph" style="margin-top: 8px;">Details</div><div class="panel" style="padding: 2px 14px;">${kv('Tracking number', 'PX 4471 0823 19')}${kv('Order', '#20481')}${kv('Weight', '2.1 kg')}${kv('Deliver to', 'Home, front door')}</div></div>
<div class="mapbox wide-only">${MAP}</div></div></div>`,
        status: `<span>2 on the way</span><span class="gap"></span><span>Updated 16:36</span>`,
    });
}

// ---------- downloads ----------
const dlLabel = () => L.dl >= 100 ? 'Done' : `${Math.floor(L.dl)}%`;
const dlLeft = () => L.dl >= 100 ? '' : `${Math.max(1, Math.ceil((100 - L.dl) / 15))} min left`;
const DLS = [
    ['Today', [['application-zip', 'lake-weekend-originals.zip', '2.1 GB', 'run', '16:31'], ['application-pdf', 'train-tickets.pdf', '182 KB', 'Done', '15:02'], ['application-pdf', 'bike-rack-plan.pdf', '1.1 MB', 'Done', '11:47']]],
    ['Yesterday', [['application-epub+zip', 'one-pot-dinners.epub', '4.6 MB', 'Done', '21:15'], ['image-jpeg', 'clean-up-poster.jpg', '2.4 MB', 'Done', '18:20'], ['application-pdf', 'router-manual.pdf', '6.8 MB', 'Done', '09:03']]],
    ['This week', [['application-pdf', 'holiday-flat-check-in.pdf', '240 KB', 'Done', 'Wed'], ['application-pdf', 'sourdough-guide.pdf', '3.2 MB', 'Done', 'Wed'], ['application-zip', 'photo-sorter-0.9.tar.gz', '380 KB', 'Done', 'Tue'],
        ['image-jpeg', 'garden-plan.jpg', '1.9 MB', 'Done', 'Tue'], ['application-pdf', 'bus-timetable-winter.pdf', '820 KB', 'Done', 'Mon'], ['audio-x-generic', 'birdsong-morning.ogg', '12.4 MB', 'Done', 'Mon']]],
    ['Earlier', [['application-zip', 'wallpapers-autumn.zip', '48 MB', 'Done', '30 Oct'], ['application-pdf', 'knitting-pattern-scarf.pdf', '1.2 MB', 'Done', '28 Oct'], ['application-x-cd-image', 'rescue-usb.iso', '1.4 GB', 'Done', '26 Oct']]],
];

function downloadsPage() {
    const rows = DLS.flatMap(([g, items]) => [`<div class="tr grp"><span>${g}</span></div>`].concat(items.map(([m, n, s, st, t]) => tr([
        ci(ico22(`mimetypes/22/${m}`), n), c(s, 'num r'),
        st === 'run' ? `<span class="row" style="gap: 10px;"><span class="grow">${bar('dl', L.dl)}</span><span class="num" data-live="dl" style="width: 40px; text-align: right;">${dlLabel()}</span></span>` : c('Done'),
        c(st === 'run' ? '8.4 MB/s' : '', 'wide-only num'), c(st === 'run' ? `<span data-live="dlLeft">${dlLeft()}</span>` : '', 'wide-only'), c(t, 'num r wide-only')], st === 'run' ? 'cur' : ''))));
    return app({
        side: sh('Show') + si(ico('actions/16/view-list-details'), 'All', '16', true) + si(ico('actions/16/download'), 'Running', '1') + si(ico('actions/16/dialog-ok-apply'), 'Finished', '15')
            + sh('Saved to') + si(ico('places/16/folder-download'), 'Downloads', '') + si(ico('places/16/folder-pictures'), 'Pictures', '') + sh('Limits') + si('', 'Limit speed at night', tg(false)) + si('', 'Ask where to save', tg(false)),
        top: `<span class="t">Downloads</span>` + fld('Search downloads', 'actions/16/edit-find', 'wide-only') + tb('actions/16/media-playback-pause', 'Pause all') + tb('actions/16/edit-clear-history', 'Clear finished', 'wide-only') + tb('actions/16/document-open-folder', 'Open folder'),
        body: `<div class="ap-c">${table('minmax(0, 1fr) 72px 170px 80px 90px 56px', ['<span>Name</span>', '<span class="r">Size</span>', '<span>Progress</span>', '<span class="wide-only">Speed</span>', '<span class="wide-only">Time left</span>', '<span class="r wide-only">Added</span>'], rows,
            { cn: 'minmax(0, 1fr) 64px 120px', cm: 'minmax(0, 1fr) 110px 380px 120px 140px 100px' })}</div>`,
        status: `<span>1 running</span><span class="wide-only">8.4 MB/s</span><span class="gap"></span><span class="wide-only">Downloads folder: 14.2 GB</span><span data-live="dlLeft">${dlLeft()}</span>`,
    });
}

// ---------- settings pages: each one is only about its own thing, no System Settings around it ----------
const settingsApp = (title, actions, body) => app({
    top: `<span class="t">${title}</span>${actions}`,
    body: `<div class="ap-c">${body}</div>`,
});

// a day of colour temperature: warm at night, 6500 K by day, now marked
function nightChart() {
    const x = h => 40 + h / 24 * 920, y = k => 20 + (6500 - k) / 3000 * 110;
    const pts = [[0, 3800], [7.02, 3800], [7.52, 6500], [16.7, 6500], [17.2, 3800], [24, 3800]].map(([h, k]) => `${x(h).toFixed(1)},${y(k).toFixed(1)}`).join(' ');
    const now = x(16 + 40 / 60);
    return `<svg class="chart" viewBox="0 0 1000 170" preserveAspectRatio="none" style="height: 170px;" aria-hidden="true">
<defs><linearGradient id="nlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6f7"/><stop offset="1" stop-color="#f9c98b"/></linearGradient></defs>
<polygon points="40,130 ${pts} 960,130" fill="url(#nlg)" opacity="0.8"/><polyline points="${pts}" fill="none" stroke="#f67400" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
<line x1="40" y1="130.5" x2="960" y2="130.5" stroke="#c9cbcd" vector-effect="non-scaling-stroke"/>
<line x1="${now}" y1="12" x2="${now}" y2="130" stroke="#3daee9" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
<div class="row" style="justify-content: space-between; padding: 4px 0 0 4%; padding-right: 4%; font-variant-numeric: tabular-nums;"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>`;
}

function nightPage() {
    const temp = (k, pct) => `<div class="val">${slider('k', pct)}<span class="num" style="width: 64px;">${k}</span></div>`;
    return settingsApp('Night Light', tb('actions/16/edit-undo', 'Defaults') + tb('actions/16/dialog-ok-apply', 'Apply'), `
<div class="panel pad col" style="gap: 6px;"><div class="row"><span class="semi grow">Today</span><span>Warms up from 16:42 to 17:12</span></div>${nightChart()}</div>
<div class="form">
<span class="lab">Night Light</span><div class="val">${tg(L.night)}<span>On, 6,500 K until 16:42</span></div>
<span class="lab">Switching times</span><div class="val">${cmb('Sunset and sunrise at current location')}</div>
<span class="lab">Day color temperature</span>${temp('6,500 K', 100)}
<span class="lab">Night color temperature</span>${temp('3,800 K', 34)}
<span class="lab">Transition</span><div class="val">${cmb('30 minutes')}</div>
<span class="lab">Sunset</span><div class="val">17:12</div>
<span class="lab">Sunrise</span><div class="val">07:31</div>
<span class="lab">Location</span><div class="val">Lyon, detected automatically</div>
</div>`);
}

function wifiPage() {
    const nets = [['network-wireless-connected-100', 'Willow', 'Connected'], ['network-wireless-connected-75', 'Willow-2G', 'Saved'], ['network-wireless-connected-50', 'Bakery Guest', 'Open'],
        ['network-wireless-connected-50', 'Flat 3', 'WPA2'], ['network-wireless-connected-25', 'Printer-Direct', 'WPA2'], ['network-wireless-connected-25', 'Corner Café', 'Open']];
    const rows = nets.map(([i, n, s], k) => k === 0
        ? `<div class="panel" style="margin: 6px 0; box-shadow: inset 0 0 0 1px rgba(61, 174, 233, 0.45); background: var(--hl-soft);"><div class="netrow" style="border: 0;">${ico22(`status/22/${i}`)}<span class="grow semi">${n}</span>${ico('actions/16/object-locked')}<span>${s}</span>${tb('actions/16/network-disconnect', 'Disconnect')}</div>
<div class="cols2" style="padding: 0 14px 10px 48px; gap: 0 32px;"><div>${kv('Signal', '82%')}${kv('Security', 'WPA3 Personal')}${kv('Band', '5 GHz, channel 44')}</div><div>${kv('IPv4 address', '192.168.1.24')}${kv('Speed', '866 Mbit/s')}${kv('Data this month', '41.2 GB')}</div></div></div>`
        : `<div class="netrow">${ico22(`status/22/${i}`)}<span class="grow">${n}</span>${s === 'Open' ? '' : ico('actions/16/object-locked')}<span>${s}</span></div>`).join('');
    return settingsApp('Wi-Fi & Internet', `<span class="row" style="gap: 8px; margin-right: 8px;"><span class="wide-only">Wi-Fi</span>${sw('wifi')}</span>` + tb('actions/16/list-add', 'Add network', 'wide-only') + tb('actions/16/configure', 'Configure'), `
<div class="ph">Wi-Fi networks</div><div class="col" style="flex: none;">${rows}</div>
<div class="ph" style="margin-top: 6px;">Other connections</div><div class="panel" style="padding: 0;"><div class="netrow">${ico22('devices/22/network-wired')}<span class="grow">Wired connection</span><span>Cable unplugged</span></div><div class="netrow">${ico22('devices/22/network-vpn')}<span class="grow">VPN</span><span>Off</span></div><div class="netrow">${ico22('devices/22/smartphone')}<span class="grow">Phone hotspot</span><span>Available</span></div></div>`);
}

function soundPage() {
    const row = (icon, name, key, pct, meter = 0, extra = '') => `<div class="vrow"><span class="nm">${ico22(icon)}<span>${name}</span></span><div class="grow" style="position: relative;">${slider(key, pct)}${meter ? `<i class="meter" style="width: ${meter}%;"></i>` : ''}</div><span class="num" ${key === 'vol' || key === 'mic' ? `data-live="${key}"` : ''}>${Math.round(pct)}%</span>${extra}</div>`;
    return settingsApp('Sound', tb('actions/16/media-playback-start', 'Test speakers') + tb('actions/16/configure', 'Configure'), `
<div class="cols2"><div class="col" style="gap: 8px;"><div class="ph">Playback devices</div><div class="panel" style="padding: 2px 0;">${row('devices/22/audio-card', 'Speakers', 'vol', L.vol, 46, '<span class="badge hl">Default</span>')}${row('devices/22/audio-headphones', 'Headphones', 'hp', 40)}${row('devices/22/monitor', 'Monitor (HDMI)', 'hdmi', 100)}</div>
<div class="ph" style="margin-top: 8px;">Recording devices</div><div class="panel" style="padding: 2px 0;">${row('devices/22/audio-input-microphone', 'Microphone', 'mic', L.mic, 12)}</div></div>
<div class="col" style="gap: 8px;"><div class="ph">Applications</div><div class="panel" style="padding: 2px 0;">${row('apps/48/elisa', 'Music', 'a1', 80, 38)}${row('apps/48/org.kde.falkon', 'Web browser', 'a2', 100)}${row('apps/48/kdenlive', 'Video export', 'a3', 60)}${row('preferences/22/preferences-desktop-notification-bell', 'Notifications', 'a4', 55)}</div>
<div class="ph" style="margin-top: 8px;">Options</div><div class="panel" style="padding: 2px 14px;"><div class="kv"><span>Play a sound when volume changes</span>${tg(true)}</div><div class="kv"><span>Raise volume above 100%</span>${tg(false)}</div><div class="kv"><span>Mute when headphones are unplugged</span>${tg(true)}</div></div></div></div>`);
}

function batteryChart() {
    const pts = [[0, 64], [2, 61], [6, 57], [8, 55], [9.2, 90], [10.5, 90], [12, 80], [13, 74], [14.3, 90], [15, 90], [16.66, 82]];
    const x = h => 40 + h / 24 * 920, y = p => 150 - p * 1.3;
    const line = pts.map(([h, p]) => `${x(h).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
    return `<svg class="chart" viewBox="0 0 1000 170" preserveAspectRatio="none" style="height: 170px;" aria-hidden="true">
${[0, 50, 100].map(p => `<line x1="40" x2="960" y1="${y(p)}" y2="${y(p)}" stroke="#e3e5e7" vector-effect="non-scaling-stroke"/>`).join('')}
<rect x="${x(8)}" y="15" width="${x(10.5) - x(8)}" height="135" fill="rgba(39,174,96,0.10)"/><rect x="${x(13)}" y="15" width="${x(15) - x(13)}" height="135" fill="rgba(39,174,96,0.10)"/>
<polygon points="${x(0)},150 ${line} ${x(16.66)},150" fill="rgba(61,174,233,0.16)"/><polyline points="${line}" fill="none" stroke="#3daee9" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
<line x1="${x(16.66)}" x2="${x(16.66)}" y1="15" y2="150" stroke="#3daee9" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/></svg>
<div class="row" style="justify-content: space-between; padding: 4px 4% 0; font-variant-numeric: tabular-nums;"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>`;
}

function powerPage() {
    const segs = ['Power save', 'Balanced', 'Performance'].map(p => `<span class="${L.profile === p ? 'on' : ''}">${p}</span>`).join('');
    return settingsApp('Power Management', `<div class="segctl wide-only" style="margin-right: 6px;">${segs}</div>` + tb('actions/16/configure', 'Advanced'), `
<div class="row" style="gap: 10px; flex: none;"><div class="panel stat"><span class="small">Charge</span><b>82%</b></div><div class="panel stat"><span class="small">Time left</span><b>3 h 10 min</b></div><div class="panel stat wide-only"><span class="small">Using</span><b>9.4 W</b></div><div class="panel stat wide-only"><span class="small">Health</span><b>94%</b></div></div>
<div class="panel pad col" style="gap: 6px;"><div class="row"><span class="semi grow">Last 24 hours</span><span class="legend"><span><i class="cdot" style="background: #3daee9;"></i>Charge</span><span><i class="cdot" style="background: rgba(39,174,96,0.35);"></i>Plugged in</span></span></div>${batteryChart()}</div>
<div class="cols2"><div class="col" style="gap: 8px;"><div class="ph">On battery</div><div class="panel" style="padding: 2px 14px;"><div class="kv"><span>Dim the screen</span><span>after 2 min</span></div><div class="kv"><span>Turn off the screen</span><span>after 5 min</span></div><div class="kv"><span>Sleep</span><span>after 15 min</span></div><div class="kv"><span>When the lid closes</span><span>Sleep</span></div></div></div>
<div class="col" style="gap: 8px;"><div class="ph">Battery</div><div class="panel" style="padding: 2px 14px;"><div class="kv"><span>Stop charging at 90%</span>${tg(true)}</div><div class="kv"><span>Stay awake while plugged in</span>${sw('awake')}</div><div class="kv"><span>Charge cycles</span><span>211</span></div><div class="kv"><span>Capacity</span><span>52.4 of 56 Wh</span></div></div></div></div>`);
}

// ---------- weather ----------
const WHOURS = [['Now', 'few-clouds', 14], ['17:00', 'few-clouds', 14], ['18:00', 'few-clouds-night', 12], ['19:00', 'clear-night', 11], ['20:00', 'clear-night', 11], ['21:00', 'clear-night', 10],
    ['22:00', 'few-clouds-night', 10], ['23:00', 'clouds-night', 9], ['00:00', 'clouds-night', 9], ['01:00', 'clouds-night', 8], ['02:00', 'clouds-night', 8], ['03:00', 'fog', 8], ['04:00', 'fog', 7], ['05:00', 'fog', 7], ['06:00', 'clouds-night', 7], ['07:00', 'few-clouds', 8]];
const WDAYS = [['Today', 'few-clouds', 'Partly cloudy', 8, 16], ['Sunday', 'clear', 'Sunny', 7, 17], ['Monday', 'showers', 'Rain', 9, 13], ['Tuesday', 'showers-scattered', 'Showers', 8, 12],
    ['Wednesday', 'many-clouds', 'Cloudy', 6, 13], ['Thursday', 'clear', 'Sunny', 5, 14], ['Friday', 'few-clouds', 'Partly cloudy', 7, 15]];

function weatherPage() {
    const hours = WHOURS.map(([t, i, d], k) => `<div class="hour${k === 0 ? ' now' : ''}${k >= 12 ? ' max-only' : k >= 6 ? ' wide-only' : ''}"><span class="num">${t}</span>${ico(`applets/48/weather-${i}`)}<span class="num semi">${d}°</span></div>`).join('');
    const days = WDAYS.map(([d, i, w, lo, hi]) => tr([c(d), `<span class="c">${ico(`applets/48/weather-${i}`, 'ico22')}<span class="wide-only">${w}</span></span>`, c(lo + '°', 'num r'), `<span class="trange"><i style="left: ${(lo - 4) / 15 * 100}%; right: ${(19 - hi) / 15 * 100}%;"></i></span>`, c(hi + '°', 'num semi')]));
    return app({
        side: sh('Locations') + si(ico('applets/48/weather-few-clouds'), 'Lyon', '14°', true) + si(ico('applets/48/weather-clear'), 'Lisbon', '19°') + si(ico('applets/48/weather-snow'), 'Oslo', '1°')
            + si(ico('applets/48/weather-showers'), 'Edinburgh', '9°') + sh('Units') + si('', 'Temperature', '°C') + si('', 'Wind', 'km/h'),
        top: `<span class="t">Lyon</span>` + tb('actions/16/list-add', 'Add location', 'wide-only') + tb('actions/16/view-refresh', 'Refresh') + tb('actions/16/configure', 'Settings'),
        body: `<div class="ap-c">
<div class="row" style="gap: 16px; align-items: stretch; flex: none;"><div class="sky grow">${ico('applets/48/weather-few-clouds', 'ico64')}<div class="col" style="gap: 4px;"><span class="huge">14°</span><span class="semi">Partly cloudy</span></div><div class="col wide-only" style="gap: 4px; margin-left: auto; text-align: right;"><span>High 16°, low 8°</span><span>Feels like 12°</span><span>Dry until Monday</span></div></div>
<div class="panel ap-pane wide-only" style="width: 300px;">${kv('Wind', '12 km/h, southwest')}${kv('Humidity', '71%')}${kv('Pressure', '1,018 hPa')}${kv('UV index', '1, low')}</div></div>
<div class="panel hours" style="padding: 6px;">${hours}</div>
<div class="row" style="gap: 16px; align-items: flex-start; flex: none;"><div class="col grow" style="gap: 6px; min-width: 0;"><div class="ph">Next 7 days</div>${table('110px 170px 36px minmax(60px, 1fr) 36px', null, days, { cn: '90px 30px 32px minmax(40px, 1fr) 32px', cm: '160px 220px 40px minmax(80px, 1fr) 40px' })}</div>
<div class="col max-only" style="gap: 6px; width: 340px; flex: none;"><div class="ph">Sun and air</div><div class="panel" style="padding: 2px 14px;">${kv('Sunrise', '07:31')}${kv('Sunset', '17:12')}${kv('Daylight', '9 h 41 min')}${kv('Air quality', 'Good')}${kv('Pollen', 'Low')}${kv('Visibility', '10 km')}</div></div></div></div>`,
        status: `<span>Updated 16:30</span><span class="gap"></span><span class="wide-only">Next update 17:00</span>`,
    });
}

// ---------- mail ----------
const MAILS = [
    ['M', '#9b59b6', 'Marta', 'Lunch on Sunday?', '15:48'], ['L', '#16a085', 'City library', 'Your reserved book is ready', '13:20', true],
    ['T', '#2980b9', 'Tom', 'Photos from the lake', '11:02', true, true], ['D', '#7f8c8d', 'Parcel service', 'Your parcel is out for delivery', '08:12', true],
    ['G', '#27ae60', 'Garden club', 'Bulb swap this Saturday', 'Fri'], ['A', '#e67e22', 'Anna', 'Re: Clean-up day', 'Fri'], ['B', '#c0392b', 'Bike workshop', 'Your service is booked', 'Thu'],
    ['S', '#8e44ad', 'Sara', 'Book club: next pick', 'Wed'], ['E', '#1d6f9c', 'Elm Street News', 'Notes for the November issue', 'Tue'], ['W', '#34495e', 'Water account', 'Your November statement', 'Mon'],
    ['K', '#d35400', 'Karim', 'Moving the bikes on Saturday', '1 Nov'],
];

function mailPage() {
    const rows = MAILS.map(([l, col, who, subj, t, unread, att], k) => `<div class="mrow${k === 0 ? ' cur' : ''}${unread ? ' unread' : ''}">${av(l, col)}<div class="col"><div class="row" style="gap: 8px;"><span class="who">${who}</span>${att ? ico('actions/16/mail-attachment') : ''}<span class="num">${t}</span></div><span>${subj}</span></div>${unread ? '<span class="ud"></span>' : ''}</div>`).join('');
    return app({
        side: `<div class="btn" style="margin: 0 2px 8px;">${ico('actions/16/mail-message-new')}New message</div>` + si(ico('places/16/mail-folder-inbox'), 'Inbox', '3', true) + si(ico('actions/16/document-edit'), 'Drafts', '1')
            + si(ico('places/16/mail-folder-sent'), 'Sent') + si(ico('places/16/folder-documents'), 'Archive') + si(ico('actions/16/mail-mark-junk'), 'Junk') + si(ico('places/16/user-trash'), 'Trash')
            + sh('Labels') + si('<i class="cdot" style="background: #9b59b6; margin: 0 3px;"></i>', 'Family') + si('<i class="cdot" style="background: #27ae60; margin: 0 3px;"></i>', 'Neighbourhood')
            + si('<i class="cdot" style="background: #f67400; margin: 0 3px;"></i>', 'Receipts') + si('<i class="cdot" style="background: #3daee9; margin: 0 3px;"></i>', 'Travel'),
        top: `<span class="t">Inbox</span>` + fld('Search mail', 'actions/16/edit-find', 'wide-only') + tb('actions/16/mail-reply-sender', 'Reply') + tb('actions/16/mail-forward', 'Forward', 'wide-only') + tb('actions/16/mail-mark-read', '', '') + tb('actions/16/edit-delete'),
        body: `<div class="mlist">${rows}</div><div class="mread wide-only">
<span class="big2" style="font-size: 19px;">Lunch on Sunday?</span>
<div class="panel" style="padding: 2px 0;"><div class="li" style="padding: 8px 12px;">${av('M', '#9b59b6', 'sm')}<span class="semi">Marta</span><span class="grow" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Are you around this weekend? We should catch up.</span><span class="num">Thu</span></div><div class="li" style="padding: 8px 12px;">${av('Y', '#7f8c8d', 'sm')}<span class="semi">You</span><span class="grow" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Back from the lake on Sunday morning, free after that!</span><span class="num">Thu</span></div></div>
<div class="row" style="gap: 12px;">${av('M', '#9b59b6', 'lg')}<div class="col grow" style="gap: 2px; min-width: 0;"><span><span class="semi">Marta</span> to you</span><span>Today at 15:48</span></div></div>
<p>Hi!</p><p>Are you free for lunch on Sunday? We're thinking 13:00 at ours, nothing fancy: soup and the apple cake from last time. Karim is bringing bread, and Anna might come by later with the kids.</p>
<p>Bring the photos from the lake if you can. Tom says they turned out really well, especially the ones from the jetty at sunset.</p><p>See you,<br>Marta</p>
<div class="reply-box"><div class="row" style="gap: 8px;">${ico('actions/16/mail-reply-sender')}<span>Reply to Marta</span><span class="grow"></span>${tb('actions/16/mail-attachment')}${tb('actions/16/document-send', 'Send')}</div><div class="hr"></div><span>Sunday works! I'll bring the photos and a salad.<span class="caret-i"></span></span></div></div>`,
        status: `<span>3 unread</span><span class="gap"></span><span>Checked 16:38</span>`,
    });
}

// ---------- disk usage ----------
const DIRS = [['Videos', 96, '#3daee9', 'folder-videos', '1,204'], ['Pictures', 71, '#27ae60', 'folder-pictures', '38,512'], ['Games', 58, '#9b59b6', 'folder-games', '22,190'],
    ['Documents', 24, '#f67400', 'folder-documents', '9,815'], ['Music', 21, '#e91e63', 'folder-music', '4,402'], ['Downloads', 14, '#16a085', 'folder-download', '611'],
    ['.cache', 9, '#95a5a6', 'folder', '310,402'], ['Trash', 3.2, '#7f8c8d', 'user-trash', '1,108'], ['Other', 3.8, '#bdc3c7', 'folder', '24,636']];

function ringSVG() {
    let a = -Math.PI / 2;
    const R = 90, r = 56, total = 512, arcs = DIRS.map(([n, gb, col]) => {
        const d = gb / total * Math.PI * 2, a2 = a + d, big = d > Math.PI ? 1 : 0;
        const p = (rad, t) => `${(100 + rad * Math.cos(t)).toFixed(2)} ${(100 + rad * Math.sin(t)).toFixed(2)}`;
        const s = `<path d="M${p(R, a)} A${R} ${R} 0 ${big} 1 ${p(R, a2 - 0.008)} L${p(r, a2 - 0.008)} A${r} ${r} 0 ${big} 0 ${p(r, a)}Z" fill="${col}"/>`;
        a = a2;
        return s;
    }).join('');
    return `<svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="73" fill="none" stroke="#eceef0" stroke-width="34"/>${arcs}
<text x="100" y="96" text-anchor="middle" style="font: 600 17px 'Noto Sans', sans-serif; fill: #232629;">212 GB</text><text x="100" y="116" text-anchor="middle" style="font: 12px 'Noto Sans', sans-serif; fill: #232629;">free of 512 GB</text></svg>`;
}

function diskPage() {
    const rows = DIRS.map(([n, gb, col, icon, files]) => tr([ci(ico22(`places/22/${icon}`), n), `<span class="dbar"><i style="width: ${gb / 96 * 100}%; background: ${col};"></i></span>`, c(`${gb} GB`, 'num r'), c(files + ' files', 'num r wide-only')]));
    return app({
        side: sh('Drives') + si(ico22('devices/22/drive-harddisk'), 'Laptop', '212 GB free', true) + si(ico22('devices/22/drive-removable-media-usb'), 'Backup drive', '1.1 TB free')
            + sh('Folders') + si(ico('places/16/user-home'), 'Home', '300 GB') + si(ico('places/16/folder'), 'System', '38 GB'),
        top: `<span class="t">Home folder</span>` + tb('actions/16/document-open-folder', 'Open') + tb('actions/16/view-refresh', 'Rescan') + tb('actions/16/edit-clear-history', 'Clean up', 'wide-only'),
        body: `<div class="ap-c"><div class="row" style="gap: 24px; align-items: flex-start; flex: none;"><div class="col wide-only" style="width: 300px; flex: none; gap: 16px; align-items: center; padding-top: 6px;">${ringSVG()}
<div class="legend" style="justify-content: center;">${DIRS.slice(0, 6).map(([n, , col]) => `<span><i class="cdot" style="background: ${col};"></i>${n}</span>`).join('')}</div>
<div class="panel" style="padding: 2px 14px; align-self: stretch;">${kv('Drive', 'Internal SSD')}${kv('Health', 'Good')}${kv('Temperature', '38 °C')}</div></div>
<div class="col grow" style="gap: 6px; min-width: 0;">${table('minmax(0, 160px) minmax(80px, 1fr) 80px 110px', ['<span>Folder</span>', '<span>Share</span>', '<span class="r">Size</span>', '<span class="r wide-only">Files</span>'], rows, { cn: 'minmax(0, 1fr) 90px 70px', cm: '220px minmax(80px, 1fr) 100px 140px' })}
<div class="panel pad col" style="gap: 8px; margin-top: 12px;"><div class="row"><span class="semi grow">Safe to remove</span></div><div class="kv"><span>Old thumbnails and caches</span><span class="num">8.6 GB</span>${tb('', 'Clean')}</div><div class="kv"><span>Trash</span><span class="num">3.2 GB</span>${tb('', 'Empty')}</div><div class="kv"><span>Downloads older than a year</span><span class="num">2.9 GB</span>${tb('', 'Review')}</div></div></div></div></div>`,
        status: `<span>300 GB used of 512 GB</span><span class="wide-only">412,880 files</span><span class="gap"></span><span>Scanned 16:02</span>`,
    });
}

// ---------- household budget: a spreadsheet ----------
const BUDGET = [['Rent', 950, [950, 950, 950]], ['Groceries', 380, [402.15, 365.8, 214.4]], ['Utilities', 140, [128.6, 151.2, 96]], ['Transport', 90, [64, 88.5, 41.2]],
    ['Phone & internet', 45, [45, 45, 45]], ['Eating out', 120, [146.3, 98.7, 52.9]], ['Gifts', 60, [25, 80, 0]], ['Savings', 200, [200, 200, 200]]];
const bsum = i => BUDGET.reduce((s, b) => s + (i < 0 ? b[1] : b[2][i]), 0);

function budgetPage() {
    const COLS = 25, ROWS = 34, letters = 'ABCDEFGHIJKLMNOPQRSTUVWXY';
    const money = v => v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const cells = {};    // "row,col" -> [text, classes]
    const put = (r, col, t, cls = '') => { cells[`${r},${col}`] = [t, cls]; };
    put(1, 0, 'Household budget 2026', 'h1c');
    ['Category', 'Budget', 'September', 'October', 'November', 'Average', 'Left in Nov'].forEach((h, k) => put(3, k, h, 'colh' + (k ? ' n' : '')));
    BUDGET.forEach(([n, b, m], i) => {
        put(4 + i, 0, n); put(4 + i, 1, money(b), 'n');
        m.forEach((v, k) => put(4 + i, 2 + k, money(v), 'n' + (v > b ? ' over' : '')));
        put(4 + i, 5, money((m[0] + m[1]) / 2), 'n'); put(4 + i, 6, money(b - m[2]), 'n');
    });
    put(13, 0, 'Total', 'tot'); put(13, 1, money(bsum(-1)), 'n tot');
    [0, 1, 2].forEach(k => put(13, 2 + k, money(bsum(k)), 'n tot' + (k === 2 ? ' cell' : '')));
    put(13, 5, money((bsum(0) + bsum(1)) / 2), 'n tot'); put(13, 6, money(bsum(-1) - bsum(2)), 'n tot');
    put(15, 0, 'Notes', 'b'); put(16, 0, 'Car insurance is due in January', 'ov'); put(17, 0, 'Gifts: start the December list', 'ov');
    let g = `<span class="hd"></span>` + [...letters].map((l, k) => `<span class="hd${k === 4 ? ' on' : ''}">${l}</span>`).join('');
    for (let r = 1; r <= ROWS; r++) {
        g += `<span class="hd${r === 13 ? ' on' : ''}">${r}</span>`;
        for (let k = 0; k < COLS; k++) { const [t, cls] = cells[`${r},${k}`] || ['', '']; g += `<span${cls ? ` class="${cls}"` : ''}>${t}</span>`; }
    }
    const chart = `<div class="panel pad col max-only" style="position: absolute; left: 1060px; top: 50px; width: 420px; gap: 8px; background: #fff; box-shadow: 0 0 0 1px rgba(35, 38, 41, 0.18), 0 6px 18px -6px rgba(0, 0, 0, 0.2);">
<span class="semi">Spent per month</span><svg class="chart" viewBox="0 0 400 180" aria-hidden="true" style="height: 180px;">${[0, 1, 2].map(k => {
        const h = bsum(k) / 2200 * 150; return `<rect x="${50 + k * 120}" y="${160 - h}" width="70" height="${h}" rx="3" fill="${k === 2 ? '#3daee9' : '#a6d4ef'}"/><text x="${85 + k * 120}" y="176" text-anchor="middle">${['Sep', 'Oct', 'Nov'][k]}</text>`;
    }).join('')}<line x1="30" x2="390" y1="${160 - bsum(-1) / 2200 * 150}" y2="${160 - bsum(-1) / 2200 * 150}" stroke="#f67400" stroke-dasharray="5 4"/><text x="388" y="${152 - bsum(-1) / 2200 * 150}" text-anchor="end">Budget</text></svg></div>`;
    return app({
        top: `<span class="t">Household budget</span>` + tb('actions/16/edit-undo', '', 'wide-only') + tb('actions/16/edit-redo', '', 'wide-only') + tsep('wide-only') + tb('actions/16/format-text-bold') + tb('actions/16/format-justify-left', '', 'wide-only')
            + tb('actions/16/office-chart-bar', 'Chart') + tb('actions/16/view-filter', 'Filter', 'wide-only') + tb('actions/16/document-export', 'Export'),
        body: `<div class="ap-c fixed" style="gap: 10px;"><div class="fx">${fld('E13', '', '')}<span class="semi" style="font-style: italic; padding: 0 2px;">fx</span>${fld('=SUM(E4:E11)', '', 'grow')}</div>
<div class="sheetgrid" style="position: relative;">${g}${chart}</div></div>`,
        status: `<div class="stabs"><span class="on">2026</span><span>2025</span><span class="wide-only">Savings goals</span></div><span class="gap"></span><span>Sum: ${eur(bsum(2))}</span><span class="wide-only">Count: 1</span>`,
    });
}

// ---------- scanned receipts ----------
const RECEIPT = [['Leaf rake', '14.90'], ['Garden gloves × 2', '9.80'], ['Compost bags × 10', '6.50'], ['Brass hinges', '4.20'], ['Wood glue', '5.95']];

function scanPage() {
    const lines = n => '<i></i>'.repeat(n);
    const pages = [[1, 9], [2, 12], [3, 7]].map(([p, n]) => `<div class="pg${p === 1 ? ' cur' : ''}"><div class="thumbp">${lines(n)}</div><span>Page ${p}</span></div>`).join('');
    const paper = `<div class="paper"><span class="ctr semi" style="font-size: 14px;">CORNER HARDWARE</span><span class="ctr">& GARDEN</span><span class="ctr">Mill Road 14</span><div class="dash"></div>
<div class="row"><span>02/11/2026</span><span>10:42</span></div><div class="dash"></div>${RECEIPT.map(([t, v]) => `<div class="row"><span>${t}</span><span>${v}</span></div>`).join('')}
<div class="dash"></div><div class="row semi"><span>TOTAL EUR</span><span>41.35</span></div><div class="row"><span>Card</span><span>41.35</span></div><div class="dash"></div>
<span class="ctr">Returns within 30 days</span><span class="ctr">with this receipt.</span><span class="ctr" style="margin-top: 10px;">Thank you!</span></div>`;
    return app({
        side: sh('Pages') + `<div class="pgs">${pages}</div>`,
        top: `<span class="t">Scanned receipts</span>` + tb('actions/16/document-scan', 'Scan') + tb('actions/16/object-rotate-right', '', 'wide-only') + tb('actions/16/transform-crop', '', 'wide-only')
            + tb('actions/16/document-save', 'Save PDF') + tb('actions/16/document-share', 'Share', 'wide-only'),
        body: `<div class="scanview">${paper}</div><div class="panel ap-pane wide-only"><div class="ph">Scanner</div>
<div class="kv"><span>Device</span><span>Scanner (USB)</span></div><div class="kv"><span>Source</span>${cmb('Flatbed')}</div><div class="kv"><span>Resolution</span>${cmb('300 dpi')}</div>
<div class="kv"><span>Color</span><div class="segctl"><span class="on">Color</span><span>Gray</span><span>B&amp;W</span></div></div><div class="kv"><span>Page size</span>${cmb('Receipt')}</div>
<div class="ph" style="margin-top: 14px;">Save</div><div class="kv"><span>Name</span><span>receipts-2026-11.pdf</span></div><div class="kv"><span>Folder</span><span>Documents › Receipts</span></div><div class="kv"><span>Make text searchable</span>${tg(true)}</div></div>`,
        status: `<span>3 pages</span><span>300 dpi</span><span class="gap"></span><span>Scanner ready</span>`,
    });
}

// ---------- backup ----------
const BACKUPS = [['Mon 2 Nov, 21:04', '2.1 GB', '14 min', 'done'], ['Mon 26 Oct, 21:02', '6.8 GB', '31 min', 'done'], ['Mon 19 Oct, 21:00', '1.2 GB', '9 min', 'done'],
    ['Mon 12 Oct, 21:01', '0.9 GB', '8 min', 'done'], ['Mon 5 Oct', '', '', 'todo'], ['Mon 28 Sep, 21:03', '3.4 GB', '18 min', 'done'], ['Mon 21 Sep, 21:00', '1.1 GB', '9 min', 'done'],
    ['Mon 14 Sep, 21:02', '0.7 GB', '7 min', 'done'], ['Mon 7 Sep, 21:05', '12.6 GB', '52 min', 'done'], ['Mon 31 Aug, 21:01', '0.8 GB', '8 min', 'done']];

function backupPage() {
    const rows = BACKUPS.map(([d, s, t, st], k) => tr([`<span class="c">${dot(st)}<span>${st === 'todo' ? `${d}: skipped, the drive was not connected` : d}</span></span>`, c(s, 'num'), c(t, 'num wide-only'), c(st === 'todo' ? '' : 'Browse', 'r wide-only')], k === 0 ? 'cur' : ''));
    const inc = [['folder-documents', 'Documents', '24 GB'], ['folder-pictures', 'Pictures', '71 GB'], ['folder-music', 'Music', '21 GB'], ['folder-videos', 'Videos', '96 GB'], ['user-desktop', 'Desktop', '0.4 GB']];
    return app({
        side: sh('Backups') + si(ico22('preferences/32/preferences-system-backup'), 'Home folder', 'Weekly', true) + si(ico22('places/22/folder-cloud'), 'Phone photos', 'Daily')
            + sh('Destination') + si(ico22('devices/22/drive-removable-media-usb'), 'Backup drive', '1.1 TB free'),
        top: `<span class="t">Backup: Home folder</span>` + tb('actions/16/document-save', 'Back up now') + tb('actions/16/edit-undo', 'Restore files') + tb('actions/16/configure', 'Settings', 'wide-only'),
        body: `<div class="ap-c">
<div class="panel pad row" style="gap: 14px;"><span class="dot done" style="width: 26px; height: 26px; border-radius: 13px;"></span><div class="col grow" style="gap: 2px; min-width: 0;"><span class="semi" style="font-size: 15px;">Last backup on Monday at 21:04</span><span>2.1 GB changed, took 14 minutes, all files copied</span></div><span class="wide-only">Next: Mon 9 Nov, 21:00</span></div>
<div class="cols2" style="align-items: start;"><div class="col" style="gap: 6px; min-width: 0;"><div class="ph">History</div>${table('minmax(0, 1fr) 90px 80px 70px', ['<span>Date</span>', '<span>Changed</span>', '<span class="wide-only">Took</span>', '<span class="wide-only"></span>'], rows, { cn: 'minmax(0, 1fr) 70px' })}</div>
<div class="col" style="gap: 6px;"><div class="ph">Included</div><div class="panel" style="padding: 2px 14px;">${inc.map(([i, n, s]) => `<div class="kv"><span class="row" style="gap: 10px;">${ico(`places/16/${i}`)}${n}</span><span class="num">${s}</span></div>`).join('')}</div>
<div class="ph" style="margin-top: 8px;">Left out</div><div class="panel" style="padding: 2px 14px;"><div class="kv"><span class="row" style="gap: 10px;">${ico('places/16/folder')}.cache</span><span class="num">9 GB</span></div><div class="kv"><span class="row" style="gap: 10px;">${ico('places/16/folder-download')}Downloads</span><span class="num">14 GB</span></div><div class="kv"><span class="row" style="gap: 10px;">${ico('places/16/user-trash')}Trash</span><span class="num">3.2 GB</span></div></div></div></div></div>`,
        status: `<span>Backup drive: 1.1 TB free of 2 TB</span><span class="gap"></span><span class="wide-only">Keeps 12 weekly copies</span>`,
    });
}

// ---------- calendar ----------
const EVENTS = {
    '10-31': [['Lake trip', 'c1']], '11-1': [['Lake trip', 'c1']], '11-3': [['18:30 Yoga', '']], '11-5': [['10:30 Dentist', '']], '11-7': [['09:00 Market', ''], ['17:00 Parcel', '']],
    '11-8': [["13:00 Lunch at Marta's", '']], '11-9': [['Newsletter due', 'c2']], '11-10': [['18:30 Yoga', '']], '11-14': [['10:00 Clean-up day', 'c2']], '11-17': [['18:30 Yoga', '']],
    '11-19': [['08:30 Bike service', ''], ['19:00 Book club', 'c2']], '11-21': [["Anna's birthday", 'c3']], '11-24': [['18:30 Yoga', '']], '11-27': [['20:30 Concert', '']],
    '11-30': [['Ideas for December', 'c2']], '12-6': [['11:00 Winter market', 'c2']],
};
// November 2026 starts on a Sunday; weeks start on Monday
const monthCells = () => { const out = []; for (let d = 26; d <= 31; d++) out.push([10, d]); for (let d = 1; d <= 30; d++) out.push([11, d]); for (let d = 1; d <= 6; d++) out.push([12, d]); return out; };
const miniCal = (marks = true) => {
    const cells = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span class="wd">${d}</span>`);
    monthCells().forEach(([m, d]) => cells.push(`<span class="${m !== 11 ? 'dimday' : ''}${m === 11 && d === 7 ? ' today' : ''}${marks && m === 11 && EVENTS[`11-${d}`] && d !== 7 ? ' ev' : ''}">${d}</span>`));
    return `<div class="cal">${cells.join('')}</div>`;
};

function calendarPage() {
    const cells = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => `<span class="wd"><span class="wide-only">${d}</span><span class="narrow-only">${d.slice(0, 3)}</span></span>`);
    monthCells().forEach(([m, d], k) => {
        const evs = (EVENTS[`${m}-${d}`] || []).map(([t, cl]) => `<span class="ev${cl ? ' ' + cl : ''}">${t.replace(/^(\d\d:\d\d) /, '<span class="wide-only">$1 </span>')}</span>`).join('');
        cells.push(`<div class="d${m !== 11 ? ' out' : ''}${m === 11 && d === 7 ? ' today' : ''}${k % 7 > 4 ? ' we' : ''}"><b>${d}</b>${evs}</div>`);
    });
    const cals = [['Personal', '#3daee9'], ['Family', '#9b59b6'], ['Neighbourhood', '#f67400'], ['Trips', '#27ae60'], ['Holidays', '#7f8c8d']];
    return app({
        side: miniCal(false) + sh('Calendars') + cals.map(([n, col]) => si(`<span class="cb on" style="background: ${col}; border-color: ${col};"></span>`, n)).join('')
            + sh('Today') + si('<i class="cdot" style="background: #3daee9; margin: 0 3px;"></i>', 'Market', '09:00') + si('<i class="cdot" style="background: #3daee9; margin: 0 3px;"></i>', 'Parcel arrives', '17:00'),
        top: `<span class="t">November 2026</span>` + tb('actions/16/go-previous') + tb('actions/16/go-next') + tb('actions/16/go-jump-today', 'Today')
            + `<div class="segctl wide-only" style="margin: 0 6px;"><span>Day</span><span>Week</span><span class="on">Month</span></div>` + tb('actions/16/appointment-new', 'New event'),
        body: `<div class="month">${cells.join('')}</div>`,
    });
}

// ---------- every item: title, icon, its dialog (a tray-style quick view) and its app page ----------
// chat is Claude's last turn for the footer under a window (hidden for now).
const chat = reply => ({ reply, tools: [] });
const ODT = 'mimetypes/64/application-vnd.oasis.opendocument.text';

const ITEMS = {
    doc: {
        title: 'November newsletter', pillTitle: 'Newsletter', icon: ODT, page: docPage,
        dialog: () => list([drow(ico(ODT, 'ico32'), 'Page 1 of 3', '936 words', ib('actions/16/document-export'))])
            + sec('Outline') + list(OUTLINE.slice(1).map(([t, , cur]) => `<div class="drow${cur ? ' cur' : ''}"><span class="grow">${t}</span></div>`)),
        chat: chat('Tightened the bike racks paragraph and moved the dates to page 2.'),
    },
    export: {
        title: 'Export: Lake weekend', pillTitle: 'Export', icon: 'apps/48/kdenlive', page: exportPage,
        dialog: () => list([
            barRow(pic(0, 'thumb'), 'Lake weekend', expLabel(), 'exp', L.exp, ib('actions/16/media-playback-pause')),
            drow(pic(0, 'thumb', 'filter: saturate(0.85);'), 'Vertical cut', L.exp >= 100 ? 'rendering' : 'next', ib('actions/16/list-remove')),
            drow(pic(7, 'thumb'), 'Garden timelapse', 'queued', ib('actions/16/list-remove')),
        ]),
        chat: chat('Exporting at high quality; the vertical cut goes next.'),
    },
    photos: {
        title: 'Import from Phone', pillTitle: 'Photo import', icon: 'apps/48/gwenview', page: photosPage,
        dialog: () => list([barRow(ico('devices/22/smartphone', 'ico22'), 'Importing to Pictures', impLabel(), 'imp', L.imp / IMP_N * 100, ib('actions/16/media-playback-pause'))])
            + sec('142 new', secBtn('actions/16/document-open-folder', 'Open folder'))
            + list(DAYS.map(([d, sc, n]) => drow(pic(sc[0], 'thumb'), d, n))),
        chat: chat('Importing the 128 photos you picked; duplicates are skipped.'),
    },
    tests: {
        title: 'Tests: photo-sorter', pillTitle: 'Tests', icon: 'apps/48/kdevelop', page: testsPage,
        dialog: () => list([
            barRow(L.tests >= T_N ? dot('fail') : spin(), 'pytest', testsLabel(), 'tests', L.tests / T_N * 100, ib('actions/16/process-stop')),
            drow(dot('done'), 'Passed', `<span data-live="tpass">${passed()}</span>`),
        ]) + sec('2 failed', secBtn('actions/16/view-refresh', 'Rerun'))
            + list([drow(dot('fail'), 'test_timezone_from_gps', ':88'), drow(dot('fail'), 'test_dst_boundary', ':104')]),
        chat: chat('Two date tests fail around the clock change; the rest pass so far.'),
    },
    music: {
        title: 'Music', pillTitle: () => trackNow()[0], icon: 'apps/48/elisa', page: musicPage,
        pillCtl: () => [['prev', 'actions/16/media-skip-backward', 'Previous track'],
            ['play', `actions/16/media-playback-${L.paused ? 'start' : 'pause'}`, L.paused ? 'Play' : 'Pause'], ['next', 'actions/16/media-skip-forward', 'Next track']],
        ctl: a => {
            if (a === 'play') L.paused = !L.paused;
            if (a === 'next') { L.trk = (L.trk + 1) % TRACKS.length; L.pos = 0; }
            if (a === 'prev') { if (L.pos < 3) L.trk = (L.trk + TRACKS.length - 1) % TRACKS.length; L.pos = 0; }
        },
        dialog: () => {
            const [name, len] = trackNow();
            const ctl = i => `<div class="ib">${ico(i)}</div>`;
            return `<div class="drow" style="padding: 2px 14px 6px; gap: 12px;"><div class="art a0" style="width: 52px; height: 52px;"></div><div class="col grow" style="gap: 2px; min-width: 0;"><span class="semi">${name}</span><span>Glass Harbour · Night Ferry</span></div></div>`
                + list([`<div class="drow"><span class="num" data-live="pos" style="width: 34px;">${mmss(L.pos)}</span><div class="grow">${bar('pos', L.pos / len * 100)}</div><span class="num">${mmss(len)}</span></div>`,
                    `<div class="drow" style="justify-content: center; gap: 10px;">${ctl('actions/16/media-playlist-shuffle')}${ctl('actions/16/media-skip-backward')}<span class="pl">${ico(`actions/16/media-playback-${L.paused ? 'start' : 'pause'}`)}</span>${ctl('actions/16/media-skip-forward')}${ctl('actions/16/media-playlist-repeat')}</div>`])
                + sec('Up next') + list(TRACKS.slice(L.trk + 1, L.trk + 4).map(([t, s]) => drow(ico('mimetypes/22/audio-x-generic', 'ico22'), t, mmss(s))));
        },
        chat: chat('Playing Night Ferry from the start of side B.'),
    },
    sync: {
        title: 'Family photos', icon: 'places/64/folder-cloud', page: syncPage,
        dialog: () => list([barRow(ico('places/64/folder-cloud', 'ico32'), 'Lake weekend', syncLabel(), 'sync', L.sync / SYNC_N * 100, ib('actions/16/media-playback-pause')),
            drow(ico('actions/16/document-share', 'ico22" style="padding: 3px;'), 'Shared with', 'Anna, Marco')])
            + sec('Recent changes') + list([drow(av('A', '#e67e22', 'sm'), 'Anna added 12 photos', '16:20'), drow(av('M', '#2980b9', 'sm'), 'Marco made Picnic', 'Thu'), drow(av('Y', '#7f8c8d', 'sm'), 'You renamed Garden', 'Wed')]),
        chat: chat('Uploading the lake photos; Anna and Marco see them as they land.'),
    },
    parcel: {
        title: 'Desk lamp parcel', pillTitle: 'Parcel', icon: 'mimetypes/64/package-x-generic', page: parcelPage,
        dialog: () => list([drow(ico('mimetypes/64/package-x-generic', 'ico32'), 'Desk lamp', 'Out for delivery'), drow(ico('actions/16/view-calendar', 'ico22" style="padding: 3px;'), 'Arrives today', '17:00 – 18:00', ib('actions/16/edit-copy'))])
            + sec('Tracking') + list(PEVENTS.slice(0, 3).map(([s, t, w]) => drow(dot(s === 'now' ? 'now' : 'done'), t, w.replace('Today ', '')))),
        chat: chat('The lamp is on the van; it should arrive between 17:00 and 18:00.'),
    },
    download: {
        title: 'Downloads', icon: 'places/64/folder-download', page: downloadsPage,
        dialog: () => list([
            barRow(ico('mimetypes/64/application-zip', 'ico32'), 'lake-weekend-originals.zip', dlLabel(), 'dl', L.dl, ib('actions/16/media-playback-pause')),
            drow(ico('mimetypes/64/application-pdf', 'ico32'), 'train-tickets.pdf', '182 KB', ib('actions/16/document-open-folder')),
            drow(ico('mimetypes/64/application-pdf', 'ico32'), 'bike-rack-plan.pdf', '1.1 MB', ib('actions/16/document-open-folder')),
        ]),
        chat: chat('Downloading the full-size originals from the shared album.'),
    },
    settings: {
        title: 'Night Light', icon: 'preferences/32/preferences-desktop-display-color', page: nightPage,
        dialog: () => list([drow(ico('preferences/22/preferences-desktop-display-color', 'ico22'), 'Night Light', 'On', sw('night'))])
            + sec('Color') + list([`<div class="drow"><span style="width: 44px;">Night</span><div class="grow">${slider('k', 34)}</div><span class="num" style="width: 52px; text-align: right;">3,800 K</span></div>`,
                `<div class="drow"><span style="width: 44px;">Day</span><div class="grow">${slider('k2', 100)}</div><span class="num" style="width: 52px; text-align: right;">6,500 K</span></div>`])
            + sec('Schedule') + list([drow(ico('applets/48/weather-few-clouds-night', 'ico22'), 'Warm from sunset', '17:12'), drow(ico('applets/48/weather-clear', 'ico22'), 'Back to day at sunrise', '07:31')]),
        chat: chat('Night Light follows sunset here; it warms up at 17:12.'),
    },
    weather: {
        title: 'Lyon', pillTitle: 'Lyon 14°', icon: 'applets/48/weather-few-clouds', page: weatherPage,
        dialog: () => list([
            drow(ico('applets/48/weather-few-clouds', 'ico32'), 'Now · partly cloudy', '14°'),
            drow(ico('applets/48/weather-clear-night', 'ico22'), 'Tonight', '8°'),
            drow(ico('applets/48/weather-clear', 'ico22'), 'Sunday', '17°'),
            drow(ico('applets/48/weather-showers', 'ico22'), 'Monday', '13°'),
        ]),
        chat: chat('Dry until Monday; Sunday is the sunniest day.'),
    },
    mail: {
        title: 'Inbox', pillTitle: 'Inbox 3', icon: 'apps/48/kmail', page: mailPage,
        dialog: () => sec('Unread', secBtn('actions/16/mail-message-new', 'New message')) + list(MAILS.filter(m => m[5]).map(([l, col, who, subj, t]) => drow(av(l, col, 'sm'), subj, t)))
            + sec('Read') + list([MAILS[0], MAILS[4]].map(([l, col, who, subj, t]) => drow(av(l, col, 'sm'), subj, t))),
        chat: chat('Three unread; Marta asked about Sunday lunch.'),
    },
    disk: {
        title: 'Disk usage', pillTitle: '212 GB free', icon: 'devices/64/drive-harddisk', page: diskPage,
        dialog: () => list([`<div class="drow">${ico('devices/64/drive-harddisk', 'ico32')}<div class="col grow" style="gap: 6px;"><div class="row"><span class="grow">212 GB free of 512 GB</span></div>${bar('disk', 59)}</div></div>`])
            + sec('Largest') + list(DIRS.slice(0, 3).map(([n, gb, , icon]) => drow(ico(`places/64/${icon}`, 'ico22'), n, `${gb} GB`, ib('actions/16/document-open-folder'))))
            + list([drow(ico('places/64/user-trash-full', 'ico22'), 'Trash', '3.2 GB', `<div class="btn" style="height: 28px; padding: 0 8px; margin-right: -4px;">Empty</div>`)]),
        chat: chat('Videos take the most space; the caches can go.'),
    },
    budget: {
        title: 'Household budget', pillTitle: 'Budget', icon: 'mimetypes/64/application-vnd.oasis.opendocument.spreadsheet', page: budgetPage,
        dialog: () => list([barRow(ico('mimetypes/64/application-vnd.oasis.opendocument.spreadsheet', 'ico32'), 'November spent', `${eur(bsum(2))} of ${eur(bsum(-1))}`, 'bud', bsum(2) / bsum(-1) * 100)])
            + sec('This month') + list([[1, '#3daee9'], [5, '#f67400'], [2, '#27ae60']].map(([i, col]) => drow(`<span class="cdot" style="background: ${col}; margin: 0 4px;"></span>`, BUDGET[i][0], eur(BUDGET[i][2][2]))))
            + list([drow(dot('done'), 'Left to spend', eur(bsum(-1) - bsum(2)))]),
        chat: chat('November is under budget so far.'),
    },
    scan: {
        title: 'Scanned receipts', pillTitle: 'Scan', icon: 'apps/48/skanpage', page: scanPage,
        dialog: () => list([drow(ico('devices/64/scanner', 'ico32'), 'Scanner', 'Ready', ib('actions/16/document-scan'))])
            + sec('3 pages', secBtn('actions/16/document-save', 'Save PDF'))
            + list([[1, 9], [2, 12], [3, 7]].map(([p, n]) => drow(`<div class="thumbp" style="width: 26px; padding: 4px; gap: 2px;">${'<i style="height: 2px;"></i>'.repeat(5)}</div>`, `Page ${p}`, 'Receipt'))),
        chat: chat('Three receipts scanned; saving them as one searchable PDF.'),
    },
    backup: {
        title: 'Backup', icon: 'preferences/32/preferences-system-backup', page: backupPage,
        dialog: () => list([drow(dot('done'), 'Last backup', 'Mon 21:04'), drow(ico('actions/16/view-calendar', 'ico22" style="padding: 3px;'), 'Next', 'Mon 9 Nov'),
            drow(ico('devices/22/drive-removable-media-usb', 'ico22'), 'Backup drive', '1.1 TB free', ib('actions/16/document-save'))])
            + sec('Included') + list([['folder-documents', 'Documents', '24 GB'], ['folder-pictures', 'Pictures', '71 GB'], ['folder-music', 'Music', '21 GB']].map(([i, n, s]) => drow(ico(`places/64/${i}`, 'ico22'), n, s))),
        chat: chat('Monday\'s backup copied 2.1 GB in 14 minutes.'),
    },

    // system pills: always in the right row, their dialogs open like tray popups
    wifi: {
        title: 'Wi-Fi', pillTitle: 'Willow', icon: 'devices/16/network-wireless-connected-75', system: true, page: wifiPage,
        dialog: () => list([drow(ico('devices/16/network-wireless-connected-75', 'ico22" style="padding: 3px;'), 'Wi-Fi', '', sw('wifi'))])
            + (L.wifi ? sec('Networks') + list([
                drow(ico('status/22/network-wireless-connected-100', 'ico22'), '<span class="semi">Willow</span>', 'connected', `<div class="btn" style="height: 28px; padding: 0 8px; margin-right: -4px;">Disconnect</div>`, ' style="background: var(--hl-soft);"'),
                drow(ico('status/22/network-wireless-connected-50', 'ico22'), 'Bakery Guest'),
                drow(ico('status/22/network-wireless-connected-25', 'ico22'), 'Flat 3'),
            ]) : ''),
        chat: chat('Connected to Willow at 866 Mbit/s.'),
    },
    volume: {
        title: 'Volume', pillTitle: () => `${Math.round(L.vol)}%`, icon: 'status/16/audio-volume-high', system: true, page: soundPage,
        dialog: () => list([
            `<div class="drow">${ico('status/16/audio-volume-high', 'ico22" style="padding: 3px;')}<div class="col grow" style="gap: 8px; padding: 4px 0;"><div class="row"><span class="grow">Speakers</span><span class="num" data-live="vol">${Math.round(L.vol)}%</span></div>${slider('vol', L.vol)}</div></div>`,
            `<div class="drow">${ico('devices/16/audio-input-microphone', 'ico22" style="padding: 3px;')}<div class="col grow" style="gap: 8px; padding: 4px 0;"><div class="row"><span class="grow">Microphone</span><span class="num" data-live="mic">${Math.round(L.mic)}%</span></div>${slider('mic', L.mic)}</div></div>`,
        ]) + sec('Applications') + list([
            `<div class="drow">${ico('apps/48/elisa', 'ico22')}<div class="col grow" style="gap: 8px; padding: 4px 0;"><div class="row"><span class="grow">Music</span><span class="num">80%</span></div>${slider('a1', 80)}</div></div>`,
        ]),
        chat: chat('Speakers at 70%.'),
    },
    battery: {
        title: 'Battery', pillTitle: '82%', icon: 'status/16/battery-080', system: true, page: powerPage,
        dialog: () => list([drow(ico('status/16/battery-080', 'ico22" style="padding: 3px;'), 'Battery', '82% · 3 h 10 min')])
            + sec('Power profile')
            + `<div style="padding: 4px 14px 8px;"><div class="segctl" style="display: flex;">${['Power save', 'Balanced', 'Performance'].map(p => `<span class="${L.profile === p ? 'on' : ''}" style="flex: 1; justify-content: center;">${p}</span>`).join('')}</div></div>`
            + list([drow(ico('actions/16/view-refresh', 'ico22" style="padding: 3px;'), 'Stay awake', '', sw('awake'))]),
        chat: chat('About 3 hours left at this load.'),
    },
    clock: {
        title: 'Saturday 7 November', pillTitle: clock, icon: '', system: true, page: calendarPage,
        dialog: () => `<div class="row" style="padding: 0 14px 8px; gap: 10px;"><span class="big" data-live="clock">${clock()}</span><span class="grow"></span><span class="semi">November 2026</span></div>`
            + miniCal()
            + sec('Coming up') + list([
                drow('<span class="cdot" style="background: #3daee9; margin: 0 4px;"></span>', "Lunch at Marta's", 'Sun 13:00'),
                drow('<span class="cdot" style="background: #f67400; margin: 0 4px;"></span>', 'Newsletter due', 'Mon'),
                drow('<span class="cdot" style="background: #3daee9; margin: 0 4px;"></span>', 'Yoga', 'Tue 18:30'),
            ]),
        chat: chat('Lunch at Marta\'s tomorrow at 13:00.'),
    },
};

// a new chat starts as an empty window; Claude builds whatever you ask for into it
let chatCount = 0;
// what a new chat window offers: the items that are not on the desktop at the start, each as a request that would make it
const SUGGEST = [
    ['sync', 'Sync the family photos folder'],
    ['download', 'Show what I downloaded today'],
    ['tests', 'Run the photo-sorter tests'],
    ['parcel', 'Where is my desk lamp parcel?'],
    ['settings', 'Make the screen warmer in the evening'],
    ['weather', 'What is the weather in Lyon this week?'],
    ['disk', 'What is filling up my disk?'],
];
const chatSide = () => si('actions/16/list-add', 'New chat', '', true)
    + sh('Today') + ['doc', 'export', 'photos', 'music', 'mail'].map(k => si(ITEMS[k].icon, ITEMS[k].title)).join('')
    + sh('Yesterday') + ['budget', 'scan'].map(k => si(ITEMS[k].icon, ITEMS[k].title)).join('')
    + sh('Monday') + si(ITEMS.backup.icon, ITEMS.backup.title);
function newChatItem() {
    const id = `chat${++chatCount}`;
    ITEMS[id] = {
        title: 'New chat', icon: 'actions/16/list-add', fresh: true,
        page: () => app({
            side: chatSide(),
            top: `<span class="t">New chat</span>` + tb('actions/16/mail-attachment', 'Attach') + tb('actions/16/configure', 'Settings'),
            // the suggestions scroll; the ask field stays at the bottom, as in any chat
            body: `<div class="nc-wrap"><div class="ap-c nc"><span class="big2">What should this window be?</span>
<div class="nc-grid">${SUGGEST.map(([k, q]) => `<div class="panel nc-tile">${ico(ITEMS[k].icon, 'ico32')}<span>${q}</span></div>`).join('')}</div></div>
<div class="field nc-ask"><span class="grow">Describe a window, or pick one above</span>${ico('actions/16/document-send')}</div></div>`,
            status: `<span>${SUGGEST.length} suggestions</span><span class="grow"></span><span>Claude</span>`,
        }),
        dialog: () => sec('Suggestions') + list(SUGGEST.slice(0, 4).map(([k, q]) => drow(ico22(ITEMS[k].icon), q))),
        chat: { reply: '', tools: [], run: null },
    };
    return id;
}

// ---------- the desktop the mockup starts from, and what moves while you watch ----------
// app.js reads these: LAYOUT, SYSTEM, tick(), live(), clock(), and each item's busy / pillLive / pillSemi.
ITEMS.export.busy = () => L.exp < 100;
ITEMS.photos.busy = () => L.imp < IMP_N;
ITEMS.tests.busy = () => L.tests < T_N;
ITEMS.download.busy = () => L.dl < 100;
ITEMS.sync.busy = () => L.sync < SYNC_N;
ITEMS.volume.pillLive = 'vol';
ITEMS.clock.pillLive = 'clock'; ITEMS.clock.pillSemi = true;

// system pills never go to History
const SYSTEM = ['wifi', 'volume', 'battery', 'clock'];

// each entry is a slot: one item, or several grouped as tabs. 'history' is the shell's own pill.
const LAYOUT = {
    wins: [['doc']],
    left: [],
    right: [],
    pillsL: [['history'], ['export'], ['photos']],
    pillsR: [['music'], ['mail'], ['wifi', 'volume', 'battery'], ['clock']],
    history: [{ tabs: ['budget', 'scan'], when: '09:12' }, { tabs: ['backup'], when: 'Mon' }],
};

// called every second; true when a job finished (or the song changed) and the desktop should be redrawn
const T0 = Date.now();
function tick() {
    let changed = false;
    const step = (key, by, max) => { if (L[key] >= max) return; L[key] = Math.min(max, L[key] + by); if (L[key] >= max) changed = true; };
    step('exp', 0.5, 100);
    step('imp', 1, IMP_N);
    step('tests', 0.5, T_N);
    step('dl', 0.6, 100);
    step('sync', 0.1, SYNC_N);
    if (!L.paused) L.pos += 1;
    if (L.pos >= trackNow()[1]) { L.pos = 0; L.trk = (L.trk + 1) % TRACKS.length; changed = true; }
    L.clockMin = 16 * 60 + 40 + Math.floor((Date.now() - T0) / 60000);
    return changed;
}

// the moving numbers: text for [data-live] elements, widths in % for [data-bar] elements
function live() {
    return {
        text: {
            exp: expLabel(), expFrames: expFrames(), imp: impLabel(), tests: testsLabel(), tpass: String(passed()), tleft: String(T_N - Math.floor(L.tests)),
            dl: dlLabel(), dlLeft: dlLeft(), sync: syncLabel(), pos: mmss(L.pos), vol: `${Math.round(L.vol)}%`, mic: `${Math.round(L.mic)}%`, clock: clock(),
        },
        bars: { exp: L.exp, imp: L.imp / IMP_N * 100, tests: L.tests / T_N * 100, dl: L.dl, sync: L.sync / SYNC_N * 100, pos: L.pos / trackNow()[1] * 100 },
    };
}
