# Explanatory Recommender Systems Prototype

This static prototype preserves the original USB and wine recommendation flows and adds a follow-up comparison between:

- **Outcome flexibility**: users can ask to see other recommendations, but the system's interpretation remains unchanged.
- **Process recourse**: users can correct the system's interpretation, and the explanation plus recommendations update.

## Files
- `index.html` — main prototype
- `style.css` — styling
- `app.js` — logic and condition handling

## URL parameters
You can deep-link to a condition using query parameters:

- `product=wine` or `product=usb`
- `condition=explanation|steering|recourse|both|outcome|process`

Examples:
- `index.html?product=wine&condition=process`
- `index.html?product=usb&condition=both`

## Included conditions
### Original study conditions
- explanation only
- steering control
- recourse
- steering + recourse

### Follow-up prototype
- outcome flexibility
- process recourse

## Notes
- This is a **static front-end prototype** for piloting and handoff.
- It logs participant interactions client-side and allows JSON export.
- No backend or database is included.
