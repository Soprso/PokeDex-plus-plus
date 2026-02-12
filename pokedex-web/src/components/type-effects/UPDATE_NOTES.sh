#!/bin/bash

# This script updates all type effect files to have more prominent effects
# with higher opacity, more particles, and reduced delays

echo "Updating all type effects for better visibility..."

# The changes will be applied manually through the editor
# This file documents the changes needed for each effect type

cat << 'EOF'
Changes to apply to all type effects:

1. Increase particle/element count by 50-100%
2. Increase opacity values by 3-5x (from 0.05-0.1 to 0.2-0.4)
3. Reduce delays from 10000-20000ms to 1000-3000ms
4. Increase particle sizes by 50%
5. Make SVG elements more visible (increase stroke width, opacity)

Already updated:
- FireEffect.tsx ✓
- WaterEffect.tsx ✓
- GrassEffect.tsx ✓
- ElectricEffect.tsx ✓

Remaining to update:
- BugEffect.tsx
- DarkEffect.tsx
- DragonEffect.tsx
- FairyEffect.tsx
- FightingEffect.tsx
- FlyingEffect.tsx
- GhostEffect.tsx
- GroundEffect.tsx
- IceEffect.tsx
- NormalEffect.tsx
- PoisonEffect.tsx
- PsychicEffect.tsx
- RockEffect.tsx
- SteelEffect.tsx
EOF
