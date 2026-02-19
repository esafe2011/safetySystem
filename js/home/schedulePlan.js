// 일정 추가·수정·삭제·보기 관리하는 파일
let events = [];

const scheduleAddOverlay = document.getElementById("scheduleAddOverlay");
const scheduleViewOverlay = document.getElementById("scheduleViewOverlay");

const addTitle = document.getElementById("addTitle");
const addStartDate = document.getElementById("addStartDate");
const addStartTime = document.getElementById("addStartTime");
const addEndDate = document.getElementById("addEndDate");
const addEndTime = document.getElementById("addEndTime");
const addContent = document.getElementById("addContent");
const addSaveBtn = document.getElementById("addSaveBtn");
const modifyBtn = document.getElementById("modifyBtn");

const viewTitle = document.getElementById("viewTitle");
const viewDate = document.getElementById("viewDate");
const viewContent = document.getElementById("viewContent");
const viewDeleteBtn = document.getElementById("viewDeleteBtn");

let selectedDateStr = "";
let selectedEventIndex = -1;

// 숫자 두 자리로 (1 → "01")
function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

// "2025-04-03" → Date 객체
function toDateObj(dateStr) {
  const parts = dateStr.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Date → "2025-04-03"
function toDateStr(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

// "2025-04-03" → "2025.04.03"
function formatDot(dateStr) {
  return dateStr.replace(/-/g, ".");
}

// 시작~끝 보기 좋게 문자열로
function formatRangeText(start, end) {
  if (!end || start === end) return formatDot(start);
  return formatDot(start) + " ~ " + formatDot(end);
}

// 모달 열기
function openOverlay(el) {
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
}

// 모달 닫기
function closeOverlay(el) {
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
}

// 선택된 색상 가져오기
function getSelectedColor() {
  const checked = document.querySelector('input[name="eventColor"]:checked');
  return checked ? checked.value : "purple";
}

// 추가 폼 깨끗하게 비우기
function clearAddForm() {
  addTitle.value = "";
  addStartTime.value = "00:00";
  addEndTime.value = "00:00";
  addContent.value = "";
}

// 버튼 모드 바꾸기
function setButtonMode(isEdit) {
  addSaveBtn.style.display = isEdit ? "none" : "inline-block";
  modifyBtn.style.display = isEdit ? "inline-block" : "none";
}

// 신규 추가 모달 열기
function openAddModal(dateStr) {
  selectedDateStr = dateStr;
  clearEditTarget();
  setButtonMode(false);
  clearAddForm();
  addStartDate.value = dateStr;
  addEndDate.value = dateStr;
  openOverlay(scheduleAddOverlay);
}

// 보기 모달 열기
function openViewModal(ev, index) {
  selectedEventIndex = index;
  viewTitle.value = ev.title;
  viewDate.value = formatRangeText(ev.rangeStart || ev.date, ev.rangeEnd || ev.date);
  viewContent.value = ev.content || "";
  openOverlay(scheduleViewOverlay);
}

// 특정 날짜 일정 찾기
function findEventsByDate(dateStr) {
  const result = [];
  for (let i = 0; i < events.length; i++) {
    if (events[i] && events[i].date === dateStr) {
      result.push({ e: events[i], idx: i });
    }
  }
  return result;
}

// 기간 일정 여러 날에 저장
function pushRangeEvents(startStr, endStr, data) {
  let start = toDateObj(startStr);
  let end = toDateObj(endStr);

  if (end < start) {
    const tmp = startStr;
    startStr = endStr;
    endStr = tmp;
    start = toDateObj(startStr);
    end = toDateObj(endStr);
  }

  const rangeId = "range_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
  let cur = new Date(start);

  while (cur <= end) {
    events.push({
      date: toDateStr(cur),
      title: data.title,
      color: data.color,
      content: data.content,
      rangeId: rangeId,
      rangeStart: startStr,
      rangeEnd: endStr,
    });
    cur.setDate(cur.getDate() + 1);
  }
}

// 수정 대상 기억하기
let editRangeId = "";
let editSingleIndex = -1;

function setEditTargetByEvent(ev, idx) {
  editRangeId = ev.rangeId || "";
  editSingleIndex = typeof idx === "number" ? idx : -1;
}

function clearEditTarget() {
  editRangeId = "";
  editSingleIndex = -1;
}

function hasEditTarget() {
  return editRangeId !== "" || editSingleIndex >= 0;
}

// 수정 전 기존 일정 지우기
function removeEventByEditTarget() {
  if (editRangeId) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].rangeId === editRangeId) {
        events.splice(i, 1);
      }
    }
  } else if (editSingleIndex >= 0) {
    events.splice(editSingleIndex, 1);
  }
}

