// Small helpers shared by every page: DOM shortcuts, app state, API calls, toasts.

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Everything the app remembers while it runs.
const state = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  events: [],
  config: {},
  currentCategory: 'ALL',      // selected tab on the Events page
  lastRegistrations: [],       // shown on the success / receipt page
};

const CATEGORIES = ['On-Stage', 'Off-Stage', 'Technical', 'Gaming'];

// CSS class that gives each category its own glow colour
const CATEGORY_CLASS = {
  'On-Stage': 'cat-onstage',
  'Off-Stage': 'cat-offstage',
  Technical: 'cat-tech',
  Gaming: 'cat-gaming',
};

const EVENT_ICONS = {
  Singing: '🎤', Dance: '💃', Drama: '🎭', 'Fashion Show': '👗', 'Stand-up Comedy': '😂',
  Quiz: '❓', Debate: '🗣️', Photography: '📷', 'Poster Making': '🖼️', 'Essay Writing': '✍️',
  BGMI: '🎮', 'Free Fire': '🔥', Valorant: '🎯', FIFA: '⚽', Chess: '♟️',
  'Code Clash': '💻', 'Web Design Challenge': '🌐', 'Debugging Battle': '🐞',
  'AI Innovation Challenge': '🤖', 'Cyber Security Challenge': '🔐', Hackathon: '🚀',
  'UI/UX Challenge': '🎨', 'Project Expo': '⚡',
};

function getEventIcon(event) {
  return EVENT_ICONS[event.name] || '✨';
}

// Stops user-typed text from being treated as HTML.
function escapeHtml(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const replacements = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, (character) => replacements[character]);
}

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = 'toast-message' + (isError ? ' error' : '');
  toast.textContent = message;
  $('#toast').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Calls our backend. Example: api('/events') or api('/events', 'POST', { name: 'Quiz' })
async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) {
    headers.Authorization = 'Bearer ' + state.token;
  }

  const response = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

// Changes the page. If we are already on it, just re-render.
function navigate(hash) {
  if (location.hash === hash) {
    route();
  } else {
    location.hash = hash;
  }
}

function saveLogin(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out');
  navigate('#/');
}

// A "label ........ value" row used on the details page and the receipt.
function infoLine(label, value) {
  return `<div class="line"><span>${label}</span><b>${escapeHtml(value)}</b></div>`;
}
