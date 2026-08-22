// API requests are now handled by api.js


const token = localStorage.getItem('admin_token');
let bankAccountsList = [];

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
  Toast.fire({ icon: type, title: message });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  loadData();
});

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}

function compressImage(file, maxWidth, maxHeight, quality, callback, forceJpeg = false) {
  if (!file.type.match(/image.*/)) {
    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsDataURL(file);
    return;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = event => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width; let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
      } else {
        if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');

      const outMime = forceJpeg ? 'image/jpeg' : file.type;
      if (forceJpeg && file.type !== 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL(outMime, quality));
    };
  };
}

function showTab(tabId) {
  // Ensure all modals are closed when navigating between tabs
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });

  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId + '-tab').classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-' + tabId).classList.add('active');

  if (window.innerWidth <= 768) {
    toggleSidebar();
  }
}

function logout() {
  localStorage.removeItem('admin_token');
  window.location.href = "login.html";
}

function loadData() {
  apiRequest('getSettings', { token: token }, populateSettings, handleError);
  apiRequest('getGallery', {}, populateGallery);
  apiRequest('getRSVPs', { token: token }, populateRSVP);
}

function renderBankList() {
  const container = document.getElementById('bank-list');
  container.innerHTML = '';
  bankAccountsList.forEach((bank, index) => {
    container.innerHTML += `
        <div class="bank-item" id="bank-item-${index}">
          <button type="button" class="btn-remove-bank" onclick="removeBankField(${index})"><i class="fas fa-times-circle"></i></button>
          <div class="floating-group">
            <input type="text" class="floating-input bank-name-input" value="${escapeHTML(bank.bank)}" placeholder=" " required>
            <label class="floating-label">Nama Bank / E-Wallet (cth: BCA)</label>
          </div>
          
          <div class="floating-group" style="margin-bottom: 10px;">
            <select class="bank-type-select" style="width:100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc; font-family: var(--font-body);" onchange="toggleBankType(this)">
              <option value="account" ${bank.type !== 'qr' ? 'selected' : ''}>Nomor Rekening (Teks)</option>
              <option value="qr" ${bank.type === 'qr' ? 'selected' : ''}>QR Code (Upload)</option>
            </select>
          </div>

          <div class="bank-text-group" style="display: ${bank.type !== 'qr' ? 'block' : 'none'};">
            <div class="floating-group">
              <input type="text" class="floating-input bank-acc-input" value="${escapeHTML(bank.account || '')}" placeholder=" ">
              <label class="floating-label">Nomor Rekening</label>
            </div>
          </div>

          <div class="bank-qr-group file-upload-wrapper" style="display: ${bank.type === 'qr' ? 'block' : 'none'}; margin-bottom: 15px;">
            <label>Upload Gambar QR / Barcode</label>
            <input type="file" class="bank-qr-file" accept="image/*" onchange="handleBankQRUpload(this)">
            <input type="hidden" class="bank-qr-base64" value="${bank.qrBase64 || bank.qrUrl || ''}">
            <input type="hidden" class="bank-qr-mime" value="${bank.qrMime || ''}">
            <input type="hidden" class="bank-existing-qr-url" value="${bank.qrUrl || ''}">
            <div class="qr-preview-area">
              ${bank.qrUrl ? `<img src="${bank.qrUrl}" style="height:100px; margin-top:5px; border-radius:5px; border:1px solid #ccc;"> <span style="font-size:0.8rem; color:green; display:block;"><i class="fas fa-check-circle"></i> QR Ter-upload</span>` : `<span style="font-size:0.8rem; color:#777; display:block;">Belum ada QR Code</span>`}
            </div>
          </div>

          <div class="floating-group" style="margin-bottom:0;">
            <input type="text" class="floating-input bank-holder-input" value="${escapeHTML(bank.name)}" placeholder=" " required>
            <label class="floating-label">Atas Nama</label>
          </div>
          <div class="bank-icon-upload-group file-upload-wrapper" style="display: ${bank.type === 'qr' ? 'none' : 'block'}; margin-top: 15px;">
            <label>Icon Rekening (Pilih Gambar)</label>
            <input type="file" class="bank-icon-file" accept="image/*" onchange="handleBankIconUpload(this)">
            <input type="hidden" class="bank-icon-base64" value="${bank.iconBase64 || bank.iconUrl || ''}">
            <input type="hidden" class="bank-icon-mime" value="${bank.iconMime || ''}">
            <input type="hidden" class="bank-existing-url" value="${bank.iconUrl || ''}">
            ${bank.iconUrl ? `<img src="${bank.iconUrl}" style="height:30px; margin-top:5px; border-radius:5px;"> <span style="font-size:0.8rem; color:green;"><i class="fas fa-check-circle"></i> Ter-upload</span>` : `<span style="font-size:0.8rem; color:#777;">Belum ada ikon khusus</span>`}
          </div>
        </div>
      `;
  });
}

