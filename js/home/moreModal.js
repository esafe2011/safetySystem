//더보기 모달 생성 및 제어

let moreOverlay = null;
let moreList = null;
let moreTitle = null;

function createMoreModal() {
  if (moreOverlay) return;

  moreOverlay = document.createElement("div");
  moreOverlay.className = "more-overlay";

  var modal = document.createElement("div");
  modal.className = "more-modal";

  var header = document.createElement("div");
  header.className = "more-header";

  moreTitle = document.createElement("h3");

  var closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.innerHTML = '<img src="../images/icons/close.svg" alt="닫기" />';
  header.appendChild(moreTitle);
  header.appendChild(closeBtn);

  moreList = document.createElement("ul");
  moreList.className = "more-list";

  modal.appendChild(header);
  modal.appendChild(moreList);
  moreOverlay.appendChild(modal);
  document.body.appendChild(moreOverlay);

  closeBtn.addEventListener("click", function () {
    moreOverlay.style.display = "none";
  });

  moreOverlay.addEventListener("click", function (e) {
    if (e.target === moreOverlay) {
      moreOverlay.style.display = "none";
    }
  });
}

function openMoreModal(dateStr) {
  createMoreModal();

  moreTitle.textContent = dateStr.replace(/-/g, ".") + " 일정";
  moreList.innerHTML = "";

  for (var i = 0; i < events.length; i++) {
    if (events[i] && events[i].date === dateStr) {
      (function (ev, idx) {
        var li = document.createElement("li");
        li.className = "more-item";

        var text = document.createElement("span");
        text.appendChild(document.createTextNode(ev.title));

        li.appendChild(text);

        li.addEventListener("click", function () {
          moreOverlay.style.display = "none";
          openViewModal(ev, idx);
        });

        moreList.appendChild(li);
      })(events[i], i);
    }
  }

  moreOverlay.style.display = "flex";
}
