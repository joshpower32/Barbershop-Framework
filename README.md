# The Barber Co. — Premium Barbershop Framework

A modern, professional barbershop website template with **online booking**, **service showcase**, **barber profiles**, and a **portfolio gallery**. Pure HTML/CSS/JS — no build step, hosts free on GitHub Pages or Netlify.

Modern dark aesthetic inspired by contemporary barbershop design, with warm gold accents and mobile-first responsive layout.

## Features

- **Hero section** with call-to-action
- **Gallery** with arrow navigation and dot indicators (auto-loads photos from Pexels)
- **Services grid** with pricing and descriptions
- **Barber profiles** with bios and profile photos
- **Online booking form** with date/time/service selection, wired to Web3Forms for appointment delivery
- **Contact & hours** section
- **Mobile responsive** design with navigation toggle
- **Fully accessible** — ARIA labels, keyboard navigation, semantic HTML

## Personalising for a client

1. **Brand & colours** — edit `:root` tokens at the top of `styles.css` (change `--brand` to client's accent colour, adjust the dark palette as needed).
2. **Business info** — update throughout `index.html`:
   - Brand name ("The Barber Co." → client's shop name)
   - Hours (Monday–Sunday times)
   - Address and contact info
   - Phone number and email
3. **Services** — edit the services grid in `index.html` with actual services and pricing.
4. **Barbers** — edit the `BARBERS` array in `app.js` (name, title, bio, portrait photo query for Pexels).
5. **Gallery photos** — currently loads from Pexels using generic queries. For real photos, edit `CONFIG.galleryQueries` in `app.js` to match your shop's style, or provide local image paths (e.g., `assets/fade-1.jpg`).

## Local preview

```bash
python3 -m http.server 5520   # then open http://localhost:5520
```

## Booking delivery

The booking form is wired to **Web3Forms** so appointment requests email the client automatically.

1. Get a FREE key at [web3forms.com](https://web3forms.com) using the **client's email**.
2. Paste it into `CONFIG.web3formsKey` in `app.js`.
3. Set `CONFIG.ownerEmail` and `CONFIG.businessName` to the client's details.
4. Test a booking from the live site and confirm the `📅 NEW BOOKING` email arrives.

Free tier = 250 submissions/month per key.

**Fallback:** If no Web3Forms key is set, the form opens the client's email app (mailto) so no booking is lost.

## Hosting

1. Push to GitHub (free demo).
2. Deploy to **Netlify** or **Cloudflare Pages** (both free, custom domain support).
3. Point custom domain nameservers to Netlify/Cloudflare.

## Notes

- Gallery photos are auto-fetched from Pexels on page load and cached in `localStorage`.
- Barber profile photos are also loaded from Pexels; customize the `query` field in `BARBERS` for each barber.
- This template works best for local barbershops, personal grooming services, and salons.
- All API keys (Pexels) are demo keys; clients should get their own at [pexels.com/api](https://www.pexels.com/api/).

## Selling this template

This is a complete, sellable template ready for barbershops, salons, and grooming professionals. The booking flow and service showcase make it ideal for appointment-based businesses.
