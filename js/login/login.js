document.addEventListener("DOMContentLoaded", function () {
  const userIdInput = document.getElementById("user-id");

  userIdInput.addEventListener("input", function () {
    const idRegex = /[^a-zA-Z0-9]/g;
    const idNotice = document.getElementById("loginIdNotice");

    if (idRegex.test(userIdInput.value)) {
      userIdInput.value = userIdInput.value.replace(idRegex, "");
      idNotice.style.display = "inline-block";
    } else {
      idNotice.style.display = "none";
    }
  });
});

/* 비밀번호 찾기 관련 함수 */
function pwFind() {
  pwFindModalOpen();
}

function pwFindModalOpen() {
  // 모달
  const pwFindModal = document.getElementById("pwModal");
  const idNotice = document.getElementById("pwFindIdNotice");
  pwFindModal.classList.add("active");

  // userId
  const userIdInput = document.getElementById("pwUserId");

  userIdInput.addEventListener("input", function () {
    const idRegex = /[^a-zA-Z0-9]/g;

    if (idRegex.test(userIdInput.value)) {
      userIdInput.value = userIdInput.value.replace(idRegex, "");
      idNotice.style.display = "inline-block";
    } else {
      idNotice.style.display = "none";
    }
  });

  // phone (번호입력)
  const phoneInput = document.getElementById("pwPhone");

  phoneInput.addEventListener("input", function () {
    const phoneRegex = /[^0-9]/g;
    let onlyNumber = phoneInput.value.replace(phoneRegex, "");
    if (onlyNumber.length < 4) {
      phoneInput.value = onlyNumber;
      return;
    }

    if (onlyNumber.length < 8) {
      phoneInput.value = onlyNumber.slice(0, 3) + "-" + onlyNumber.slice(3);
      return;
    }

    phoneInput.value = onlyNumber.slice(0, 3) + "-" + onlyNumber.slice(3, 7) + "-" + onlyNumber.slice(7, 11);
  });

  // authCode (인증번호)
  const authCodeInput = document.getElementById("authCode");

  authCodeInput.addEventListener("input", function () {
    const authCodeRegex = /[^0-9]/g;

    if (authCodeRegex.test(authCodeInput.value)) {
      authCodeInput.value = authCodeInput.value.replace(authCodeRegex, "");
    }
  });
}

function pwFindModalClose() {
  const pwFindModal = document.getElementById("pwModal");
  pwFindModal.classList.remove("active");

  const pwChangeModal = document.getElementById("pwChangeModal");
  pwChangeModal.classList.remove("active");

  /* 입력값 및 상태 초기화 */
  resetPwFindModal();
  resetPwChangeModal();
}

function sendPhoneAuthCode() {
  // input 요소 먼저 가져오기
  const userIdInput = document.getElementById("pwUserId");
  const userPhoneInput = document.getElementById("pwPhone");
  const sendAuthNumBtn = document.getElementById("sendAuthNum");
  const pwSearchBtn = document.getElementById("pwSearch");

  // value 값을 따로 변수로 빼기
  const userId = userIdInput.value;
  const userPhone = userPhoneInput.value;

  // 빈값 체크
  if (userId === "") {
    alert("아이디를 입력해주세요.");
    userIdInput.focus();
    return;
  } else if (userPhone === "") {
    alert("전화번호를 입력해주세요.");
    userPhoneInput.focus();
    return;
  }

  // 인증번호 입력창 가져오기
  const authField = document.getElementById("authField");

  // 비교용 기준값
  const tempId = "admin";
  const tempPhone = "010-0000-0000";

  // 둘 다 일치
  if (userId === tempId && userPhone === tempPhone) {
    authField.style.display = "block";
    userIdInput.disabled = true;
    userPhoneInput.disabled = true;
    sendAuthNumBtn.style.display = "none";
    pwSearchBtn.style.display = "block";
    alert("인증번호가 발송되었습니다.");
    return;
  }

  // 아이디만 틀림
  if (userId !== tempId && userPhone === tempPhone) {
    authField.style.display = "none";
    alert("아이디가 일치하지 않습니다.");
    userIdInput.focus();
    return;
  }

  // 휴대폰만 틀림
  if (userId === tempId && userPhone !== tempPhone) {
    authField.style.display = "none";
    alert("휴대폰번호가 일치하지 않습니다.");
    userPhoneInput.focus();
    return;
  }

  // 둘 다 틀림
  if (userId !== tempId && userPhone !== tempPhone) {
    authField.style.display = "none";
    alert("아이디와 휴대폰번호가 모두 일치하지 않습니다.");
    userIdInput.focus();
    return;
  }
}

