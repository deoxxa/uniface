const { app, BrowserWindow, ipcMain } = require('electron');
const { unlinkSync } = require('fs');
const jayson = require('jayson');
const { createServer } = require('net');
const { v4 } = require('uuid');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 320,
    height: 600,
  });

  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', () => { win = null; });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

const backlog = [];
function record(action, args) {
  const id = v4();

  backlog.push({ id, action, args });

  return id;
}

const clients = new Set();
ipcMain.on('ready', (event) => {
  clients.add(event.sender);

  backlog.slice(0, 100).forEach(({ action, id, args }) => {
    event.sender.send(action, id, true, args);
  });
});

const server = jayson.server({
  Debug: ([ { text } ], cb) => {
    const id = record('debug', { text });
    for (c of clients) {
      c.send('debug', id, false, { text });
    }

    cb(null, true);
  },
  Info: ([ { text } ], cb) => {
    const id = record('info', { text });
    for (c of clients) {
      c.send('info', id, false, { text });
    }

    cb(null, true);
  },
  Warn: ([ { text } ], cb) => {
    const id = record('warn', { text });
    for (c of clients) {
      c.send('warn', id, false, { text });
    }

    cb(null, true);
  },
  Error: ([ { text } ], cb) => {
    const id = record('error', { text });
    for (c of clients) {
      c.send('error', id, false, { text });
    }

    cb(null, true);
  },
  Progress: ([ { token: inputToken, total, complete, final } ], cb) => {
    const token = inputToken || v4();

    const id = record('progress', { token, total, complete, final });
    for (c of clients) {
      c.send('progress', id, false, { token, total, complete, final });
    }

    cb(null, token);
  },
  Confirm: ([ { text } ], cb) => {
    const id = record('confirm', { text });
    for (c of clients) {
      c.send('confirm', id, false, { text });
    }

    ipcMain.once(id, (event, res) => { cb(null, res); });
  },
  Prompt: ([ { text } ], cb) => {
    const id = record('prompt', { text });
    for (c of clients) {
      c.send('prompt', id, false, { text });
    }

    ipcMain.once(id, (event, res) => { cb(null, res); });
  },
  Password: ([ { text } ], cb) => {
    const id = record('password', { text });
    for (c of clients) {
      c.send('password', id, false, { text });
    }

    ipcMain.once(id, (event, res) => { cb(null, res); });
  },
  Option: ([ { text, options } ], cb) => {
    const id = record('option', { text, options });
    for (c of clients) {
      c.send('option', id, false, { text, options });
    }

    ipcMain.once(id, (event, res) => { cb(null, res); });
  },
  Options: ([ { text, options } ], cb) => {
    const id = record('options', { text, options });
    for (c of clients) {
      c.send('options', id, false, { text, options });
    }

    ipcMain.once(id, (event, res) => { cb(null, res); });
  },
});

server.tcp({ version: 1 }).listen('/tmp/.unifaced.sock', () => {
  process.on('exit', () => { unlinkSync('/tmp/.unifaced.sock'); });
});
