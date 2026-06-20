# 🌊 HydroSphere: River Basin Pollution Simulator

> **An interactive, real-time environmental simulation modeling the complex feedback loops between industrial development, agricultural runoff, municipal policies, and river basin ecosystems.**

---

<div align="center">

[![Status](https://img.shields.io/badge/Status-Interactive_Demo-00C2FF?style=for-the-badge)](https://github.com/sahu0247/river_simulation-)
[![Platform](https://img.shields.io/badge/Platform-Web_App-black?style=for-the-badge&logo=react)](https://github.com/sahu0247/river_simulation-)
[![Graphics](https://img.shields.io/badge/Visuals-HTML5_Canvas-F16529?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License](https://img.shields.io/badge/License-MIT-FFC107?style=for-the-badge)](LICENSE)

</div>

---

## 🌌 Overview

**HydroSphere** is an interactive, premium web-based environmental simulation center. It demonstrates how industrial waste discharges, agricultural chemical runoffs, and civic regulatory policies interact over time to shape the water quality and biodiversity of a river basin.

By tuning parameters, choosing presets, managing civic budgets, and responding to random ecological events, users observe immediate changes in the ecosystem via a live side-scrolling landscape visualizer and dynamic multi-line analytics charts.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose & Context |
| :--- | :--- | :--- |
| **Core Client** | React 19 & JavaScript | Component-based state engine managing daily tick loops. |
| **Styling** | Tailwind CSS v3 & PostCSS | Custom glassmorphic cards, layout grid, and responsive dark aesthetics. |
| **Sound Synthesis** | Web Audio API | Live synthesizer generating water flow ambience, warnings, chime chords, and button clicks. |
| **Visual Rendering** | HTML5 Canvas 2D API | High-fidelity animations of river waves, smoke puffs, chemical sewage plumes, fertilizer bubbles, weather, and swimming fish. |
| **Data Analytics** | Recharts | Renders interactive historical multi-line tracking, stacked area charts, and 12-month predictive models. |
| **Icons Library** | Lucide React | Visual symbols for alerts, policies, parameters, and indicators. |
| **Build Tooling** | Vite v7 | Ultra-fast local hot-reload compilation and bundling. |

---

## ✨ Features & Core Mechanics

### 📅 1. Environmental Weather Engine
* **Daily Tick Intervals**: Run the simulation in real-time, adjusting speed dynamically (from `1x` to `10x`).
* **Seasons & Climate**: Automatically cycles between Spring, Summer, Monsoon, and Winter, shifting temperature, rainfall values, and river flow levels (dilution capacity).
* **Weather Overlay**: Renders falling rain animations and surface splash ripples based on current weather precipitation.

### 🏭 2. Dual-Source Pollution Adjusters
* **Industrial Districts**:
  - Adjust factory counts and chimney smoke levels.
  - Set purification treatment rates.
  - Switch manufacturer classification (Chemical, Textile, or Food Processing) impacting pollutant types and acidity (pH).
* **Agricultural Watershed**:
  - Control watershed farm area (km²).
  - Adjust chemical fertilizer intensity.
  - Scale organic farming ratios to mitigate runoff.

### 📜 3. Presets & Random Events
* **Preset Scenarios**: Launch baseline states instantly, including *Standard Baseline, Industrial Expansion, Agricultural Heartland, Eco-Haven, or Ecological Collapse*.
* **Ecosystem Incidents**: Scripted and random event alerts (like "Midnight Dumping", "Accidental Spill", "Algae Bloom") that prompt players for decisions affecting budget, public approval, and pollution indices.

### 🌊 4. Live Landscape Canvas Visualizer
* **Dynamic Wave Shifting**: Fluid wave color moves from sparkling turquoise (clean WQI > 80) to muddy brown (farm runoffs) to toxic reddish-purple (untreated heavy metals).
* **Effluent Plumes**: Factory pipes discharge brown sewage plumes that dissolve in the current. Chemical manufacturers discharge toxic purple sludge.
* **Fertilizer Runoff**: Farmlands trickle glowing lime-green bubbles into the water. High runoff triggers eutrophication green algal blooms.
* **Fish Health Indicators**: Fish swim dynamically across the screen. If Dissolved Oxygen (DO) falls below 4.2 mg/L, fish struggle, move slowly, or float belly-up near the surface.
* **Regional Reports**: Hover over factories, river channels, or farms to see pop-up stats overlays.

### 🔊 5. Real-Time Synthesizer (Audio)
* Synthesizes soft, pink-noise river running sounds.
* UI bubble pop sounds for slider updates and button click chimes.
* Harmonic chime sequences on policy status change.
* Alarm sweeps when WQI drops to critical danger zones.

### 🔬 6. Educational Science & Analytics
* **Ecosystem Science Reference**: Dedicated encyclopedia outlining water chemistry formulas (e.g. how temperature impacts oxygen solubility, turbidity calculation weights, and eutrophication causes).
* **Incident logs**: Complete history log tracking past milestones and political actions.

---

## 📂 Project Directory Structure

```
river_simulation-/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Environmental graphics and logos
│   ├── App.jsx             # Core simulation dashboard containing calculation logic, audio, & UI panels
│   ├── App.css             # Main stylesheet overrides (glassmorphic classes & custom sliders)
│   ├── index.css           # Tailwind CSS directives
│   └── main.jsx            # React mounting hook
├── eslint.config.js        # JavaScript linting rules
├── postcss.config.js       # Stylesheet configuration
├── tailwind.config.js      # Layout spacing configurations
├── vite.config.js          # Development compiler settings
└── package.json            # Dependencies and start scripts
```

---

## 🏁 Getting Started & Setup

### ⚙️ Prerequisites
* Node.js (version 18.x or above)
* npm (Node Package Manager)

### 📥 Running the Simulator

1. Clone the project repository:
   ```bash
   git clone https://github.com/sahu0247/river_simulation-.git
   cd river_simulation-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. View the dashboard locally:
   ```
   http://localhost:5173
   ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
