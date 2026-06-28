/* =====================================================================
   The Barber Co. — Barbershop Framework
   Gallery navigation, barber profiles, and booking form integration
   ===================================================================== */

const CONFIG = {
  pexelsKey: "4SuTxTJkprUsJAP1CZoSkd412wKx4EuXt7xfK5HzZf9DreiCe8Wv0twm",
  galleryQueries: ["barbershop haircut", "barber fade", "haircut style", "barber shop", "mens haircut", "barber grooming"],
  heroBgQuery: "modern barbershop",
  web3formsKey: "YOUR_WEB3FORMS_ACCESS_KEY",
  ownerEmail: "hello@thebarberc o.ca",
  businessName: "The Barber Co.",
};

const BARBERS = [
  { id: "marcus", name: "Marcus", title: "Senior Barber", bio: "15+ years experience, specializes in fades and lineups.", query: "man portrait beard" },
  { id: "david", name: "David", title: "Barber", bio: "Expert with classic cuts and hot shaves.", query: "man portrait professional" },
  { id: "james", name: "James", title: "Barber", bio: "Creative with modern styles and beard design.", query: "man portrait styled" },
];

const $ = (id) => document.getElementById(id);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// --- Gallery state and control ---
let galleryPhotos = [];
let currentGalleryIndex = 0;
const IMG_CACHE_KEY = "barbershop_imgcache";
let imgCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}");

// Fetch gallery images from Pexels
async function loadGalleryImages() {
  const queries = CONFIG.galleryQueries;
  let allPhotos = [];

  try {
    for (let i = 0; i < queries.length; i++) {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(queries[i])}&per_page=1&orientation=landscape`,
        { headers: { Authorization: CONFIG.pexelsKey } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        allPhotos.push(data.photos[0]);
      }
    }
    galleryPhotos = allPhotos;
    renderGallery();
    renderGalleryDots();
  } catch (_) {
    $("galleryGrid").innerHTML = "<p style='grid-column:1/-1;text-align:center;color:#a0a0a0;padding:40px;'>Unable to load gallery. Check your API key.</p>";
  }
}

function renderGallery() {
  const grid = $("galleryGrid");
  grid.innerHTML = galleryPhotos.map((p, i) => `<img src="${esc(p.src.landscape)}" alt="Haircut ${i + 1}" loading="lazy">`).join("");
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

// --- Load barber profiles ---
async function loadBarberImages() {
  for (const barber of BARBERS) {
    const cached = imgCache[barber.id]?.url;
    if (cached) continue;
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(barber.query)}&per_page=1&orientation=portrait`,
        { headers: { Authorization: CONFIG.pexelsKey } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        imgCache[barber.id] = { url: data.photos[0].src.medium };
        localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imgCache));
      }
    } catch (_) {}
  }
  renderBarbers();
}

function renderBarbers() {
  const grid = $("barbersGrid");
  grid.innerHTML = BARBERS.map((b) => {
    const img = imgCache[b.id]?.url || null;
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

// --- Load hero background ---
async function loadHeroBg() {
  const el = $("heroBg");
  const cacheKey = "__hero";
  const cached = imgCache[cacheKey]?.url;
  if (cached) { el.style.backgroundImage = `url("${cached}")`; return; }
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(CONFIG.heroBgQuery)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: CONFIG.pexelsKey } }
    );
    if (!res.ok) return;
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      const url = data.photos[0].src.landscape;
      imgCache[cacheKey] = { url };
      localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imgCache));
      el.style.backgroundImage = `url("${url}")`;
    }
  } catch (_) {}
}

// --- Init ---
loadGalleryImages();
loadBarberImages();
loadHeroBg();
