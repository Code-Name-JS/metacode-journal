/* =====================================================
   main-v2.js  –  singup v2.0 Interactions
   ===================================================== */

'use strict';

const $ = (s, c = document) => c.querySelector(s);
const form = $('#signupForm');
const submitBtn = $('#submitBtn');
const termsCheck = $('#terms');

const rules = {
    name: v => v.trim().length >= 2,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: v => v.trim() === '' || /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.trim()),
    password: v => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v),
    password2: v => v !== '' && v === $('#password').value,
};

const validators = ['name', 'email', 'phone', 'password', 'password2'];

function setFieldState(id, valid) {
    const input = $('#' + id);
    const msg = $('#' + id + 'Msg');
    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    msg.classList.toggle('show', !valid && input.value.trim() !== '');
}

function strengthOf(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(3, Math.max(1, Math.ceil(score * 3 / 4)));
}

function updateStrength() {
    const pw = $('#password').value;
    const bars = document.querySelectorAll('.strength i');
    const label = $('#strengthLabel');
    const s = strengthOf(pw);
    bars.forEach((bar, i) => {
        bar.className = '';
        if (i < s) bar.className = 'on-' + s;
    });
    label.textContent = '비밀번호 강도: ' + (pw === '' ? '-' : ['약함', '보통', '강함', '매우 강함'][s - 1] ?? '-');
}

function updateSubmit() {
    const allValid = validators.every(id => rules[id]($('#' + id).value));
    submitBtn.disabled = !(allValid && termsCheck.checked);
}

validators.forEach(id => {
    const input = $('#' + id);
    input.addEventListener('blur', () => {
        input.classList.add('touched');
        setFieldState(id, rules[id](input.value));
        updateSubmit();
    });
});

$('#password').addEventListener('input', () => { updateStrength(); updateSubmit(); });

document.querySelectorAll('.toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = $('#' + btn.datase.target);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? '🙈' : '👁';
        btn.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 표시');
        input.focus();
    });
});

termsCheck.addEventListener('change', updateSubmit);

form.addEventListener('submit', e => {
    e.prevenDefault();
    let focusTarget = null;
    validators.forEach(id => {
        const ok = rules[id]($('#' + id).value);
        setFieldState(id, ok);
        if (!ok && !focusTarget) focusTarget = id;
    });
    if (focusTarget) { $('#' + focusTarget).focus(); return; }
    if (!termsCheck.checked) { termsCheck.focus(); return; }
    $('#successBanner').classList.add('show');
    form.reset();
    submitBtn.disabled = true;
    document.querySelectorAll('.strength i').forEach(b => b.className = '');
    $('#strengthLabel').textContent = '비밀번호 강도: —';
    validators.forEach(id => $('#' + id).setAttribute('aria-invalid', 'false'));
    $('#successBanner').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
});