// ──────────────────────────────── 이벤트 연결 ────────────────────────────────

// 모달 닫기 버튼들
document.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-modal-close]");
  if (!btn) return;
  const id = btn.getAttribute("data-modal-close");
  const overlay = document.getElementById(id);
  if (overlay) closeOverlay(overlay);
});

// 모달 바깥 클릭 닫기
scheduleAddOverlay.addEventListener("click", (e) => {
  if (e.target === scheduleAddOverlay) closeOverlay(scheduleAddOverlay);
});
scheduleViewOverlay.addEventListener("click", (e) => {
  if (e.target === scheduleViewOverlay) closeOverlay(scheduleViewOverlay);
});

// 새 일정 저장
addSaveBtn.addEventListener("click", function () {
  const title = addTitle.value.trim();
  const content = addContent.value.trim();

  if (!title) {
    alert("제목을 입력해주세요");
    addTitle.focus();
    return;
  }
  if (!content) {
    alert("내용을 입력해주세요");
    addContent.focus();
    return;
  }

  const color = getSelectedColor();
  const start = addStartDate.value;
  const end = addEndDate.value || start;

  pushRangeEvents(start, end, { title, color, content });

  closeOverlay(scheduleAddOverlay);
  renderCalendar();
});

// 상세보기 → 수정 모드로 전환
document.getElementById("viewDetailBtn").addEventListener("click", function () {
  if (selectedEventIndex < 0) return;
  const ev = events[selectedEventIndex];
  if (!ev) return;

  setEditTargetByEvent(ev, selectedEventIndex);
  setButtonMode(true);

  addTitle.value = ev.title;
  addStartDate.value = ev.rangeStart || ev.date;
  addEndDate.value = ev.rangeEnd || ev.date;
  addContent.value = ev.content || "";

  const radio = document.querySelector(`input[name="eventColor"][value="${ev.color}"]`);
  if (radio) radio.checked = true;

  closeOverlay(scheduleViewOverlay);
  openOverlay(scheduleAddOverlay);
});

// 수정 저장
modifyBtn.addEventListener("click", function () {
  if (!hasEditTarget()) return;

  const title = addTitle.value.trim();
  const content = addContent.value.trim();

  if (!title) {
    alert("제목을 입력해주세요");
    addTitle.focus();
    return;
  }
  if (!content) {
    alert("내용을 입력해주세요");
    addContent.focus();
    return;
  }

  if (!confirm("일정을 수정할까요?")) return;

  const color = getSelectedColor();
  const start = addStartDate.value;
  const end = addEndDate.value || start;

  removeEventByEditTarget();
  pushRangeEvents(start, end, { title, color, content });

  clearEditTarget();
  setButtonMode(false);
  closeOverlay(scheduleAddOverlay);
  renderCalendar();
});

// 삭제
viewDeleteBtn.addEventListener("click", function () {
  if (selectedEventIndex < 0) return;
  const target = events[selectedEventIndex];
  if (!target) return;

  if (target.rangeId) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].rangeId === target.rangeId) {
        events.splice(i, 1);
      }
    }
  } else {
    events.splice(selectedEventIndex, 1);
  }

  selectedEventIndex = -1;
  closeOverlay(scheduleViewOverlay);
  renderCalendar();
});

// 세부일정 목록 클릭 (오른쪽 목록용)
scheduleList.addEventListener("click", function (e) {
  const item = e.target.closest("li");
  if (!item) return;

  const time = item.querySelector("time");
  if (!time) return;

  const dateStr = time.getAttribute("datetime");
  if (!dateStr) return;

  const found = findEventsByDate(dateStr);

  if (found.length === 0) {
    openAddModal(dateStr);
  } else {
    openViewModal(found[0].e, found[0].idx);
  }
});

// 처음 시작할 때 신규 모드로
setButtonMode(false);
