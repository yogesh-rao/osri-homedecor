/* Contact page. Business details come from BUSINESS in js/data.js; anything
   still blank renders as a visible "to be added" marker so you can see what
   is outstanding. The form is front-end only — see the note it shows on submit. */

document.addEventListener('DOMContentLoaded', () => {

  const addressParts = []
    .concat(BUSINESS.addressLines || [])
    .concat([[BUSINESS.city, BUSINESS.state].filter(Boolean).join(', ')])
    .concat([BUSINESS.pincode])
    .filter(Boolean);

  const rows = [
    ['Email', BUSINESS.email
      ? `<a href="mailto:${esc(BUSINESS.email)}">${esc(BUSINESS.email)}</a>`
      : orTodo('', 'Email address')],
    ['Phone', BUSINESS.phone
      ? `<a href="tel:${esc(BUSINESS.phone.replace(/\s/g, ''))}">${esc(BUSINESS.phone)}</a>`
      : orTodo('', 'Phone number')],
    ['WhatsApp', BUSINESS.whatsapp
      ? `<a href="https://wa.me/${esc(BUSINESS.whatsapp)}" target="_blank" rel="noopener">Message us</a>`
      : orTodo('', 'WhatsApp number')],
    ['Address', addressParts.length
      ? esc(addressParts.join(', '))
      : orTodo('', 'Address')],
    ['Hours', esc(BUSINESS.hours || '')]
  ];
  // GSTIN only appears once you actually have one — an empty row reading
  // "GSTIN to be added" is not something a customer should see.
  if (BUSINESS.gstin) rows.push(['GSTIN', esc(BUSINESS.gstin)]);

  qs('#contactDetails').innerHTML = rows
    .map(([k, v]) => `<div><span class="k">${k}</span><span>${v}</span></div>`)
    .join('');

  // Social links only appear once a URL exists.
  const social = [
    BUSINESS.instagram ? `<a class="btn btn--light btn--sm" href="${esc(BUSINESS.instagram)}" target="_blank" rel="noopener">Instagram</a>` : '',
    BUSINESS.facebook ? `<a class="btn btn--light btn--sm" href="${esc(BUSINESS.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''
  ].filter(Boolean).join(' ');
  const socialHost = qs('#contactSocial');
  if (social) socialHost.innerHTML = social;
  else socialHost.remove();

  /* ---------------- enquiry submission ----------------
     Static site, so email goes out through Web3Forms. Whether or not that
     is configured, the enquiry is also offered on WhatsApp so it reaches a
     phone immediately. */

  const form = qs('#contactForm');
  const note = qs('#contactNote');
  const btn  = form.querySelector('button[type="submit"]');

  function values() {
    return {
      name: qs('#cName').value.trim(),
      email: qs('#cEmail').value.trim(),
      phone: qs('#cPhone').value.trim(),
      topic: qs('#cTopic').value,
      message: qs('#cMessage').value.trim()
    };
  }

  function validate(v) {
    if (v.name.length < 2) return 'Please enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return 'Please enter a valid email address';
    if (v.message.length < 10) return 'Please add a little more detail to your message';
    return null;
  }

  function whatsappText(v) {
    return `New enquiry from theosri.in\n\n` +
      `Name: ${v.name}\nEmail: ${v.email}` +
      (v.phone ? `\nPhone: ${v.phone}` : '') +
      `\nAbout: ${v.topic}\n\n${v.message}`;
  }

  function say(kind, text) {
    note.className = 'note note--' + kind;
    note.textContent = text;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const v = values();
    const problem = validate(v);
    if (problem) { say('err', problem); return; }

    const openWhatsApp = () => {
      if (!CONTACT.alsoNotifyWhatsApp || !BUSINESS.whatsapp) return;
      window.open(whatsappHref(whatsappText(v)), '_blank', 'noopener');
    };

    // No key configured: WhatsApp is the whole delivery path, so say so plainly.
    if (!CONTACT.web3formsKey) {
      openWhatsApp();
      say('ok', BUSINESS.whatsapp
        ? 'Opening WhatsApp so your enquiry reaches us straight away. Send the message to complete it.'
        : `Please email us at ${BUSINESS.email} — the form is not connected yet.`);
      return;
    }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONTACT.web3formsKey,
          subject: CONTACT.subject,
          from_name: 'theosri.in enquiry form',
          name: v.name, email: v.email, phone: v.phone,
          topic: v.topic, message: v.message
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        say('ok', 'Thank you — your enquiry has reached us. We usually reply the same working day.');
        form.reset();
        openWhatsApp();
      } else {
        // Do not claim it sent when it did not.
        say('err', `Could not send just now. Please email ${BUSINESS.email} or use WhatsApp.`);
        openWhatsApp();
      }
    } catch (err) {
      say('err', `Could not send — you may be offline. Please email ${BUSINESS.email} or use WhatsApp.`);
      openWhatsApp();
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
});
