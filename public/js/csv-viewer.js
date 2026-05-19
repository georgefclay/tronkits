/* global Papa, XLSX */

(() => {
  const el = (id) => document.getElementById(id);

  const csvFile = el('csvFile');
  const delimiter = el('delimiter');
  const newline = el('newline');
  const hasHeader = el('hasHeader');

  const trimCells = el('trimCells');
  const removeEmptyRows = el('removeEmptyRows');
  const removeEmptyCols = el('removeEmptyCols');
  const normalizeHeader = el('normalizeHeader');

  const columnFilter = el('columnFilter');

  const applyBtn = el('applyBtn');               // Reset
  const downloadBtn = el('downloadBtn');         // Download Filtered CSV
  const downloadXlsxBtn = el('downloadXlsxBtn'); // Download Filtered Excel

  const searchColumn = el('searchColumn');
  const searchBox = el('searchBox');
  const stats = el('stats');

  const previewTable = el('previewTable');
  const thead = previewTable.querySelector('thead');
  const tbody = previewTable.querySelector('tbody');
  const previewNote = el('previewNote');

  let rawRows = null;                 // array of arrays (from PapaParse)
  let baseCleaned = null;             // cleaned WITHOUT keep-only-columns + remove-empty-cols
  let cleaned = null;                 // cleaned AFTER keep-only-columns + remove-empty-cols
  let viewRows = [];                  // rows displayed (cleaned + search + sort)
  let sortState = { colIndex: null, dir: 1 }; // 1=asc, -1=desc

  const PREVIEW_LIMIT = 200;

  // ---------- Helpers ----------

  function safeStr(v) {
    if (v === null || v === undefined) return '';
    return String(v);
  }

  function isRowEmpty(row) {
    return row.every((c) => safeStr(c).trim() === '');
  }

  function collapseSpaces(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  function detectMaxCols(rows) {
    let max = 0;
    for (const r of rows) max = Math.max(max, r.length);
    return max;
  }

  function padRowsToMax(rows, maxCols) {
    return rows.map((r) => {
      if (r.length === maxCols) return r.slice();
      const out = r.slice();
      while (out.length < maxCols) out.push('');
      return out;
    });
  }

  function parseNumberLoose(s) {
    const x = String(s).trim().replace(/,/g, '');
    if (x === '') return null;
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }

  function smartCompare(a, b) {
    const sa = safeStr(a).trim();
    const sb = safeStr(b).trim();

    // empty last (ascending)
    const aEmpty = sa === '';
    const bEmpty = sb === '';
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    const na = parseNumberLoose(sa);
    const nb = parseNumberLoose(sb);
    if (na !== null && nb !== null) return na - nb;

    return sa.localeCompare(sb, undefined, { sensitivity: 'base' });
  }

  // ---------- Column operations ----------

  function removeEmptyColumns(headers, rows) {
    const colCount = headers.length;
    const keep = new Array(colCount).fill(false);

    for (let c = 0; c < colCount; c++) {
      for (let r = 0; r < rows.length; r++) {
        if (safeStr(rows[r][c]).trim() !== '') {
          keep[c] = true;
          break;
        }
      }
    }

    const newHeaders = [];
    const mapIdx = [];
    for (let c = 0; c < colCount; c++) {
      if (keep[c]) {
        mapIdx.push(c);
        newHeaders.push(headers[c]);
      }
    }

    const newRows = rows.map((r) => mapIdx.map((c) => r[c]));
    return { headers: newHeaders, rows: newRows };
  }

  function keepOnlySelectedColumns(headers, rows, selectedNames) {
    if (!selectedNames || selectedNames.length === 0) return { headers, rows };

    const nameToIdx = new Map(headers.map((h, i) => [h, i]));
    const indices = selectedNames
      .map((name) => nameToIdx.get(name))
      .filter((i) => Number.isInteger(i));

    const newHeaders = indices.map((i) => headers[i]);
    const newRows = rows.map((r) => indices.map((i) => r[i]));
    return { headers: newHeaders, rows: newRows };
  }

  function renderColumnPicker(headers) {
    // Preserve selection so multi-select isn’t wiped
    const selected = new Set(
      Array.from(columnFilter.selectedOptions || []).map((o) => o.value)
    );

    columnFilter.innerHTML = '';
    for (const h of headers) {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      if (selected.has(h)) opt.selected = true;
      columnFilter.appendChild(opt);
    }

    columnFilter.disabled = headers.length === 0;
  }

  function renderSearchColumnPicker(headers) {
    const current = searchColumn.value || '__all__';

    searchColumn.innerHTML = '';

    const allOpt = document.createElement('option');
    allOpt.value = '__all__';
    allOpt.textContent = 'All columns';
    searchColumn.appendChild(allOpt);

    headers.forEach((h, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = h;
      searchColumn.appendChild(opt);
    });

    const stillExists = Array.from(searchColumn.options).some((o) => o.value === current);
    searchColumn.value = stillExists ? current : '__all__';

    searchColumn.disabled = headers.length === 0;
  }

  // ---------- Cleaning pipeline (staged) ----------

  function buildHeadersAndRows(rows) {
    const maxCols = detectMaxCols(rows);
    const padded = padRowsToMax(rows, maxCols);

    if (!padded.length) return { headers: [], rows: [] };

    if (hasHeader.checked) {
      const rawHeaders = padded[0].map((h, i) => {
        const base = safeStr(h);
        const name = normalizeHeader.checked ? collapseSpaces(base) : base;
        return name || `Column${i + 1}`;
      });
      return { headers: rawHeaders, rows: padded.slice(1) };
    }

    const headers = Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`);
    return { headers, rows: padded };
  }

  function cleanBaseData() {
    if (!rawRows) return null;

    let { headers, rows } = buildHeadersAndRows(rawRows);

    if (trimCells.checked) {
      headers = headers.map((h) => safeStr(h).trim());
      rows = rows.map((r) => r.map((c) => safeStr(c).trim()));
    } else {
      headers = headers.map((h) => safeStr(h));
      rows = rows.map((r) => r.map((c) => safeStr(c)));
    }

    if (removeEmptyRows.checked) {
      rows = rows.filter((r) => !isRowEmpty(r));
    }

    return { headers, rows };
  }

  function applyColumnSelectionAndEmptyCols(base) {
    if (!base) return { headers: [], rows: [] };

    let { headers, rows } = base;

    const selected = Array.from(columnFilter.selectedOptions || []).map((o) => o.value);
    ({ headers, rows } = keepOnlySelectedColumns(headers, rows, selected));

    if (removeEmptyCols.checked) {
      ({ headers, rows } = removeEmptyColumns(headers, rows));
    }

    return { headers, rows };
  }

  // ---------- View model (search + sort) ----------

  function rebuildViewRows() {
    if (!cleaned) {
      viewRows = [];
      return;
    }

    const q = safeStr(searchBox.value).toLowerCase().trim();
    const colSel = searchColumn.value;

    if (!q) {
      viewRows = cleaned.rows.slice();
      return;
    }

    if (colSel !== '__all__') {
      const idx = Number(colSel);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cleaned.headers.length) {
        viewRows = cleaned.rows.filter((r) =>
          r.some((c) => safeStr(c).toLowerCase().includes(q))
        );
        return;
      }

      viewRows = cleaned.rows.filter((r) =>
        safeStr(r[idx]).toLowerCase().includes(q)
      );
      return;
    }

    viewRows = cleaned.rows.filter((r) =>
      r.some((c) => safeStr(c).toLowerCase().includes(q))
    );
  }

  function sortViewRows() {
    if (!cleaned) return;
    if (sortState.colIndex === null) return;

    const c = sortState.colIndex;
    const dir = sortState.dir;

    // Stable by CURRENT view order
    viewRows = viewRows
      .map((row, i) => ({ row, i }))
      .sort((a, b) => {
        const cmp = smartCompare(a.row[c], b.row[c]);
        if (cmp !== 0) return cmp * dir;
        return a.i - b.i;
      })
      .map((x) => x.row);
  }

  function updateStats() {
    if (!cleaned) {
      stats.textContent = '';
      return;
    }
    stats.textContent =
      `Showing ${viewRows.length} / ${cleaned.rows.length} rows | ${cleaned.headers.length} columns`;
  }

  function applySearchSortAndRender() {
    if (!cleaned) return;
    rebuildViewRows();
    sortViewRows();
    renderPreview(cleaned.headers, viewRows);
    updateStats();
  }

  // ---------- Preview rendering ----------

  function renderPreview(headers, rows) {
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const trh = document.createElement('tr');
    headers.forEach((h, idx) => {
      const th = document.createElement('th');
      th.dataset.colIndex = String(idx);
      th.classList.add('csv-sortable');

      let label = h;
      if (sortState.colIndex === idx) {
        label += sortState.dir === 1 ? ' ▲' : ' ▼';
      } else {
        label += ' ↕';
      }
      th.textContent = label;

      trh.appendChild(th);
    });
    thead.appendChild(trh);

    const shown = rows.slice(0, PREVIEW_LIMIT);

    for (const r of shown) {
      const tr = document.createElement('tr');
      for (const cell of r) {
        const td = document.createElement('td');
        td.textContent = safeStr(cell);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    previewNote.textContent =
      rows.length > PREVIEW_LIMIT
        ? `Preview limited to ${PREVIEW_LIMIT} rows (download includes all filtered rows).`
        : '';
  }

  // ---------- CSV + Excel downloads ----------

  function getOutputNewline() {
    const v = newline.value;
    if (v === 'CRLF') return '\r\n';
    if (v === 'LF') return '\n';
    if (v === '\\r\\n') return '\r\n';
    if (v === '\\n') return '\n';
    if (v === '\r\n' || v === '\n') return v;
    return '\r\n';
  }

  function toCsv(headers, rows, outDelimiter, outNewline) {
    const esc = (value) => {
      const s = safeStr(value);
      const mustQuote =
        s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(outDelimiter);
      if (!mustQuote) return s;
      return `"${s.replace(/"/g, '""')}"`;
    };

    const lines = [];
    lines.push(headers.map(esc).join(outDelimiter));
    for (const r of rows) {
      lines.push(r.map(esc).join(outDelimiter));
    }
    return lines.join(outNewline) + outNewline;
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadXlsx(filename, headers, rows) {
    const aoa = [
      headers,
      ...rows.map((r) => r.map((v) => (v === null || v === undefined) ? '' : v))
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    XLSX.writeFile(wb, filename);
  }

  // ---------- Enable/disable ----------

  function setEnabled(enabled) {
    applyBtn.disabled = !enabled;
    downloadBtn.disabled = !enabled;
    downloadXlsxBtn.disabled = !enabled;
    searchBox.disabled = !enabled;
    searchColumn.disabled = !enabled;
    columnFilter.disabled = !enabled || columnFilter.options.length === 0;
  }

  // ---------- Refresh ----------

  function refreshUI() {
    if (!rawRows) return;

    baseCleaned = cleanBaseData();
    renderColumnPicker(baseCleaned.headers);

    cleaned = applyColumnSelectionAndEmptyCols(baseCleaned);
    renderSearchColumnPicker(cleaned.headers);

    if (sortState.colIndex === null && cleaned.headers.length > 0) {
      sortState.colIndex = 0;
      sortState.dir = 1;
    }
    if (sortState.colIndex !== null && sortState.colIndex >= cleaned.headers.length) {
      sortState.colIndex = cleaned.headers.length ? 0 : null;
      sortState.dir = 1;
    }

    applySearchSortAndRender();
  }

  function refreshStage2Only() {
    if (!rawRows || !baseCleaned) return;

    cleaned = applyColumnSelectionAndEmptyCols(baseCleaned);
    renderSearchColumnPicker(cleaned.headers);

    if (sortState.colIndex !== null && sortState.colIndex >= cleaned.headers.length) {
      sortState.colIndex = cleaned.headers.length ? 0 : null;
      sortState.dir = 1;
    }

    applySearchSortAndRender();
  }

  // ---------- Parsing ----------

  function parseFile(file) {
    const chosenDelimiter = delimiter.value === 'auto' ? '' : delimiter.value;

    Papa.parse(file, {
      skipEmptyLines: false,
      delimiter: chosenDelimiter, // '' => auto
      encoding: 'UTF-8',
      complete: (results) => {
        if (results.errors && results.errors.length) {
          console.warn('PapaParse errors:', results.errors);
        }

        rawRows = Array.isArray(results.data) ? results.data : [];

        // Strip UTF-8 BOM if it exists in first cell
        if (rawRows.length && rawRows[0].length && typeof rawRows[0][0] === 'string') {
          rawRows[0][0] = rawRows[0][0].replace(/^\uFEFF/, '');
        }

        setEnabled(true);
        refreshUI();
      },
      error: (err) => {
        console.error(err);
        rawRows = null;
        baseCleaned = null;
        cleaned = null;
        viewRows = [];
        sortState = { colIndex: null, dir: 1 };
        setEnabled(false);
        stats.textContent = 'Error parsing CSV.';
      }
    });
  }

  // ---------- Events ----------

  csvFile.addEventListener('change', () => {
    const file = csvFile.files && csvFile.files[0];

    if (!file) {
      rawRows = null;
      baseCleaned = null;
      cleaned = null;
      viewRows = [];
      sortState = { colIndex: null, dir: 1 };

      setEnabled(false);
      thead.innerHTML = '';
      tbody.innerHTML = '';
      previewNote.textContent = '';
      stats.textContent = '';
      searchBox.value = '';
      searchColumn.value = '__all__';
      columnFilter.innerHTML = '';
      searchColumn.innerHTML = '<option value="__all__" selected>All columns</option>';
      return;
    }

    parseFile(file);
  });

  // Reset: clears search + selected columns, then rebuilds
  applyBtn.addEventListener('click', () => {
    if (!rawRows) return;

    searchBox.value = '';
    searchColumn.value = '__all__';

    Array.from(columnFilter.options).forEach((opt) => {
      opt.selected = false;
    });

    refreshUI();
  });

  // Download filtered CSV (viewRows)
  downloadBtn.addEventListener('click', () => {
    if (!cleaned) return;

    const outDelimiter = delimiter.value === 'auto' ? ',' : delimiter.value;
    const outNewline = getOutputNewline();

    const csvText = toCsv(cleaned.headers, viewRows, outDelimiter, outNewline);

    const original = (csvFile.files && csvFile.files[0] && csvFile.files[0].name) || 'data.csv';
    const base = original.replace(/\.csv$/i, '');
    downloadText(`${base}-filtered.csv`, csvText);
  });

  // Download filtered Excel (viewRows)
  downloadXlsxBtn.addEventListener('click', () => {
    if (!cleaned) return;

    const original = (csvFile.files && csvFile.files[0] && csvFile.files[0].name) || 'data.csv';
    const base = original.replace(/\.csv$/i, '');
    downloadXlsx(`${base}-filtered.xlsx`, cleaned.headers, viewRows);
  });

  searchBox.addEventListener('input', () => {
    if (!cleaned) return;
    applySearchSortAndRender();
  });

  searchColumn.addEventListener('change', () => {
    if (!cleaned) return;
    applySearchSortAndRender();
  });

  // Click-to-sort headers
  thead.addEventListener('click', (e) => {
    if (!cleaned) return;

    const th = e.target.closest('th');
    if (!th || !th.dataset.colIndex) return;

    const idx = Number(th.dataset.colIndex);
    if (!Number.isInteger(idx)) return;

    if (sortState.colIndex === idx) {
      sortState.dir *= -1;
    } else {
      sortState.colIndex = idx;
      sortState.dir = 1;
    }

    sortViewRows();
    renderPreview(cleaned.headers, viewRows);
    updateStats();
  });

  // Option changes => full rebuild
  [
    delimiter,
    newline,
    hasHeader,
    trimCells,
    removeEmptyRows,
    removeEmptyCols,
    normalizeHeader
  ].forEach((control) => {
    control.addEventListener('change', () => {
      if (!rawRows) return;
      refreshUI();
    });
  });

  // Column selection => stage 2 only (prevents wiping multi-select)
  columnFilter.addEventListener('change', () => {
    refreshStage2Only();
  });

  setEnabled(false);
})();
