// Page builders. Each render function returns an HTML string for the #app area.

// ---------- Reusable pieces ----------

function eventCard(event) {
  return `
    <div class="card reveal ${CATEGORY_CLASS[event.category]}">
      <div class="icon">${getEventIcon(event)}</div>
      <h3>${escapeHtml(event.name)}</h3>
      <span class="tag">${event.category}</span>
      <p>${escapeHtml(event.description)}</p>
      <small>
        📅 ${event.date} &nbsp;⏰ ${event.time}<br>
        📍 ${escapeHtml(event.venue)}<br>
        👥 Team up to ${event.teamSize}
      </small>
      <div class="price">₹${event.fee}</div>
      <div class="row">
        <a class="btn ghost small" href="#/event/${event._id}">Details</a>
        <a class="btn small" href="#/register/${event._id}">Register</a>
      </div>
    </div>`;
}

function arenaSection(category, title, subtitle) {
  const cards = state.events
    .filter((event) => event.category === category)
    .map(eventCard)
    .join('');

  return `
    <section class="arena ${CATEGORY_CLASS[category]} reveal">
      <h2 class="heading">${title}</h2>
      <p class="subtitle">${subtitle}</p>
      <div class="grid">${cards}</div>
    </section>`;
}

// Table of registrations. The admin version has extra columns.
function registrationTable(registrations, isAdmin = false) {
  const adminHeaders = isAdmin ? '<th>Participant</th><th>College / Dept / Year</th><th>Team</th>' : '';

  const rows = registrations.map((reg) => {
    const adminCells = isAdmin
      ? `<td>${escapeHtml(reg.participantName)}<br>${escapeHtml(reg.email)}<br>${escapeHtml(reg.phone)}</td>
         <td>${escapeHtml(reg.collegeName)} / ${escapeHtml(reg.department)} / ${escapeHtml(reg.year)}</td>
         <td>${escapeHtml(reg.teamName)} ${escapeHtml(reg.teamMembers.join(', '))}</td>`
      : '';

    return `
      <tr>
        <td>${reg.registrationId}</td>
        <td>${escapeHtml(reg.eventId.name)}</td>
        <td>${reg.eventId.category}</td>
        <td>₹${reg.amount}</td>
        <td class="success">${reg.paymentStatus}</td>
        <td>${new Date(reg.createdAt).toLocaleDateString()}</td>
        ${adminCells}
      </tr>`;
  });

  return `
    <div class="table-wrap">
      <table>
        <tr>
          <th>Reg ID</th><th>Event</th><th>Category</th><th>Amount</th><th>Payment</th><th>Date</th>
          ${adminHeaders}
        </tr>
        ${rows.join('')}
      </table>
    </div>`;
}

// ---------- Home ----------

