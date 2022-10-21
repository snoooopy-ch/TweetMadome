const {app, BrowserWindow, ipcMain, dialog, Menu, MenuItem} = require('electron');
const fs = require('fs');
var moment = require('moment');

let win;
let settingPath = 'Setting.ini';
let widthFiletPath = 'WidthList.ini';

let curComment = '';
let yesNoKeys = ['youtube', 'pict1mai_kyousei_tuujou', 'username_link_br', 't_top_link', 'inyo_tweet', 'large'];
let settings;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 956,
    height: 948,
    minWidth: 956,
    title: 'ツイート取得',
    backgroundColor: '#ffffff',
    icon: `${__dirname}\\src\\assets\\green_circle.png`,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(`file://${__dirname}/dist/TweetMadome/index.html`);

  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  });

  let handleRedirect = (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };
  const isMac = process.platform === 'darwin'

  // const template = [
  //   // { role: 'appMenu' }
  //   ...(isMac ? [{
  //     label: app.name,
  //     submenu: [
  //       {role: 'about'},
  //       {type: 'separator'},
  //       {role: 'services'},
  //       {type: 'separator'},
  //       {role: 'hide'},
  //       {role: 'hideothers'},
  //       {role: 'unhide'},
  //       {type: 'separator'},
  //       {role: 'quit'}
  //     ]
  //   }] : []),
  //   // { role: 'fileMenu' }
  //   {
  //     label: 'File',
  //     submenu: [
  //       isMac ? {role: 'close'} : {role: 'quit'}
  //     ]
  //   },
  //   // { role: 'editMenu' }
  //   {
  //     label: 'Edit',
  //     submenu: [
  //       {role: 'undo'},
  //       {role: 'redo'},
  //       {type: 'separator'},
  //       {role: 'cut'},
  //       {role: 'copy'},
  //       {role: 'paste'},
  //       ...(isMac ? [
  //         {role: 'pasteAndMatchStyle'},
  //         {role: 'delete'},
  //         {role: 'selectAll'},
  //         {type: 'separator'},
  //         {
  //           label: 'Speech',
  //           submenu: [
  //             {role: 'startspeaking'},
  //             {role: 'stopspeaking'}
  //           ]
  //         }
  //       ] : [
  //         {role: 'delete'},
  //         {type: 'separator'},
  //         {role: 'selectAll'}
  //       ])
  //     ]
  //   },
  //   // { role: 'viewMenu' }
  //   {
  //     label: 'View',
  //     submenu: [
  //       {role: 'reload'},
  //       {role: 'forcereload'},
  //       {role: 'toggledevtools'},
  //       {type: 'separator'},
  //       {role: 'resetzoom'},
  //       {role: 'zoomin'},
  //       {role: 'zoomout'},
  //       {type: 'separator'},
  //       {role: 'togglefullscreen'}
  //     ]
  //   },
  //   // { role: 'windowMenu' }
  //   {
  //     label: 'Window',
  //     submenu: [
  //       {role: 'minimize'},
  //       {role: 'zoom'}
  //     ]
  //   },
  //   {
  //     role: 'help',
  //     submenu: [
  //       {
  //         label: 'Learn More',
  //         click: async () => {
  //           const {shell} = require('electron');
  //           await shell.openExternal('https://electronjs.org');
  //         }
  //       }
  //     ]
  //   }
  
  // ];
  // const temp_menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(temp_menu);

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)
  // win.setMenu(menu);
  win.removeMenu();
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
});

ipcMain.on("loadSettings", (event) => {
  getSettings();
});

function getSettings() {

  if(!fs.existsSync(settingPath)) {
    dialog.showErrorBox('設定', '設定ファイルを読めません。');
    return;
  }

  let input = fs.createReadStream(settingPath);
  let remaining = '';
  settings = { };
  num = 0;
  input.on('data', function (data) {
    remaining += data;
    remaining = remaining.replace(/(\r)/gm, '');
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      let line = remaining.substring(last, index);

      last = index + 1;
      index = remaining.indexOf('\n', last);
      if (line.startsWith('#')) {
        curComment = line;
        continue;
      }
      if (line.length === 0) {
        continue;
      }
      getLineParam(line);
    }
    remaining = remaining.substring(last);
  });

  input.on('end', function () {
    if (remaining.length > 2){
      getLineParam(remaining);
    }
    win.webContents.send("getSettings", settings);
  });


  let widthList = [];
  if (fs.existsSync(widthFiletPath)) {
    let data = fs.readFileSync(widthFiletPath);
    let strTmp = '' + data;
    if (strTmp.length > 0) {
      widthList = strTmp.split('\n');
    }
    for(let i=0; i<widthList.length; i++){
      widthList[i] = widthList[i].replace(/\r|\n|\r\n/g, '');
    }
  }
  win.webContents.send("getWidthList", widthList);
}

