// API requests are now handled by api.js

// ==========================================
// ANALYTICS TRACKING
// ==========================================
async function trackAnalyticsEvent(eventType, details = '') {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    const ip = data.ip;

    apiRequest('recordAnalytics', {
      analyticsData: {
        type: eventType,
        ip: ip,
        details: details
      }
    }, () => { }); // ignoring response
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

trackAnalyticsEvent('page_view');


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



});

// Carousel Logic
let carouselImages = [
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

  // Populate SEO
  if (s.SeoTitle) {
    document.title = s.SeoTitle;
    if(document.getElementById('page-title')) document.getElementById('page-title').textContent = s.SeoTitle;
    if(document.getElementById('meta-og-title')) document.getElementById('meta-og-title').content = s.SeoTitle;
  }
  if (s.SeoDesc) {
    if(document.getElementById('meta-desc')) document.getElementById('meta-desc').content = s.SeoDesc;
    if(document.getElementById('meta-og-desc')) document.getElementById('meta-og-desc').content = s.SeoDesc;
  }
  if (s.SeoKeywords) {
    if(document.getElementById('meta-keywords')) document.getElementById('meta-keywords').content = s.SeoKeywords;
  }
  if (s.SeoAuthor) {
    if(document.getElementById('meta-author')) document.getElementById('meta-author').content = s.SeoAuthor;
  }
  if (s.ThemeColor) {
    if(document.getElementById('meta-theme')) document.getElementById('meta-theme').content = s.ThemeColor;
  }
  if (s.FaviconUrl) {
    if(document.getElementById('favicon-32')) document.getElementById('favicon-32').href = s.FaviconUrl;
    if(document.getElementById('favicon-16')) document.getElementById('favicon-16').href = s.FaviconUrl;
    if(document.getElementById('favicon-shortcut')) document.getElementById('favicon-shortcut').href = s.FaviconUrl;
    if(document.getElementById('favicon-apple')) document.getElementById('favicon-apple').href = s.FaviconUrl;
  }
  if (s.OgImageUrl) {
    if(document.getElementById('meta-og-image')) document.getElementById('meta-og-image').content = s.OgImageUrl;
  }

  // Populate Names
  document.getElementById('bride-name-hero').textContent = s.BrideName;
  document.getElementById('groom-name-hero').textContent = s.GroomName;
  document.getElementById('bride-name').textContent = s.BrideName;
  document.getElementById('groom-name').textContent = s.GroomName;
  document.getElementById('bride-desc').textContent = s.BrideDesc || 'Putri dari ...';
  document.getElementById('groom-desc').textContent = s.GroomDesc || 'Putra dari ...';
  
  // Populate Photos
  if (s.BridePhoto) document.getElementById('bride-photo').src = s.BridePhoto;
  if (s.GroomPhoto) document.getElementById('groom-photo').src = s.GroomPhoto;

  // Populate Dates
  const akad = new Date(s.AkadDate);
  const resepsi = new Date(s.ResepsiDate);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
  // Format dates for Google Calendar (YYYYMMDDTHHmm00Z)
  // We use local time by just removing punctuation to assume local timezone for user
  const formatForCalendar = (dateObj) => {
    return dateObj.toISOString().replace(/-|:|\.\d\d\d/g,"");
  };
  const startDateStr = formatForCalendar(resepsi);
  // Assume reception lasts for 3 hours
  const endDateStr = formatForCalendar(new Date(resepsi.getTime() + 3 * 60 * 60 * 1000));
  
  const calLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(s.GroomName)}+%26+${encodeURIComponent(s.BrideName)}&dates=${startDateStr}/${endDateStr}&details=Acara+Resepsi+Pernikahan&location=${encodeURIComponent(s.LocationAddress || '')}`;
  
  const heroCalBtn = document.getElementById('hero-calendar-btn');
  if(heroCalBtn) heroCalBtn.href = calLink;

  document.getElementById('hero-date').textContent = resepsi.toLocaleDateString('id-ID', options);
  document.getElementById('akad-date').textContent = akad.toLocaleDateString('id-ID', options);
  document.getElementById('akad-time').textContent = akad.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB - Selesai';
  document.getElementById('resepsi-date').textContent = resepsi.toLocaleDateString('id-ID', options);
  document.getElementById('resepsi-time').textContent = resepsi.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB - Selesai';

  targetDate = resepsi.getTime();
  startCountdown();

  document.getElementById('greeting-text').textContent = s.Greeting;
  // Initialize map if available
  if (s.MapsLink) {
    document.getElementById('maps-link').href = s.MapsLink;
    document.getElementById('maps-link').addEventListener('click', () => {
      trackAnalyticsEvent('click_maps');
    });
  } // Update Hero Avatar
  if (s.HeroAvatar) {
    const avatarImg = document.querySelector('.hero-avatar img');
    if (avatarImg) avatarImg.src = s.HeroAvatar;
  }

  // Update Carousel Images
  if (s.CarouselImages) {
    try {
      const parsed = JSON.parse(s.CarouselImages);
      if (parsed && parsed.length > 0) {
        carouselImages = parsed;
      }
    } catch (e) { }
  }

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
              <div class="text-content">
                <h4>${escapeHTML(b.bank)}</h4>
                <p style="font-size: 0.85rem; color: #666; margin: 0; font-weight: normal;">${escapeHTML(b.name)}</p>
              </div>
            </div>
          `;
      });
    } catch (e) {
      console.error("Gagal memproses data bank", e);
    }
  }

  // Audio Caching Logic
  const DB_NAME = 'UndanganDB';
  const STORE_NAME = 'AudioStore';

  function getCachedAudio(fileId, callback) {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function (e) {
        let db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function (e) {
        let db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) return callback(null);
        let transaction = db.transaction([STORE_NAME], 'readonly');
        let store = transaction.objectStore(STORE_NAME);
        let getReq = store.get(fileId);
        getReq.onsuccess = function (e) { callback(e.target.result); };
        getReq.onerror = function () { callback(null); };
      };
      request.onerror = function () { callback(null); };
    } catch (err) {
      callback(null);
    }
  }

  function cacheAudio(fileId, base64Str) {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function (e) {
        let db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function (e) {
        let db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) return;
        let transaction = db.transaction([STORE_NAME], 'readwrite');
        let store = transaction.objectStore(STORE_NAME);
        store.put(base64Str, fileId);
      };
    } catch (err) {
      console.error("Failed to cache audio", err);
    }
  }

  function setAudioAndPlay(audioSrc) {
    const audio = document.getElementById('bg-music');
    const isInvitationOpen = document.getElementById('home').style.display === 'none';
    audio.src = audioSrc;
    if (isInvitationOpen) {
      audio.play().catch(e => console.log('Audio play failed', e));
      document.getElementById('audio-btn').style.display = 'flex';
      document.getElementById('audio-btn').innerHTML = '<i class="fas fa-compact-disc fa-spin"></i>';
      isPlaying = true;
    }
  }

  let musicUrl = s.MusicUrl;
  if (musicUrl && musicUrl.includes('drive.google.com')) {
    try {
      const fileIdMatch = musicUrl.match(/(?:id=|file\/d\/)([a-zA-Z0-9_-]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      if (fileId) {
        getCachedAudio(fileId, function (cachedBase64) {
          if (cachedBase64) {
            console.log("Audio loaded from cache.");
            setAudioAndPlay(cachedBase64);
          } else {
            console.log("Audio not in cache. Fetching from network...");
            window.apiRequest('getAudioData', { fileId: fileId }, function (res) {
              if (res.success && res.base64) {
                // Force audio MIME type if Google Drive returns generic octet-stream
                let mime = res.mimeType;
                if (!mime || mime === 'application/octet-stream' || !mime.startsWith('audio/')) {
                  mime = 'audio/mpeg';
                }
                const fullBase64 = 'data:' + mime + ';base64,' + res.base64;
                cacheAudio(fileId, fullBase64);
                setAudioAndPlay(fullBase64);
              } else {
                setAudioAndPlay('https://drive.google.com/uc?export=download&id=' + fileId);
              }
            });
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

  // Gallery Rendering (Dynamic Categorized Rows)
  const galleryContainer = document.getElementById('gallery-container');
  galleryContainer.innerHTML = '';
  window.galleryItems = [];
  
  if (data.gallery && data.gallery.length > 0) {
    const totalItems = data.gallery.length;
    // Split into 3 arrays roughly equal
    const row1 = [];
    const row2 = [];
    const row3 = [];
    
    data.gallery.forEach((item, index) => {
      if (index % 3 === 0) row1.push(item);
      else if (index % 3 === 1) row2.push(item);
      else row3.push(item);
    });

    const rows = [
      { items: row1, direction: 'left' },
      { items: row2, direction: 'right' },
      { items: row3, direction: 'left' }
    ];

    rows.forEach((row, rowIndex) => {
      if (row.items.length === 0) return;
      
      let trackHtml = `<div class="marquee-row"><div class="marquee-track ${row.direction}">`;
      
      // We duplicate the items 3 times to ensure a smooth infinite loop
      for(let copy = 0; copy < 3; copy++) {
        row.items.forEach((item) => {
          let isVideo = item.type === 'video';
          let itemUrl = item.url;
          let thumbUrl = itemUrl;
          let fileId = '';
          
          if (isVideo) {
            const fileIdMatch = itemUrl.match(/[?&]id=([^&]+)/);
            fileId = fileIdMatch ? fileIdMatch[1] : '';
            thumbUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
            
            // Only add to global gallery array on the first copy to avoid modal duplicates
            if (copy === 0) {
              window.galleryItems.push({ url: fileId, type: 'video' });
            }
          } else {
            if (copy === 0) {
              window.galleryItems.push({ url: item.url, type: 'photo' });
            }
          }
          
          // Calculate the exact index in window.galleryItems for the modal
          let globalIndex = -1;
          if (copy === 0) {
            globalIndex = window.galleryItems.length - 1;
          } else {
            // Find its index from the first copy
            if (isVideo) {
              globalIndex = window.galleryItems.findIndex(g => g.url === fileId && g.type === 'video');
            } else {
              globalIndex = window.galleryItems.findIndex(g => g.url === item.url && g.type === 'photo');
            }
          }

          if (isVideo) {
            trackHtml += `
              <div class="marquee-item" onclick="openModal(${globalIndex})">
                <img src="${thumbUrl}" alt="Video Thumbnail">
                <div class="play-icon" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:rgba(255,255,255,0.9); font-size:3rem; pointer-events:none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"><i class="fas fa-play-circle"></i></div>
              </div>
            `;
          } else {
            trackHtml += `
              <div class="marquee-item" onclick="openModal(${globalIndex})">
                <img src="${item.url}" alt="Gallery Image">
              </div>
            `;
          }
        });
      }
      
      trackHtml += `</div></div>`;
      galleryContainer.innerHTML += trackHtml;
    });
  } else {
    // Dummy Data fallback
    const dummyImages = [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    
    const rows = [
      { items: [dummyImages[0], dummyImages[1]], direction: 'left' },
      { items: [dummyImages[2], dummyImages[3]], direction: 'right' },
      { items: [dummyImages[4], dummyImages[5]], direction: 'left' }
    ];

    rows.forEach((row, rIdx) => {
      let trackHtml = `<div class="marquee-row"><div class="marquee-track ${row.direction}">`;
      for(let copy = 0; copy < 3; copy++) {
        row.items.forEach(img => {
          if(copy === 0) window.galleryItems.push({ url: img, type: 'photo' });
          let globalIndex = window.galleryItems.findIndex(g => g.url === img);
          trackHtml += `
            <div class="marquee-item" onclick="openModal(${globalIndex})">
              <img src="${img}" alt="Gallery Fallback">
            </div>
          `;
        });
      }
      trackHtml += `</div></div>`;
      galleryContainer.innerHTML += trackHtml;
    });
  }

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
  const btnBuka = document.getElementById('btn-open-invitation');
  if (btnBuka) btnBuka.style.display = 'none';
  
  const mainContent = document.getElementById('main-content');
  mainContent.style.display = 'block';
  // Trigger reflow to ensure CSS transitions execute
  void mainContent.offsetWidth;
  mainContent.classList.add('fade-in');
  
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'block';
  window.scrollTo(0, 0);

  // Display buttons regardless of audio success
  document.getElementById('audio-btn').style.display = 'flex';
  document.getElementById('auto-scroll-btn').style.display = 'flex';

  // Play music
  const audio = document.getElementById('bg-music');
  audio.play().then(() => {
    document.getElementById('audio-btn').innerHTML = '<i class="fas fa-compact-disc fa-spin"></i>';
    isPlaying = true;
  }).catch(err => {
    console.log('Audio play failed', err);
    document.getElementById('audio-btn').innerHTML = '<i class="fas fa-volume-mute"></i>';
    isPlaying = false;
  });

  // Init AOS Animations
  setTimeout(() => {
    AOS.init({
      duration: 500,
      once: true,
      offset: 50
    });
  }, 100);

  // Auto-start autoscroll after a brief delay so user can orient themselves
  setTimeout(() => {
    startAutoScroll();
  }, 1500);
}

function toggleAudio() {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('audio-btn');
  if (isPlaying) {
    audio.pause();
    btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  } else {
    audio.play();
    btn.innerHTML = '<i class="fas fa-compact-disc fa-spin"></i>';
  }
  isPlaying = !isPlaying;
}

// Auto Scroll Feature
let autoScrollInterval = null;
let autoScrollTimeout = null;
let isAutoScrolling = false;

function toggleAutoScroll() {
  if (isAutoScrolling) stopAutoScroll();
  else startAutoScroll();
}

function startAutoScroll() {
  isAutoScrolling = true;
  const btn = document.getElementById('auto-scroll-btn');
  if (btn) btn.innerHTML = '<i class="fas fa-chevron-down scroll-anim"></i>';

  function step() {
    if (!isAutoScrolling) return;

    // 1. Scroll jalan perlahan dari atas ke bawah (Smooth 60fps)
    window.scrollBy(0, 1.5); // 1.5px per frame for a nice smooth speed

    // 2. Deteksi apakah sudah mentok paling bawah
    let isBottom = false;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (window.innerWidth <= 768) {
      const activeTab = document.querySelector('.mobile-tab.active-tab');
      if (activeTab) {
        const rect = activeTab.getBoundingClientRect();
        isBottom = Math.ceil(rect.bottom) <= viewportHeight + 10;
      }
    } else {
      const mainContent = document.getElementById('main-content') || document.body;
      const rect = mainContent.getBoundingClientRect();
      isBottom = Math.ceil(rect.bottom) <= viewportHeight + 10;
    }

    if (isBottom) {
      stopAutoScroll();

      // 3. Logika Pindah Tab
      if (window.innerWidth <= 768) {
        isAutoScrolling = true;
        if (btn) btn.innerHTML = '<i class="fas fa-chevron-down scroll-anim"></i>';

        // Jeda 0.5 detik untuk pindah tab (sesuai request)
        autoScrollTimeout = setTimeout(() => {
          const tabs = ['greeting', 'events', 'gallery', 'gift', 'rsvp'];
          const activeLink = document.querySelector('.bottom-nav a.active');

          if (activeLink) {
            const currentHref = activeLink.getAttribute('href').substring(1);
            const currentIndex = tabs.indexOf(currentHref);

            if (currentIndex !== -1 && currentIndex < tabs.length - 1) {
              const nextTabId = tabs[currentIndex + 1];
              const nextLink = document.querySelector(`.bottom-nav a[href="#${nextTabId}"]`);

              if (nextLink) {
                nextLink.click();

                // PENTING: Kembalikan layar ke paling atas di tab yang baru!
                window.scrollTo(0, 0);

                // Jeda 0.5 detik sebelum mulai jalan lagi di tab baru
                autoScrollTimeout = setTimeout(() => {
                  startAutoScroll();
                }, 500);
              }
            } else {
              // Sudah mentok di tab terakhir (RSVP)
              stopAutoScroll();
            }
          }
        }, 500);
      }
    } else {
      autoScrollInterval = requestAnimationFrame(step);
    }
  }

  autoScrollInterval = requestAnimationFrame(step);
}

function stopAutoScroll() {
  isAutoScrolling = false;
  const btn = document.getElementById('auto-scroll-btn');
  if (btn) btn.innerHTML = '<i class="fas fa-hand-paper"></i>';

  if (autoScrollInterval) {
    cancelAnimationFrame(autoScrollInterval);
    clearInterval(autoScrollInterval); // fallback
    autoScrollInterval = null;
  }
  if (autoScrollTimeout) {
    clearTimeout(autoScrollTimeout);
    autoScrollTimeout = null;
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
    attendance: document.querySelector('input[name="rsvp-attendance"]:checked').value,
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
    trackAnalyticsEvent('click_bank', acc);
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
  document.getElementById('modal-gift-holder').textContent = b.name;

  const accElement = document.getElementById('modal-gift-account');
  const copyBtn = document.getElementById('btn-copy-modal');

  // Handle QR vs Text Account
  if (b.type === 'qr' && b.qrUrl) {
    iconContainer.style.display = 'none'; // Hide icon for QR

    // Add QR Image and Download Button
    const downloadUrl = b.qrUrl.replace('export=view', 'export=download'); // Try to force download if it's a Drive URL
    accElement.innerHTML = `
      <img src="${b.qrUrl}" alt="QR Code" style="width:100%; max-width:250px; border-radius:15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 0 auto; display: block;">
      <a href="${downloadUrl}" target="_blank" download="QRCode_${b.bank}.png" class="btn-secondary" style="display: block; width: 100%; max-width: 250px; margin: 15px auto 0; text-decoration: none; text-align: center; border-radius: 30px; font-size: 0.9rem; padding: 10px;">
        <i class="fas fa-download"></i> Download QR
      </a>
    `;
    copyBtn.style.display = 'none'; // Hide copy button for QR
  } else {
    iconContainer.style.display = 'block';
    accElement.textContent = b.account;
    copyBtn.style.display = 'inline-block';
    copyBtn.onclick = function () {
      copyBankAccount('modal-gift-account');
    };
  }

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
    if (event.target.id === 'gallery-modal') {
      document.getElementById('gallery-modal-content').innerHTML = ''; // Stop video
    }
  }
}

// Gallery Modal Functions
window.currentGalleryIndex = 0;

function openModal(index) {
  if (!window.galleryItems || window.galleryItems.length === 0) return;
  window.currentGalleryIndex = index;
  renderGalleryModal();
  document.getElementById('gallery-modal').style.display = 'flex';
}

function renderGalleryModal() {
  const content = document.getElementById('gallery-modal-content');
  const item = window.galleryItems[window.currentGalleryIndex];
  if (!item) return;

  if (item.type === 'video') {
    // url is fileId
    content.innerHTML = `<iframe src="https://drive.google.com/file/d/${item.url}/preview" width="90%" height="80%" style="border-radius:10px; max-width:800px; background:black;" frameborder="0" allowfullscreen allow="autoplay"></iframe>`;
  } else {
    // url is image url
    content.innerHTML = `<img src="${item.url}" style="max-width:90%; max-height:80vh; border-radius:10px; object-fit:contain; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">`;
  }
}

function prevGalleryItem() {
  if (!window.galleryItems) return;
  window.currentGalleryIndex = (window.currentGalleryIndex - 1 + window.galleryItems.length) % window.galleryItems.length;
  renderGalleryModal();
}

function nextGalleryItem() {
  if (!window.galleryItems) return;
  window.currentGalleryIndex = (window.currentGalleryIndex + 1) % window.galleryItems.length;
  renderGalleryModal();
}

function closeGalleryModal() {
  document.getElementById('gallery-modal').style.display = 'none';
  document.getElementById('gallery-modal-content').innerHTML = ''; // Stop video playback
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
      // tab.style.position = 'relative';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault(); // Stop default scroll behavior on mobile

        const targetId = this.getAttribute('href').substring(1);
        const targetTab = document.getElementById(targetId);

        if (targetTab) {
          // Update active nav link
          navLinks.forEach(nav => nav.classList.remove('active'));
          this.classList.add('active');

          // Determine direction for animation
          const currentTab = document.querySelector('.mobile-tab.active-tab');
          let currentIdx = -1;
          let targetIdx = -1;
          const tabsArray = Array.from(tabs);
          if (currentTab) currentIdx = tabsArray.indexOf(currentTab);
          if (targetTab) targetIdx = tabsArray.indexOf(targetTab);
          const isNext = targetIdx > currentIdx;

          // Switch tabs
          tabs.forEach(tab => tab.classList.remove('active-tab', 'turn-next', 'turn-prev'));
          targetTab.classList.add('active-tab');
          if (currentIdx !== -1) {
            targetTab.classList.add(isNext ? 'turn-next' : 'turn-prev');
          }

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
