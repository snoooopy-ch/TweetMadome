const {app, BrowserWindow, ipcMain, dialog, Menu, MenuItem} = require('electron');
const fs = require('fs');
const encoding = require('encoding-japanese');

let win;
let num = 0;
let ids = [];
let sreTitle = '';
let settingPath = 'Setting.ini';

let stateComments = ['#datパス', '#指定したdatパス', '#チェックボックス', '#文字色', '#注意レス', '#非表示レス', '#名前欄の置換',
  '#投稿日・IDの置換', '#注目レスの閾値', '#ボタンの色'];
let curComment = '';
let yesNoKeys = ['youtube'];
let selectKeys = ['res_menu'];
const onOffKeys = ['jogai'];
let settings;
let loadedTitles = [];

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1223,
    height: 948,
    minWidth: 1223,
    title: 'ツイート取得',
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,
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

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? {role: 'close'} : {role: 'quit'}
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        ...(isMac ? [
          {role: 'pasteAndMatchStyle'},
          {role: 'delete'},
          {role: 'selectAll'},
          {type: 'separator'},
          {
            label: 'Speech',
            submenu: [
              {role: 'startspeaking'},
              {role: 'stopspeaking'}
            ]
          }
        ] : [
          {role: 'delete'},
          {type: 'separator'},
          {role: 'selectAll'}
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const {shell} = require('electron');
            await shell.openExternal('https://electronjs.org');
          }
        }
      ]
    }

  ];

  const temp_menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(temp_menu);

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)
  // win.setMenu(menu);
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
        // if(stateComments.indexOf(line) !== -1) {
        curComment = line;
        // }
        continue;
      }
      if (line.length === 0) {
        continue;
      }
      // if (line.match(/pass:/gi)) {
      //   settings['autoSavePath'] = line.replace(/pass:/gi, '').trim();
      //   continue;
      // }
      let chunks = line.split(':');
      let lineArgs = [chunks.shift(), chunks.join(':')];

      if (yesNoKeys.indexOf(lineArgs[0]) !== -1) {
        settings[lineArgs[0]] = (lineArgs[1] === 'yes' || lineArgs[1] === 'yes;');
      } else if (selectKeys.indexOf(lineArgs[0]) !== -1) {
        settings[lineArgs[0]] = lineArgs[1];
      } else {
        if (lineArgs.length > 1) {
          settings[lineArgs[0]] = lineArgs[1].replace(/;/g, '');
        } else {
          settings[lineArgs[0]] = '';
        }
      }
    }
    remaining = remaining.substring(last);
  });

  input.on('end', function () {
    win.webContents.send("getSettings", settings);
  });

}