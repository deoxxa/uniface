const crel = require('crel');
const { ipcRenderer } = require('electron');
const { v4 } = require('uuid');

['click', 'keydown'].forEach((eventName) => {
  crel.attrMap[`on${eventName}`] = (element, fn) => {
    element.addEventListener(eventName, fn);
  };
});

crel.attrMap.classes = (element, arr) => {
  arr.forEach((e) => element.classList.add(e));
};

crel.attrMap.disabled = (element, disabled) => {
  if (disabled) {
    element.disabled = true;
  }
};

function appendText(id, urgency, text) {
  document.body.appendChild(crel('div', { id, classes: [ 'element', 'text', urgency ] }, text));

  window.scrollTo(0, document.body.scrollHeight);
}

ipcRenderer.on('debug', (event, id, replay, { text }) => { appendText(id, 'debug', text); });
ipcRenderer.on('info', (event, id, replay, { text }) => { appendText(id, 'info', text); });
ipcRenderer.on('warn', (event, id, replay, { text }) => { appendText(id, 'warn', text); });
ipcRenderer.on('error', (event, id, replay, { text }) => { appendText(id, 'error', text); });

ipcRenderer.on('confirm', (event, id, replay, { text }) => {
  document.body.appendChild(crel('div', { id, classes: [ 'element' ] }, [
    crel('div', { classes: [ 'buttons' ] }, [
      crel('button', { classes: [ 'button' ], disabled: replay, onclick() { ipcRenderer.send(id, true); } }, 'yes'),
      crel('button', { classes: [ 'button' ], disabled: replay, onclick() { ipcRenderer.send(id, false); } }, 'no'),
    ]),
    crel('div', text),
  ]));

  window.scrollTo(0, document.body.scrollHeight);
});

ipcRenderer.on('prompt', (event, id, replay, { text }) => {
  document.body.appendChild(crel('div', { id, classes: [ 'element', 'text-input' ] }, [
    crel('div', text),
    crel('input', {
      type: 'text',
      disabled: replay,
      onkeydown(ev) {
        if (ev.key === 'Enter') {
          ev.target.disabled = true;

          ipcRenderer.send(id, ev.target.value);
        }
      },
    }),
  ]));

  window.scrollTo(0, document.body.scrollHeight);
});

ipcRenderer.on('password', (event, id, replay, { text }) => {
  document.body.appendChild(crel('div', { id, classes: [ 'element', 'text-input' ] }, [
    crel('div', text),
    crel('input', {
      type: 'password',
      disabled: replay,
      onkeydown(ev) {
        if (ev.key === 'Enter') {
          ev.target.disabled = true;

          ipcRenderer.send(id, ev.target.value);
        }
      },
    }),
  ]));

  window.scrollTo(0, document.body.scrollHeight);
});

ipcRenderer.on('option', (event, id, replay, { text, options }) => {
  document.body.appendChild(crel('div', { id, classes: [ 'element' ] }, [
    crel('div', { classes: [ 'buttons' ] }, options.map((option) => crel('button', {
      classes: [ 'button' ],
      disabled: replay,
      onclick(ev) {
        Array.from(ev.target.parentNode.querySelectorAll('button')).forEach((el) => {
          el.disabled = true;
        });

        ipcRenderer.send(id, option);
      },
    }, option))),
    crel('div', text),
  ]));

  window.scrollTo(0, document.body.scrollHeight);
});

ipcRenderer.on('options', (event, id, replay, { text, options }) => {
  document.body.appendChild(crel('div', { id, classes: [ 'element' ] }, [
    crel('div', text),
    crel('div', { classes: [ 'checkboxes' ] }, options.map((name, i) => crel('span', { classes: [ 'checkbox' ] }, [
      crel('label', { for: `${id}-${i}` }, name),
      crel('input', { type: 'checkbox', id: `${id}-${i}`, name, disabled: replay }),
    ]))),
    crel('button', {
      disabled: replay,
      onclick(ev) {
        const checked = Array.from(ev.target.parentNode.querySelectorAll('input')).filter((e) => {
          return e.checked;
        }).map((e) => e.name);

        Array.from(ev.target.parentNode.querySelectorAll('input, button')).forEach((el) => {
          el.disabled = true;
        });

        ipcRenderer.send(id, checked);
      },
    }, 'Continue'),
  ]));

  window.scrollTo(0, document.body.scrollHeight);
});

ipcRenderer.send('ready');
