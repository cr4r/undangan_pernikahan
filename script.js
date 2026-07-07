// API requests are now handled by api.js


let isPlaying = false;
let targetDate = new Date().getTime();

const Toast = Swal.mixin({
  toast: true,
  position: "bottom",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

function showToast(message, type = 'success') {
  Toast.fire({
    icon: type,
    title: message
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Load data from Google Apps Script
  apiRequest('getPublicData', {}, initPage);
  document.getElementById('year').textContent = new Date().getFullYear();

  // RSVP Attendance Toggle
  document.getElementById('rsvp-attendance').addEventListener('change', function () {
    const guestsGroup = document.getElementById('guests-group');
    if (this.value === 'Hadir') {
      guestsGroup.style.display = 'block';
    } else {
      guestsGroup.style.display = 'none';
    }
  });



});

// Carousel Logic
const carouselImages = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80'
];
let currentSlide = 0;

function initCarousel() {
  const container = document.getElementById('hero-carousel');
  carouselImages.forEach((src, idx) => {
    const div = document.createElement('div');
    div.className = 'carousel-slide' + (idx === 0 ? ' active' : '');
    div.style.backgroundImage = `url(${src})`;
    container.appendChild(div);
  });

  setInterval(() => {
    const slides = document.querySelectorAll('.carousel-slide');
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000);
}

function initPage(data) {
  const s = data.settings;

  // Populate Names
  document.getElementById('bride-name-hero').textContent = s.BrideName;
  document.getElementById('groom-name-hero').textContent = s.GroomName;
  document.getElementById('bride-name').textContent = s.BrideName;
  document.getElementById('groom-name').textContent = s.GroomName;
  document.getElementById('bride-desc').textContent = s.BrideDesc || 'Putri dari ...';
  document.getElementById('groom-desc').textContent = s.GroomDesc || 'Putra dari ...';
  document.getElementById('footer-names').textContent = s.BrideName + ' & ' + s.GroomName;

  // Populate Dates
  const akad = new Date(s.AkadDate);
  const resepsi = new Date(s.ResepsiDate);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('hero-date').textContent = resepsi.toLocaleDateString('id-ID', options);
  document.getElementById('akad-date').textContent = akad.toLocaleDateString('id-ID', options);
  document.getElementById('akad-time').textContent = akad.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB - Selesai';
  document.getElementById('resepsi-date').textContent = resepsi.toLocaleDateString('id-ID', options);
  document.getElementById('resepsi-time').textContent = resepsi.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB - Selesai';

  targetDate = resepsi.getTime();
  startCountdown();

  document.getElementById('greeting-text').textContent = s.Greeting;
  document.getElementById('maps-link').href = s.MapsLink;

  // Map Image
  const mapContainer = document.getElementById('map-container');
  if (s.MapImage && s.MapImage.trim() !== '') {
    mapContainer.innerHTML = `<img src="${s.MapImage}" alt="Denah Lokasi" id="actual-map-img" style="width:100%; border-radius:10px;">`;
  } else {
    mapContainer.innerHTML = `<p style="padding-top:100px;">Klik tombol di bawah untuk melihat peta</p>`;
  }

  // Bank / Gift Settings
  if (s.BankAccounts) {
    try {
      const banks = JSON.parse(s.BankAccounts);
      const listContainer = document.getElementById('gift-list');
      listContainer.innerHTML = '';

      // Define global banks array for modal access
      window.giftBanks = banks;

      banks.forEach((b, idx) => {
        let icon = 'fa-credit-card';
        let bName = b.bank.toLowerCase();
        if (bName.includes('gopay') || bName.includes('ovo') || bName.includes('dana') || bName.includes('shopee') || bName.includes('wallet')) {
          icon = 'fa-wallet';
        } else if (bName.includes('paypal')) {
          icon = 'fa-paypal';
        }
        let iconHtml = `<i class="fas ${icon}"></i>`;
        if (b.iconUrl) {
          iconHtml = `<img src="${b.iconUrl}" alt="${bName}" style="width:100%; height:100%; object-fit:contain;">`;
        }

        listContainer.innerHTML += `
            <div class="gift-thumbnail" onclick="openGiftModal(${idx}, '${icon}')">
              <div class="gift-icon-thumb" style="${b.iconUrl ? 'width:50px; height:50px; display:flex; align-items:center; justify-content:center;' : ''}">${iconHtml}</div>
              <h4>${escapeHTML(b.bank)}</h4>
            </div>
          `;
      });
    } catch (e) {
      console.error("Gagal memproses data bank", e);
    }
  }

  // Audio
  let musicUrl = s.MusicUrl;
  if (musicUrl && musicUrl.includes('drive.google.com/uc')) {
    try {
      const urlParams = new URLSearchParams(musicUrl.split('?')[1]);
      const fileId = urlParams.get('id');
      if (fileId) {
        window.apiRequest('getAudioData', { fileId: fileId }, function (res) {
          const audio = document.getElementById('bg-music');
          const isInvitationOpen = document.getElementById('home').style.display === 'none';

          if (res.success && res.base64) {
            audio.src = 'data:' + res.mimeType + ';base64,' + res.base64;
          } else {
            audio.src = musicUrl;
          }

          if (isInvitationOpen) {
            audio.play().catch(e => console.log('Audio play failed', e));
            document.getElementById('audio-btn').style.display = 'flex';
            document.getElementById('audio-btn').innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
          }
        });
      } else {
        document.getElementById('bg-music').src = musicUrl;
      }
    } catch (e) {
      document.getElementById('bg-music').src = musicUrl;
    }
  } else {
    document.getElementById('bg-music').src = musicUrl;
  }

  // Gallery (Strictly 6 Images + 1 Dummy Video)
  const galleryGrid = document.getElementById('gallery-grid');
  galleryGrid.innerHTML = '';
  
  let images = [];
  if (data.gallery && data.gallery.length > 0) {
    images = data.gallery.filter(item => item.type === 'photo').map(item => item.url);
  }
  
  // Dummy high-quality wedding images for fallback
  const dummyImages = [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ];

  // Fill up to 6 images
  for (let i = 0; i < 6; i++) {
    const src = images[i] ? images[i] : dummyImages[i];
    galleryGrid.innerHTML += `
      <div class="gallery-item" data-aos="zoom-in" data-aos-delay="${i * 100}">
        <img src="${src}" alt="Gallery Image ${i+1}">
      </div>
    `;
  }
  
  // Always append 1 Dummy Video (Cinematic Wedding Video Placeholder)
  galleryGrid.innerHTML += `
    <div class="gallery-item video-item" data-aos="zoom-in" data-aos-delay="600">
      <video src="https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-kissing-in-a-forest-40916-large.mp4" controls preload="metadata" poster="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"></video>
    </div>
  `;

  // RSVPs
  const wishesList = document.getElementById('wishes-list');
  if (data.rsvps && data.rsvps.length > 0) {
    wishesList.innerHTML = '';
    data.rsvps.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wish-card modern-wish';

      let dateStr = '';
      if (item.timestamp) {
        const dt = new Date(item.timestamp);
        dateStr = dt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }

      const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';
      let badgeHtml = '';
      if (item.attendance === 'Hadir' || item.attendance === 'Tidak Hadir') {
        const badgeClass = item.attendance === 'Hadir' ? 'badge-hadir' : 'badge-absen';
        const badgeIcon = item.attendance === 'Hadir' ? 'fa-check-circle' : 'fa-times-circle';
        badgeHtml = `<span class="wish-badge ${badgeClass}"><i class="fas ${badgeIcon}"></i> ${item.attendance}</span>`;
      }

      div.innerHTML = `
          <div class="wish-avatar">${initial}</div>
          <div class="wish-content">
            <h4>${escapeHTML(item.name)} ${badgeHtml}</h4>
            ${dateStr ? `<p class="wish-date"><i class="far fa-clock"></i> ${dateStr}</p>` : ''}
            <p class="wish-text">"${escapeHTML(item.message)}"</p>
          </div>
        `;
      wishesList.appendChild(div);
    });
  } else {
    wishesList.innerHTML = '<p class="text-center" style="color:#777; font-style:italic;">Jadilah yang pertama memberikan ucapan.</p>';
  }

  // Initialize Carousel
  initCarousel();

  // Hide loader
  document.getElementById('loader').style.display = 'none';
}

function openInvitation() {
  document.getElementById('home').classList.add('opened');
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('main-content').classList.add('fade-in');
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'block';
  window.scrollTo(0, 0);

  // Play music
  const audio = document.getElementById('bg-music');
  audio.play().then(() => {
    document.getElementById('audio-btn').style.display = 'flex';
    document.getElementById('auto-scroll-btn').style.display = 'flex';
    document.getElementById('audio-btn').innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  }).catch(err => console.log('Audio play failed', err));

  // Init AOS Animations
  setTimeout(() => {
    AOS.init({
      duration: 500,
      once: true,
      offset: 50
    });
  }, 100);
}

function toggleAudio() {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('audio-btn');
  if (isPlaying) {
    audio.pause();
    btn.innerHTML = '<i class="fas fa-music"></i>';
  } else {
    audio.play();
    btn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

// Auto Scroll Feature
let autoScrollInterval = null;
let isAutoScrolling = false;

function toggleAutoScroll() {
  if (isAutoScrolling) stopAutoScroll();
  else startAutoScroll();
}

function startAutoScroll() {
  isAutoScrolling = true;
  document.getElementById('auto-scroll-btn').innerHTML = '<i class="fas fa-pause"></i>';
  autoScrollInterval = setInterval(() => {
    window.scrollBy(0, 1);
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
      stopAutoScroll();
    }
  }, 25);
}

function stopAutoScroll() {
  isAutoScrolling = false;
  document.getElementById('auto-scroll-btn').innerHTML = '<i class="fas fa-chevron-down"></i>';
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

// Pause auto-scroll on manual interaction
window.addEventListener('wheel', () => { if (isAutoScrolling) stopAutoScroll(); }, { passive: true });
window.addEventListener('touchstart', () => { if (isAutoScrolling) stopAutoScroll(); }, { passive: true });


function startCountdown() {
  setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('mins').textContent = '00';
      document.getElementById('secs').textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days < 10 ? '0' + days : days;
    document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
    document.getElementById('mins').textContent = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('secs').textContent = seconds < 10 ? '0' + seconds : seconds;
  }, 1000);
}

function loadWishes() {
  apiRequest('getPublicData', {}, (data) => {
    const list = document.getElementById('wishes-list');
    list.innerHTML = '';
    const rsvps = data.rsvps;
    if (!rsvps || rsvps.length === 0) {
      list.innerHTML = '<p class="text-center" style="color:#777; font-style:italic;">Jadilah yang pertama memberikan ucapan.</p>';
      return;
    }
    rsvps.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wish-card modern-wish';

      let dateStr = '';
      if (item.timestamp) {
        const dt = new Date(item.timestamp);
        dateStr = dt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }

      const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';
      let badgeHtml = '';
      if (item.attendance === 'Hadir' || item.attendance === 'Tidak Hadir') {
        const badgeClass = item.attendance === 'Hadir' ? 'badge-hadir' : 'badge-absen';
        const badgeIcon = item.attendance === 'Hadir' ? 'fa-check-circle' : 'fa-times-circle';
        badgeHtml = `<span class="wish-badge ${badgeClass}"><i class="fas ${badgeIcon}"></i> ${item.attendance}</span>`;
      }

      div.innerHTML = `
          <div class="wish-avatar">${initial}</div>
          <div class="wish-content">
            <h4>${escapeHTML(item.name)} ${badgeHtml}</h4>
            ${dateStr ? `<p class="wish-date"><i class="far fa-clock"></i> ${dateStr}</p>` : ''}
            <p class="wish-text">"${escapeHTML(item.message)}"</p>
          </div>
        `;
      list.appendChild(div);
    });
  });
}

