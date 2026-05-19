import argparse
import csv
import json
import random
import sys
from pathlib import Path


WORD_FILES = {
    "adjective": "adjectives.csv",
    "noun": "nouns.csv",
    "verb": "verbs.csv",
    "adverb": "adverbs.csv",
}

POS_ORDER = ["adjective", "noun", "verb", "adverb"]

DIGITS_1 = list("0123456789")
SYMS_1 = list("!@#$%^&*()-_=+[]{};:,.<>?")

# 2-char separators (used only for exact-length fitting)
DIGITS_2 = [a + b for a in DIGITS_1 for b in DIGITS_1]
SYMS_2 = [a + b for a in SYMS_1 for b in SYMS_1]
MIXED_2 = [d + s for d in DIGITS_1 for s in SYMS_1] + [s + d for s in SYMS_1 for d in DIGITS_1]


def load_csv_words(pathlike: Path) -> list[str]:
    """Load words from a CSV file.

    Assumes the first column is the word. Works with either header "word,length" or no header.
    Files are assumed to already contain only valid-length words.
    """
    path = Path(pathlike)
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path.resolve()}")

    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        raise ValueError(f"{path.name} is empty")

    start = 1 if rows[0] and rows[0][0].strip().lower() == "word" else 0

    words: list[str] = []
    for row in rows[start:]:
        if not row:
            continue
        w = row[0].strip()
        if w:
            words.append(w)

    if not words:
        raise ValueError(f"No words loaded from {path.name}")

    return words


def apply_random_first_letter_case(word_list: list[str]) -> list[str]:
    """Randomly uppercase/lowercase the first letter of each word; guarantee >= 1 uppercase."""
    out: list[str] = []
    any_upper = False

    for w in word_list:
        w = w.strip()
        if not w:
            continue
        if random.choice([True, False]):
            out.append(w[:1].upper() + w[1:].lower())
            any_upper = True
        else:
            out.append(w.lower())

    if out and not any_upper:
        idx = random.randrange(len(out))
        out[idx] = out[idx][:1].upper() + out[idx][1:]

    return out


def random_sep(exact_mode: bool) -> str:
    """Return a separator (digit or symbol). Exact mode sometimes returns 2 chars."""
    if not exact_mode:
        return random.choice(DIGITS_1 + SYMS_1)

    r = random.random()
    if r < 0.70:
        return random.choice(DIGITS_1 + SYMS_1)
    if r < 0.85:
        return random.choice(DIGITS_2 + SYMS_2)
    return random.choice(MIXED_2)


def build_candidate(words_by_pos: dict[str, list[str]], num_words: int, exact_mode: bool) -> str:
    raw_words: list[str] = []
    for i in range(num_words):
        pos = POS_ORDER[i % len(POS_ORDER)]
        raw_words.append(random.choice(words_by_pos[pos]))

    chosen_words = apply_random_first_letter_case(raw_words)

    out = chosen_words[0]
    for w in chosen_words[1:]:
        out += random_sep(exact_mode) + w
    out += random_sep(exact_mode)  # ensure it ends with a digit/symbol
    return out


def enforce_digit_and_symbol(candidate: str, exact_mode: bool, target_length: int | None = None) -> str:
    """Ensure at least one digit and at least one non-alnum symbol exist.

    - Minimum mode: append missing types.
    - Exact mode: edit separator positions in-place (preserves length).
    """
    has_digit = any(ch.isdigit() for ch in candidate)
    has_symbol = any((not ch.isalnum()) for ch in candidate)
    if has_digit and has_symbol:
        return candidate

    chars = list(candidate)
    sep_positions = [i for i, ch in enumerate(chars) if not ch.isalpha()]  # digits/symbols

    if not sep_positions:
        if not exact_mode:
            if not has_symbol:
                chars.append(random.choice(SYMS_1))
            if not has_digit:
                chars.append(random.choice(DIGITS_1))
            return "".join(chars)
        raise RuntimeError("No separator positions found to enforce digit/symbol in exact mode.")

    if exact_mode:
        if not has_digit:
            i = random.choice(sep_positions)
            chars[i] = random.choice(DIGITS_1)
        if not has_symbol:
            choices = [i for i in sep_positions if not chars[i].isdigit()] or sep_positions
            i = random.choice(choices)
            chars[i] = random.choice(SYMS_1)
        fixed = "".join(chars)
        if target_length is not None and len(fixed) != target_length:
            raise RuntimeError("Exact-length enforcement altered length (unexpected).")
        return fixed

    # minimum mode
    if not has_symbol:
        chars.append(random.choice(SYMS_1))
    if not has_digit:
        chars.append(random.choice(DIGITS_1))
    return "".join(chars)


def generate_one(words_by_pos: dict[str, list[str]], target_length: int, exact: bool, max_attempts: int = 30000) -> str:
    if target_length < 12:
        raise ValueError("Password length must be >= 12.")

    if not exact:
        num_words = 2
        while True:
            candidate = build_candidate(words_by_pos, num_words=num_words, exact_mode=False)
            if len(candidate) >= target_length:
                return enforce_digit_and_symbol(candidate, exact_mode=False)
            num_words += 1

    for _ in range(max_attempts):
        min_words = max(2, target_length // 9)
        max_words = max(2, target_length // 4 + 3)
        num_words = random.randint(min_words, max_words)

        candidate = build_candidate(words_by_pos, num_words=num_words, exact_mode=True)
        if len(candidate) != target_length:
            continue

        candidate = enforce_digit_and_symbol(candidate, exact_mode=True, target_length=target_length)
        if len(candidate) == target_length:
            return candidate

    raise RuntimeError(f"Could not generate exact length {target_length} after {max_attempts} attempts.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--length", type=int, default=20, help="Target passphrase length (>=12)")
    parser.add_argument("--count", type=int, default=10, help="How many passphrases (1-50)")
    parser.add_argument("--exact", type=int, default=0, help="1 for exact length, 0 for >= length")
    parser.add_argument("--data-dir", type=str, default=".", help="Directory containing the CSV files")
    args = parser.parse_args()

    length = args.length
    count = args.count
    exact = bool(args.exact)

    if length < 12:
        raise ValueError("length must be >= 12")
    if count < 1 or count > 50:
        raise ValueError("count must be between 1 and 50")

    data_dir = Path(args.data_dir)

    words_by_pos = {k: load_csv_words(data_dir / v) for k, v in WORD_FILES.items()}

    results = []
    for _ in range(count):
        pw = generate_one(words_by_pos, length, exact)
        results.append({"passphrase": pw, "length": len(pw)})

    print(json.dumps({"lengthRequested": length, "exact": exact, "results": results}))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
