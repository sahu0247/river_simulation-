# 🌊 River Basin Pollution Simulator

> **An interactive, real-time environmental simulation modeling the impact of industrial activity, agricultural practices, and municipal policies on river basin ecosystems.**

---

<div align="center">

[![Status](https://img.shields.io/badge/Status-Interactive_Demo-00C2FF?style=for-the-badge)](https://github.com/)
[![Platform](https://img.shields.io/badge/Platform-Web_App-black?style=for-the-badge&logo=react)](https://github.com/)
[![Graphics](https://img.shields.io/badge/Visuals-HTML5_Canvas-F16529?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License](https://img.shields.io/badge/License-MIT-FFC107?style=for-the-badge)](LICENSE)

</div>

---

## 🌌 Overview

The **River Basin Pollution Simulator** is an interactive web-based ecological simulator built to demonstrate how industrial waste discharge, agricultural runoff, and governmental policies interact to shape the water quality and biodiversity of a river basin over time. 

By adjusting pollution inputs, enacting environmental legislation, and observing real-time feedback loops via standard charts and a custom-rendered 2D canvas animation, users learn about environmental resource management, system modeling, and structural policy tradeoffs.

### 🎨 Design System
* **Fluid Interface**: High-contrast, card-based layout featuring modern glassmorphism panels.
* **Intelligent Ecological Alarms**: Integrates blinking critical alerts (red status cards) warning when dissolved oxygen collapses or when the fish population faces extinction.
* **Smooth Animation Loops**: Fully responsive, GPU-friendly 2D canvas that dynamically simulates water currents, waves, floating debris, and chemical haze opacity.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose & Context |
| :--- | :--- | :--- |
| **Core Client** | React 19 & JavaScript | Component-based state flow managing simulation tick intervals. |
| **Styling** | Tailwind CSS & PostCSS | Custom dark container borders, flex grids, and responsive margins. |
| **Visual Rendering** | HTML5 Canvas 2D API | Custom animation cycles drawing physical river current waves, particles, and haze filters. |
| **Data Analytics** | Recharts (v3) | Draws high-performance multi-line historical trends, stacked pollution area charts, and forecasting models. |
| **Icons Library** | Lucide React | Visual symbols for sensors, policies, alerts, and controls. |
| **Build Tooling** | Vite | Quick hot-reload dev server and modular builds. |

---

## ✨ Features & Sim Core Mechanics

### 📅 1. Seasonal Environment Controller
* **Daily Tick Intervals**: Run the simulation in real-time, adjusting speed dynamically (from `1x` to `10x`).
* **Season Logic Loop**: Tracks dates through standard Spring, Summer, Monsoon, and Winter seasons.
* **Micro-Climate Updates**: Seasons automatically impact temperature coefficients, rainfall levels, and river water flows (dilution capacity).

### 🏭 2. Dual-Source Pollution Adjusters
* **Industrial Discharges**:
  * **Factory Count**: Simulates local industrial density.
  * **Effluent Treatment (0-100%)**: Models private filtering capabilities.
  * **Factory Classification**: Adjusts pollution chemical intensity (Chemical, Textile, or Food Processing).
* **Agricultural Runoff**:
  * **Cultivation Area (km²)**: Models farm layouts.
  * **Fertilizer Use Intensity**: Controls Nitrogen/Phosphorus load potential.
  * **Organic Ratio**: Offsets fertilizer impacts.

### 📜 3. Policy Interventions & Budget Constraints
* **Strict Effluent Laws**: Reduces industrial chemical dump rates by 40% (Costs: $200K, Public Approval: -10%).
* **Green Farming Subsidy**: Decreases farm runoff values by 30% (Costs: $150K, Public Approval: +15%).
* **River Cleanup Drive**: Adds a direct +10 index point boost to water quality (Costs: $50K, Public Approval: +20%).
* **Carbon & Output Tax**: Trims factory output by 20% (Costs: $100K, Public Approval: -15%).

### 📊 4. Live Sensor Readings & Forecasting
* **Water Quality Index (WQI)**: General safety indicator calculated from pollution vs. water volume dilution.
* **Dissolved Oxygen (DO mg/L)**: Simulates aquatic life support, affected by chemical load and water temperature.
* **Fish Population**: Models birth/mortality based on WQI and DO levels.
* **Budget & Approval Logs**: Tracks civic funds and public sentiment.
* **Predictive Analysis Panels**:
  * *Line Chart*: Historical WQI and DO sensor logs over the past 180 days.
  * *Area Chart*: Stacked breakdown showing Industrial vs. Agricultural pollution shares.
  * *12-Month Forecast*: Regression forecast lines projecting future WQI and Fish Population levels.

---

## 📂 Project Directory Structure

```
river_simulation-/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Environmental graphics and logos
│   ├── App.jsx             # Core simulation dashboard containing calculation logic & UI panels
│   ├── App.css             # Main stylesheet overrides
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