function submitRSVP(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-rsvp');
  btn.textContent = 'Mengirim...';
  btn.disabled = true;

  const data = {
    name: document.getElementById('rsvp-name').value,
    attendance: document.getElementById('rsvp-attendance').value,
    guests: document.getElementById('rsvp-attendance').value === 'Hadir' ? document.getElementById('rsvp-guests').value : '0',
    message: document.getElementById('rsvp-message').value
  };

  apiRequest('saveRSVP', { data: data }, (res) => {
    if (res.success) {
      showToast('Terima kasih atas ucapan Anda!', 'success');
      document.getElementById('rsvp-form').reset();
      loadWishes();
    } else {
      showToast('Terjadi kesalahan. Coba lagi.', 'error');
    }
    btn.textContent = 'Kirim Ucapan';
    btn.disabled = false;
  }, (err) => {
    showToast('Terjadi kesalahan. Coba lagi.', 'error');
    btn.textContent = 'Kirim Ucapan';
    btn.disabled = false;
  });
}

function copyBankAccount(elementId) {
  const acc = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(acc).then(() => {
    showToast('Nomor Rekening Berhasil Disalin!', 'success');
  }).catch(err => {
    showToast('Gagal menyalin rekening.', 'error');
  });
}

function openGiftModal(idx, iconClass) {
  if (!window.giftBanks || !window.giftBanks[idx]) return;
  const b = window.giftBanks[idx];

  const iconContainer = document.getElementById('modal-gift-icon-container');
  if (b.iconUrl) {
    iconContainer.innerHTML = `<img src="${b.iconUrl}" alt="${b.bank}" style="max-height:60px; object-fit:contain;">`;
  } else {
    iconContainer.innerHTML = `<i id="modal-gift-icon" class="fas ${iconClass}"></i>`;
  }

  document.getElementById('modal-gift-bank').textContent = b.bank;
  document.getElementById('modal-gift-account').textContent = b.account;
  document.getElementById('modal-gift-holder').textContent = b.name;
  document.getElementById('btn-copy-modal').onclick = function () {
    copyBankAccount('modal-gift-account');
  };
  document.getElementById('gift-modal').style.display = "flex";
}