function renderHome() {
  const totalEvents = state.events.length;
  const techEvents = state.events.filter((event) => event.category === 'Technical').length;

  const stats = [
    { target: 500, prefix: '', suffix: '+', label: 'PARTICIPANTS' },
    { target: totalEvents, prefix: '', suffix: '+', label: 'EVENTS' },
    { target: techEvents, prefix: '', suffix: '+', label: 'TECH EVENTS' },
    { target: 50, prefix: '₹', suffix: '', label: 'ENTRY FEE' },
  ];

  const reasons = [
    { icon: '💻', title: 'LEARN', text: 'Explore new technologies.', color: 'cat-tech' },
    { icon: '🏆', title: 'WIN', text: 'Compete for exciting prizes.', color: 'cat-gaming' },
    { icon: '🚀', title: 'BUILD', text: 'Create innovative projects.', color: 'cat-offstage' },
    { icon: '🤝', title: 'CONNECT', text: 'Meet students and developers.', color: 'cat-onstage' },
    { icon: '📜', title: 'CERTIFICATE', text: 'Earn participation certificates.', color: 'cat-tech' },
    { icon: '🎯', title: 'SHOWCASE', text: 'Demonstrate your skills.', color: 'cat-gaming' },
  ];

  const prizes = [
    { icon: '🥇', amount: '₹10,000', label: '1ST PRIZE', color: 'cat-onstage' },
    { icon: '🥈', amount: '₹5,000', label: '2ND PRIZE', color: 'cat-tech' },
    { icon: '🥉', amount: '₹2,500', label: '3RD PRIZE', color: 'cat-offstage' },
  ];

  const statBoxes = stats.map((s) => `
    <div class="panel stat">
      <b class="counter" data-target="${s.target}" data-prefix="${s.prefix}" data-suffix="${s.suffix}">0</b>${s.label}
    </div>`).join('');

  const reasonCards = reasons.map((r) => `
    <div class="card reveal ${r.color}">
      <div class="icon">${r.icon}</div>
      <h3>${r.title}</h3>
      <p>${r.text}</p>
    </div>`).join('');

  const prizeBoxes = prizes.map((p) => `
    <div class="panel reveal ${p.color}"><span>${p.icon}</span><b>${p.amount}</b>${p.label}</div>`).join('');

  return `
    <div class="hero">
      <div class="grid-floor"></div>
      <p class="eyebrow">COLLEGE TECH FEST 2026</p>
      <h1>INNOVATE.<br>COMPETE.<br>CREATE.</h1>
      <p class="lead">Experience the ultimate celebration of technology, creativity and innovation.</p>
      <a class="btn big" href="#/register">Register Now</a>
      <a class="btn ghost big" href="#/events">Explore Events</a>
    </div>

    <section class="stats reveal">${statBoxes}</section>

    <section class="reveal" style="text-align: center">
      <p class="subtitle" style="letter-spacing: 0.3em">EVENT STARTS IN</p>
      <div class="countdown" id="countdown"></div>
    </section>

    ${arenaSection('Technical', 'TECHNICAL ARENA', 'Challenge your skills. Build the future.')}
    ${arenaSection('Gaming', 'GAMING ARENA', 'Level up. Compete. Dominate.')}

    <section>
      <h2 class="heading">WHY PARTICIPATE?</h2>
      <p class="subtitle">Six reasons to be there.</p>
      <div class="grid">${reasonCards}</div>
    </section>

    <section>
      <h2 class="heading">WIN BIG</h2>
      <p class="subtitle">Prizes for the top performers.</p>
      <div class="grid prizes">${prizeBoxes}</div>
    </section>

    <section id="about" class="grid2">
      <div class="panel reveal">
        <h2>About the Event</h2>
        <p style="color: var(--muted)">College Tech Fest 2026 brings together developers, designers, performers and gamers for three days of competition, learning and celebration.</p>
      </div>
      <div class="panel reveal">
        <h2>Important Dates</h2>
        <div class="line"><span>Registration closes</span><b>8 Nov 2026</b></div>
        <div class="line"><span>Fest begins</span><b>12 Nov 2026</b></div>
        <div class="line"><span>Grand finale</span><b>14 Nov 2026</b></div>
      </div>
    </section>

    <section id="contact">
      <div class="panel reveal">
        <h2>Contact</h2>
        <p style="color: var(--muted)">📧 fest@college.edu &nbsp; 📞 +91 98765 43210 &nbsp; 📍 College Main Campus</p>
      </div>
    </section>`;
}

// ---------- Events list ----------

function renderEvents(category) {
  state.currentCategory = CATEGORIES.includes(category) ? category : 'ALL';

  const tabs = ['ALL', ...CATEGORIES].map((name) => {
    const colorClass = CATEGORY_CLASS[name] || '';
    const activeClass = name === state.currentCategory ? ' active' : '';
    return `<a class="tab ${colorClass}${activeClass}" href="#/events/${name}">${name.toUpperCase()}</a>`;
  }).join('');

  return `
    <section>
      <h2 class="heading">EXPLORE EVENTS</h2>
      <p class="subtitle">Choose your challenge. Show your skills.</p>
      <div class="tabs">${tabs}</div>
      <label for="event-search" class="sr-only">Search events</label>
      <input id="event-search" class="search" placeholder="Search events...">
      <div class="grid" id="event-grid"></div>
    </section>`;
}

// Shows the events that match the selected tab and the search box.
function filterEvents() {
  const searchText = $('#event-search').value.toLowerCase();

  const matches = state.events.filter((event) => {
    const inCategory = state.currentCategory === 'ALL' || event.category === state.currentCategory;
    const matchesSearch = (event.name + ' ' + event.description).toLowerCase().includes(searchText);
    return inCategory && matchesSearch;
  });

  $('#event-grid').innerHTML = matches.length
    ? matches.map(eventCard).join('')
    : '<p class="subtitle">No events found.</p>';

  setupReveal();
}

// ---------- Single event ----------

async function renderEventDetails(id) {
  const event = await api('/events/' + id);

  return `
    <section>
      <div class="panel ${CATEGORY_CLASS[event.category]}">
        <div class="icon" style="font-size: 3rem">${getEventIcon(event)}</div>
        <span class="tag">${event.category}</span>
        <h2 class="heading">${escapeHtml(event.name)}</h2>
        <p style="color: var(--muted)">${escapeHtml(event.description)}</p>
        ${infoLine('Rules', event.rules)}
        ${infoLine('Date', event.date)}
        ${infoLine('Time', event.time)}
        ${infoLine('Venue', event.venue)}
        ${infoLine('Max team size', event.teamSize)}
        ${infoLine('Prize', event.prize)}
        ${infoLine('Registration fee', '₹' + event.fee)}
        ${infoLine('Registration deadline', event.registrationDeadline)}
        <br>
        <a class="btn" href="#/register/${event._id}">Register Now</a>
      </div>
    </section>`;
}

