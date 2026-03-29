# Landscaper Collective — Website

Premium marketing website for Landscaper Collective, a national buying association for landscape companies.

## Stack

- Single `index.html` — all styles and scripts inline, no build step required
- Tailwind CSS via CDN
- Google Fonts: Playfair Display + Inter
- Vanilla JavaScript

## Local Development

**Requirements:** Node.js 18+

```bash
# Start the local dev server
node serve.mjs
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This site is a single static file — no build step, no dependencies to install.

**Netlify / Vercel / GitHub Pages:**
- Deploy the project root as-is
- Set `index.html` as the entry point (this is automatic on all three platforms)

**Manual hosting:**
- Upload `index.html` and `serve.mjs` to any static host or CDN
- `serve.mjs` is only needed for local development; it is not required in production

## Site Structure

| Section | Anchor |
|---|---|
| Sticky Navbar | — |
| Hero | `#` |
| About / What Is Landscaper Collective | `#about` |
| Member Benefits (6 value prop cards) | `#benefits` |
| Founders / Credibility | `#founders` |
| How It Works (3 steps) | `#how-it-works` |
| Vendor Network (tabbed grid) | `#vendors` |
| Why Join | `#why-join` |
| CTA Banner | — |
| Application Form | `#contact` |
| Footer | — |

## Customization

### Brand Colors
Defined in the `tailwind.config` block inside `index.html`:

```
Primary Green:  #1F3D2B
Gold:           #C8A96A
Background:     #F7F5F0
Text:           #111111
Charcoal:       #2E2E2E
```

### Adding Vendors
Vendor items are in the `#vendor-grid` section. Each item has a `data-category` attribute:
- `mowers` — Mowers & Equipment
- `irrigation` — Irrigation
- `robotics` — Robotics & Technology
- `power` — Power Equipment
- `supplies` — Supplies & Materials

### Form Integration
The form currently shows a success state on submit without sending data. To connect it to a backend:

1. Update the form's `action` attribute with your endpoint URL
2. Replace the `e.preventDefault()` block in the JavaScript with a `fetch()` POST call
3. Popular options: Formspree, Netlify Forms, a custom API endpoint

### Connecting a Real Domain
Update the `og:url` meta tag with your production URL once the domain is live.
