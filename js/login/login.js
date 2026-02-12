document.addEventListener("DOMContentLoaded", function () {
  const userIdInput = document.getElementById("user-id");

  userIdInput.addEventListener("input", function () {
    const idRegex = /[^a-zA-Z0-9]/g;

    if (idRegex.test(userIdInput.value)) {
      userIdInput.value = userIdInput.value.replace(idRegex, "");
      alert("아이디는 영문 + 숫자만 사용할 수 있습니다.");
    }
    // console.log(userIdInput.value);
  });
});

function pwFind() {
  pwFindModalOpen();
}

function pwFindModalOpen() {
  const pwFindModal = document.getElementById("pwModal");
  pwFindModal.classList.add("active");
}

function pwFindModalClose() {
  const pwFindModal = document.getElementById("pwModal");
  pwFindModal.classList.remove("active");
}
