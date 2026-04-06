# RS follow-up study demo (profile-based recourse)

This package preserves the original inference-first recommender flow:

1. One question per page
2. A results modal that first shows **How we understood you**
3. Recommendations shown underneath
4. Post-recommendation recourse varies by condition

## Conditions

Use the URL parameter `cond`:

- `cond=none` → No recourse
- `cond=expressive` → Expressive recourse
- `cond=corrective` → Corrective recourse

Use `product=wine` or `product=usb`.

Example:
`app.html?product=wine&cond=corrective`

## Run locally

Open `app.html` in a browser, or run:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/app.html
```
