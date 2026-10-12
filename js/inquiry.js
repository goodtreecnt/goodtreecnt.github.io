/* GT-CnT — inquiry modal + contact form
   Formspree form ID below is confirmed and active — submissions go
   straight to gtcosmed@gmail.com via Formspree, no mailto fallback needed. */
const FORMSPREE_ID = 'xjgjplrg';
const FORMSPREE_CONFIGURED = true;
const TO_EMAIL = 'gtcosmed@gmail.com';

async function sendInquiry(fields, subject, msgOk, msgErr, btn) {
  if (!FORMSPREE_CONFIGURED) {
    const body = Object.entries(fields).map(([k, v]) => k + ': ' + (v || '')).join('\n');
    window.location.href = 'mailto:' + TO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return;
  }
  const label = btn.textContent;
  btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    const resp = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ _subject: subject }, fields))
    });
    if (!resp.ok) throw new Error();
    msgOk.style.display = 'block'; msgErr.style.display = 'none';
    btn.textContent = '✓ Sent';
    return true;
  } catch (e) {
    msgErr.style.display = 'block'; msgOk.style.display = 'none';
    btn.textContent = label; btn.disabled = false;
  }
}

/* ---- Modal ---- */
const overlay = document.getElementById('modalOverlay');
function openModal(category) {
  if (!overlay) return;
  document.getElementById('modalTitle').textContent = category;
  const form = document.getElementById('modalForm');
  form.reset();
  form.dataset.category = category;
  document.getElementById('modalOk').style.display = 'none';
  document.getElementById('modalErr').style.display = 'none';
  const btn = form.querySelector('button[type=submit]');
  btn.textContent = 'Send Inquiry →'; btn.disabled = false;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}
if (overlay) {
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.getElementById('modalForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const cat = this.dataset.category || '';
    const f = {
      Category: cat,
      Name: this.name.value.trim(), Email: this.email.value.trim(),
      Company: this.company.value.trim(), Country: this.country.value.trim(),
      Message: this.message.value.trim()
    };
    sendInquiry(f, 'GT-CnT Inquiry: ' + cat, document.getElementById('modalOk'),
      document.getElementById('modalErr'), this.querySelector('button[type=submit]'));
  });
}

/* ---- Contact page form ---- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const pre = new URLSearchParams(location.search).get('cat');
  if (pre && contactForm.product) contactForm.product.value = pre;
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = {
      Name: this.name.value.trim(), Email: this.email.value.trim(),
      Company: this.company.value.trim(), Country: this.country.value.trim(),
      'Topic of Interest': this.product.value, Message: this.message.value.trim()
    };
    const ok = await sendInquiry(f, 'GT-CnT Inquiry', document.getElementById('formOk'),
      document.getElementById('formErr'), this.querySelector('button[type=submit]'));
    if (ok) this.reset();
  });
}