function getLineParam(line){
  let chunks = line.split(':');
  let lineArgs = [chunks.shift(), chunks.join(':')];

  if (yesNoKeys.indexOf(lineArgs[0]) !== -1) {
    settings[lineArgs[0]] = (lineArgs[1] === 'yes' || lineArgs[1] === 'yes;');
  } else {
    if (lineArgs.length > 1) {
      settings[lineArgs[0]] = lineArgs[1].replace(/;/g, '');
    } else {
      settings[lineArgs[0]] = '';
    }
  }
}

ipcMain.on("saveSettings", (event, params) => {
  saveSettings(params);
});

ipcMain.on("log", (event, value) => {
  saveLog(value);
});

function saveSettings(params) {
  fs.readFile('Setting.ini', 'utf8', function (err, data) {

    if (data.match(/(image_width:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(image_width:)+(\r\n)/g, `$1${params.imageWidth}$2`);
    } else {
      data = data.replace(/(image_width:)[^\r^\n]+(\r\n)/g, `$1${params.imageWidth}$2`);
    }

    if (data.match(/(video_width:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(video_width:)+(\r\n)/g, `$1${params.videoWidth}$2`);
    } else {
      data = data.replace(/(video_width:)[^\r^\n]+(\r\n)/g, `$1${params.videoWidth}$2`);
    }

    if (data.match(/(video_width2:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(video_width2:)+(\r\n)/g, `$1${params.videoWidth2}$2`);
    } else {
      data = data.replace(/(video_width2:)[^\r^\n]+(\r\n)/g, `$1${params.videoWidth2}$2`);
    }

    if (data.match(/(video_width3:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(video_width3:)+(\r\n)/g, `$1${params.videoWidth3}$2`);
    } else {
      data = data.replace(/(video_width3:)[^\r^\n]+(\r\n)/g, `$1${params.videoWidth3}$2`);
    }

    if (data.match(/(replace_image_url1:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(replace_image_url1:)+(\r\n)/g, `$1${params.replaceImgUrl1}$2`);
    } else {
      data = data.replace(/(replace_image_url1:)[^\r^\n]+(\r\n)/g, `$1${params.replaceImgUrl1}$2`);
    }

    if (data.match(/(replace_image_url2:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(replace_image_url2:)+(\r\n)/g, `$1${params.replaceImgUrl2}$2`);
    } else {
      data = data.replace(/(replace_image_url2:)[^\r^\n]+(\r\n)/g, `$1${params.replaceImgUrl2}$2`);
    }

    if (data.match(/(replace_anchor_url1:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(replace_anchor_url1:)+(\r\n)/g, `$1${params.replaceAnchorUrl1}$2`);
    } else {
      data = data.replace(/(replace_anchor_url1:)[^\r^\n]+(\r\n)/g, `$1${params.replaceAnchorUrl1}$2`);
    }

    if (data.match(/(replace_anchor_url2:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(replace_anchor_url2:)+(\r\n)/g, `$1${params.replaceAnchorUrl2}$2`);
    } else {
      data = data.replace(/(replace_anchor_url2:)[^\r^\n]+(\r\n)/g, `$1${params.replaceAnchorUrl2}$2`);
    }

    if (data.match(/(douga_url:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(douga_url:)+(\r\n)/g, `$1${params.dougaUrl}$2`);
    } else {
      data = data.replace(/(douga_url:)[^\r^\n]+(\r\n)/g, `$1${params.dougaUrl}$2`);
    }

    if (data.match(/(is_t_top_link:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(is_t_top_link:)+(\r\n)/g, `$1${params.isAddTopLink ? 'on' : 'off'}$2`);
    } else {
      data = data.replace(/(is_t_top_link:)[^\r^\n]+(\r\n)/g, `$1${params.isAddTopLink ? 'on' : 'off'}$2`);
    }

    if (data.match(/(is_t_bottom_link:)[^\r^\n]+((\r\n)|$)/g) === null) {
      data = data.replace(/(is_t_bottom_link:)+((\r\n)|$)/g, `$1${params.isAddBottomLink ? 'on' : 'off'}$2`);
    } else {
      data = data.replace(/(is_t_bottom_link:)[^\r^\n]+((\r\n)|$)/g, `$1${params.isAddBottomLink ? 'on' : 'off'}$2`);
    }

    if (!data.endsWith('\r\n')){
      data +='\r\n';
    }

    fs.writeFile('Setting.ini', data, (err) => {
      if (err) throw err;
      console.log('The settings file has been saved!');
    });
  });
}

function saveLog(value) {
  console.log(settings);
  if (value.length != 0) {
    let lines = moment().format('YYYY/MM/DD HH:mm:ss');
    lines += '\r\n';
    for (const v of value) {
      lines += v;
      lines += '\r\n';
    }
    lines += '\r\n';

    fs.appendFile(settings['tweet_tuika_pass'], lines, err => {
      if (err) {
      } else {
      }
    });
  }
}
