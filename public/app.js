const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const authForm = document.getElementById('authForm');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authMessage = document.getElementById('authMessage');
const urlForm = document.getElementById('urlForm');
const urlMessage = document.getElementById('urlMessage');
const urlList = document.getElementById('urlList');
const statsPanel = document.getElementById('statsPanel');
const totalLinks = document.getElementById('totalLinks');
const totalClicks = document.getElementById('totalClicks');
const logoutBtn = document.getElementById('logoutBtn');
const tabs = [...document.querySelectorAll('.tab')];

const TOKEN_KEY = 'shortly_token';
let currentAuthMode = 'login';
let currentToken = localStorage.getItem(TOKEN_KEY) || '';

function setMessage(element, text, type = '') {
  element.textContent = text;
  element.classList.remove('error', 'success');
  if (type) {
    element.classList.add(type);
  }
}

function showView(viewName) {
  const authVisible = viewName === 'auth';
  authView.classList.toggle('hidden', !authVisible);
  dashboardView.classList.toggle('hidden', authVisible);
  logoutBtn.classList.toggle('hidden', authVisible);
}

function setAuthMode(mode) {
  currentAuthMode = mode;
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === mode));
  authSubmitBtn.textContent = mode === 'login' ? 'Login' : 'Create account';
  setMessage(authMessage, '');
}

function saveToken(token) {
  currentToken = token;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearSession() {
  currentToken = '';
  localStorage.removeItem(TOKEN_KEY);
  showView('auth');
  setAuthMode('login');
  authForm.reset();
  urlList.innerHTML = '';
  statsPanel.innerHTML = '<p>Select a link to view performance.</p>';
  totalLinks.textContent = '0';
  totalClicks.textContent = '0';
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: getAuthHeaders(),
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

function formatDate(dateValue) {
  if (!dateValue) return 'Never';
  return new Date(dateValue).toLocaleString();
}

function renderStats(url) {
  if (!url) {
    statsPanel.innerHTML = '<p>Select a link to view performance.</p>';
    statsPanel.classList.add('empty');
    return;
  }

  statsPanel.classList.remove('empty');
  statsPanel.innerHTML = `
    <div class="stat-row"><span>Original URL</span><strong>${url.original_url || '—'}</strong></div>
    <div class="stat-row"><span>Short code</span><strong>${url.short_code || '—'}</strong></div>
    <div class="stat-row"><span>Clicks</span><strong>${url.click_count ?? 0}</strong></div>
    <div class="stat-row"><span>Created</span><strong>${formatDate(url.created_at)}</strong></div>
    <div class="stat-row"><span>Expires</span><strong>${formatDate(url.expires_at)}</strong></div>
  `;
}

async function loadUrlStats(shortCode) {
  try {
    const stats = await apiRequest(`/api/v1/urls/stats/${shortCode}`);
    renderStats(stats);
  } catch (error) {
    renderStats(null);
    setMessage(urlMessage, error.message, 'error');
  }
}

function renderUrlList(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    urlList.innerHTML = '<div class="url-item"><p>No URLs created yet.</p></div>';
    return;
  }

  const total = urls.reduce((sum, item) => sum + Number(item.click_count || 0), 0);
  totalLinks.textContent = String(urls.length);
  totalClicks.textContent = String(total);

  urlList.innerHTML = urls
    .map((item) => {
      const shortUrl = item.short_code ? `${window.location.origin}/${item.short_code}` : '—';
      return `
        <article class="url-item" data-short-code="${item.short_code}">
          <div class="url-item-header">
            <div>
              <p class="eyebrow">Short link</p>
              <a class="url-link" href="${shortUrl}" target="_blank" rel="noreferrer">${shortUrl}</a>
            </div>
            <span class="badge">${item.click_count || 0} clicks</span>
          </div>

          <div class="url-item-meta">
            <span>${item.original_url}</span>
            <span>Created ${formatDate(item.created_at)}</span>
          </div>

          <div class="url-item-actions">
            <button class="copy-btn" data-copy-url="${shortUrl}" type="button">Copy</button>
            <button class="link-btn" data-stats="${item.short_code}" type="button">View stats</button>
          </div>
        </article>
      `;
    })
    .join('');

  urlList.querySelectorAll('[data-copy-url]').forEach((button) => {
    button.addEventListener('click', async () => {
      const url = button.dataset.copyUrl;
      try {
        await navigator.clipboard.writeText(url);
        setMessage(urlMessage, 'Short URL copied to clipboard.', 'success');
      } catch (error) {
        setMessage(urlMessage, 'Unable to copy automatically.', 'error');
      }
    });
  });

  urlList.querySelectorAll('[data-stats]').forEach((button) => {
    button.addEventListener('click', () => loadUrlStats(button.dataset.stats));
  });
}

async function loadDashboard() {
  try {
    const urls = await apiRequest('/api/v1/auth/me/urls');
    renderUrlList(urls);
    if (urls.length > 0) {
      loadUrlStats(urls[0].short_code);
    } else {
      renderStats(null);
    }
    showView('dashboard');
  } catch (error) {
    setMessage(authMessage, error.message, 'error');
    clearSession();
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  setMessage(authMessage, '');

  const formData = new FormData(authForm);
  const payload = {
    email: formData.get('email')?.toString().trim(),
    password: formData.get('password')?.toString(),
  };

  if (!payload.email || !payload.password) {
    setMessage(authMessage, 'Email and password are required.', 'error');
    return;
  }

  try {
    const endpoint = currentAuthMode === 'login' ? 'login' : 'register';
    const result = await apiRequest(`/api/v1/auth/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (currentAuthMode === 'register') {
      setMessage(authMessage, 'Registration successful. Please log in.', 'success');
      setAuthMode('login');
      authForm.reset();
      return;
    }

    saveToken(result.token);
    authForm.reset();
    await loadDashboard();
  } catch (error) {
    setMessage(authMessage, error.message, 'error');
  }
}

async function handleUrlSubmit(event) {
  event.preventDefault();
  setMessage(urlMessage, '');

  const formData = new FormData(urlForm);
  const payload = {
    url: formData.get('url')?.toString().trim(),
    customAlias: formData.get('customAlias')?.toString().trim() || '',
    expiresAt: formData.get('expiresAt')?.toString() || null,
  };

  if (!payload.url) {
    setMessage(urlMessage, 'Please enter a valid URL.', 'error');
    return;
  }

  try {
    const result = await apiRequest('/api/v1/urls/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    urlForm.reset();
    setMessage(urlMessage, `Short URL created: ${result.shortUrl}`, 'success');
    await loadDashboard();
  } catch (error) {
    setMessage(urlMessage, error.message, 'error');
  }
}

function initAuthTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setAuthMode(tab.dataset.tab));
  });
}

logoutBtn.addEventListener('click', clearSession);
authForm.addEventListener('submit', handleAuthSubmit);
urlForm.addEventListener('submit', handleUrlSubmit);

if (!currentToken) {
  showView('auth');
} else {
  loadDashboard();
}

initAuthTabs();
