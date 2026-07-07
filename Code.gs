function doGet(e) {
  var action = e.parameter.action;
  
  if (action) {
    return handleApiRequest(e.parameter);
  }
  
  // Default API response
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success', 
    message: 'Undangan Pernikahan API is running successfully.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    return handleApiRequest(postData);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApiRequest(data) {
  try {
    if (data.apiKey !== 'cr4r_wedding_secret_2026') {
      throw new Error('Unauthorized Access: Invalid API Key');
    }
    
    var action = data.action;
    var responseData = {};
    
    if (action === 'getPublicData') {
      responseData = getPublicData();
    } else if (action === 'saveRSVP') {
      var res = saveRSVP(data.data);
      responseData = {result: res};
    } else if (action === 'getSettings') {
      responseData = getSettings(data.token);
    } else if (action === 'getGallery') {
      responseData = getGallery();
    } else if (action === 'getRSVPs') {
      responseData = getRSVPs(data.token);
    } else if (action === 'getAudioData') {
      responseData = getAudioData(data.fileId);
    } else if (action === 'login') {
      var res = login(data.username, data.password);
      responseData = {result: res};
    } else if (action === 'saveSettings') {
      var res = saveSettings(data.settings, data.token);
      responseData = {result: res};
    } else if (action === 'addGalleryItem') {
      var res = addGalleryItem(data.item, data.token);
      responseData = {result: res};
    } else if (action === 'deleteGalleryItem') {
      var res = deleteGalleryItem(data.id, data.token);
      responseData = {result: res};
    } else if (action === 'deleteRsvp') {
      var res = deleteRsvp(data.rowNum, data.token);
      responseData = {result: res};
    } else {
      throw new Error('Action not found');
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: responseData}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}



function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

function getDb() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  var ss;
  if (!ssId) {
    ss = SpreadsheetApp.create('Database_Undangan_Pernikahan');
    props.setProperty('SPREADSHEET_ID', ss.getId());
    setupDatabase(ss);
  } else {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch(e) {
      ss = SpreadsheetApp.create('Database_Undangan_Pernikahan');
      props.setProperty('SPREADSHEET_ID', ss.getId());
      setupDatabase(ss);
    }
  }
  return ss;
}

