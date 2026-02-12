//서브메뉴 열고 닫기 기능
const menuItems = document.querySelectorAll(".menu-item.has-children");

menuItems.forEach(function (item) {
  const button = item.querySelector(".menu-button");
  const submenu = item.querySelector(".submenu");
  const menuArrowImg = button.querySelector(".menu-arrow-img");

  button.addEventListener("click", function () {
    const isOpen = submenu.classList.contains("open");

    //모든 서브메뉴 닫기
    document.querySelectorAll(".submenu").forEach(function (el) {
      el.style.height = "0px";
      el.classList.remove("open");
    });

    //모든 화살표 원래대로
    document.querySelectorAll(".menu-arrow-img").forEach(function (arrow) {
      arrow.style.transform = "rotate(0deg)";
    });

    //이미 열려있던 메뉴라면 그냥 닫기
    if (isOpen) {
      submenu.style.height = "0px";
      submenu.classList.remove("open");
      return;
    }

    //현재 메뉴 열기
    submenu.classList.add("open");
    submenu.style.height = submenu.scrollHeight + "px";

    if (menuArrowImg) {
      menuArrowImg.style.transform = "rotate(180deg)";
    }
  });
});
