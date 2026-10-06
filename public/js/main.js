// Starts the app: navigation bar, page routing, and all click / form / input listeners.

// ---------- Navigation bar ----------

function renderNav(page, param) {
  // Which link should look highlighted
  let activeKey = page;
  if (page === 'events') {
    if (param === 'Technical') activeKey = 'tech';
    else if (param === 'Gaming') activeKey = 'game';
  }

  const links = [
    { key: 'home', label: 'HOME', href: '#/' },
    { key: 'events', label: 'EVENTS', href: '#/events' },
    { key: 'tech', label: 'TECHNICAL', href: '#/events/Technical' },
    { key: 'game', label: 'GAMING', href: '#/events/Gaming' },
    { key: 'about', label: 'ABOUT', href: '#/about' },
    { key: 'contact', label: 'CONTACT', href: '#/contact' },
  ];

  if (state.user) {
    links.push({ key: 'my', label: 'DASHBOARD', href: '#/my' });
    if (state.user.role === 'admin') {
      links.push({ key: 'admin', label: 'ADMIN', href: '#/admin' });
    }
  } else {
    links.push({ key: 'login', label: 'LOGIN', href: '#/login' });
    links.push({ key: 'admin-login', label: 'ADMIN LOGIN', href: '#/admin-login' });
  }

  let html = links
    .map((link) => `<a href="${link.href}" ${link.key === activeKey ? 'class="active"' : ''}>${link.label}</a>`)
    .join('');

  if (state.user) {
    html += '<a href="#" data-action="logout">LOGOUT</a>';
  }
  $('#links').innerHTML = html;
}

// ---------- Pages ----------
// render: builds the HTML.  after: runs once the HTML is on screen.
// access: "login" or "admin" if the page is protected.

const pages = {
  home:     { render: renderHome },
  events:   { render: renderEvents, after: filterEvents },
  event:    { render: renderEventDetails },
  login:    { render: renderLogin },
  'admin-login': { render: renderAdminLogin },
  signup:   { render: renderSignup },
  register: { render: renderRegister, access: 'login', after: updateTeamAndSummary },
  success:  { render: renderSuccess },
  my:       { render: renderDashboard, access: 'login' },
  admin:    { render: renderAdmin, access: 'admin', after: loadAdminRegistrations },
};

// The URL looks like  #/page/param   e.g. #/event/64f... or #/events/Gaming
async function route() {
  const [urlPage, param] = location.hash.slice(2).split('/');
  let pageName = urlPage || 'home';

  // "About" and "Contact" are sections of the home page, so show home and scroll to them
  let scrollTarget = null;
  if (pageName === 'about' || pageName === 'contact') {
    scrollTarget = pageName;
    pageName = 'home';
  }
  const page = pages[pageName] || pages.home;

  renderNav(urlPage || 'home', param);
  $('#links').classList.remove('open');

  // Protected pages
  if (page.access === 'login' && !state.token) {
    showToast('Please login first', true);
    return navigate('#/login');
  }
  if (page.access === 'admin' && (!state.user || state.user.role !== 'admin')) {
    showToast('Admin access only', true);
    return navigate('#/admin-login');
  }

  const app = $('#app');
  app.innerHTML = '<div class="loading"><i class="spinner"></i>LOADING</div>';

  try {
    state.events = await api('/events');
    state.config = await api('/config');

    app.innerHTML = `<div class="page">${await page.render(param)}</div>`;
    if (page.after) page.after(param);

    setupReveal();
    startCountdown();

    const section = scrollTarget && $('#' + scrollTarget);
    if (section) section.scrollIntoView();
    else window.scrollTo(0, 0);
  } catch (error) {
    app.innerHTML = `<div class="loading">${escapeHtml(error.message)}</div>`;
    showToast(error.message, true);
  }
}

// ---------- Click handling ----------
// Buttons in the HTML have data-action="name". This table says what each name does.

const actions = {
  'toggle-menu':   () => $('#links').classList.toggle('open'),
  'logout':        () => logout(),
  'print':         () => window.print(),

  'go-step':       (button) => goToStep(Number(button.dataset.step)),
  'add-member':    () => addMember(),
  'remove-member': (button) => removeMember(button),
  'pay':           (button) => startPayment(button.dataset.mode),

  'new-event':     () => openEventForm(),
  'edit-event':    (button) => openEventForm(button.dataset.id),
  'delete-event':  (button) => deleteEvent(button.dataset.id),
  'close-modal':   () => closeModal(),
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action = actions[button.dataset.action];
  if (action) {
    event.preventDefault();
    action(button);
  }
});

// Login and sign-up forms
document.addEventListener('submit', (event) => {
  const kind = event.target.dataset.form;
  if (kind) {
    event.preventDefault();
    if (kind === 'event') {
      saveEvent(event.target.dataset.eventId);
    } else {
      submitAuthForm(event.target, kind);
    }
  }
});

// Typing in search boxes
document.addEventListener('input', (event) => {
  if (event.target.id === 'event-search') filterEvents();
  if (event.target.id === 'admin-search') loadAdminRegistrations();
});

// Ticking checkboxes / changing dropdowns
document.addEventListener('change', (event) => {
  if (event.target.matches('.check-row input')) updateTeamAndSummary();
  if (event.target.id === 'admin-category') loadAdminRegistrations();
});

// ---------- Start ----------

window.addEventListener('hashchange', route);
startParticles();
route();