function handleBankIconUpload(input) {
  if (input.files.length > 0) {
    const item = input.closest('.bank-item');
    const existingUrl = item.querySelector('.bank-existing-url').value;

    const processUpload = () => {
      compressImage(input.files[0], 200, 200, 0.8, function (dataUrl) {
        item.querySelector('.bank-icon-base64').value = dataUrl;
        item.querySelector('.bank-icon-mime').value = input.files[0].type;
      });
    };

    if (existingUrl) {
      Swal.fire({
        title: 'Timpa Ikon Rekening?',
        text: 'Sudah ada ikon terunggah. Ingin menimpanya?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Timpa',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          processUpload();
        } else {
          input.value = ''; // clear input
        }
      });
    } else {
      processUpload();
    }
  }
}

function handleMapUpload(input) {
  if (input.files.length > 0) {
    const mapStatus = document.getElementById('map-existing-status');
    if (mapStatus.getAttribute('data-exists') === 'true') {
      Swal.fire({
        title: 'Timpa Denah Lokasi?',
        text: 'Sudah ada file denah yang tersimpan. Ingin menimpanya?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Timpa',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (!result.isConfirmed) {
          input.value = ''; // clear input
        }
      });
    }
  }
}

function addBankField() {
  syncBankListFromDOM();
  bankAccountsList.push({ bank: '', account: '', name: '' });
  renderBankList();
}

function removeBankField(index) {
  syncBankListFromDOM();
  bankAccountsList.splice(index, 1);
  renderBankList();
}

function syncBankListFromDOM() {
  const items = document.querySelectorAll('.bank-item');
  bankAccountsList = [];
  items.forEach(item => {
    const type = item.querySelector('.bank-type-select').value;
    bankAccountsList.push({
      type: type,
      bank: item.querySelector('.bank-name-input').value,
      account: item.querySelector('.bank-acc-input') ? item.querySelector('.bank-acc-input').value : '',
      name: item.querySelector('.bank-holder-input').value,
      iconBase64: item.querySelector('.bank-icon-base64').value,
      iconMime: item.querySelector('.bank-icon-mime').value,
      iconUrl: item.querySelector('.bank-icon-base64').value.startsWith('http') ? item.querySelector('.bank-icon-base64').value : undefined,
      qrBase64: item.querySelector('.bank-qr-base64') ? item.querySelector('.bank-qr-base64').value : '',
      qrMime: item.querySelector('.bank-qr-mime') ? item.querySelector('.bank-qr-mime').value : '',
      qrUrl: item.querySelector('.bank-qr-base64') && item.querySelector('.bank-qr-base64').value.startsWith('http') ? item.querySelector('.bank-qr-base64').value : (item.querySelector('.bank-existing-qr-url') ? item.querySelector('.bank-existing-qr-url').value : undefined)
    });
  });
}

