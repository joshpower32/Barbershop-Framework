/* =====================================================================
   The Barber Co. — Barbershop Framework
   Gallery navigation, barber profiles, and booking form integration
   ===================================================================== */

const CONFIG = {
  galleryQueries: ["barbershop haircut", "barber fade", "haircut style", "barber shop", "mens haircut", "barber grooming"],
  heroBgQuery: "modern barbershop",
  web3formsKey: "YOUR_WEB3FORMS_ACCESS_KEY",
  ownerEmail: "hello@thebarberco.ca",
  businessName: "The Barber Co.",
};

const BARBERS = [
  { id: "marcus", name: "Marcus", title: "Senior Barber", bio: "15+ years experience, specializes in fades and lineups.", query: "man portrait beard" },
  { id: "david", name: "David", title: "Barber", bio: "Expert with classic cuts and hot shaves.", query: "man portrait professional" },
  { id: "james", name: "James", title: "Barber", bio: "Creative with modern styles and beard design.", query: "man portrait styled" },
];

// --- Demo photos: pinned Pexels shots, keyed by query -------------------
// Direct image URLs load with the page — no API call, no key, no pop-in.
// To change a photo: browse pexels.com, copy the image address, paste here.
const PEXELS_PHOTOS = {
  "modern barbershop": { u: "https://images.pexels.com/photos/7518739/pexels-photo-7518739.jpeg", p: "Pavel Danilyuk" },
  "barbershop haircut": { u: "https://images.pexels.com/photos/7447152/pexels-photo-7447152.jpeg", p: "Gustavo Fring" },
  "barber fade": { u: "https://images.pexels.com/photos/34702982/pexels-photo-34702982.jpeg", p: "Daniel Cosma" },
  "haircut style": { u: "https://images.pexels.com/photos/37533244/pexels-photo-37533244.jpeg", p: "Gizem toprak" },
  "barber shop": { u: "https://images.pexels.com/photos/37764947/pexels-photo-37764947.jpeg", p: "wal_ 172619" },
  "mens haircut": { u: "https://images.pexels.com/photos/12464843/pexels-photo-12464843.jpeg", p: "izzet çakallı" },
  "barber grooming": { u: "https://images.pexels.com/photos/7697443/pexels-photo-7697443.jpeg", p: "RDNE Stock project" },
  "man portrait beard": { u: "https://images.pexels.com/photos/10935029/pexels-photo-10935029.jpeg", p: "R. Fera" },
  "man portrait professional": { u: "https://images.pexels.com/photos/26820703/pexels-photo-26820703.jpeg", p: "Wanas Rosa" },
  "man portrait styled": { u: "https://images.pexels.com/photos/33280219/pexels-photo-33280219.jpeg", p: "Mohammad Gharib" },
};
// Size an image via Pexels CDN params (w = width; pxCrop also crops to w×h)
const px = (u, w) => `${u}?auto=compress&cs=tinysrgb&w=${w}`;
const pxCrop = (u, w, h) => `${u}?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const $ = (id) => document.getElementById(id);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// --- Gallery state and control ---
// Gallery photos come straight from the pinned PEXELS_PHOTOS map — instant.
const galleryPhotos = CONFIG.galleryQueries
  .map((q) => PEXELS_PHOTOS[q])
  .filter(Boolean)
  .map((ph) => pxCrop(ph.u, 1200, 627));
let currentGalleryIndex = 0;

function renderGallery() {
  const grid = $("galleryGrid");
  grid.innerHTML = galleryPhotos.map((url, i) => `<img src="${esc(url)}" alt="Haircut example ${i + 1}" ${i === 0 ? "" : 'loading="lazy"'}>`).join("");
  updateGalleryScroll();
}

function updateGalleryScroll() {
  const grid = $("galleryGrid");
  grid.style.transform = `translateX(${-currentGalleryIndex * 100}%)`;
}

function renderGalleryDots() {
  const dots = $("galleryDots");
  dots.innerHTML = galleryPhotos.map((_, i) =>
    `<button class="gallery-dot ${i === currentGalleryIndex ? "active" : ""}" onclick="setGalleryIndex(${i})" aria-label="Photo ${i + 1}"></button>`
  ).join("");
}

function setGalleryIndex(idx) {
  currentGalleryIndex = idx;
  updateGalleryScroll();
  renderGalleryDots();
}

function galleryPrev() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
  updateGalleryScroll();
  renderGalleryDots();
}

function galleryNext() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryPhotos.length;
  updateGalleryScroll();
  renderGalleryDots();
}

$("galleryPrev").addEventListener("click", galleryPrev);
$("galleryNext").addEventListener("click", galleryNext);

// Keyboard navigation for gallery
document.addEventListener("keydown", (e) => {
  if (window.location.hash === "#gallery") {
    if (e.key === "ArrowLeft") galleryPrev();
    if (e.key === "ArrowRight") galleryNext();
  }
});

// --- Barber profiles ---
function renderBarbers() {
  const grid = $("barbersGrid");
  grid.innerHTML = BARBERS.map((b) => {
    const ph = PEXELS_PHOTOS[b.query];
    const img = b.image || (ph ? px(ph.u, 500) : null);
    return `
      <div class="barber-card">
        ${img ? `<img src="${esc(img)}" alt="${esc(b.name)}" class="barber-img" loading="lazy">` : `<div class="barber-img" style="background:#333;display:flex;align-items:center;justify-content:center;"><span style="font-size:2rem;color:#666;">✂</span></div>`}
        <h3>${esc(b.name)}</h3>
        <p style="color:#d4a574;font-weight:600;font-size:.9rem;margin:4px 0;">${esc(b.title)}</p>
        <p>${esc(b.bio)}</p>
      </div>`;
  }).join("");
}

// --- Booking form ---
const bookingForm = $("bookingForm");
const bookNote = $("bookNote");
const KEY_PLACEHOLDER = "YOUR_WEB3FORMS_ACCESS_KEY";

async function submitBooking(formData) {
  const firstName = String(formData.get("name") || "there").split(" ")[0];
  const btn = bookingForm.querySelector('button[type="submit"]');

  if (!CONFIG.web3formsKey || CONFIG.web3formsKey === KEY_PLACEHOLDER) {
    const subject = encodeURIComponent(`Booking request — ${formData.get("name") || ""}`);
    const body = encodeURIComponent([...formData.entries()].map(([k, v]) => `${k}: ${v}`).join("\n"));
    window.location.href = `mailto:${CONFIG.ownerEmail}?subject=${subject}&body=${body}`;
    toast(`Opening your email app to send your booking request…`);
    return;
  }

  const fd = new FormData();
  fd.append("access_key", CONFIG.web3formsKey);
  fd.append("subject", `📅 NEW BOOKING — ${formData.get("name") || "website"}`);
  fd.append("from_name", CONFIG.businessName);
  fd.append("Name", formData.get("name") || "");
  fd.append("Phone", formData.get("phone") || "");
  fd.append("Email", formData.get("email") || "");
  fd.append("Service", formData.get("service") || "");
  fd.append("Barber", formData.get("barber") || "");
  fd.append("Date", formData.get("date") || "");
  fd.append("Time", formData.get("time") || "");
  fd.append("Notes", formData.get("notes") || "");

  btn.disabled = true;
  const orig = btn.textContent;
  btn.textContent = "Sending…";

  try {
    const res = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: fd });
    const data = await res.json();
    if (res.ok && data.success) {
      bookingForm.reset();
      toast(`Thanks ${firstName}! Your booking request has been sent. We'll confirm by email shortly.`);
      bookNote.textContent = "Sent ✓ — we'll be in touch within 24 hours.";
    } else {
      throw new Error(data.message || "Send failed");
    }
  } catch (_) {
    toast(`Couldn't send booking — please call (905) 555-CUTS or email ${CONFIG.ownerEmail}.`);
    bookNote.textContent = `Something went wrong. Please call (905) 555-CUTS or email ${CONFIG.ownerEmail}.`;
  } finally {
    btn.disabled = false;
    btn.textContent = orig;
  }
}

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitBooking(new FormData(bookingForm));
});

// --- Mobile nav toggle ---
const navToggle = $("navToggle");
const navLinks = $("navLinks");
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", false);
}));
document.addEventListener("click", (e) => {
  if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

// --- Toast notifications ---
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => (t.hidden = true), 300);
  }, 3500);
}

// --- Hero background ---
function loadHeroBg() {
  const ph = PEXELS_PHOTOS[CONFIG.heroBgQuery];
  if (ph) $("heroBg").style.backgroundImage = `url("${px(ph.u, 1600)}")`;
}

// --- Init ---
renderGallery();
renderGalleryDots();
renderBarbers();
loadHeroBg();
