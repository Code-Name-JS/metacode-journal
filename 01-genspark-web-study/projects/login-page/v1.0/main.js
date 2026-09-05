/* =====================================================
   main.js  –  Login Page Interactions
   ===================================================== */
console.log("main.js 연결 성공!");

'use strict';



//  ── Demo account (replaced by server authentication in the live service) ──
const DEMO_ACCOUNTS = [
    {email:'demo@myapp.com', password:'demo1234'},
    {email:'test@example.com', password:'test5678'},
];



//  ── DOM Element ──
const form = document.getElementByld('login-form');
const emaillnput = document.getElementByld('email');
const passwordlnput = document.getElementByld('password');
const togglePwBtn = document.getElementByld('toggle-pw');
const eyelcon = document.getElementByld('eye-icon');
const submitBtn = document.getElementByld('btn-submit');
const rememberMe = document.getElementByld('remember-me');
const toast = document.getElementByld('toast');

const groupEmail = document.getElementByld('group-email');
const groupPassword = document.getElementByld('group-password');
const errorEmail = document.getElementByld('error-email');
const errorPassword = document.getElementByld('error-password');



//  ── Social button ──
document.getElementByld('btn-google').addEventListener('click', () =>
    showToast('info', '🔍 Google Sign-In is being prepared.'));
document.getElementByld('btn-github').addEventListener('click', () =>
    showToast('info', '🐙 GitHub login is being prepared.'));
document.getElementByld('link-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('info', '📧 We will send you an email to reset your password.');
});
document.getElementByld('link-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('info', '✍️ Go to the sign-up page.');
});



// ── Restore saved emails ──
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getltem('remembered_email');
    if(saved){
        emaillnput.value = saved;
        rememberMe.checked = true;
    }
    // If there is a value in the email field, focus on the password
    if(emaillnput.value) passwordlnput.focus();
    else emaillnput.focus();
});



// ── Show/Hide Password ──
togglePwBtn.addEventListener('click', () => {
    const isHidden = passwordlnput.type === 'password';
    passwordlnput.type = isHidden ? 'text' : 'password';
    eyelcon.className = isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    togglePwBtn.setAttribute('aria-label', isHidden ? 'Hide Password' : 'Show password');
});



// ── Live validation ──
emaillnput.addEventListener('input', () => {
    clearFieldState(groupEmail, errorEmail);
});
emaillnput.addEventListener('blur', () => {
    validateEmail();
});
passwordlnput.addEventListener('input', () => {
    clearFieldState(groupPassword, errorPassword);
});
passwordlnput.addEventListerner('blur', () => {
    validatePassword();
});



// ── Form submission ──
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const emailOk = validateEmail();
    const passwordOk = validatePassword();
    if(!emailOk || !passwordOk) return;

    // Start loading
    setLoading(true);

    try{
        // Server request simulation (1.2 s delay)
        await delay(1200);

        const matched = DEMO_ACCOUNTS.find(
            a => a.email === emaillnput.value.trim().toLowerCase()
            && a.password === passwordlnput.value
        );

        if(matched){
            // Handle persistent login state
            if(rememberMe.checked){
                localStorage.setltem('remembered_email', matched.email);
            } else{
                localStorage.removeltem('remembered_email');
            }

            setFieldSuccess(groupEmail);
            setFieldSuccess(groupPassword);
            showToast('success', '✅ Login successful! Welcome aboard.');

            // Button completed state
            submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)';
            submitBtn.querySelector('.btn-text').style.display = 'flex';
            submitBtn.querySelector('.btn-text').textContent = '✓ Login complete';
            submitBtn.querySelector('.btn-spinner').style.display = 'none';
        } else{
            // Login failed
            setFieldError(groupEmail, errorEmail, '');
            setFieldError(groupPassword, errorPassword, 'The email or password does not match.');
            showToast('error', '❌ Failed to log in. Please check again.');
            shakeCard();
        }
    } finally{
        if(!submitBtn.textContent.includes('Completion')) setLoading(false);
    }
});



// ── Validation Functions ──
function validateEmail(){
    const val = emaillnput.value.trim();
    if(!val) {
        setFieldError(groupEmail, errorEmail, 'Please enter your email.');
        return false;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setFieldError(groupEmail, errorEmail, 'This is not a valid email format.');
        return false;
    }
    clearFieldState(groupEmail, errorEmail);
    return true;
}

function validatePassword() {
    const val = passwordlnput.value;
    if(!val) {
        setFieldError(groupPassword, errorPassword, 'Please enter your password.');
        return false;
    }
    if(val.length < 6) {
        setFieldError(groupPassword, errorPassword, 'The password must be at least 6 characters long.');
        return false;
    }
    clearFieldState(groupPassword, errorPassword);
    return true;
}



// ── Field state helper ──
function setFieldError(group, errorEl, message) {
    group.classList.remove('is-success');
    group.classList.add('is-error');
    errorEl.innerHTML = message ? `<i class="fa-solid fa-circle-exclamation"></i>
    ${message}` : '';
}

function setFieldSuccess(group) {
    group.classList.remove('is-error');
    group.classList.add('is-success');
}

function clearFieldState(group, errorEl) {
    group.classList.remove('is-error', 'is-success');
    errorEl.textContent = '';
}



// ── Loading state ──
function setLoading(on) {
    submitBtn.disabled = on;
    if(on) {
        submitBtn.classList.add('loading');
    } else{
        submitBtn.classList.remove('loading');
    }
}



// ── Shake the card ──
function shakeCard() {
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = 'shake .4s ease';
}



// ── Toast message ──
let toastTimer = null;
function showToast(type, message) {
    clearTimeout(toastTimer);
    toast.className = `toast show ${type}`;
    toast.textContent = message;
    toastTimer = setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}



// ── Utility ──
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// ── CSS: Dynamic Injection of Shake Animation ──
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
    0%, 100%{transform: translateX(0);}
    15%{transform: translateX(-8px);}
    30%{transform: translateX(7px);}
    45%{transform: translateX(-6px);}
    60%{transform: translateX(5px);}
    75%{transform: translateX(-4px);}
    90%{transform: translateX(3px);}
}
`;
document.head.appendChild(shakeStyle);