function populateSettings(data) {
  document.getElementById('BrideName').value = data.BrideName || '';
  document.getElementById('BrideDesc').value = data.BrideDesc || '';
  document.getElementById('GroomName').value = data.GroomName || '';
  document.getElementById('GroomDesc').value = data.GroomDesc || '';
  document.getElementById('Greeting').value = data.Greeting || '';
  document.getElementById('AkadDate').value = data.AkadDate || '';
  document.getElementById('ResepsiDate').value = data.ResepsiDate || '';
  document.getElementById('MusicUrl').value = data.MusicUrl || '';
  document.getElementById('MapsLink').value = data.MapsLink || '';

  const mapStatus = document.getElementById('map-existing-status');
  if (data.MapImage) {
    mapStatus.innerHTML = `<i class="fas fa-check-circle" style="color:green;"></i> File sudah ter-upload.`;
    mapStatus.setAttribute('data-exists', 'true');
  } else {
    mapStatus.innerHTML = `Belum ada file ter-upload.`;
    mapStatus.setAttribute('data-exists', 'false');
  }

  if (data.BankAccounts) {
    try { bankAccountsList = JSON.parse(data.BankAccounts); } catch (e) { bankAccountsList = []; }
  } else {
    bankAccountsList = [];
  }
  renderBankList();

  document.getElementById('loader').style.display = 'none';
  document.getElementById('admin-layout').style.display = 'flex';
}

function saveSettings(e) {
  e.preventDefault();
  syncBankListFromDOM();
  const btn = document.getElementById('btn-save-settings');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
  btn.disabled = true;

  const data = {
    BrideName: document.getElementById('BrideName').value,
    BrideDesc: document.getElementById('BrideDesc').value,
    GroomName: document.getElementById('GroomName').value,
    GroomDesc: document.getElementById('GroomDesc').value,
    Greeting: document.getElementById('Greeting').value,
    AkadDate: document.getElementById('AkadDate').value,
    ResepsiDate: document.getElementById('ResepsiDate').value,
    MusicUrl: document.getElementById('MusicUrl') ? document.getElementById('MusicUrl').value : '',
    MapsLink: document.getElementById('MapsLink').value,
    BankAccounts: JSON.stringify(bankAccountsList)
  };

  const mapFileInput = document.getElementById('MapImageFile');
  const musicFileInput = document.getElementById('MusicFile');

  function proceedToSend() {
    sendSettings(data, btn);
  }

  function readMusicFile(callback) {
    if (musicFileInput && musicFileInput.files.length > 0) {
      const file = musicFileInput.files[0];
      // Validasi ukuran maksimal (misal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Terlalu Besar', 'Ukuran file musik maksimal 5MB.', 'error');
        btn.innerHTML = '<i class="fas fa-save"></i> Simpan Semua Pengaturan';
        btn.disabled = false;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        data.MusicFileBase64 = e.target.result;
        data.MusicFileMime = file.type;
        data.MusicFileName = file.name;
        callback();
      };
      reader.readAsDataURL(file);
    } else {
      callback();
    }
  }

  if (mapFileInput.files.length > 0) {
    const file = mapFileInput.files[0];
    compressImage(file, 800, 800, 0.7, function (dataUrl) {
      data.MapImageBase64 = dataUrl;
      data.MapImageMime = file.type;
      readMusicFile(proceedToSend);
    });
  } else {
    readMusicFile(proceedToSend);
  }
}

function sendSettings(data, btn) {
  apiRequest('saveSettings', { settings: data, token: token }, (res) => { if (res.success) { showToast('Pengaturan berhasil disimpan!', 'success'); document.getElementById('MapImageFile').value = ''; } else showToast('Gagal menyimpan', 'error'); btn.innerHTML = '<i class="fas fa-save"></i> Simpan Semua Pengaturan'; btn.disabled = false; }, (err) => { handleError(err); btn.innerHTML = '<i class="fas fa-save"></i> Simpan Semua Pengaturan'; btn.disabled = false; });
}

