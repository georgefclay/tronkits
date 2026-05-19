(() => {
  const $ = (id) => document.getElementById(id);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function setStatus(msg, kind) {
    var el = $("status");
    el.textContent = msg || "";
    el.className = "tk-status-msg" + (kind ? " is-" + kind : "");
  }

  function setButtonsEnabled(hasResults) {
    $("copyAll").disabled = !hasResults;
    $("clear").disabled = !hasResults;
  }

  function getInputs() {
    const length = Math.max(12, Number($("length").value || 20));
    const count = Math.min(50, Math.max(1, Number($("count").value || 10)));
    const exact = $("exact").checked ? 1 : 0;
    return { length, count, exact };
  }

  async function generate() {
    const { length, count, exact } = getInputs();
    setStatus("Generating…");
    $("list").innerHTML = "";
    setButtonsEnabled(false);

    try {
      const res = await fetch(
        `/api/passphrases?length=${encodeURIComponent(length)}&count=${encodeURIComponent(count)}&exact=${exact}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setStatus(`GENERATED ${data.results.length} · length ${data.lengthRequested}${data.exact ? ' · exact' : ''}`, 'success');

      $("list").style.display = "";
      for (const item of data.results) {
        const li = document.createElement("li");
        li.innerHTML = `
          <span style="display:flex; align-items:baseline; gap:10px; min-width:0; flex:1">
            <span style="word-break:break-all">${escapeHtml(item.passphrase)}</span>
            <span style="color:var(--ink-faint); font-size:11px; letter-spacing:0.08em">LEN=${item.length}</span>
          </span>
          <button class="copy-btn" type="button" data-copy="${escapeHtml(item.passphrase)}">Copy</button>
        `;
        $("list").appendChild(li);
      }

      setButtonsEnabled(data.results.length > 0);
    } catch (err) {
      setStatus("Error: " + (err && err.message ? err.message : err), 'error');
      console.error(err);
    }
  }

  function clearResults() {
    $("list").innerHTML = "";
    $("list").style.display = "none";
    setStatus("");
    setButtonsEnabled(false);
  }

  async function copyAll() {
    const codes = Array.from($("list").querySelectorAll("code")).map(el => el.textContent || "");
    const text = codes.join("\n");
    if (!text) return;

    try {
      await copyText(text);
      setStatus("COPIED ALL TO CLIPBOARD", 'success');
      const btn = $("copyAll");
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = old), 900);
    } catch (err) {
      console.error(err);
      setStatus("Copy all failed (browser blocked clipboard).", 'error');
    }
  }

  // Generate
  $("go").addEventListener("click", generate);

  // Preset length buttons
  document.querySelectorAll(".preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const len = Number(btn.getAttribute("data-len"));
      if (Number.isFinite(len)) $("length").value = String(Math.max(12, len));
      $("length").focus();
    });
  });

  // Copy per-item (event delegation)
  $("list").addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;

    const text = btn.getAttribute("data-copy") || "";
    try {
      await copyText(text);
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = old), 900);
    } catch (err) {
      console.error(err);
      setStatus("Copy failed (browser blocked clipboard).", 'error');
    }
  });

  // Copy all + Clear
  $("copyAll").addEventListener("click", copyAll);
  $("clear").addEventListener("click", clearResults);

  // Start with buttons disabled
  setButtonsEnabled(false);
})();