function resetPassWord() {
  const userPhoneAuthNumInput = document.getElementById("authCode");
  const pwChangeModal = document.getElementById("pwChangeModal");
  const pwFindModal = document.getElementById("pwModal");
  const userPhoneAuthNum = userPhoneAuthNumInput.value;
  const tempAuthNum = "123456";

  if (userPhoneAuthNum === "") {
    alert("인증번호를 입력해주세요.");
    userPhoneAuthNumInput.focus();
    return;
  } else if (userPhoneAuthNum !== tempAuthNum) {
    alert("인증번호가 일치하지 않습니다.");
    userPhoneAuthNumInput.focus();
    return;
  } else {
    alert("인증번호가 일치합니다. 비밀번호를 재설정해주세요.");
    pwFindModal.classList.remove("active");
    pwChangeModal.classList.add("active");
  }
}

function Changepw() {
  const changePwInput = document.getElementById("changePw");
  const changePwCheckInput = document.getElementById("changePwCheck");
  const changePw = changePwInput.value;
  const changePwCheck = changePwCheckInput.value;

  if (changePw === "") {
    alert("새 비밀번호를 입력해주세요.");
    changePwInput.focus();
    return;
  } else if (changePwCheck === "") {
    alert("새 비밀번호 확인을 입력해주세요.");
    changePwCheckInput.focus();
    return;
  } else if (changePw !== changePwCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    changePwCheckInput.focus();
    return;
  } else {
    // 비밀번호 재설정 로직 추가하면 됩니다.
    alert("비밀번호가 재설정되었습니다.");

    location.reload();
  }
}

/* 🔥 추가: 비밀번호 찾기 모달 초기화 */
function resetPwFindModal() {
  const pwUserId = document.getElementById("pwUserId");
  const pwPhone = document.getElementById("pwPhone");
  const authCode = document.getElementById("authCode");

  const authField = document.getElementById("authField");
  const sendAuthNumBtn = document.getElementById("sendAuthNum");
  const pwSearchBtn = document.getElementById("pwSearch");
  const idNotice = document.getElementById("pwFindIdNotice");

  pwUserId.value = "";
  pwPhone.value = "";
  authCode.value = "";

  pwUserId.disabled = false;
  pwPhone.disabled = false;

  authField.style.display = "none";
  sendAuthNumBtn.style.display = "block";
  pwSearchBtn.style.display = "none";

  if (idNotice) idNotice.style.display = "none";
}

/* 🔥 추가: 비밀번호 변경 모달 초기화 */
function resetPwChangeModal() {
  const changePw = document.getElementById("changePw");
  const changePwCheck = document.getElementById("changePwCheck");

  changePw.value = "";
  changePwCheck.value = "";
}

/* */

/* 로그인 관련 함수 */

function login() {
  const userIdInput = document.getElementById("user-id");
  const userPwInput = document.getElementById("user-pw");
  const keepLoginInput = document.querySelector("input[name='keepLogin']");

  // 자동 로그인 먼저 검사 (임시로 로컬스토리지에 저장)
  const isLogin = localStorage.getItem("isLogin");

  if (isLogin === "true") {
    alert("자동 로그인 상태입니다.");
    location.href = "./home/home.html";
    return;
  }

  const userId = userIdInput.value;
  const userPw = userPwInput.value;

  // 빈값 검사
  if (userId === "") {
    alert("아이디를 입력해주세요.");
    userIdInput.focus();
    return;
  }

  if (userPw === "") {
    alert("비밀번호를 입력해주세요.");
    userPwInput.focus();
    return;
  }

  // 임시 계정
  const tempId = "admin";
  const tempPw = "123456";

  if (userId === tempId && userPw === tempPw) {
    alert("로그인 성공!");

    // 로그인 상태 유지 체크 시 저장
    if (keepLoginInput.checked) {
      localStorage.setItem("isLogin", "true");
    } else {
      localStorage.removeItem("isLogin");
    }

    location.href = "./home/home.html";
  } else {
    alert("아이디 또는 비밀번호가 일치하지 않습니다.");
  }
}

/*  */
