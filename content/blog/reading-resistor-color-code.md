---
title: "Reading Resistor Color Codes (with the Navy Mnemonic I Still Use)"
slug: "reading-resistor-color-code"
date: "2026-05-04"
description: "How to read 4-, 5-, and 6-band resistor color codes — plus the old Navy mnemonic I learned years ago and still use at the bench."
tags: ["electronics", "resistors", "beginner", "utilities"]
---

If you've worked with any kind of through-hole electronics, you've had to squint at a tiny resistor and decode the bands of color painted around it. Surface-mount components have made this less common — most SMD resistors use printed numeric codes instead — but if you're prototyping on a breadboard, repairing older gear, or pulling parts out of a kit, color bands are still the daily reality.

The good news: it's not hard. There's a pattern, and once you know the mnemonic for the colors, you can read most resistors in a few seconds.

## The mnemonic I learned in the Navy

When I was in the Navy many years ago — and people weren't quite so worried about being polite — we had a saying for the resistor color order. I'll give you the cleaned-up version:

> **B**ad **B**oys **R**ace **O**ur **Y**oung **G**irls **B**ehind **V**ictory **G**arden **W**all

Each word is the first letter of a color, and each color stands for a digit:

| Word    | Color   | Digit |
|---------|---------|-------|
| Bad     | Black   | 0     |
| Boys    | Brown   | 1     |
| Race    | Red     | 2     |
| Our     | Orange  | 3     |
| Young   | Yellow  | 4     |
| Girls   | Green   | 5     |
| Behind  | Blue    | 6     |
| Victory | Violet  | 7     |
| Garden  | Gray    | 8     |
| Wall    | White   | 9     |

Then for the multiplier and tolerance bands you'll also see:

- **Gold** — ×0.1 multiplier, or ±5% tolerance
- **Silver** — ×0.01 multiplier, or ±10% tolerance
- **No band** — ±20% tolerance

I had the rest of that one drilled in too — *"**G**et **S**tarted **N**ow"* for **G**old, **S**ilver, **N**one — but honestly the colors stick on their own once you've used them a while.

## How the bands actually work

Hold the resistor with the gold or silver band on the right (that's the tolerance band — it's the one with the bigger gap from the rest). Then read left to right:

**4-band resistor** — the most common kind:

1. First digit
2. Second digit
3. Multiplier (number of zeros to add)
4. Tolerance

So a resistor with **brown / black / red / gold** is `1`, `0`, `× 100`, ±5% — that's a **1,000 Ω** (1 kΩ) resistor at 5% tolerance.

**5-band resistor** — used for precision parts (1% or tighter):

1. First digit
2. Second digit
3. Third digit
4. Multiplier
5. Tolerance

That extra digit gives you finer-grained values like 4.99 kΩ instead of "5k-ish."

**6-band resistor** — same as 5-band, plus a sixth band for **temperature coefficient** (how much the resistance drifts per °C). You only see this on resistors meant for precision analog work.

## Why it still matters with SMD everywhere

Two reasons. First, even if your project boards are all surface-mount, breadboard prototyping is still through-hole — and that's where most learning, debugging, and one-off tinkering happens. Second, every drawer of "mystery resistors" anyone inherits is full of color-banded parts. If you can't read them, you can't use them.

## The cheat sheet trick

I have a small printed color-code chart taped to the wall behind my workbench. After 30 years it's still the fastest way to verify a value when I'm tired or the lighting is bad. Recommended.

## Or just use the calculator

If you've had a long day, and you just don't want to think, go to our calculator. It will make you life easier.

[**TronKits Resistor Color Code Calculator →**](/resistor)

Pick the bands, get the value, tolerance, and (for 6-band parts) temperature coefficient.
