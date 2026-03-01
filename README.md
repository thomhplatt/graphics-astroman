# Astroman

## Overview

This project explored object modeling, affine transformation, and real time animation.

## Features

### Hierarchical Modeling
- Matrix stack (`gPush`, `gPop`)
- Local joint rotations for:
  - Arms
  - Legs
  - Head
- Independent animation transforms

### Animation
- Time-based motion using `TIME += dt`
- Sinusoidal:
  - Arm swing
  - Leg swing
  - Jelly tentacle motion
- Continuous jelly rotation
- Starfield wrap-around

## Animation Details

- AstroMan oscillates in a sinusoidal path.
- Arms and legs swing using sine functions.
- Jelly tentacles animate using phase-shifted sine waves.
- Stars move diagonally and wrap across screen bounds.

## Controls

This version auto-runs animation on load.

## Technical Highlights

- Orthographic projection
- Hierarchical transformations
- Procedural geometry (Sphere, Cube, Cylinder, Cone)
- Frame-delta based animation (`dt`)
- Transform stack usage

## Starter Code Attribution

This project uses WebGL starter framework code provided by the course instructor, including:

- Matrix utilities
- Shader setup
- Shape initialization (Cube, Sphere, Cylinder, Cone)
- Basic lighting framework

All scene design, animation logic, hierarchical modeling, and object construction were implemented by Thomas Pietrovito.

---

## What I Learned

- Hierarchical modeling using transformation stacks
- Time-based animation with frame deltas
- Procedural motion using sine functions
- Scene organization in WebGL
- Affine Transformations and basic Graphic Pipeline
