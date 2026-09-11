# Design System: APIx — Real-time Airfare Price Index
**Project ID:** MoSPI-SIH2026-APIX-01

## 1. Visual Theme & Atmosphere
APIx synthesizes executive government data visualization with high-tech aerospace telemetry. The aesthetic direction is **Aero-Cyber Slate & Luminescent Glassmorphism**. The tone is authoritative, highly technical, yet visually captivating — moving away from flat, generic dark modes to multi-layered obsidian glass with subtle ambient glow overlays and vibrant emerald indicator accents.

## 2. Color Palette & Roles
- **Obsidian Core (`#070B12`)**: Primary application background; provides infinite depth.
- **Slate Panel (`#0F172A`)**: Base surface for glass containers and cards.
- **Translucent Glass Surface (`rgba(15, 23, 42, 0.75)`)**: Main frosted container background with `backdrop-filter: blur(16px)`.
- **Luminescent Emerald (`#10B981`)**: Primary accent color representing positive trend status, data stability, and primary interactive buttons.
- **Electric Cyan (`#06B6D4`)**: Secondary accent for route connections, chart gradients, and active UI states.
- **Neon Amber (`#F59E0B`)**: Alert indicator, mock demo banner, and moderate volatility warnings.
- **Crimson Spike (`#EF4444`)**: Price increases, high volatility alerts, and max fare indicator line.
- **Subtle Glass Border (`rgba(255, 255, 255, 0.08)`)**: Precision boundary lines for all cards and interactive components.

## 3. Typography Rules
- **Display & Headings**: `Plus Jakarta Sans` — bold, geometric, authoritative numbers and hero statistics.
- **Body & Controls**: `Inter` — hyper-legible body typography, form controls, and labels.
- **Telemetry & Terminal**: `JetBrains Mono` — for live API logs, timestamps, HTTP status codes, latency readouts, and raw data attributes.

## 4. Component Stylings
- **Buttons**:
  - *Primary ("Analyze Fare")*: Full-width emerald-to-teal gradient (`from-emerald-500 to-teal-600`) with glowing shadow (`shadow-emerald-500/25`), smooth 200ms scale on hover.
  - *Secondary ("Run Mock Scraper")*: Slate pill with subtle white border (`border-white/10`), glowing lightning bolt icon, amber status glow on hover.
- **Cards & Containers**:
  - *Glass Cards*: Frosted glass panels (`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`).
  - *KPI Stat Cards*: Ambient radial gradient backlight (`radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent)`), high-contrast large numerical display.
- **Inputs & Selectors**:
  - Custom glass dropdowns with cyan focus ring (`ring-2 ring-cyan-500/30 border-cyan-500/50`), hover micro-glow, clear floating label headers.
- **Charts & Telemetry**:
  - Recharts Area Chart featuring smooth curve lines (`monotone`), multi-stop area opacity gradients, custom glass tooltip with date formatting and INR currency tokens (`₹`).

## 5. Layout Principles
- **Grid Strategy**: 12-column dynamic desktop layout split into a 4-column control column (Search Panel + Live Terminal Log) and an 8-column data dashboard (Hero KPI Cards + 30-Day Recharts Graph + Analytics Hub).
- **Whitespace & Rhythm**: 24px structural gap with 20px card inner padding to achieve executive density without visual crowding.
- **Motion Philosophy**: Micro-transitions for hover states (150ms ease-out), entrance stagger using Framer Motion (opacity + scale/Y translation), and pulse indicators for real-time background tasks.
