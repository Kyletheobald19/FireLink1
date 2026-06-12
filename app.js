const STATUS_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NOTIFY_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

let device = null;

async function connectBLE() {
  try {
    document.getElementById('connectBtn').textContent = 'Connecting...';

    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'PTContact' }],
      optionalServices: [STATUS_UUID]
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(STATUS_UUID);
    const characteristic = await service.getCharacteristic(NOTIFY_UUID);

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleButtonPress);

    setConnected();
    document.getElementById('connectBtn').textContent = 'Connected ✓';
    addLog('Connected to button');

  } catch (err) {
    document.getElementById('connectBtn').textContent = 'Connect to Button';
    addLog('Connection failed: ' + err.message);
  }
}

function handleButtonPress(event) {
  const value = new TextDecoder().decode(event.target.value);

  if (value === 'CONTACT') {
    setContact();
    const time = new Date().toLocaleTimeString();
    document.getElementById('timestamp').textContent = 'PT Contact at ' + time;
    addLog('PT CONTACT — ' + time);
    sendNotification('PT CONTACT', 'Patient contact made at ' + time);
  }

  if (value === 'CLEAR') {
    setConnected();
    document.getElementById('timestamp').textContent = '';
    addLog('Cleared');
  }
}

function setConnected() {
  document.getElementById('status').innerHTML = '<span class="dot connected" id="dot"></span> Connected — Awaiting...';
  document.body.style.background = '#1a1a2e';
}

function setContact() {
  document.getElementById('status').innerHTML = '<span class="dot contact" id="dot"></span> PT CONTACT';
  document.body.style.background = '#3a0000';
}

function addLog(message) {
  const log = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  log.prepend(entry);
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body });
  } else if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body: body });
      }
    });
  }
  function manualContact() {
  setContact();
  const time = new Date().toLocaleTimeString();
  document.getElementById('timestamp').textContent = 'PT Contact at ' + time;
  addLog('PT CONTACT — ' + time);
  sendNotification('PT CONTACT', 'Patient contact made at ' + time);
}
}