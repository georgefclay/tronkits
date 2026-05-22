(function () {
  'use strict';

  var state = {
    rawText: '',
    fileName: '',
    headers: [],
    rows: [],
    profile: {},
    filtered: [],
    filters: {},
    sort: { col: null, dir: 1 },
    selectedRow: null,
    built: false
  };

  var el = {};

  document.addEventListener('DOMContentLoaded', function () {
    cacheEls();
    wireUI();
  });

  function cacheEls() {
    [
      'csv2appDropzone', 'csvFile', 'delimiter', 'hasHeader', 'trimCells',
      'removeEmptyRows', 'appTitle', 'primaryColumn', 'filterColumns',
      'enableRecordView', 'enableSummaries', 'buildAppBtn', 'resetAppBtn',
      'downloadFilteredBtn', 'csv2appStatus', 'emptyState', 'generatedApp',
      'generatedAppTitle', 'generatedAppMeta', 'searchColumn', 'searchBox',
      'summaryRows', 'summaryColumns', 'summaryFilteredRows', 'summaryTypes',
      'clearFiltersBtn', 'activeFilters', 'appTable', 'appNote', 'recordView',
      'columnProfileTable'
    ].forEach(function (id) { el[id] = document.getElementById(id); });
  }

  function wireUI() {
    el.csvFile.addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) readFile(f);
    });

    ['dragenter', 'dragover'].forEach(function (evt) {
      el.csv2appDropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        el.csv2appDropzone.classList.add('csv2app-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      el.csv2appDropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        el.csv2appDropzone.classList.remove('csv2app-dragover');
      });
    });
    el.csv2appDropzone.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) {
        el.csvFile.value = '';
        readFile(f);
      }
    });

    ['delimiter', 'hasHeader', 'trimCells', 'removeEmptyRows'].forEach(function (id) {
      el[id].addEventListener('change', function () {
        if (state.rawText) parseAndPrepare();
      });
    });

    el.buildAppBtn.addEventListener('click', buildApp);
    el.resetAppBtn.addEventListener('click', resetAll);
    el.downloadFilteredBtn.addEventListener('click', downloadFiltered);
    el.clearFiltersBtn.addEventListener('click', clearFilters);
    el.searchBox.addEventListener('input', function () { applyFilters(); });
    el.searchColumn.addEventListener('change', function () { applyFilters(); });
  }

  function readFile(file) {
    state.fileName = file.name;
    setStatus('Reading "' + file.name + '"...');
    var reader = new FileReader();
    reader.onload = function () {
      state.rawText = String(reader.result || '');
      parseAndPrepare();
    };
    reader.onerror = function () { setStatus('Failed to read file.'); };
    reader.readAsText(file);
  }

  function parseAndPrepare() {
    var delim = el.delimiter.value;
    var config = {
      header: el.hasHeader.checked,
      skipEmptyLines: el.removeEmptyRows.checked ? 'greedy' : false,
      dynamicTyping: false,
      transform: function (v) { return el.trimCells.checked ? String(v).trim() : v; }
    };
    if (delim !== 'auto') {
      config.delimiter = delim === '\\t' ? '\t' : delim;
    }

    var result = window.Papa.parse(state.rawText, config);
    var data = result.data || [];

    if (el.hasHeader.checked) {
      state.headers = result.meta && result.meta.fields ? result.meta.fields.slice() : [];
      state.rows = data;
    } else {
      var width = 0;
      data.forEach(function (r) { if (r.length > width) width = r.length; });
      state.headers = [];
      for (var i = 0; i < width; i++) state.headers.push('col_' + (i + 1));
      state.rows = data.map(function (r) {
        var obj = {};
        state.headers.forEach(function (h, idx) { obj[h] = idx < r.length ? r[idx] : ''; });
        return obj;
      });
    }

    state.profile = profileColumns(state.headers, state.rows);
    populateColumnPickers();
    enablePostLoadUI();
    setStatus('Loaded ' + state.rows.length + ' rows, ' + state.headers.length + ' columns. Configure and click "Build App".');
  }

  function profileColumns(headers, rows) {
    var profile = {};
    headers.forEach(function (h) {
      var filled = 0, blank = 0;
      var uniqueSet = Object.create(null);
      var numericCount = 0, dateCount = 0, boolCount = 0, nonBlank = 0;
      rows.forEach(function (r) {
        var v = r[h];
        if (v === undefined || v === null || String(v).trim() === '') {
          blank++;
        } else {
          filled++;
          var s = String(v).trim();
          uniqueSet[s] = true;
          nonBlank++;
          if (isNumericLike(s)) numericCount++;
          if (isDateLike(s)) dateCount++;
          if (isBoolLike(s)) boolCount++;
        }
      });
      var type = 'string';
      if (nonBlank > 0) {
        if (boolCount === nonBlank) type = 'boolean';
        else if (numericCount === nonBlank) type = 'number';
        else if (dateCount === nonBlank) type = 'date';
      }
      profile[h] = {
        type: type,
        filled: filled,
        blank: blank,
        unique: Object.keys(uniqueSet).length,
        values: uniqueSet
      };
    });
    return profile;
  }

  function isNumericLike(s) {
    if (s === '') return false;
    var n = Number(s.replace(/,/g, ''));
    return isFinite(n);
  }
  function isDateLike(s) {
    if (!/[-/]/.test(s) || s.length < 6) return false;
    var t = Date.parse(s);
    return !isNaN(t);
  }
  function isBoolLike(s) {
    return /^(true|false|yes|no|y|n|0|1)$/i.test(s);
  }

  function populateColumnPickers() {
    var defaultTitle = state.fileName ? state.fileName.replace(/\.csv$/i, '') + ' App' : 'Generated CSV App';
    el.appTitle.value = defaultTitle;

    fillSelect(el.primaryColumn, state.headers, state.headers[0] || '');

    el.filterColumns.innerHTML = '';
    state.headers.forEach(function (h) {
      var opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h + '  (' + state.profile[h].type + ', ' + state.profile[h].unique + ' unique)';
      if (state.profile[h].unique > 1 && state.profile[h].unique <= 25) opt.selected = true;
      el.filterColumns.appendChild(opt);
    });

    fillSelect(el.searchColumn, ['__all__'].concat(state.headers), '__all__', function (v) {
      return v === '__all__' ? 'All columns' : v;
    });
  }

  function fillSelect(select, values, selectedValue, labelFn) {
    select.innerHTML = '';
    values.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = labelFn ? labelFn(v) : v;
      if (v === selectedValue) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function enablePostLoadUI() {
    ['appTitle', 'primaryColumn', 'filterColumns', 'enableRecordView',
      'enableSummaries', 'buildAppBtn', 'resetAppBtn'].forEach(function (id) {
      el[id].disabled = false;
    });
  }

  function buildApp() {
    if (!state.headers.length) return;

    state.filters = {};
    state.sort = { col: null, dir: 1 };
    state.selectedRow = null;
    state.built = true;

    el.emptyState.classList.add('csv2app-hidden');
    el.generatedApp.classList.remove('csv2app-hidden');

    el.generatedAppTitle.textContent = el.appTitle.value || 'Generated CSV App';
    el.generatedAppMeta.textContent =
      state.fileName + ' · ' + state.rows.length + ' rows · ' + state.headers.length + ' columns';

    renderSummaryCards();
    renderColumnProfile();
    renderFilters();
    renderTableHead();
    applyFilters();

    el.downloadFilteredBtn.disabled = false;
    setStatus('App built. Edit filters, search, or sort to explore.');
  }

  function renderSummaryCards() {
    var showCards = el.enableSummaries.checked;
    document.getElementById('summaryCards').style.display = showCards ? '' : 'none';
    el.summaryRows.textContent = state.rows.length.toLocaleString();
    el.summaryColumns.textContent = state.headers.length.toLocaleString();
    var typeSet = {};
    state.headers.forEach(function (h) { typeSet[state.profile[h].type] = true; });
    el.summaryTypes.textContent = Object.keys(typeSet).length;
  }

  function renderColumnProfile() {
    var tbody = el.columnProfileTable.querySelector('tbody');
    tbody.innerHTML = '';
    state.headers.forEach(function (h) {
      var p = state.profile[h];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(h) + '</td>' +
        '<td><span class="badge badge-secondary">' + p.type + '</span></td>' +
        '<td>' + p.filled + '</td>' +
        '<td>' + p.blank + '</td>' +
        '<td>' + p.unique + '</td>';
      tbody.appendChild(tr);
    });
  }

  function renderFilters() {
    el.activeFilters.innerHTML = '';
    var selected = Array.prototype.filter.call(el.filterColumns.options, function (o) { return o.selected; })
      .map(function (o) { return o.value; });

    if (!selected.length) {
      el.activeFilters.innerHTML = '<small class="text-muted">No filter columns chosen.</small>';
      return;
    }

    selected.forEach(function (col) {
      var p = state.profile[col];
      var row = document.createElement('div');
      row.className = 'csv2app-filter-row';
      row.innerHTML = '<div class="small font-weight-bold mb-1">' + escapeHtml(col) +
        ' <span class="text-muted">(' + p.type + ')</span></div>';

      if (p.unique <= 25 && p.type !== 'number') {
        var values = Object.keys(p.values).sort();
        var listWrap = document.createElement('div');
        values.forEach(function (v) {
          var id = 'flt_' + Math.random().toString(36).slice(2, 9);
          var w = document.createElement('div');
          w.className = 'custom-control custom-checkbox';
          w.innerHTML =
            '<input type="checkbox" class="custom-control-input" id="' + id + '">' +
            '<label class="custom-control-label" for="' + id + '">' + escapeHtml(v) + '</label>';
          var cb = w.querySelector('input');
          cb.addEventListener('change', function () {
            var f = state.filters[col] || { kind: 'set', values: {} };
            f.kind = 'set';
            if (cb.checked) f.values[v] = true; else delete f.values[v];
            if (Object.keys(f.values).length === 0) delete state.filters[col];
            else state.filters[col] = f;
            applyFilters();
          });
          listWrap.appendChild(w);
        });
        row.appendChild(listWrap);
      } else if (p.type === 'number') {
        var range = document.createElement('div');
        range.className = 'form-row';
        range.innerHTML =
          '<div class="col"><input type="number" class="form-control form-control-sm" placeholder="min"></div>' +
          '<div class="col"><input type="number" class="form-control form-control-sm" placeholder="max"></div>';
        var inputs = range.querySelectorAll('input');
        var onInput = function () {
          var min = inputs[0].value === '' ? null : Number(inputs[0].value);
          var max = inputs[1].value === '' ? null : Number(inputs[1].value);
          if (min === null && max === null) delete state.filters[col];
          else state.filters[col] = { kind: 'range', min: min, max: max };
          applyFilters();
        };
        inputs[0].addEventListener('input', onInput);
        inputs[1].addEventListener('input', onInput);
        row.appendChild(range);
      } else {
        var input = document.createElement('input');
        input.className = 'form-control form-control-sm';
        input.placeholder = 'contains...';
        input.addEventListener('input', function () {
          var v = input.value.trim();
          if (!v) delete state.filters[col];
          else state.filters[col] = { kind: 'contains', text: v.toLowerCase() };
          applyFilters();
        });
        row.appendChild(input);
      }

      el.activeFilters.appendChild(row);
    });
  }

  function clearFilters() {
    state.filters = {};
    el.searchBox.value = '';
    renderFilters();
    applyFilters();
  }

  function renderTableHead() {
    var thead = el.appTable.querySelector('thead');
    thead.innerHTML = '';
    var tr = document.createElement('tr');
    state.headers.forEach(function (h) {
      var th = document.createElement('th');
      th.className = 'csv2app-sortable';
      th.textContent = h;
      th.addEventListener('click', function () {
        if (state.sort.col === h) state.sort.dir *= -1;
        else { state.sort.col = h; state.sort.dir = 1; }
        applyFilters();
      });
      tr.appendChild(th);
    });
    thead.appendChild(tr);
  }

  function applyFilters() {
    var q = (el.searchBox.value || '').trim().toLowerCase();
    var qCol = el.searchColumn.value;

    state.filtered = state.rows.filter(function (r) {
      for (var col in state.filters) {
        if (!Object.prototype.hasOwnProperty.call(state.filters, col)) continue;
        var f = state.filters[col];
        var cell = r[col] === undefined || r[col] === null ? '' : String(r[col]).trim();
        if (f.kind === 'set') {
          if (!f.values[cell]) return false;
        } else if (f.kind === 'contains') {
          if (cell.toLowerCase().indexOf(f.text) === -1) return false;
        } else if (f.kind === 'range') {
          var n = Number(cell.replace(/,/g, ''));
          if (!isFinite(n)) return false;
          if (f.min !== null && n < f.min) return false;
          if (f.max !== null && n > f.max) return false;
        }
      }
      if (q) {
        if (qCol === '__all__') {
          var hit = false;
          for (var i = 0; i < state.headers.length; i++) {
            var v = r[state.headers[i]];
            if (v !== undefined && v !== null && String(v).toLowerCase().indexOf(q) !== -1) { hit = true; break; }
          }
          if (!hit) return false;
        } else {
          var v2 = r[qCol];
          if (v2 === undefined || v2 === null || String(v2).toLowerCase().indexOf(q) === -1) return false;
        }
      }
      return true;
    });

    if (state.sort.col) {
      var col = state.sort.col;
      var dir = state.sort.dir;
      var numeric = state.profile[col] && state.profile[col].type === 'number';
      state.filtered.sort(function (a, b) {
        var av = a[col], bv = b[col];
        if (numeric) {
          var an = Number(String(av).replace(/,/g, ''));
          var bn = Number(String(bv).replace(/,/g, ''));
          if (!isFinite(an)) an = -Infinity;
          if (!isFinite(bn)) bn = -Infinity;
          return (an - bn) * dir;
        }
        var as = av === undefined || av === null ? '' : String(av);
        var bs = bv === undefined || bv === null ? '' : String(bv);
        return as.localeCompare(bs) * dir;
      });
    }

    renderTableBody();
    el.summaryFilteredRows.textContent = state.filtered.length.toLocaleString();
  }

  function renderTableBody() {
    var tbody = el.appTable.querySelector('tbody');
    tbody.innerHTML = '';
    var MAX = 500;
    var slice = state.filtered.slice(0, MAX);
    slice.forEach(function (r, idx) {
      var tr = document.createElement('tr');
      tr.style.cursor = el.enableRecordView.checked ? 'pointer' : 'default';
      state.headers.forEach(function (h) {
        var td = document.createElement('td');
        td.textContent = r[h] === undefined || r[h] === null ? '' : String(r[h]);
        tr.appendChild(td);
      });
      tr.addEventListener('click', function () {
        if (!el.enableRecordView.checked) return;
        state.selectedRow = r;
        renderRecordView();
      });
      tbody.appendChild(tr);
    });
    if (state.filtered.length > MAX) {
      el.appNote.textContent = 'Showing first ' + MAX + ' of ' + state.filtered.length +
        ' rows. Narrow filters or search to see more.';
    } else {
      el.appNote.textContent = 'Tip: Click a row to view it as a record. Click a column header to sort.';
    }
  }

  function renderRecordView() {
    if (!state.selectedRow) {
      el.recordView.innerHTML = '<small class="text-muted">Select a row to inspect its fields.</small>';
      return;
    }
    var frag = document.createDocumentFragment();
    state.headers.forEach(function (h) {
      var v = state.selectedRow[h];
      var w = document.createElement('div');
      w.className = 'csv2app-record-field';
      w.innerHTML =
        '<span class="csv2app-record-key">' + escapeHtml(h) + '</span>' +
        '<span class="csv2app-record-value">' +
          escapeHtml(v === undefined || v === null ? '' : String(v)) +
        '</span>';
      frag.appendChild(w);
    });
    el.recordView.innerHTML = '';
    el.recordView.appendChild(frag);
  }

  function downloadFiltered() {
    if (!state.filtered.length) {
      setStatus('Nothing to download — filtered set is empty.');
      return;
    }
    var csv = window.Papa.unparse({ fields: state.headers, data: state.filtered.map(function (r) {
      return state.headers.map(function (h) { return r[h] === undefined ? '' : r[h]; });
    }) });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var base = (el.appTitle.value || 'csv2app').replace(/[^a-z0-9_\-]+/gi, '_');
    a.download = base + '_filtered.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function resetAll() {
    state = {
      rawText: '', fileName: '', headers: [], rows: [], profile: {},
      filtered: [], filters: {}, sort: { col: null, dir: 1 },
      selectedRow: null, built: false
    };
    el.csvFile.value = '';
    el.appTitle.value = '';
    el.primaryColumn.innerHTML = '<option value="">Load a CSV first</option>';
    el.filterColumns.innerHTML = '';
    el.searchColumn.innerHTML = '<option value="__all__" selected>All columns</option>';
    el.searchBox.value = '';
    el.appTable.querySelector('thead').innerHTML = '';
    el.appTable.querySelector('tbody').innerHTML = '';
    el.columnProfileTable.querySelector('tbody').innerHTML = '';
    el.activeFilters.innerHTML = '<small class="text-muted">Choose filter columns, then build the app.</small>';
    el.recordView.innerHTML = '<small class="text-muted">Select a row to inspect its fields.</small>';
    el.generatedApp.classList.add('csv2app-hidden');
    el.emptyState.classList.remove('csv2app-hidden');
    ['appTitle', 'primaryColumn', 'filterColumns', 'enableRecordView',
      'enableSummaries', 'buildAppBtn', 'downloadFilteredBtn'].forEach(function (id) {
      el[id].disabled = true;
    });
    setStatus('No CSV loaded.');
  }

  function setStatus(msg) {
    if (el.csv2appStatus) el.csv2appStatus.textContent = msg;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
