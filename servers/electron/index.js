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

const backlog = new Array();
const clients = new Set();

function getByID(id) {
  for (let i = 0; i < backlog.length; i++) {
    if (backlog[i].id === id) {
      return backlog[i];
    }
  }

  return null;
}

function record(inputId, action, args) {
  const id = inputId || v4();

  let entry = getByID(id);
  if (entry) {
    entry.args = args;
  } else {
    entry = { action, id, value: null, args };
    backlog.push(entry);
  }

  return id;
}

function update(id, value) {
  const entry = getByID(id);
  if (entry) {
    entry.value = value;

    for (c of clients) {
      c.send('_value', id, value);
    }
  }
}

ipcMain.on('ready', (event) => {
  clients.add(event.sender);

  backlog.slice(0, 100).forEach(({ action, id, value, args }) => {
    event.sender.send(action, id, value, args);
  });
});

const server = jayson.server({
  Debug: ([ { text } ], cb) => {
    const id = record(null, 'debug', { text });
    for (c of clients) {
      c.send('debug', id, null, { text });
    }

    cb(null, true);
  },
  Info: ([ { text } ], cb) => {
    const id = record(null, 'info', { text });
    for (c of clients) {
      c.send('info', id, null, { text });
    }

    cb(null, true);
  },
  Warn: ([ { text } ], cb) => {
    const id = record(null, 'warn', { text });
    for (c of clients) {
      c.send('warn', id, null, { text });
    }

    cb(null, true);
  },
  Error: ([ { text } ], cb) => {
    const id = record(null, 'error', { text });
    for (c of clients) {
      c.send('error', id, null, { text });
    }

    cb(null, true);
  },
  Progress: ([ { token: inputToken, total, complete, final } ], cb) => {
    const token = inputToken || v4();

    const id = record(token, 'progress', { token, total, complete, final });
    for (c of clients) {
      c.send('progress', id, null, { token, total, complete, final });
    }

    cb(null, token);
  },
  Confirm: ([ { text } ], cb) => {
    const id = record(null, 'confirm', { text });
    for (c of clients) {
      c.send('confirm', id, null, { text });
    }

    ipcMain.once(id, (event, res) => {
      update(id, res);
      cb(null, res);
    });
  },
  Prompt: ([ { text } ], cb) => {
    const id = record(null, 'prompt', { text });
    for (c of clients) {
      c.send('prompt', id, null, { text });
    }

    ipcMain.once(id, (event, res) => {
      update(id, res);
      cb(null, res);
    });
  },
  Password: ([ { text } ], cb) => {
    const id = record(null, 'password', { text });
    for (c of clients) {
      c.send('password', id, null, { text });
    }

    ipcMain.once(id, (event, res) => {
      update(id, res);
      cb(null, res);
    });
  },
  Option: ([ { text, options } ], cb) => {
    const id = record(null, 'option', { text, options });
    for (c of clients) {
      c.send('option', id, null, { text, options });
    }

    ipcMain.once(id, (event, res) => {
      update(id, res);
      cb(null, res);
    });
  },
  Options: ([ { text, options } ], cb) => {
    const id = record(null, 'options', { text, options });
    for (c of clients) {
      c.send('options', id, null, { text, options });
    }

    ipcMain.once(id, (event, res) => {
      update(id, res);
      cb(null, res);
    });
  },
});

server.tcp({ version: 1 }).listen('/tmp/.unifaced.sock', () => {
  process.on('exit', () => { unlinkSync('/tmp/.unifaced.sock'); });
});
