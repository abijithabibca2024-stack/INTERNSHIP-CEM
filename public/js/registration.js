// The 5-step registration wizard and the payment flow.

const WIZARD_STEPS = ['PARTICIPANT', 'EVENT', 'TEAM', 'PAYMENT', 'CONFIRMATION'];
const STUDY_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

let currentStep = 1;

// The progress bar at the top. Also used on the success page.
function renderStepper(activeStep) {
  const steps = WIZARD_STEPS.map((name, index) => {
    const stepNumber = index + 1;
    let statusClass = '';
    if (stepNumber === activeStep) statusClass = ' active';
    else if (stepNumber < activeStep) statusClass = ' done';

    return `<div class="step${statusClass}"><b>0${stepNumber}</b>${name}</div>`;
  });
  return `<div class="stepper">${steps.join('')}</div>`;
}

// preselectedEventId comes from the URL (#/register/<id>) when the user clicked "Register" on an event.
function renderRegister(preselectedEventId) {
  currentStep = 1;

  const yearOptions = STUDY_YEARS.map((year) => `<option>${year}</option>`).join('');

  const eventCheckboxes = state.events.map((event) => `
    <label class="check-row">
      <input type="checkbox" value="${event._id}" ${event._id === preselectedEventId ? 'checked' : ''}>
      ${escapeHtml(event.name)} <small>(${event.category}, team up to ${event.teamSize})</small>
    </label>`).join('');

  const razorpayDisabled = state.config.realPay ? '' : 'disabled title="Add Razorpay keys in .env"';

  return `
    <section>
      <h2 class="heading">EVENT REGISTRATION</h2>
      <div id="stepper-area">${renderStepper(1)}</div>

      <div class="panel wizard">

        <div class="step-panel">
          <h3>Participant Details</h3>
          <div class="form-grid">
            <div><label for="participant-name">Name</label>
              <input id="participant-name" value="${escapeHtml(state.user.name)}"></div>
            <div><label for="participant-email">Email ID</label>
              <input id="participant-email" value="${escapeHtml(state.user.email || '')}"></div>
            <div><label for="participant-phone">Phone</label>
              <input id="participant-phone"></div>
            <div><label for="participant-college">College Name</label>
              <input id="participant-college"></div>
            <div><label for="participant-department">Department</label>
              <input id="participant-department"></div>
            <div><label for="participant-year">Year</label>
              <select id="participant-year">${yearOptions}</select></div>
          </div>
          <div class="step-buttons">
            <button class="btn" data-action="go-step" data-step="2">Next</button>
          </div>
        </div>

        <div class="step-panel" hidden>
          <h3>Choose Events</h3>
          ${eventCheckboxes}
          <div class="step-buttons">
            <button class="btn ghost" data-action="go-step" data-step="1">Back</button>
            <button class="btn" data-action="go-step" data-step="3">Next</button>
          </div>
        </div>

        <div class="step-panel" hidden>
          <h3>Team</h3>
          <label for="team-name">Team Name (optional for solo)</label>
          <input id="team-name">
          <div id="member-list"></div>
          <button class="btn ghost small" data-action="add-member">+ Add Member</button>
          <div id="member-hint" style="color: var(--muted); font-size: 0.8rem; margin-top: 6px"></div>
          <div class="step-buttons">
            <button class="btn ghost" data-action="go-step" data-step="2">Back</button>
            <button class="btn" data-action="go-step" data-step="4">Next</button>
          </div>
        </div>

        <div class="step-panel" hidden>
          <h3>REGISTRATION SUMMARY</h3>
          <div id="summary"></div>
          <div class="step-buttons">
            <button class="btn ghost" data-action="go-step" data-step="3">Back</button>
            <button class="btn big" data-action="pay" data-mode="demo">Proceed to Payment (Demo)</button>
            <button class="btn ghost" data-action="pay" data-mode="razorpay" ${razorpayDisabled}>Pay with Razorpay</button>
          </div>
        </div>

      </div>
    </section>`;
}

// ---------- Reading the form ----------

function getSelectedEvents() {
  return Array.from($$('.check-row input:checked')).map((checkbox) =>
    state.events.find((event) => event._id === checkbox.value)
  );
}

// How many extra teammates are allowed = smallest team size among selected events, minus the participant.
function getMaxExtraMembers() {
  const selected = getSelectedEvents();
  if (!selected.length) return 0;
  return Math.min(...selected.map((event) => event.teamSize)) - 1;
}