function setupDatabase(ss) {
  var sheet1 = ss.getSheets()[0];
  sheet1.setName('Settings');
  sheet1.appendRow(['Key', 'Value']);
  sheet1.appendRow(['BrideName', 'Siti']);
  sheet1.appendRow(['GroomName', 'Andi']);
  sheet1.appendRow(['AkadDate', '2026-12-01T08:00']);
  sheet1.appendRow(['ResepsiDate', '2026-12-01T11:00']);
  sheet1.appendRow(['MusicUrl', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3']);
  sheet1.appendRow(['MapsLink', 'https://maps.google.com']);
  sheet1.appendRow(['MapImage', '']);
  sheet1.appendRow(['Greeting', 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan resepsi pernikahan putra-putri kami.']);
  sheet1.appendRow(['BrideDesc', 'Putri dari Bpk. Fulan & Ibu Fulanah']);
  sheet1.appendRow(['GroomDesc', 'Putra dari Bpk. Fulan & Ibu Fulanah']);
  sheet1.appendRow(['BankAccounts', JSON.stringify([{"bank": "BCA", "account": "1234567890", "name": "Putra / Putri"}])]);
  
  var gallery = ss.insertSheet('Gallery');
  gallery.appendRow(['Id', 'Type', 'Url', 'Name']);
  gallery.appendRow(['1', 'photo', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', 'Contoh Foto 1']);
  gallery.appendRow(['2', 'photo', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 'Contoh Foto 2']);
  
  var rsvp = ss.insertSheet('RSVP');
  rsvp.appendRow(['Timestamp', 'Name', 'Attendance', 'Guests', 'Message']);
  
  var users = ss.insertSheet('Users');
  users.appendRow(['Username', 'Password', 'Role']);
  users.appendRow(['admin', 'admin123', 'admin']);
}

function login(username, password) {
  var ss = getDb();
  var usersSheet = ss.getSheetByName('Users');
  var data = usersSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == username && data[i][1] == password && data[i][2] == 'admin') {
      var token = Utilities.getUuid();
      CacheService.getScriptCache().put(token, 'admin', 21600); // 6 hours
      return { success: true, token: token };
    }
  }
  return { success: false, message: 'Invalid credentials' };
}

function verifyToken(token) {
  if (!token) return false;
  var role = CacheService.getScriptCache().get(token);
  return role === 'admin';
}

function getSettings() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Settings');
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    var val = data[i][1];
    if (val instanceof Date) {
      val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
    }
    settings[data[i][0]] = val;
  }
  return settings;
}

function saveSettings(settings, token) {
  if (!verifyToken(token)) throw new Error('Unauthorized');
  var ss = getDb();
  var sheet = ss.getSheetByName('Settings');
  var data = sheet.getDataRange().getValues();
  
  if (settings.MapImageBase64) {
    settings.MapImage = uploadFileToDrive(settings.MapImageBase64, 'denah.png', settings.MapImageMime, 'Undangan Pernikahan');
  }

  if (settings.MusicFileBase64) {
    settings.MusicUrl = uploadFileToDrive(settings.MusicFileBase64, settings.MusicFileName || 'musik_latar.mp3', settings.MusicFileMime, 'Undangan Pernikahan');
  }

  // Handle Bank Icons
  if (settings.BankAccounts) {
    try {
      var banks = JSON.parse(settings.BankAccounts);
      for (var j = 0; j < banks.length; j++) {
        if (banks[j].iconBase64 && banks[j].iconBase64.startsWith('data:image')) {
          banks[j].iconUrl = uploadFileToDrive(banks[j].iconBase64, 'icon_bank_' + Utilities.getUuid().substring(0,8) + '.png', banks[j].iconMime || 'image/png', 'icon_amplop', 'Undangan Pernikahan');
        }
        delete banks[j].iconBase64;
        delete banks[j].iconMime;
      }
      settings.BankAccounts = JSON.stringify(banks);
    } catch(e) {
      // ignore
    }
  }

  // Cek key yang ada di sheet
  var existingKeys = {};
  for (var i = 1; i < data.length; i++) {
    existingKeys[data[i][0]] = i + 1; // row index (1-based)
  }

  // Update or Append
  for (var key in settings) {
    if (key !== 'MapImageBase64' && key !== 'MapImageMime' && 
        key !== 'MusicFileBase64' && key !== 'MusicFileMime' && key !== 'MusicFileName') { // Skip temporary upload variables
      if (existingKeys[key]) {
        sheet.getRange(existingKeys[key], 2).setValue(settings[key]);
      } else {
        sheet.appendRow([key, settings[key]]);
      }
    }
  }
  
  return { success: true };
}

function getGallery() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Gallery');
  var data = sheet.getDataRange().getValues();
  var gallery = [];
  for (var i = 1; i < data.length; i++) {
    gallery.push({
      id: data[i][0],
      type: data[i][1],
      url: data[i][2],
      name: data[i][3] || ''
    });
  }
  return gallery;
}

function addGalleryItem(item, token) {
  if (!verifyToken(token)) throw new Error('Unauthorized');
  
  if (item.base64Data) {
    try {
      var ext = item.mimeType.split('/')[1] || 'jpeg';
      var filename = item.name + '.' + ext;
      item.url = uploadFileToDrive(item.base64Data, filename, item.mimeType, 'Galeri', 'Undangan Pernikahan');
    } catch(e) {
      throw new Error('Gagal upload gambar: ' + e.message);
    }
  }

  var ss = getDb();
  var sheet = ss.getSheetByName('Gallery');
  var id = Utilities.getUuid();
  sheet.appendRow([id, item.type, item.url, item.name]);
  return { success: true, id: id };
}

function deleteGalleryItem(id, token) {
  if (!verifyToken(token)) throw new Error('Unauthorized');
  var ss = getDb();
  var sheet = ss.getSheetByName('Gallery');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

function saveRSVP(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('RSVP');
  var timestamp = new Date();
  sheet.appendRow([timestamp, data.name, data.attendance, data.guests, data.message]);
  return { success: true };
}

function getRSVPs(token) {
  if (!verifyToken(token)) throw new Error('Unauthorized');
  var ss = getDb();
  var sheet = ss.getSheetByName('RSVP');
  var data = sheet.getDataRange().getValues();
  var rsvps = [];
  for (var i = 1; i < data.length; i++) {
    var ts = data[i][0];
    if (ts instanceof Date) ts = ts.toISOString();
    rsvps.push({
      timestamp: ts,
      name: data[i][1],
      attendance: data[i][2],
      guests: data[i][3],
      message: data[i][4]
    });
  }
  return rsvps;
}

function getPublicData() {
  return {
    settings: getSettings(),
    gallery: getGallery(),
    rsvps: getPublicRSVPs()
  };
}

function getPublicRSVPs() {
  var ss = getDb();
  var sheet = ss.getSheetByName('RSVP');
  var data = sheet.getDataRange().getValues();
  var rsvps = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][4]) { // has message
      rsvps.push({
        timestamp: data[i][0] ? new Date(data[i][0]).toISOString() : null,
        name: data[i][1],
        message: data[i][4]
      });
    }
  }
  return rsvps.reverse();
}

function getOrCreateFolder(folderName, parentFolder) {
  var parent = parentFolder ? parentFolder : DriveApp.getRootFolder();
  var folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(folderName);
  }
}

function uploadFileToDrive(base64Data, filename, mimeType, folderName, parentFolderName) {
  var parent = DriveApp.getRootFolder();
  if (parentFolderName) {
    parent = getOrCreateFolder(parentFolderName, parent);
  }
  var folder = getOrCreateFolder(folderName, parent);
  
  var data = Utilities.base64Decode(base64Data.split(',')[1]);
  var blob = Utilities.newBlob(data, mimeType, filename);
  
  // If a file with the same name exists, delete it (useful for denah.png)
  var existing = folder.getFilesByName(filename);
  while (existing.hasNext()) {
    existing.next().setTrashed(true);
  }
  
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  if (mimeType.indexOf('audio/') > -1) {
    return 'https://drive.google.com/uc?export=download&confirm=t&id=' + file.getId();
  }
  
  // Return the direct view URL
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000';
}


function getAudioData(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var base64 = Utilities.base64Encode(file.getBlob().getBytes());
    return {
      success: true,
      mimeType: file.getMimeType(),
      base64: base64
    };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