function closeGiftModal() {
  document.getElementById('gift-modal').style.display = "none";
}

function openMapModal() {
  const mapImg = document.getElementById('actual-map-img');
  const modalImg = document.getElementById('img01');
  if (mapImg && modalImg) {
    modalImg.src = mapImg.src;
    document.getElementById('map-modal').style.display = "flex";
  }
}

function closeMapModal() {
  document.getElementById('map-modal').style.display = "none";
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Close modals when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}




// --- MOBILE SPA NAVIGATION LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.bottom-nav a');
  const tabs = document.querySelectorAll('.mobile-tab');
  
  // Inject luxurious floral decorations into every tab
  tabs.forEach(tab => {
    // Prevent double injection if it already exists
    if (!tab.querySelector('.tab-ornament-top')) {
      const topOrn = document.createElement('div');
      topOrn.className = 'tab-ornament-top';
      topOrn.innerHTML = '<i class="fab fa-envira"></i>';
      topOrn.style = 'position: absolute; top: 15px; left: 15px; font-size: 3.5rem; color: var(--secondary-color); opacity: 0.25; z-index: -1; animation: sway 6s ease-in-out infinite alternate; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);';
      tab.appendChild(topOrn);
      
      const botOrn = document.createElement('div');
      botOrn.className = 'tab-ornament-bot';
      botOrn.innerHTML = '<i class="fas fa-leaf"></i>';
      botOrn.style = 'position: absolute; bottom: 80px; right: 15px; font-size: 3.5rem; color: var(--secondary-color); opacity: 0.25; z-index: -1; transform: scaleX(-1) rotate(-30deg); animation: sway 8s ease-in-out infinite alternate-reverse; text-shadow: -2px 2px 4px rgba(0,0,0,0.1);';
      tab.appendChild(botOrn);
      
      // Ensure tab has position relative for absolute positioning of ornaments
      tab.style.position = 'relative';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault(); // Stop default scroll behavior on mobile
        
        const targetId = this.getAttribute('href').substring(1);
        const targetTab = document.getElementById(targetId);
        
        if (targetTab) {
          // Update active nav link
          navLinks.forEach(nav => nav.classList.remove('active'));
          this.classList.add('active');
          
          // Switch tabs
          tabs.forEach(tab => tab.classList.remove('active-tab'));
          targetTab.classList.add('active-tab');
          
          // Trigger typewriter animation on the title
          const title = targetTab.querySelector('h2.section-title, h3.section-title');
          if (title) {
            // Re-trigger CSS animation by cloning and replacing
            title.classList.remove('typewriter-text');
            void title.offsetWidth; // trigger reflow
            title.classList.add('typewriter-text');
          }
          
          window.scrollTo(0, 0);
        }
      }
    });
  });
});