function readParticipantForm() {
  return {
    participantName: $('#participant-name').value,
    email: $('#participant-email').value,
    phone: $('#participant-phone').value,
    collegeName: $('#participant-college').value,
    department: $('#participant-department').value,
    year: $('#participant-year').value,
    teamName: $('#team-name').value,
    teamMembers: Array.from($$('.member-input')).map((input) => input.value),
  };
}

function participantDetailsAreFilled(form) {
  return [form.participantName, form.email, form.phone, form.collegeName, form.department]
    .every((value) => value.trim());
}

// ---------- Moving between steps ----------

function goToStep(newStep) {
  // Only check the current step when moving forward
  if (newStep > currentStep) {
    if (currentStep === 1 && !participantDetailsAreFilled(readParticipantForm())) {
      return showToast('Please fill all participant details', true);
    }
    if (currentStep === 2 && !getSelectedEvents().length) {
      return showToast('Select at least one event', true);
    }
  }

  currentStep = newStep;
  $$('.step-panel').forEach((panel, index) => {
    panel.hidden = index + 1 !== newStep;
  });
  $('#stepper-area').innerHTML = renderStepper(newStep);
  updateTeamAndSummary();
}

// ---------- Team members ----------

function addMember() {
  const currentCount = $$('.member-input').length;
  if (currentCount >= getMaxExtraMembers()) {
    return showToast('Team size limit reached for selected events', true);
  }

  const row = document.createElement('div');
  row.className = 'row member-row';
  row.innerHTML = `
    <input class="member-input" placeholder="Team Member ${currentCount + 1}">
    <button class="btn ghost small" data-action="remove-member">✕</button>`;
  $('#member-list').appendChild(row);

  updateTeamAndSummary();
}

function removeMember(button) {
  button.closest('.member-row').remove();
  updateTeamAndSummary();
}

// Refreshes the team hint and the price summary. Runs whenever the selection changes.
function updateTeamAndSummary() {
  const selected = getSelectedEvents();
  const maxMembers = getMaxExtraMembers();

  // If the user picked an event with a smaller team size, remove the extra member boxes
  const memberRows = $$('.member-row');
  for (let i = memberRows.length - 1; i >= maxMembers && i >= 0; i--) {
    memberRows[i].remove();
  }

  $('#member-hint').textContent = selected.length
    ? `Up to ${maxMembers} additional member(s) allowed for your selection.`
    : 'Select an event first.';

  let total = 0;
  const lines = selected.map((event, index) => {
    total += event.fee;
    return `<div class="line"><span>Event ${index + 1} – ${escapeHtml(event.name)}</span><span>₹${event.fee}</span></div>`;
  });
  lines.push(`<div class="line total"><span>Total</span><span>₹${total}</span></div>`);
  $('#summary').innerHTML = lines.join('');
}

// ---------- Payment ----------

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load Razorpay'));
    document.body.appendChild(script);
  });
}

// mode is "demo" or "razorpay"
async function startPayment(mode) {
  const eventIds = getSelectedEvents().map((event) => event._id);
  if (!eventIds.length) {
    return showToast('Select at least one event', true);
  }

  const form = readParticipantForm();
  if (!participantDetailsAreFilled(form)) {
    return showToast('Please fill all participant details', true);
  }

  try {
    const order = await api('/payment/create-order', 'POST', { eventIds, mode });

    // Demo payment: no money involved, finish straight away
    if (order.demo) {
      return completeRegistration({ orderId: order.orderId, eventIds, form });
    }

    await loadRazorpayScript();
    const checkout = new Razorpay({
      key: order.keyId,
      amount: order.amount * 100,
      currency: 'INR',
      name: 'COLLEGE FEST 2026',
      order_id: order.orderId,
      prefill: { name: form.participantName, email: form.email, contact: form.phone },
      handler: (response) => {
        completeRegistration({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          eventIds,
          form,
        });
      },
    });
    checkout.on('payment.failed', () => showToast('Payment failed. Please try again.', true));
    checkout.open();
  } catch (error) {
    showToast(error.message, true);
  }
}

// Tells the server the payment is done so it can save the registrations.
async function completeRegistration(paymentDetails) {
  try {
    state.lastRegistrations = await api('/payment/verify', 'POST', paymentDetails);
    location.hash = '#/success';
  } catch (error) {
    showToast(error.message, true);
  }
}
