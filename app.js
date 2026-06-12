import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIWF_4uHJ888IYJbAuhlgO9-BrQofxVTE",
  authDomain: "firelink-beb61.firebaseapp.com",
  projectId: "firelink-beb61",
  storageBucket: "firelink-beb61.firebasestorage.app",
  messagingSenderId: "395613452691",
  appId: "1:395613452691:web:af1620da9edbbc39ce5066"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let responderName = localStorage.getItem('responderName') || '';

window.onload = function() {
  if (responderName) {
    document.getElementById('responderName').textContent = responderName;
    document.getElementById('nameInput').value = responderName;
  }
  listenForContacts();
  requestNotificationPermission();
};

window.saveName = function() {
  const input = document.getElementById('nameInput').value.trim();
  if (!input) return;
  responderName = input;
  localStorage.setItem('responderName', responderName);
  document.getElementById('responderName').textContent = responderName;
  alert('Name saved: ' + responderName);
};

window.manualContact = async function() {
  if (!responderName) {
    alert('Please enter your name first');
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  const dateStr = now.toLocaleDateString();

  await addDoc(collection(db, 'contacts'), {
    responder: responderName,
    time: timeStr,
    date: dateStr,
    timestamp: now.getTime()
  });

  document.body.style.background = '#3a0000';
  document.getElementById('status').textContent = '🚨 PT CONTACT';
  document.getElementById('timestamp').textContent = responderName + ' — ' + dateStr + ' at ' + timeStr;
};

window.clearContact = function() {
  document.body.style.background = '#1a1a2e';
  document.getElementById('status').textContent = 'Awaiting call...';
  document.getElementById('timestamp').textContent = '';
};

function listenForContacts() {
  const q = query(collection(db, 'contacts'), orderBy('timestamp', 'desc'), limit(10));
  onSnapshot(q, (snapshot) => {
    const entries = document.getElementById('logEntries');
    entries.innerHTML = '';
    snapshot.forEach((doc) => {
      const d = doc.data();
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `
        <div class="log-name">${d.responder}</div>
        <div class="log-time">${d.date} at ${d.time}</div>
      `;
      entries.appendChild(div);
    });

    if (!snapshot.empty) {
      const latest = snapshot.docs[0].data();
      sendNotification('PT CONTACT', latest.responder + ' made patient contact at ' + latest.time);
    }
  });
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body });
  }
}
