import util from 'util';
import foreverMonitor from 'forever-monitor';
import { exec as ex } from 'child_process';

import reterminalKeyboard from './reterminalkeyboard.js';
const exec = util.promisify(ex);
const CHROMIUM = [
  '/usr/bin/chromium',
  '--kiosk',
  'http://10.160.18.10:3000',
  '–check-for-update-interval=1',
  '–simulate-critical-update',
  '–start-fullscreen',
  '–incognito',
  '–noerrdialogs',
  '–disable-translate',
  '–no-first-run',
  '–fast',
  '–fast-start',
  '–disable-infobars',
  '–disable-features=TranslateUI',
  '–disk-cache-dir=/dev/null',
  '–overscroll-history-navigation=0',
  '–disable-pinch',
];

// console.log('reterminalKeyboard', reterminalKeyboard);

// reterminalKeyboard.on('single', console.log);
// reterminalKeyboard.on('double', console.log);
// reterminalKeyboard.on('long', console.log);
// reterminalKeyboard.on('verylong', console.log);

reterminalKeyboard.on('GREEN', (ev) => {
  switch(ev.type) {
    case 'single': {
      turnScreenOn();
      break;
    }
    case 'long': {
      if (browser) {
        if (browser && browser.running) {
          console.log('Killing browser');
          browser.stop();
        } else {
          console.log('Starting browser');
          startBrowser();
        }
      }
      break;
    }
  }
})

reterminalKeyboard.on('POWER', (ev) => {
  switch(ev.type) {
    case 'single': {
      turnScreenOff();
    }
  }
})


let mainDisplay;
let browser;
const setup = () => {
  exec('(cd /tmp/.X11-unix && for x in X*; do echo ":${x#X}"; done)')
    .then(
      ({ stdout, stderr }) => {
        const displays = stdout.split('\n').filter(line => line != '');
        if (displays && displays[0]) {
          mainDisplay = displays[0];
        }
      }
    )
    .then(
      () => {
        if (mainDisplay) {
          startBrowser()
          // console.log(browser);
        }
      }
    )


  // const retval = exec('export DISPLAY=:0; /usr/bin/xinput --list', (error, stdout, stderr) => {
  //   const lines = stdout.split('\n');
  //   lines.forEach((line) => {
  //     if (line.indexOf('gpio_keys') > -1) {
  //       const words = line.split('\t');
  //       const id = words[1].split('=')[1];
  //       console.log(`Disabling input id = ${id}`);
  //       exec(`export DISPLAY=:0; /usr/bin/xinput --disable ${id}`);
  //     }
  //   })
  // });
}

const startBrowser = () => {
  browser = foreverMonitor.start(CHROMIUM, {
    'env': { 'DISPLAY': mainDisplay },
    // max : 1,
    silent : true
  });
}

const turnScreenOn = () => {
  console.log('Turn display ON');
  exec('export DISPLAY=:0; /usr/bin/xset dpms force on');
}

const turnScreenOff = () => {
  console.log('Turn display OFF');
  exec('export DISPLAY=:0; /usr/bin/xset dpms force off');
}


setup();
