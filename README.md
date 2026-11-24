# Fast Track International — website (v3 redesign)

Static site: HTML + Bootstrap 5.3 + jQuery. Works on GitHub Pages as-is (all paths are relative).

## Structure
- `index.html` · `ielts.html` · `pte.html` · `tools.html` · `contact.html` · `portal.html`
- `css/style.css` — all styles; design tokens are CSS variables at the top
- `js/main.js` — all scripts (jQuery)
- `images/photos/` — client photos (resized), `images/illustrations/` — platform illustrations, `images/placeholders/` — images to replace

## Replace before launch (search for `TODO` / `PLACEHOLDER`)
| What | Where |
|---|---|
| Office address, phone, email | footer of every page, `contact.html` |
| WhatsApp number (`https://wa.me/` → `https://wa.me/8801XXXXXXXXX`) | floating button on every page, `contact.html` |
| Map location (currently "Dhaka, Bangladesh") | `contact.html` |
| Social profile URLs | footer of every page |
| Placeholder photos (`images/placeholders/*.svg`) | home (live class, news), `ielts.html`, `contact.html` |
| Platform illustrations → real screenshots | `images/illustrations/` (home, `tools.html`) |
| News articles and links | home "Latest news" (sample topics, links go to `#`) |
| Offer end date (`data-end`) | home, offer ticket |
| Forms (login, register, contact, subscribe) | front-end validation only — connect to a backend |
| PTE score report | sample numbers, labelled "SAMPLE" |
