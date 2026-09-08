/* =====================================================
   main-v1.js  –  Login v1 Interactions
   ===================================================== */

(function(){
   "use strict";

   var form = document.getElementById("signupForm");
   var email = document.getElementById("email");
   var password = document.getElementById("password");
   var pwConfirm = document.getElementById("pwConfirm");
   var verifyCode = document.getElementById("verifyCode");
   var btnSendCode = document.getElementById("btnSendCode");
   var timerText = document.getElementById("timerText");
   var agreeAll = document.getElementById("agreeAll");
   var requiredChecks = document.querySelectorAll(".required-check");
   var optionalCheck = document.getElementById("agreeOptional");
   var btnSubmit = document.getElementById("btnSubmit");
   var successBox = document.getElementById("successBox");
   var card = document.getElementById("card");

   var codeTimer = null;
   var codeRemain = 0;
   var sentCode = null; // 데모용 인증번호

   /* ---------- 유틸 ---------- */
   function setError(id, msg){
    var el = document.getElementById(id);

    el.textContent = msg;
    el.classList.toggle("show", !!msg);
   }

   function markInput(input, state){
    input.classList.remove("invalid", "valid");
    if(state === "invalid") input.classList.add("invalid");
    if(state === "valid") input.classList.add("valid");
   }

   /* ---------- 이메일 검증 ---------- */
   var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   email.addEventListener("input", function(){
    var v = email.value.trim();
    if(v === ""){setError("emailError", ""); markInput(email, ""); return;}
    if(!emailRe.test(v)){
        setError("emailError", "올바른 이메일 주소를 입력해 주세요.");
        markInput(email, "invalid");
    } else{
        setError("emailError", "");
        markInput(email, "valid");
    }
   });

   /* ---------- 비밀번호 강도 ---------- */
   var bars = document.querySelectorAll(".strength-bar span");
   var strengthText = document.getElementById("strengthText");
   var STRENGTH = [
    {label: "취약", cls: "weak", n: 1},
    {label: "보통", cls: "fair", n: 2},
    {label: "좋음", cls: "good", n: 3},
    {label: "강력", cls: "strong", n: 4},
   ];

   function evalStrength(pw){
    var score = 0;
    if(pw.length >= 8) score++;
    if(pw.length >= 12) score++;
    if(/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(4, Math.max(1, score)); 
   }

   password.addEventListener("input", function(){
    var pw = password.value;
    if(pw === ""){
        bars.forEach(function (b) {b.className = "";});
        strengthText.textContent ="비밀번호를 입력하면 강도가 표시됩니다.";
        strengthText.className = "strength-text";
        setError("pwError", "");
        markInput(password, "");
        return;
    }

    var s = evalStrength(pw);
    var info = STRENGTH[s - 1];
    bars.forEach(function (b, i){
        b.className = i < info.n ? "on-" + info.cls: "";
    });

    strengthText.textContent = "강도:" + info.label;
    strengthText.className = "strength-text" + info.cls;
    if(pw.length < 8){
        setError("pwError", "비밀번호는 8자 이상이어야 합니다.");
        markInput(password, "invalid");
    } else{
        setError("pwError", "");
        markInput(password, "valid");
    }

    //확인란과도 연동
    if(pwConfirm.value !== "")checkConfirm();
   });

   /* ---------- 비밀번호 확인 ---------- */
   function checkConfirm(){
    var v = pwConfirm.value;
    if(v === ""){setError("pwConfirmError", ""); markInput(pwConfirm, ""); return;}
    if(v !== password.value){
        setError("pwConfirmError", "비밀번호가 일치하지 않습니다.");
    } else{
        setError("pwConfirmError", "");
        markInput(pwConfirm, "valid");
        }
    }

    pwConfirm.addEventListener("input", checkConfirm);

    /* ---------- 표시/숨김 토글 ---------- */
    function bindToggle(btnld, inputld){
        var btn = document.getElementById(btnld);
        var input = document.getElementById(inputld);
        btn.addEventListener("click", function(){
            var show = input.type === "password";
            input.type = show? "text" : "password";
            btn.textContent = show? "숨김" : "표시";
            btn.setAttribute("aria-label", show? "비밀번호 숨기기" : "비밀번호 표시");
        });
    }

    bindToggle("togglePw", "password");
    bindToggle("togglePwConfirm", "pwConfirm");

    /* ---------- 인증번호 발송 (데모) ---------- */
    btnSendCode.addEventListener("click", function(){
        var v = email.value.trim();
        if(!emailRe.test(v)){
            setError("emailError", "먼저 올바른 이메일을 입력해 주세요.");
            markInput(email, "invalid");
            email.focus();
            return;
        }

        sentCode = String(Math.floor(100000 + Math.random()*900000)); //6자리 데모 코드
        verifyCode.disabled = false;
        verifyCode.focus();
        btnSendCode.disabled = true;
        codeRemain = 180; // 3분
        timerText.hidden = false;
        timerText.classList.remove("warning");
        timerText.textContent = "인증번호가 발송되었습니다. (데모: " + sentCode + ") 남은 시간 3:00";

        setError("codeError", "");

        clearInterval(codeTimer);
        codeTimer = setInterval(function(){
            codeRemain--;
            if(codeRemain <= 0){
                clearlnterval(codeTimer);
                timerText.textContent = "인증번호가 만료되었습니다. 다시 발송해 주세요.";
                timerText.classList.add("warning");
                btnSendCode.disabled = false;
                btnSendCode.textContent = "재발송";
                return;
            }

            var m = Math.floor(codeRemain / 60);
            var s = codeRemain % 60;
            timerText.textContent = "남은 시간" + m + ":" + (s < 10 ? "0" : "") + s;
            if(codeRemain <= 30) timerText.classList.add("warning");
        }, 1000);
    });

    verifyCode.addEventListener("input", function(){
        var v = verifyCode.value;
        if(v === ""){setError("codeError", ""); return;}
        if(!/^\d{6}$/.test(v)){
            setError("codeError", "인증번호는 숫자 6자리입니다.");
            markInput(verifyCode, "invalid");
        } else if(sentCode && v !== sentCode){
            setError("codeError", "인증번호가 일치하지 않습니다.");
            markInput(verifyCode, "invalid");
        } else {
            setError("codeError", "인증되었습니다.");
            document.getElementById("codeError").style.color = "var(--success)";
            markInput(verifyCode, "valid");
        }
    });

    /* ---------- 약관 전체동의 연동 ---------- */
    function syncAll(){
        var all = Array.prototype.every.call(requiredChecks, function (c) {return c.checked;});
        agreeAll.checked = all;
    }

    requiredChecks.forEach(function (c){
        c.addEventListener("change", syncAll);
    });

    optionalCheck.addEventListener("change", syncAll);
    agreeAll.addEventListener("change", function(){
        var checked = agreeAll.checked;
        requiredChecks.forEach(function (c) {c.checked = checked;});
        optionalCheck.checked = checked;
    });

    /* ---------- 제출 ---------- */
    form.addEventListener("submit", function (e){
        e.preventDefault();
        var firstError = null;

        // 1. 이메일
        var em = email.value.trim();
        if(!emailRe.test(em)){
            setError("emailError", "올바른 이메일 주소를 입력해 주세요.");
            markInput(email, "invalid");
            firstError = firstError || email;
        }

        // 2. 비밀번호
        var pw = password.value;
        if(pw.length < 8){
            setError("pwError", "비밀번호는 8자 이상이어야 합니다.");
            markInput(password, "invalid");
            firstError = firstError || password;
        }

        // 3. 확인
        if(pwConfirm.value !== pw || pwConfirm.value === ""){
            setError("pwConfirmError", "비밀번호가 일치하지 않습니다.");
            markInput(pwConfirm, "invalid");
            firstError = firstError || pwConfirm;
        }

        // 4. 인증
        if(!sentCode){
            setError("codeError", "인증번호를 먼저 발송해 주세요.");
            firstError = firstError || verifyCode;
        } else if(verifyCode.value !== sentCode){
            setError("codeError","인증번호를 확인해 주세요.");
            markInput(verifyCode, "invalid");
            firstError = firstError || verifyCode;
        }

        // 5. 필수 약관
        var requiredOk = Array.prototype.every.call(requiredChecks, function (c){
            return c.checked;
        });
        if(!requiredOk){
            setError("termsError", "필수 약관에 모두 동의해 주세요.");
            firstError = firstError || requiredChecks[0];
        }

        if(firstError){
            firstError.focus();
            return;
        }

        // 성공 처리 (데모)
        form.style.display = "none";
        successBox.classList.add("show");
        var msg = document.getElementById("successMsg");
        msg.textContent = em + "님, 환영합니다! 이제 모든 기능을 이용할 수 있어요.";
        card.scrollIntoView({behavior: "smooth", block: "center"});
    });

    document.getElementById("btnGoLogin").addEventListener("click", function(){
        // 데모 :폼 리셋 후 다시 표시
        form.reset();
        form.style.display="";
        successBox.classList.remove("show");
        bars.forEach(function (b){b.className = "";});
        strengthText.textContent = "비밀번호를 입력하면 강도가 표시됩니다.";
        strengthText.className = "strength-text";
        verifyCode.disabled = true;
        btnSendCode.disabled = false;
        btnSendCode.textContent = "인증번호 발송";
        timerText.hidden = true;
        clearInterval(codeTimer);
        sentCode = null;
        ["emailError", "pwError", "pwConfirmError", "codeError", "termsError"].forEach(function(id){
            setError(id, "");
        });
        [email, password, pwConfirm, verifyCode].forEach(function(i){markInput(i, "");});
        window.scrollTo({top: 0, behavior: "smooth"});
    });
})();