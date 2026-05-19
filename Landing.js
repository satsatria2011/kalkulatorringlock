/* ═══════════════════════════════════════════
   RINGLOCK INDONESIA — LANDING PAGE SCRIPTS
═══════════════════════════════════════════ */

/* ── Navbar scroll shadow ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile burger menu ── */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMenu() {
  mobileMenu.classList.remove('open');
}

/* ── Smooth scroll for nav links (offset for fixed nav) ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});

/* ── Intersection Observer — fade-in on scroll ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-animate]').forEach(el => {
  el.classList.add('will-animate');
  observer.observe(el);
});

/* ── Kontak form → WA ── */
function kirimPesan() {
  const nama    = document.querySelector('.kontak-form input[type="text"]')?.value?.trim();
  const nomor   = document.querySelector('.kontak-form input[placeholder^="+62"]')?.value?.trim();
  const pesan   = document.querySelector('.kontak-form textarea')?.value?.trim();

  if (!nama || !nomor || !pesan) {
    alert('Harap isi semua field terlebih dahulu!');
    return;
  }

  const text = encodeURIComponent(
    `Halo Ringlock Indonesia! 👋\n\n` +
    `Nama   : ${nama}\n` +
    `No. WA : ${nomor}\n\n` +
    `Pesan  :\n${pesan}`
  );

  window.open(`https://wa.me/628123456789?text=${text}`, '_blank');
}

/* ═══════════════════════════════════════════
   KALKULATOR (override warna ke biru)
   script.js diload setelah landing.js
═══════════════════════════════════════════ */

// Override fungsi hitung agar hasil tampil di panel kanan landing page
// dan metrik menggunakan warna biru (bukan merah)
window.addEventListener('load', () => {
  // Pastikan script.js sudah loaded, lalu patch fungsi hitung
  const originalHitung = window.hitung;
  if (!originalHitung) return;

  window.hitung = function() {
    originalHitung();
    // Setelah hitung(), tampilkan panel hasil di landing page
    const resultContent = document.getElementById('result-content');
    const resultEmpty   = document.getElementById('result-empty');
    if (resultContent && resultEmpty) {
      resultEmpty.style.display   = 'none';
      resultContent.style.display = 'block';
    }
    // Salin konten hasil dari #result ke #result-content jika berbeda elemen
  };
});