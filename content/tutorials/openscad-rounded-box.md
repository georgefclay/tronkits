---
title: "Creating a Rounded Box in OpenSCAD"
slug: "openscad-rounded-box"
date: "2026-04-21"
description: "Round the corners of an OpenSCAD box with the two-pass offset() trick, extrude it to 3D and hollow it out. Faster than minkowski()."
category: "openscad"
difficulty: 1
steps: 3
minutes: 12
tags: ["openscad", "3d-printing", "beginner"]
---

Make a box with rounded corners using the `offset()` technique.

## Step 1: Define the rounded rectangle

Create a 2D shape with rounded corners using a two-pass offset technique.

```
w = 60;
l = 40;
h = 20;
rad = 3;

module rounded_rect() {
  offset(r=rad)
  offset(delta=-rad)
  square([w, l]);
}
rounded_rect();
```

This <a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#offset" target="_blank">offset technique</a> expands then contracts the base shape to create rounded corners.

## Step 2: Extrude to 3D

Use `linear_extrude()` to give the shape depth.

```
linear_extrude(height=20)
rounded_rect();
```

## Final code

```
$fn = 100;
w = 60; l = 40; h = 20;
wall_thickness = 2;
lid_thickness = 4;
lid_clearance = 0;
rad = 2;

module outer_rec() {
  linear_extrude(height = h)
  offset(r=rad) offset(delta = -1*rad) square([w, l]);
}

module inner_rec() {
  linear_extrude(height = h)
  offset(r=rad) offset(delta = -1*rad)
  square([w - (wall_thickness*2), l - (wall_thickness*2)]);
}

difference() {
  outer_rec();
  translate([wall_thickness, wall_thickness, wall_thickness])
  inner_rec();
}
```

> **Tip:** The `offset()` method is lightweight and efficient — perfect for clean rounded edges without the complexity of `minkowski()`.
