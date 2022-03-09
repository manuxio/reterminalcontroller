import InputEvent from 'input-event';
import EventEmitter from 'events';
const input = new InputEvent('/dev/input/by-path/platform-gpio_keys-event');
const keyboard = new InputEvent.Keyboard(input);

const keys = {
  30: 'F1',
  31: 'F2',
  32: 'F3',
  33: 'GREEN',
  142: 'POWER'
};
const DBL_CLICK_INTERVAL = 500;
const LONG_CLICK = 2000;
const VERYLONG_CLICK = 5000;

const myEventEmitter = new EventEmitter();
const defaultClickStatus = {
  clickCount: 0,
  pressed: false,
  lastClick: null,
  scheduleSingle: null,
  scheduleLong: null,
  scheduleVeryLong: null
}
const keystatus = {
  F1: Object.assign({}, defaultClickStatus),
  F2: Object.assign({}, defaultClickStatus),
  F3: Object.assign({}, defaultClickStatus),
  GREEN: Object.assign({}, defaultClickStatus),
  POWER: Object.assign({}, defaultClickStatus),
};

keyboard.on('keyup', (ev) => {
  // console.log('Up')
  const now = new Date();
  const key = keys[ev.code];
  const status = keystatus[key];
  status.pressed = false;
  let {
    clickCount,
    lastClick
  } = status;
  const diff = now - lastClick;
  if (status.clickCount === 1 && diff < VERYLONG_CLICK) {
    // console.log('Not very long')
    clearTimeout(status.scheduleVeryLong);
  }
  if (status.clickCount === 1 && diff > LONG_CLICK && diff < VERYLONG_CLICK) {
    // console.log('Long', key);
    myEventEmitter.emit('long', {
      key,
      time: now,
      type: 'long'
    });
    myEventEmitter.emit(key, {
      key,
      time: now,
      type: 'long'
    });
    status.scheduleSingle = null;
    status.scheduleLong = null;
    status.scheduleVeryLong = null;
    status.clickCount = 0;
  }
  if (status.clickCount === 1) {
    // console.log('Maybe single')
    status.scheduleSingle = setTimeout(((k, s) => () => {
      // console.log('Single', key);
      myEventEmitter.emit('single', {
        key,
        time: now,
        type: 'single'
      });
      myEventEmitter.emit(key, {
        key,
        time: now,
        type: 'single'
      });
      status.clickCount = 0;
    })(key, status), DBL_CLICK_INTERVAL);
  }

});

keyboard.on('keypress', (ev) => {
  const now = new Date();
  // console.log(ev.code);
  const key = keys[ev.code];
  const status = keystatus[key];
  let {
    clickCount,
    lastClick
  } = status;
  const diff = now - lastClick;
  if (status.scheduleSingle) {
    clearTimeout(status.scheduleSingle);
  }
  if (clickCount === 0 || diff > DBL_CLICK_INTERVAL) {
    // console.log('Here');
    status.clickCount = 1;
    status.lastClick = now;
    // status.scheduleLong = setTimeout(((k, s) => () => {
    //   if (!status.pressed) {
    //     console.log('Long', k);
    //     clearTimeout(status.scheduleVeryLong);
    //     status.scheduleSingle = null;
    //     status.scheduleLong = null;
    //     status.scheduleVeryLong = null;
    //     status.clickCount = 0;
    //   } else {
    //     console.log('Long skip', 'still pressed');
    //   }
    // })(key, status), LONG_CLICK);
    status.scheduleVeryLong = setTimeout(((k, s) => () => {
      // console.log('Very Long', k);
      myEventEmitter.emit('verylong', {
        key,
        time: now,
        type: 'verylong'
      });
      myEventEmitter.emit(key, {
        key,
        time: now,
        type: 'verylong'
      });
      status.scheduleSingle = null;
      status.scheduleLong = null;
      status.scheduleVeryLong = null;
      status.clickCount = 0;
    })(key, status), VERYLONG_CLICK);
  } else {
    status.lastClick = now;
    if (diff < DBL_CLICK_INTERVAL) {
      clearTimeout(status.scheduleSingle);
      // console.log('Double', key);
      myEventEmitter.emit('double', {
        key,
        time: now,
        type: 'double'
      });
      myEventEmitter.emit(key, {
        key,
        time: now,
        type: 'double'
      });
      status.clickCount = 0;
    }
  }
});
export default myEventEmitter;