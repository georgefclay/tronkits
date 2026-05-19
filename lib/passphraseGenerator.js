// lib/passphraseGenerator.js (CommonJS)

const DIGITS_1 = "0123456789".split("");
const SYMS_1 = "!@#$%^&*()-_=+[]{};:,.<>?".split("");

const POS_ORDER = ["adjective", "noun", "verb", "adverb"];

// Prebuild 2-char separators for exact-fitting
const DIGITS_2 = [];
for (const a of DIGITS_1) for (const b of DIGITS_1) DIGITS_2.push(a + b);

const SYMS_2 = [];
for (const a of SYMS_1) for (const b of SYMS_1) SYMS_2.push(a + b);

const MIXED_2 = [];
for (const d of DIGITS_1) for (const s of SYMS_1) {
  MIXED_2.push(d + s);
  MIXED_2.push(s + d);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function randomSep(exactMode) {
  // Minimum mode: 1 char digit or symbol
  if (!exactMode) return pick(DIGITS_1.concat(SYMS_1));

  // Exact mode: usually 1 char; sometimes 2 chars to help hit exact length
  const r = Math.random();
  if (r < 0.70) return pick(DIGITS_1.concat(SYMS_1));
  if (r < 0.85) return pick(DIGITS_2.concat(SYMS_2));
  return pick(MIXED_2);
}

function applyRandomFirstLetterCase(wordList) {
  // Randomly upper/lower first letter; guarantee at least one uppercase word.
  const out = [];
  let anyUpper = false;

  for (const wRaw of wordList) {
    const w = String(wRaw || "").trim();
    if (!w) continue;

    if (Math.random() < 0.5) {
      out.push(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      anyUpper = true;
    } else {
      out.push(w.toLowerCase());
    }
  }

  if (out.length === 0) return out;

  if (!anyUpper) {
    const idx = randInt(0, out.length - 1);
    const w = out[idx];
    out[idx] = w.charAt(0).toUpperCase() + w.slice(1);
  }

  return out;
}

function enforceDigitAndSymbol(candidate, exactMode, targetLength) {
  // Ensure at least one digit and at least one non-alnum symbol exists.
  const hasDigit = /[0-9]/.test(candidate);
  const hasSymbol = /[^A-Za-z0-9]/.test(candidate);

  if (hasDigit && hasSymbol) return candidate;

  const chars = candidate.split("");

  // Separator positions = non-letters (digits or punctuation)
  const sepPositions = [];
  for (let i = 0; i < chars.length; i++) {
    if (!/[A-Za-z]/.test(chars[i])) sepPositions.push(i);
  }

  if (sepPositions.length === 0) {
    if (!exactMode) {
      let out = candidate;
      if (!hasSymbol) out += pick(SYMS_1);
      if (!hasDigit) out += pick(DIGITS_1);
      return out;
    }
    throw new Error("No separator positions found to enforce digit/symbol in exact mode.");
  }

  if (exactMode) {
    if (!hasDigit) {
      const i = pick(sepPositions);
      chars[i] = pick(DIGITS_1);
    }
    if (!hasSymbol) {
      const choices = sepPositions.filter((i) => !/[0-9]/.test(chars[i]));
      const i = pick(choices.length ? choices : sepPositions);
      chars[i] = pick(SYMS_1);
    }
    const fixed = chars.join("");
    if (typeof targetLength === "number" && fixed.length !== targetLength) {
      throw new Error("Exact-length enforcement altered length (unexpected).");
    }
    return fixed;
  }

  // Minimum mode: append missing types (still ends with separator)
  let out = candidate;
  if (!hasSymbol) out += pick(SYMS_1);
  if (!hasDigit) out += pick(DIGITS_1);
  return out;
}

function buildCandidate(wordsByPos, numWords, exactMode) {
  // Choose words in guaranteed POS order
  const rawWords = [];
  for (let i = 0; i < numWords; i++) {
    const pos = POS_ORDER[i % POS_ORDER.length];
    const list = wordsByPos[pos];
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(`Missing/empty word list for POS: ${pos}`);
    }
    rawWords.push(pick(list));
  }

  const chosen = applyRandomFirstLetterCase(rawWords);
  if (chosen.length === 0) throw new Error("No words chosen (empty lists?)");

  // Build: word sep word sep ... word sep(end)
  let out = chosen[0];
  for (let i = 1; i < chosen.length; i++) {
    out += randomSep(exactMode) + chosen[i];
  }
  out += randomSep(exactMode); // end with number/special
  return out;
}

function generateOne(wordsByPos, targetLength, exact, maxAttempts = 30000) {
  if (!Number.isInteger(targetLength) || targetLength < 12) {
    throw new Error("Password length must be an integer >= 12.");
  }

  if (!exact) {
    // Minimum mode: increase word count until len >= target
    let numWords = 2;
    while (true) {
      let candidate = buildCandidate(wordsByPos, numWords, false);
      if (candidate.length >= targetLength) {
        candidate = enforceDigitAndSymbol(candidate, false);
        return candidate;
      }
      numWords++;
    }
  }

  // Exact mode: retry until len == target
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // heuristic range for word count: "unit" ~ (word 3-6 + sep 1-2) => 4..8
    const minWords = Math.max(2, Math.floor(targetLength / 9));
    const maxWords = Math.max(2, Math.floor(targetLength / 4) + 3);
    const numWords = randInt(minWords, maxWords);

    let candidate = buildCandidate(wordsByPos, numWords, true);
    if (candidate.length !== targetLength) continue;

    candidate = enforceDigitAndSymbol(candidate, true, targetLength);

    // re-check requirements
    if (candidate.length !== targetLength) continue;
    if (!/[0-9]/.test(candidate)) continue;
    if (!/[^A-Za-z0-9]/.test(candidate)) continue;

    return candidate;
  }

  throw new Error(
    `Could not generate EXACT-length passphrase of ${targetLength} after ${maxAttempts} attempts. ` +
    `Try a different length or use minimum mode.`
  );
}

function generatePassphrases(wordsByPos, { length = 20, count = 10, exact = false } = {}) {
  const targetLength = Number(length);
  const howMany = Number(count);
  const exactBool = !!exact;

  if (!Number.isInteger(targetLength) || targetLength < 12) {
    throw new Error("length must be an integer >= 12");
  }
  if (!Number.isInteger(howMany) || howMany < 1 || howMany > 50) {
    throw new Error("count must be an integer between 1 and 50");
  }

  const results = [];
  for (let i = 0; i < howMany; i++) {
    const passphrase = generateOne(wordsByPos, targetLength, exactBool);
    results.push({ passphrase, length: passphrase.length });
  }

  return {
    lengthRequested: targetLength,
    exact: exactBool,
    results,
  };
}

module.exports = {
  generatePassphrases,
};
