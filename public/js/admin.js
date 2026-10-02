// Admin dashboard: statistics, event management, and the registrations list.

const EVENT_FORM_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'rules', label: 'Rules' },
  { key: 'date', label: 'Date (YYYY-MM-DD)' },
  { key: 'time', label: 'Time (HH:MM)' },
  { key: 'venue', label: 'Venue' },
  { key: 'teamSize', label: 'Max team size' },
  { key: 'fee', label: 'Fee (₹)' },
  { key: 'prize', label: 'Prize' },
  { key: 'registrationDeadline', label: 'Registration deadline (YYYY-MM-DD)' },
];

async function renderAdmin() {
  const stats = await api('/admin/statistics');

  const eventRows = state.events.map((event) => `
    <tr>
      <td>${escapeHtml(event.name)}</td>
      <td>${event.category}</td>
      <td>${event.date}</td>
      <td>₹${event.fee}</td>
      <td>
        <button class="btn small ghost" data-action="edit-event" data-id="${event._id}">Edit</button>
        <button class="btn small ghost" data-action="delete-event" data-id="${event._id}">Delete</button>
      </td>
    </tr>`).join('');

  const categoryOptions = CATEGORIES.map((category) => `<option>${category}</option>`).join('');

  return `
    <section>
      <h2 class="heading">ADMIN DASHBOARD</h2>

      <div class="grid">
        <div class="panel stat"><b>${stats.users}</b>Total Users</div>
        <div class="panel stat"><b>${stats.events}</b>Total Events</div>
        <div class="panel stat"><b>${stats.registrations}</b>Total Registrations</div>
        <div class="panel stat"><b>₹${stats.revenue}</b>Total Revenue</div>
      </div>

      <h3>Events <button class="btn small" data-action="new-event">+ Add Event</button></h3>
      <div class="table-wrap">
        <table>
          <tr><th>Name</th><th>Category</th><th>Date</th><th>Fee</th><th></th></tr>
          ${eventRows}
        </table>
      </div>

      <h3>Registrations &amp; Payments</h3>
      <div class="row">
        <input id="admin-search" placeholder="Search name, email, ID, college..." style="flex: 2">
        <select id="admin-category" style="flex: 1">
          <option value="">All categories</option>
          ${categoryOptions}
        </select>
      </div>
      <div id="admin-registrations"></div>
    </section>`;
}

async function loadAdminRegistrations() {
  const search = encodeURIComponent($('#admin-search').value);
  const category = encodeURIComponent($('#admin-category').value);

  try {
    const registrations = await api(`/registrations?q=${search}&category=${category}`);
    $('#admin-registrations').innerHTML = registrations.length
      ? registrationTable(registrations, true)
      : '<p>No registrations found.</p>';
  } catch (error) {
    showToast(error.message, true);
  }
}

// ---------- Add / edit event popup ----------

// Pass an event id to edit, or nothing to add a new event.
function openEventForm(eventId) {
  const event = state.events.find((e) => e._id === eventId) || { category: 'On-Stage', fee: 50, teamSize: 1 };

  const categoryOptions = CATEGORIES
    .map((category) => `<option ${category === event.category ? 'selected' : ''}>${category}</option>`)
    .join('');

  const fieldInputs = EVENT_FORM_FIELDS.map((field) => `
    <label>${field.label}</label>
    <input id="event-${field.key}" value="${escapeHtml(event[field.key] || '')}">`).join('');

  $('#modal').innerHTML = `
    <div class="modal">
      <div class="panel">
        <h3>${eventId ? 'Edit' : 'Add'} Event</h3>
        <label>Category</label>
        <select id="event-category">${categoryOptions}</select>
        ${fieldInputs}
        <button class="btn" data-action="save-event" data-id="${eventId || ''}">Save</button>
        <button class="btn ghost" data-action="close-modal">Cancel</button>
      </div>
    </div>`;
}

function closeModal() {
  $('#modal').innerHTML = '';
}

async function saveEvent(eventId) {
  const eventData = { category: $('#event-category').value };
  EVENT_FORM_FIELDS.forEach((field) => {
    eventData[field.key] = $('#event-' + field.key).value;
  });

  try {
    if (eventId) {
      await api('/events/' + eventId, 'PUT', eventData);
    } else {
      await api('/events', 'POST', eventData);
    }
    closeModal();
    showToast('Event saved');
    route();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Delete this event?')) return;

  try {
    await api('/events/' + eventId, 'DELETE');
    showToast('Event deleted');
    route();
  } catch (error) {
    showToast(error.message, true);
  }
}
