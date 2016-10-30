const cn = require('classnames');
const crel = require('crel');
const { ipcRenderer } = require('electron');
const { v4 } = require('uuid');

['click', 'keydown'].forEach((eventName) => {
  crel.attrMap[`on${eventName}`] = (element, fn) => {
    element.addEventListener(eventName, fn);
  };
});

['disabled', 'checked'].forEach((prop) => {
  crel.attrMap[prop] = (element, value) => {
    if (value) {
      element[prop] = value;
    }
  };
});

function appendText(id, urgency, text) {
  const el = crel('div', { id, class: cn('element', 'text', urgency) }, text);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }
}

ipcRenderer.on('debug', (event, id, value, { text }) => { appendText(id, 'debug', text); });
ipcRenderer.on('info', (event, id, value, { text }) => { appendText(id, 'info', text); });
ipcRenderer.on('warn', (event, id, value, { text }) => { appendText(id, 'warn', text); });
ipcRenderer.on('error', (event, id, value, { text }) => { appendText(id, 'error', text); });

ipcRenderer.on('confirm', (event, id, value, { text }) => {
  const el = crel('div', { id, class: cn('element') }, [
    crel('div', { class: cn('buttons') }, [ [ true, 'yes' ], [ false, 'no' ] ].map(([ res, label ]) => {
      return crel('button', {
        class: cn('button'),
        disabled: value !== null,
        onclick(ev) {
          ipcRenderer.send(id, res);

          Array.from(ev.target.parentNode.querySelectorAll('button')).forEach((e) => {
            e.disabled = true;
          });
        },
      }, label);
    })),
    crel('div', text),
  ]);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }

  if (value === null) {
    el.scrollIntoView();
    el.querySelector('button').focus();
  }
});

ipcRenderer.on('prompt', (event, id, value, { text }) => {
  const el = crel('div', { id, class: cn('element', 'text-input') }, [
    crel('div', text),
    crel('input', {
      type: 'text',
      disabled: value !== null,
      value: value || '',
      onkeydown(ev) {
        if (ev.key === 'Enter') {
          ev.target.disabled = true;

          ipcRenderer.send(id, ev.target.value);
        }
      },
    }),
  ]);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }

  if (value === null) {
    el.scrollIntoView();
    el.querySelector('input').focus();
  }
});

ipcRenderer.on('password', (event, id, value, { text }) => {
  const el = crel('div', { id, class: cn('element', 'text-input') }, [
    crel('div', text),
    crel('input', {
      type: 'password',
      disabled: value !== null,
      value: value || '',
      onkeydown(ev) {
        if (ev.key === 'Enter') {
          ev.target.disabled = true;

          ipcRenderer.send(id, ev.target.value);
        }
      },
    }),
  ]);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }

  if (value === null) {
    el.scrollIntoView();
    el.querySelector('input').focus();
  }
});

ipcRenderer.on('option', (event, id, value, { text, options }) => {
  const el = crel('div', { id, class: cn('element') }, [
    crel('div', { class: cn('buttons') }, options.map((option) => crel('button', {
      class: cn('button', { 'button-bold': value === option }),
      disabled: value !== null,
      onclick(ev) {
        Array.from(ev.target.parentNode.querySelectorAll('button')).forEach((el) => {
          el.disabled = true;
        });

        ev.target.classList.add('button-bold');

        ipcRenderer.send(id, option);
      },
    }, option))),
    crel('div', text),
  ]);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }

  if (value === null) {
    el.scrollIntoView();
  }
});

ipcRenderer.on('options', (event, id, value, { text, options }) => {
  const el = crel('div', { id, class: cn('element') }, [
    crel('div', text),
    crel('div', { class: cn('checkboxes') }, options.map((name, i) => crel('span', { class: cn('checkbox') }, [
      crel('label', { for: `${id}-${i}` }, name),
      crel('input', {
        type: 'checkbox',
        id: `${id}-${i}`,
        name,
        disabled: value !== null,
        checked: Array.isArray(value) && value.includes(name),
      }),
    ]))),
    crel('button', {
      disabled: value !== null,
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
  ]);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }

  if (value === null) {
    el.scrollIntoView();
  }
});

ipcRenderer.on('progress', (event, id, value, { token, total, complete, final }) => {
  const el = crel('div', { id, class: cn('element', 'progress-outer') }, [
    crel('div', {
      class: cn('progress-inner'),
      style: `width: ${(complete / total) * 100}%`,
    }),
    crel('span', { class: cn('progress-label') }, `${((complete / total) * 100).toFixed(1)}%`),
  ]);

  const existing = document.getElementById(id);
  if (existing) {
    document.body.replaceChild(el, existing);
  } else {
    document.body.appendChild(el);
  }

  if (!existing) {
    el.scrollIntoView();
  }
});

ipcRenderer.send('ready');