// ---------- Login / Sign up ----------

function renderLogin() {
  return `
    <div class="auth-wrap">
      <div class="grid-floor"></div>
      <div class="panel auth">
        <h2 class="heading small">WELCOME BACK</h2>
        <p class="subtitle">Login to manage your registrations.</p>
        <form data-form="login">
          <label for="login-email">Email</label>
          <input id="login-email" name="email" type="email" required>
          <label for="login-password">Password</label>
          <input id="login-password" name="password" type="password" required>
          <button class="btn big">Login</button>
        </form>
        <p class="subtitle" style="margin: 18px 0 0">Do not have an account? <a class="link" href="#/signup">Create Account</a></p>
      </div>
    </div>`;
}

function renderSignup() {
  return `
    <div class="auth-wrap">
      <div class="grid-floor"></div>
      <div class="panel auth">
        <h2 class="heading small">CREATE ACCOUNT</h2>
        <p class="subtitle">Join the fest in seconds.</p>
        <form data-form="register">
          <label for="signup-name">Full Name</label>
          <input id="signup-name" name="name" required>
          <label for="signup-email">Email</label>
          <input id="signup-email" name="email" type="email" required>
          <label for="signup-phone">Phone (10 digits)</label>
          <input id="signup-phone" name="phone" required>
          <label for="signup-password">Password</label>
          <input id="signup-password" name="password" type="password" required>
          <label for="signup-confirm">Confirm Password</label>
          <input id="signup-confirm" name="confirmPassword" type="password" required>
          <button class="btn big">Sign Up</button>
        </form>
        <p class="subtitle" style="margin: 18px 0 0">Already registered? <a class="link" href="#/login">Login</a></p>
      </div>
    </div>`;
}

// kind is "login" or "register" - it matches the API route name.
async function submitAuthForm(form, kind) {
  const formData = Object.fromEntries(new FormData(form));

  try {
    const result = await api('/auth/' + kind, 'POST', formData);
    saveLogin(result.token, result.user);
    showToast('Welcome ' + result.user.name);
    navigate(result.user.role === 'admin' ? '#/admin' : '#/my');
  } catch (error) {
    showToast(error.message, true);
  }
}

// ---------- Success / receipt ----------

function renderSuccess() {
  if (!state.lastRegistrations.length) {
    return '<section><h2>Nothing to show</h2></section>';
  }

  const receipts = state.lastRegistrations.map((reg) => `
    <div class="panel receipt">
      <h3>COLLEGE FEST 2026 – Receipt</h3>
      ${infoLine('Registration ID', reg.registrationId)}
      ${infoLine('Participant', reg.participantName)}
      ${infoLine('Event', reg.eventId.name)}
      ${infoLine('Category', reg.eventId.category)}
      ${infoLine('Amount Paid', '₹' + reg.amount)}
      ${infoLine('Payment ID', reg.paymentId)}
      ${infoLine('Registered On', new Date(reg.createdAt).toLocaleString())}
      ${infoLine('Event Date', reg.eventId.date + ' ' + reg.eventId.time)}
      ${infoLine('Venue', reg.eventId.venue)}
    </div>`).join('');

  return `
    <section>
      ${renderStepper(5)}
      <h2 class="success" style="text-align: center">✅ Registration Successful!</h2>
      <div id="receipts">${receipts}</div>
      <div style="text-align: center">
        <button class="btn" data-action="print">Download Receipt</button>
        <a class="btn ghost" href="#/my">My Registrations</a>
      </div>
    </section>`;
}

// ---------- User dashboard ----------

async function renderDashboard() {
  const allRegistrations = await api('/registrations');
  const registrations = allRegistrations.filter((reg) => reg.eventId); // skip deleted events

  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = registrations.filter((reg) => reg.eventId.date >= today).length;

  const history = registrations.length
    ? registrationTable(registrations)
    : '<p>No registrations yet. <a class="success" href="#/events">Browse events</a></p>';

  return `
    <section>
      <h2 class="heading">DASHBOARD</h2>
      <div class="panel">
        <h3>👤 ${escapeHtml(state.user.name)}</h3>
        <p class="subtitle" style="margin: 0">${escapeHtml(state.user.email)}</p>
      </div>
      <br>
      <div class="grid">
        <div class="panel stat"><b>${registrations.length}</b>Total registrations</div>
        <div class="panel stat"><b>${upcomingCount}</b>Upcoming events</div>
      </div>
      <h3>Registration History</h3>
      ${history}
    </section>`;
}