function populateGallery(data) {
  const tbody = document.getElementById('gallery-tbody');
  tbody.innerHTML = '';
  data.forEach(item => {
    let preview = item.type === 'video' ? `<video src="${item.url}" width="50" style="border-radius:5px;" muted></video>` : `<img src="${item.url}" width="50" style="border-radius:5px;">`;
    tbody.innerHTML += `
      <tr>
        <td>${preview}</td>
        <td>${escapeHTML(item.name || '')}</td>
        <td>
          <button class="btn-danger" onclick="deleteGalleryItem('${item.id}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      </tr>
    `;
  });
}

function addGallery(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-add-gallery');

  const fileInput = document.getElementById('media-file');
  if (fileInput.files.length === 0) {
    showToast("Harap pilih file!", 'error');
    return;
  }
  const file = fileInput.files[0];
  const type = document.getElementById('media-type').value;

  if (type === 'video') {
    if (file.size > 15 * 1024 * 1024) {
      showToast("Maksimal ukuran video 15MB", "error");
      return;
    }
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(event) {
      const item = {
        name: document.getElementById('media-name').value,
        type: 'video',
        mimeType: file.type,
        base64Data: event.target.result
      };
      apiRequest('addGalleryItem', { item: item, token: token }, (res) => { if (res.success) { showToast('Video berhasil ditambahkan!', 'success'); document.getElementById('add-gallery-form').reset(); loadData(); } btn.innerHTML = '<i class="fas fa-upload"></i> Unggah Media'; btn.disabled = false; }, (err) => { btn.innerHTML = '<i class="fas fa-upload"></i> Unggah Media'; btn.disabled = false; handleError(err); });
    };
    reader.readAsDataURL(file);
    return;
  }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  btn.disabled = true;

  // Reduce size to 800x800, lower quality to 0.6, and force JPEG conversion
  compressImage(file, 800, 800, 0.6, function (dataUrl) {
    const item = {
      name: document.getElementById('media-name').value,
      type: 'photo',
      mimeType: 'image/jpeg', // force mime to jpeg
      base64Data: dataUrl
    };

    apiRequest('addGalleryItem', { item: item, token: token }, (res) => { if (res.success) { showToast('Media berhasil ditambahkan!', 'success'); document.getElementById('add-gallery-form').reset(); loadData(); } btn.innerHTML = '<i class="fas fa-upload"></i> Unggah Media'; btn.disabled = false; }, (err) => { btn.innerHTML = '<i class="fas fa-upload"></i> Unggah Media'; btn.disabled = false; handleError(err); });
  }, true);
}

function deleteGalleryItem(id) {
  Swal.fire({
    title: 'Yakin menghapus media ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      apiRequest('deleteGalleryItem', { id: id, token: token }, (res) => {
        if (res.success) {
          showToast('Media dihapus', 'success');
          loadData();
        } else {
          showToast('Gagal menghapus media', 'error');
        }
      }, handleError);
    }
  });
}

