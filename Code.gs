function doGet(e) {
  var page = e.parameter.page;
  var template;
  if (page === 'admin') {
    template = HtmlService.createTemplateFromFile('Admin');
  } else if (page === 'login') {
    template = HtmlService.createTemplateFromFile('Login');
  } else {
    template = HtmlService.createTemplateFromFile('Index');
  }
  return template.evaluate()
    .setTitle('Undangan Pernikahan')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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
  
  var gallery = ss.insertSheet('Gallery');
  gallery.appendRow(['Id', 'Type', 'Url']);
  gallery.appendRow(['1', 'photo', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80']);
  gallery.appendRow(['2', 'photo', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80']);
  
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
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function saveSettings(settings, token) {
  if (!verifyToken(token)) throw new Error('Unauthorized');
  var ss = getDb();
  var sheet = ss.getSheetByName('Settings');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    if (settings.hasOwnProperty(key)) {
      sheet.getRange(i + 1, 2).setValue(settings[key]);
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
      url: data[i][2]
    });
  }
  return gallery;
}

function addGalleryItem(item, token) {
  if (!verifyToken(token)) throw new Error('Unauthorized');
  var ss = getDb();
  var sheet = ss.getSheetByName('Gallery');
  var id = Utilities.getUuid();
  sheet.appendRow([id, item.type, item.url]);
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
    rsvps.push({
      timestamp: data[i][0],
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
  for (var i = Math.max(1, data.length - 20); i < data.length; i++) { // only return last 20 messages for public view
    rsvps.push({
      name: data[i][1],
      message: data[i][4]
    });
  }
  return rsvps.reverse();
}
