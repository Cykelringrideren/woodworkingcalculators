# Woodworkers Tools

A set of woodworking calculators for WordPress.

**Version 0.2.7** includes:

- **Board-Foot Calculator** — total board-feet for multiple boards; estimate material cost.  
- **Sheet-Goods Yield Calculator** — arrange parts on standard or custom sheet sizes; compute sheets needed; generate cut diagrams.  
- **Wood Weight Estimator** — sum board-feet of parts and convert to pounds or kilograms.  
- **Wood Movement Predictor** — compute edge expansion or shrinkage between two moisture‐content values; fill final MC from local climate; plot a 12-month change chart.

---

## Installation

1. Copy the `woodworkers-tools` folder into `/wp-content/plugins/`.  
2. In WordPress admin, go to **Plugins** → **Installed Plugins** and activate **Woodworkers Tools**.

---

## Usage

Place one of these shortcodes on any page or post:

| Calculator                    | Shortcode                       |
| ----------------------------- | ------------------------------- |
| Board-Foot Calculator         | `[board_foot_calculator]`       |
| Sheet-Goods Yield Calculator  | `[sheet_yield_calculator]`      |
| Wood Weight Estimator         | `[wood_weight_estimator]`       |
| Wood Movement Predictor       | `[wood_movement_predictor]`     |

Each widget will load its own CSS and JavaScript when rendered.

---

## Customization

- **Styles**  
  Edit or override `assets/css/woodtools.css` in your theme or via the Customizer.

- **Species data**  
  - _Weight Estimator_ and _Movement Predictor_ pull data from JSON files in `assets/data/`.  
  - To add a species, edit the corresponding JSON and include required fields.

- **Sheet-Yield presets**  
  Default sheet sizes live in `assets/js/sheetyield.js`. You can add more or let users define custom dimensions via the UI.


---

## Changelog

**0.2.7**  
- Sheet-Goods: added custom-sheet inputs.  
- Weight Estimator: unit toggle redesign; metric support.  
- Movement Predictor: EMC formula update; UI notes.

---

## License

GPL 2.0+  
© 2023–2025 Aske / The Woodworker’s Archive