function populateRSVP(data) {
  const tbody = document.getElementById('rsvp-tbody');
  tbody.innerHTML = '';
  data.forEach(item => {
    const date = new Date(item.timestamp).toLocaleString('id-ID');
    // Using unescaped string for modal parameters to avoid nested quotes issues, but escapeHTML in display
    const safeName = item.name ? item.name.replace(/'/g, "\\'") : '';
    const safeMsg = item.message ? item.message.replace(/'/g, "\\'") : '';
    tbody.innerHTML += `
        <tr>
          <td>${date}</td>
          <td>${escapeHTML(item.name)}</td>
          <td>${item.attendance}</td>
          <td>${item.guests}</td>
          <td>${escapeHTML(item.message)}</td>
          <td style="vertical-align: middle;">
            <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
              <button class="btn-primary" style="padding:6px 12px; font-size:0.85rem; border-radius:6px; cursor:pointer;" onclick="openEditRsvpModal(${item.rowNum}, '${safeName}', '${item.attendance}', ${item.guests}, '${safeMsg}')" title="Edit RSVP"><i class="fas fa-edit"></i></button>
              <button class="btn-danger" style="padding:6px 12px; font-size:0.85rem; border-radius:6px; cursor:pointer;" onclick="deleteRsvp(${item.rowNum})" title="Hapus RSVP"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
  });
}

function openEditRsvpModal(rowNum, name, attendance, guests, message) {
  document.getElementById('edit-rsvp-row').value = rowNum;
  document.getElementById('edit-rsvp-name').value = name;
  document.getElementById('edit-rsvp-attendance').value = attendance;
  document.getElementById('edit-rsvp-guests').value = guests;
  document.getElementById('edit-rsvp-message').value = message;
  document.getElementById('edit-rsvp-modal').style.display = 'flex';
}

function closeEditRsvpModal() {
  document.getElementById('edit-rsvp-modal').style.display = 'none';
}

function submitEditRsvp(e) {
  e.preventDefault();
  const rowNum = document.getElementById('edit-rsvp-row').value;
  const btn = document.getElementById('btn-edit-rsvp');
  const data = {
    name: document.getElementById('edit-rsvp-name').value,
    attendance: document.getElementById('edit-rsvp-attendance').value,
    guests: parseInt(document.getElementById('edit-rsvp-guests').value) || 0,
    message: document.getElementById('edit-rsvp-message').value
  };

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
  btn.disabled = true;
  
  // Close the modal immediately so the user doesn't wait staring at it
  closeEditRsvpModal();
  showToast('Menyimpan perubahan...', 'success');

  apiRequest('editRsvp', { rowNum: rowNum, rsvpData: data, token: token }, (res) => {
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
    btn.disabled = false;
    if (res.success) {
      showToast('Data RSVP berhasil diperbarui!', 'success');
      loadData();
    } else {
      showToast('Gagal: ' + res.message, 'error');
    }
  }, (err) => {
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
    btn.disabled = false;
    handleError(err);
  });
}

function deleteRsvp(rowNum) {
  if (confirm("Apakah Anda yakin ingin menghapus data RSVP ini?")) {
    apiRequest('deleteRsvp', { rowNum: rowNum, token: token }, (res) => {
      if (res.success) {
        showToast('Data RSVP berhasil dihapus!', 'success');
        loadData();
      } else {
        showToast('Gagal menghapus: ' + res.message, 'error');
      }
    }, handleError);
  }
}

function handleError(err) {
  showToast(err.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
  if (err.message === 'Unauthorized') { logout(); }
}

window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}

function escapeHTML(str) {
  return (str + '').replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function toggleBankType(selectElement) {
  const item = selectElement.closest('.bank-item');
  const type = selectElement.value;
  const textInputGroup = item.querySelector('.bank-text-group');
  const qrUploadGroup = item.querySelector('.bank-qr-group');
  const iconUploadGroup = item.querySelector('.bank-icon-upload-group');

  if (type === 'qr') {
    textInputGroup.style.display = 'none';
    qrUploadGroup.style.display = 'block';
    if (iconUploadGroup) iconUploadGroup.style.display = 'none';
  } else {
    textInputGroup.style.display = 'block';
    qrUploadGroup.style.display = 'none';
    if (iconUploadGroup) iconUploadGroup.style.display = 'block';
  }
}

function handleBankQRUpload(input) {
  if (input.files.length > 0) {
    const item = input.closest('.bank-item');

    compressImage(input.files[0], 800, 800, 0.8, function (dataUrl) {
      item.querySelector('.bank-qr-base64').value = dataUrl;
      item.querySelector('.bank-qr-mime').value = input.files[0].type;

      const previewArea = item.querySelector('.qr-preview-area');
      previewArea.innerHTML = `<img src="${dataUrl}" style="height:100px; margin-top:5px; border-radius:5px; border: 1px solid #ccc;"> <span style="font-size:0.8rem; color:green; display:block;"><i class="fas fa-check-circle"></i> QR Siap Disimpan</span>`;
    });
  }
}
