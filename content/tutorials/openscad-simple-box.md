---
title: "Creating a Simple Box in OpenSCAD"
slug: "openscad-simple-box"
date: "2026-04-18"
description: "Design a parametric box with a lid in OpenSCAD: set a few variables, hollow a cube with difference(), wrap it in a module and print it."
category: "openscad"
difficulty: 1
steps: 6
minutes: 15
tags: ["openscad", "3d-printing", "beginner"]
---

This tutorial shows how to design a basic, parametric box using [OpenSCAD](https://openscad.org). Perfect for 3D printing or as a base for more complex designs.

## Set up your parameters

We define variables for the box's size and wall thickness so we can easily tweak it later:

```
w = 25;     // Outer width of the box
d = 15;     // Outer depth/length of the box
h = 10;     // Outer height of the box
wall = 2;   // Wall thickness
```

Statements must end with a `;` (semicolon).

## Create the outer shell

```
cube([width, length, height]);
```

If all sides are the same you could do `cube(size)`. You don't need the brackets for a single value.

## Hollow out the middle

```
difference(){
  cube([w, d, h]);
  translate([wall, wall, wall])
  cube([w-2*wall, d-2*wall, h]);
}
```

`difference()` removes the second object from the first. `translate()` moves the second object. The first cube is the outer shell, the second is the hollow part.

## Make it a module

```
module box() {
  difference(){
    cube([w, d, h]);
    translate([wall, wall, wall])
    cube([w-2*wall, d-2*wall, h]);
  }
}
```

`module` acts like a function. You must call the module for it to run with `box();`.

## Add a lid

```
module lid() {
  cube([w, d, wall]);
  translate([wall, wall, wall])
  cube([w-2*wall, d-2*wall, wall]);
}
lid();
```

## Final code

```
// Simple Box Design
w = 25; d = 15; h = 10; wall = 2;

module box() {
  difference(){
    cube([w, d, h]);
    translate([wall, wall, wall])
    cube([w-2*wall, d-2*wall, h]);
  }
}

module lid() {
  cube([w, d, wall]);
  translate([wall, wall, wall])
  cube([w-2*wall, d-2*wall, wall]);
}

box();
translate([w+5, 0, 0]) { lid(); }
```
