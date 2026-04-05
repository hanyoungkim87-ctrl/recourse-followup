# Explanatory Recommender Systems Prototype (v2)

This package preserves the original USB and wine study interfaces and adds two
follow-up recourse conditions:

- Expressive recourse
- Corrective recourse

## Files
- `index.html` – entry point
- `style.css` – styles
- `app.js` – prototype logic
- `README.md` – this file

## URL parameters
You can deep-link directly to a product and condition using query params.

Examples:
- `?product=wine&condition=corrective`
- `?product=usb&condition=expressive`
- `?product=usb&condition=both`

## Notes
- Original conditions kept:
  - explanation
  - steering
  - recourse
  - both
- Follow-up conditions added:
  - expressive
  - corrective

The prototype is front-end only. It logs interactions in memory and lets you
download a session JSON at the end.
