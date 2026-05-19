function hitung() {
  const p    = parseFloat(document.getElementById('p').value);
  const l    = parseFloat(document.getElementById('l').value);
  const t    = parseFloat(document.getElementById('t').value);
  const mod  = parseInt(document.getElementById('proyek').value);
  const diag = document.getElementById('diag').value;

  if (!p || !l || !t) {
    alert('Isi semua dimensi terlebih dahulu!');
    return;
  }

  /* ─ Kalkulasi Bay ─ */
  const bayP       = Math.ceil((p * 100) / mod);
  const bayL       = Math.ceil((l * 100) / mod);
  const titikTiang = (bayP + 1) * (bayL + 1);

  /* ─ Kalkulasi Level / Standard ─
     Ukuran tersedia: 250, 200, 150, 100, 50 cm
     Strategi: greedy terpanjang dulu, sisa ditangani jackbase (jika aktif)
  ─ */
  const ukuranStd = [250, 200, 150, 100, 50]; // cm, urutan prioritas
  const jumlahStd = [0, 0, 0, 0, 0];          // counter per ukuran
  let sSisa = t * 100;                          // tinggi dalam cm

  for (let i = 0; i < ukuranStd.length; i++) {
    if (sSisa <= 0) break;
    jumlahStd[i] = Math.floor(sSisa / ukuranStd[i]);
    sSisa = sSisa % ukuranStd[i];
  }

  // sSisa sekarang = sisa tinggi yang tidak terpenuhi standard (< 50cm)
  const sisaCm   = sSisa;
  const levels   = jumlahStd.reduce((a, b) => a + b, 0);
  const pakaiJackbase = document.getElementById('pakai_jackbase').checked;

  /* ─ Komponen Material ─ */
  const nStd     = jumlahStd.map(j => j * titikTiang); // per ukuran
  const nLedger  = ((bayP * (bayL + 1)) + (bayL * (bayP + 1))) * levels;
  const nJack    = pakaiJackbase ? titikTiang : 0;
  const nCatwalk = (bayP * bayL) * 2;
  const nDiag    = (diag === 'luar') ? (bayP + bayL) * 2 : (bayP * bayL);

  /* ─ Estimasi Berat ─ */
  const beratStd = nStd.reduce((sum, qty, i) => {
    // Berat per batang estimasi proporsional terhadap panjang (std 250cm = 12.8kg)
    const kgPerBatang = (ukuranStd[i] / 250) * 12.8;
    return sum + qty * kgPerBatang;
  }, 0);

  const totalBerat = (
    (beratStd + nLedger * 4.2 + nJack * 3.2 + nCatwalk * 7.2 + nDiag * 4.6) / 1000
  ).toFixed(2);

  /* ─ Tampilkan Ringkasan ─ */
  document.getElementById('res_tiang').innerText  = titikTiang;
  document.getElementById('res_bay').innerText    = bayP + '×' + bayL;
  document.getElementById('res_tinggi').innerText = t;
  document.getElementById('res_level').innerText  = levels;

  /* ─ Tampilkan Material ─ */
  // const ikonStd  = ['📏', '📏', '📏', '📏', '📏'];
  const labelStd = ['Standard 2.5m', 'Standard 2.0m', 'Standard 1.5m', 'Standard 1.0m', 'Standard 0.5m'];

  const mats = [
    ...ukuranStd.map((u, i) => ({ name: labelStd[i], qty: nStd[i] })),
    { name: 'Ledger ' + mod + 'cm',  qty: nLedger  },
    { name: 'Diagonal brace',          qty: nDiag    },
    { name: 'Catwalk ' + mod + 'cm',  qty: nCatwalk },
    ...(pakaiJackbase ? [{ name: 'Jackbase 60cm', qty: nJack }] : [])
  ];

  document.getElementById('mat_grid').innerHTML = mats
    .filter(m => m.qty > 0)
    .map(m => `
      <div class="mat-card">
        <div class="mat-name">${m.name}</div>
        <div class="mat-qty">${m.qty.toLocaleString('id-ID')}</div>
        <span class="mat-badge">pcs</span>
      </div>`)
    .join('');

  /* ─ Logika Kendaraan Angkut ─
     Pertimbangan:
     1. Berat total material
     2. Panjang material terpanjang = Standard 2.5m → butuh bak min. 3m
        (pick up bak pendek maks 2.4m → tidak bisa angkut standard 2.5m)
     3. Ritase = berapa kali kendaraan bolak-balik
  ─ */
  const beratNum = parseFloat(totalBerat);
  const adaStd25 = nStd[0] > 0; // ada standard 2.5m → butuh bak panjang (min 3m)

  // Tabel armada: { nama, kapasitasTon, bakPanjang (true = bisa angkut std 2.5m), icon }
  const armada = [
    { nama: 'Pick up bak panjang', kapasitas: 1.0,  bakPanjang: true},
    { nama: 'Colt diesel L300',    kapasitas: 2.5,  bakPanjang: true},
    { nama: 'Truk engkel',         kapasitas: 6.0,  bakPanjang: true},
    { nama: 'Truk fuso',           kapasitas: 10.0, bakPanjang: true},
    { nama: 'Truk tronton',        kapasitas: 20.0, bakPanjang: true},
  ];

  // Pilih kendaraan paling efisien:
  // - Jika ada std 2.5m, hanya pilih yang bakPanjang = true (semua di sini)
  // - Pilih yang kapasitasnya pas (tidak terlalu kecil, tidak terlalu besar)
  let pilihan = armada.find(a => {
    if (adaStd25 && !a.bakPanjang) return false;
    return a.kapasitas >= beratNum;
  });

  // Jika berat melebihi semua armada, pakai tronton + hitung ritase
  if (!pilihan) pilihan = armada[armada.length - 1];

  const ritase = Math.ceil(beratNum / pilihan.kapasitas);
  const efisiensi = ritase === 1
    ? 'Cukup 1 kali pengiriman.'
    : `Butuh <b>${ritase}x ritase</b> dengan kendaraan yang sama.`;

  // Rekomendasi alternatif lebih besar jika ritase > 1
  let alternatif = '';
  if (ritase > 1) {
    const alt = armada.find(a => a.kapasitas >= beratNum);
    if (alt && alt.nama !== pilihan.nama) {
      alternatif = ` Atau upgrade ke <b>${alt.nama}</b> untuk 1x angkut.`;
    }
  }

  const analyses = [
    {
      // icon: '📐',
      label: 'Modul ledger',
      val: `${mod}cm — jarak antar tiang optimal untuk kapasitas beban struktur.`
    },
    {
      // icon: '📦',
      label: 'Susunan tinggi',
      val: (() => {
        const bagian = ukuranStd
          .map((u, i) => jumlahStd[i] > 0 ? `${jumlahStd[i]}× std ${u/100}m` : null)
          .filter(Boolean)
          .join(' + ');
        const sisaInfo = sisaCm > 0
          ? ` Sisa ${sisaCm}cm${pakaiJackbase ? ' — ditangani jackbase.' : ' — tidak dipasang jackbase.'}`
          : ' Tinggi terpenuhi presisi.';
        return bagian + '.' + sisaInfo;
      })()
    },
    {
      // icon: '⚖️',
      label: 'Estimasi berat total',
      val: `${totalBerat} ton material keseluruhan.`
    },
    {
      // icon: pilihan.icon,
      label: 'Kendaraan angkut',
      val: `${pilihan.nama} (maks. ${pilihan.kapasitas} ton). ${efisiensi}${alternatif}`
    }
  ];

  document.getElementById('analysis_grid').innerHTML = analyses
    .map(a => `
      <div class="analysis-card">
        <div class="analysis-label">${a.label}</div>
        <div class="analysis-val">${a.val}</div>
      </div>`)
    .join('');

  /* ─ WA Link ─ */
  const waText = encodeURIComponent(
    `Halo Sales Tangga Mas, saya ingin konsultasi material:\n\n` +
    ` Dimensi: ${p}m × ${l}m × ${t}m\n` +
    ` Modul: ${mod}cm\n\n` +
    ukuranStd.map((u, i) => nStd[i] > 0 ? `Standard ${u/100}m    : ${nStd[i]} pcs` : null).filter(Boolean).join('\n') + '\n' +
    `Ledger ${mod}cm   : ${nLedger} pcs\n` +
    `Diagonal brace   : ${nDiag} pcs\n` +
    `Catwalk ${mod}cm  : ${nCatwalk} pcs\n` +
    (pakaiJackbase ? `Jackbase 60cm    : ${nJack} pcs\n` : '') +
    `\n Estimasi berat: ${totalBerat} ton\n` +
    `Kendaraan: ${pilihan.nama} (${ritase}x ritase)`
  );
  document.getElementById('wa_link').href = `https://wa.me/628123456789?text=${waText}`;

  /* ─ Tampilkan & Scroll ─
     Deteksi mode: landing page (ada #result-content) vs standalone (ada #result)
  ─ */
  const resultContent = document.getElementById('result-content');
  const resultEmpty   = document.getElementById('result-empty');

  if (resultContent) {
    // MODE LANDING PAGE
    if (resultEmpty) resultEmpty.style.display = 'none';
    resultContent.style.display = 'block';
    document.getElementById('kalkulator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // MODE STANDALONE
    const resultEl = document.getElementById('result');
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.style.animation = 'none';
      void resultEl.offsetHeight;
      resultEl.style.animation = '';
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}