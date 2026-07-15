---
title: "Ohm's Law in 5 Minutes (with the Eagle Mnemonic)"
slug: "ohms-law-in-5-minutes"
date: "2026-07-14"
description: "Ohm's law is one triangle and three tiny equations. Here's the Eagle mnemonic I use to keep them straight, with worked examples from the bench."
tags: ["electronics", "ohms-law", "beginner", "utilities"]
---

Ohm's law is the one piece of electronics math you can't skip. The good news is there's almost nothing to it — one triangle, three little equations, and you're done. If you've been avoiding it because it looks like homework, give me five minutes.

Here's the whole thing:

> **E = I × R**

E is voltage (the old symbol for it is E, for electromotive force). I is current, in amps. R is resistance, in ohms. Voltage equals current times resistance. That's the law. Everything else is just rearranging it.

## The Eagle sits on top

You don't want to memorize three separate equations — you want one picture. Draw a triangle. Put **E** at the top, and **I** and **R** in the two spots along the bottom.

```
      E
    -----
    I | R
```

The way I remember which letter goes up top: the eagle flies highest, so **E** perches at the top. Once E is up there, I and R have nowhere to go but the bottom.

Now cover the one you're solving for with your finger:

- Cover **E** — you see **I** next to **R**, so E = I × R
- Cover **I** — you see **E** over **R**, so I = E / R
- Cover **R** — you see **E** over **I**, so R = E / I

Letters side by side means multiply. One over the other means divide. You'll never have to remember which way the division goes again, because the triangle tells you.

## Let's actually use it

Say you've got a 9V battery and a 470 Ω resistor, and you want to know the current. Cover I in the triangle: E over R. So 9 ÷ 470 = 0.019 amps, or about 19 milliamps.

Here's the one I reach for most: sizing a resistor for an LED. Say you're running a red LED off 5V. The LED drops about 2V across itself and wants roughly 15 mA. The resistor has to eat the leftover voltage, which is 5 − 2 = 3V, at 0.015 amps. Cover R: E over I. So 3 ÷ 0.015 = 200 Ω. Grab the nearest standard value (220 Ω) and your LED lives a long life instead of a short, bright one.

Go the other way if you like. You've got a 12V supply and a 100 Ω load — how much current? Cover I: 12 ÷ 100 = 0.12 amps. Every one of these is the same triangle with a different finger on it.

## Watch your units

The math only works if E is in volts, I is in amps, and R is in ohms. Milliamps will bite you. 15 mA is 0.015 amps, not 15. If your answer comes out off by a factor of a thousand, that's almost always what happened. I've done it, and I still catch myself doing it when I'm tired.

## One more: power

While you're here, there's a fourth quantity worth knowing — power, in watts. The basic one is **P = E × I**, voltage times current. Back to that LED: 3V across the resistor at 0.015 amps is 0.045 watts. A standard quarter-watt (0.25 W) resistor handles that with room to spare, so you're fine. This is how you find out whether a part is going to run warm or run away.

That's Ohm's law and its power cousin. Four quantities, and if you know any two you can work out the other two. No calculus, no magic. Keep the eagle in your head and you've got it.

## Or let the calculator do the arithmetic

If it's late and you don't feel like dividing anything, we built the triangle into a page. Punch in any two values and it hands you the rest.

[**TronKits Ohm's Law Calculator →**](/ohms-law)

*This blog post was written by AI using the voice of George Clay's writings. Edited by George Clay.*
