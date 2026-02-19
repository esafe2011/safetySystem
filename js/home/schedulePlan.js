/* 교육일정 일정 관리 js */

// - 신규 등록 모드: 저장 버튼(addSaveBtn)만 보이고, 일정 추가 가능
// - 수정 모드: 수정 버튼(modifyBtn)만 보이고, 기존 일정 수정 가능
// - 기간 일정은 시작일~종료일까지 하루씩 events에 저장하고 rangeId로 묶어서 관리

// document.addEventListener("DOMContentLoaded", function () {
//   console.log("daysList :", daysList);
// });

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

// 1~9 같은 숫자를 "01"처럼 2자리 문자열로 바꿔 날짜 문자열 만들 때 사용
function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

// "YYYY-MM-DD" 문자열을 Date 객체로 바꿔 날짜 비교/계산(기간 반복)에 사용
function toDateObj(dateStr) {
  const parts = dateStr.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Date 객체를 "YYYY-MM-DD" 문자열로 바꿔 events에 저장할 때 사용
function toDateStr(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

// 화면 표시용으로 "YYYY-MM-DD"를 "YYYY.MM.DD" 형태로 변환
function formatDot(dateStr) {
  return dateStr.replace(/-/g, ".");
}

// 시작~끝 날짜를 화면 표시용 문구로 만들기
// - 하루 일정이면 단일 날짜만 표시
// - 기간 일정이면 "시작 ~ 끝" 형태로 표시
function formatRangeText(startStr, endStr) {
  if (!endStr || startStr === endStr) return formatDot(startStr);
  return formatDot(startStr) + " ~ " + formatDot(endStr);
}

// 오버레이(모달) 열기: 화면에 보이도록 클래스/aria 상태 변경
function openOverlay(overlayEl) {
  overlayEl.classList.add("is-open");
  overlayEl.setAttribute("aria-hidden", "false");
}

// 오버레이(모달) 닫기: 화면에서 숨기도록 클래스/aria 상태 변경
function closeOverlay(overlayEl) {
  overlayEl.classList.remove("is-open");
  overlayEl.setAttribute("aria-hidden", "true");
}

// 색상 라디오 버튼 중 현재 선택된 값을 가져오고, 없으면 기본값 "purple" 사용
function getSelectedColor() {
  const checked = document.querySelector('input[name="eventColor"]:checked');
  return checked ? checked.value : "purple";
}

// 신규 등록 모드로 열릴 때 입력값을 비우고 기본값(시간 등) 세팅
function clearAddForm() {
  addTitle.value = "";
  addStartTime.value = "00:00";
  addEndTime.value = "00:00";
  addContent.value = "";
}

// 모드에 따라 버튼을 바꿔 보여주는 함수
// - isEdit=true  : 저장 버튼 숨김 + 수정 버튼 노출(수정 모드)
// - isEdit=false : 저장 버튼 노출 + 수정 버튼 숨김(신규 등록 모드)
function setButtonMode(isEdit) {
  if (isEdit) {
    addSaveBtn.style.display = "none";
    modifyBtn.style.display = "inline-block";
  } else {
    addSaveBtn.style.display = "inline-block";
    modifyBtn.style.display = "none";
  }
}

// 신규 일정 등록 모달 열기
// - 수정 타겟 초기화(수정 상태가 남아있지 않게)
// - 저장 버튼만 보이게(신규 등록 모드)
// - 클릭한 날짜를 시작/끝 날짜 기본값으로 넣고 모달 열기
function openAddModal(dateStr) {
  selectedDateStr = dateStr;

  clearEditTarget();
  setButtonMode(false);

  clearAddForm();
  addStartDate.value = dateStr;
  addEndDate.value = dateStr;

  openOverlay(scheduleAddOverlay);
}

// 상세보기 모달 열기
// - 선택한 일정의 제목/기간/내용을 모달에 채워 넣고 모달 열기
function openViewModal(ev, index) {
  selectedEventIndex = index;

  viewTitle.value = ev.title;
  viewDate.value = formatRangeText(ev.rangeStart ? ev.rangeStart : ev.date, ev.rangeEnd ? ev.rangeEnd : ev.date);
  viewContent.value = ev.content ? ev.content : "";

  openOverlay(scheduleViewOverlay);
}

// 특정 날짜(dateStr)에 해당하는 events를 찾아 반환
// - 달력에서 날짜 클릭했을 때 "해당 날짜에 일정이 있는지" 판단하는 용도
// - IE 호환: map/filter 없이 for로 동일 로직 수행
function findEventsByDate(dateStr) {
  const result = [];
  for (let idx = 0; idx < events.length; idx++) {
    const e = events[idx];
    if (e && e.date === dateStr) {
      result.push({ e: e, idx: idx });
    }
  }
  return result;
}

// 기간 일정 저장
// - startStr~endStr 사이를 하루씩 돌면서 events에 날짜별로 1개씩 저장
// - 같은 기간 일정끼리는 rangeId로 묶어서 삭제/수정 시 한 번에 처리할 수 있게 함
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

  const rangeId = "range_" + new Date().getTime() + "_" + Math.floor(Math.random() * 100000);
  let cur = new Date(start.getTime());

  while (cur <= end) {
    const dStr = toDateStr(cur);

    events.push({
      date: dStr,
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

// 달력 날짜 클릭 이벤트
// - 클릭한 날짜에 일정이 없으면: 신규 등록 모달 열기
// - 클릭한 날짜에 일정이 있으면: 첫 번째 일정의 상세보기 모달 열기
daysList.addEventListener("click", function (e) {
  console.log("캘린더 li 클릭");
  console.log(e.target);
  const dayEl = e.target.closest(".day");
  if (!dayEl) return;

  const timeEl = dayEl.querySelector("time");
  if (!timeEl) return;

  const dateStr = timeEl.getAttribute("datetime");
  if (!dateStr) return;

  const found = findEventsByDate(dateStr);

  if (found.length === 0) {
    openAddModal(dateStr);
    return;
  }

  openViewModal(found[0].e, found[0].idx);
});

// data-modal-close 속성이 있는 버튼을 누르면 해당 id의 모달(오버레이)을 닫기
document.addEventListener("click", function (e) {
  const closeTarget = e.target.closest("[data-modal-close]");
  if (!closeTarget) return;

  const targetId = closeTarget.getAttribute("data-modal-close");
  const overlayEl = document.getElementById(targetId);
  if (!overlayEl) return;

  closeOverlay(overlayEl);
});

// 모달 배경(오버레이 바깥)을 클릭하면 모달 닫기
scheduleAddOverlay.addEventListener("click", function (e) {
  if (e.target === scheduleAddOverlay) closeOverlay(scheduleAddOverlay);
});

scheduleViewOverlay.addEventListener("click", function (e) {
  if (e.target === scheduleViewOverlay) closeOverlay(scheduleViewOverlay);
});

// 신규 저장 버튼 클릭
// - 제목/내용이 비어있으면 저장하지 않고 해당 입력칸으로 포커스 이동
// - 정상 입력이면 기간 저장 함수로 events에 저장하고 모달 닫은 뒤 달력 다시 렌더링
addSaveBtn.addEventListener("click", function () {
  const title = addTitle.value.trim();
  const content = addContent.value.trim();

  if (!title) {
    alert("제목을 입력해주세요.");
    addTitle.focus();
    return;
  }

  if (!content) {
    alert("내용을 입력해주세요.");
    addContent.focus();
    return;
  }

  const color = getSelectedColor();

  const startStr = addStartDate.value;
  const endStr = addEndDate.value ? addEndDate.value : startStr;

  pushRangeEvents(startStr, endStr, {
    title: title,
    color: color,
    content: content,
  });

  closeOverlay(scheduleAddOverlay);
  renderCalendar();
});

// 상세보기에서 삭제 버튼 클릭
// - 기간 일정이면 같은 rangeId 가진 것 전부 삭제
// - 단일 일정이면 선택한 1개만 삭제
// - 삭제 후 상세보기 닫고 달력 다시 렌더링
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

let editRangeId = "";
let editSingleIndex = -1;

// 수정할 대상을 기억해두는 함수
// - 기간 일정이면 rangeId로, 단일 일정이면 index로 저장해둠
function setEditTargetByEvent(ev, index) {
  editRangeId = ev && ev.rangeId ? ev.rangeId : "";
  editSingleIndex = typeof index === "number" ? index : -1;
}

// 수정 대상 초기화 함수
// - 수정이 끝났거나 신규 등록 모드로 돌아갈 때 사용
function clearEditTarget() {
  editRangeId = "";
  editSingleIndex = -1;
}

// 현재 수정 대상이 있는지 확인하는 함수
// - 수정 버튼(modifyBtn)이 눌렸을 때 유효한 수정 대상이 없으면 실행을 막기 위해 사용
function hasEditTarget() {
  return !!editRangeId || editSingleIndex >= 0;
}

// 수정 저장 전에 기존 일정을 삭제하는 함수
// - 기간 일정이면 같은 rangeId 전부 삭제
// - 단일 일정이면 해당 인덱스 1개 삭제
function removeEventByEditTarget() {
  if (editRangeId) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].rangeId === editRangeId) {
        events.splice(i, 1);
      }
    }
    return;
  }

  if (editSingleIndex >= 0) {
    events.splice(editSingleIndex, 1);
  }
}

const viewDetailBtn = document.getElementById("viewDetailBtn");

// 상세보기에서 수정 버튼 클릭
// - 수정 대상 세팅 + 수정 버튼만 보이게 전환
// - add 모달 입력칸에 기존 값 채워넣고 add 모달을 열어 수정 화면으로 사용
viewDetailBtn.addEventListener("click", function () {
  if (selectedEventIndex < 0) return;

  const ev = events[selectedEventIndex];
  if (!ev) return;

  setEditTargetByEvent(ev, selectedEventIndex);
  setButtonMode(true);

  addTitle.value = ev.title;
  addStartDate.value = ev.rangeStart ? ev.rangeStart : ev.date;
  addEndDate.value = ev.rangeEnd ? ev.rangeEnd : ev.date;
  addContent.value = ev.content ? ev.content : "";

  const colorRadio = document.querySelector('input[name="eventColor"][value="' + ev.color + '"]');
  if (colorRadio) colorRadio.checked = true;

  closeOverlay(scheduleViewOverlay);
  openOverlay(scheduleAddOverlay);
});

// 수정 버튼 클릭
// - 수정 대상이 없으면 실행 안 함
// - 제목/내용이 비어있으면 저장 안 하고 포커스 이동
// - 확인창에서 확인 누르면: 기존 삭제 -> 새로 저장 -> 수정 모드 해제 -> 버튼/모달/달력 상태 원복
modifyBtn.addEventListener("click", function () {
  if (!hasEditTarget()) return;

  const title = addTitle.value.trim();
  const content = addContent.value.trim();

  if (!title) {
    alert("제목을 입력해주세요.");
    addTitle.focus();
    return;
  }

  if (!content) {
    alert("내용을 입력해주세요.");
    addContent.focus();
    return;
  }

  if (!confirm("일정을 수정하시겠습니까?")) return;

  const color = getSelectedColor();

  const startStr = addStartDate.value;
  const endStr = addEndDate.value ? addEndDate.value : startStr;

  removeEventByEditTarget();

  pushRangeEvents(startStr, endStr, {
    title: title,
    color: color,
    content: content,
  });

  clearEditTarget();
  setButtonMode(false);
  closeOverlay(scheduleAddOverlay);
  renderCalendar();
});

//스케줄 리스트 li 클릭 이벤트 추가 (세부일정)
scheduleList.addEventListener("click", function (e) {
  const itemEl = e.target.closest("li");
  if (!itemEl) return;

  const timeEl = itemEl.querySelector("time");
  if (!timeEl) return;

  const dateStr = timeEl.getAttribute("datetime");
  if (!dateStr) return;

  const found = findEventsByDate(dateStr);

  if (found.length === 0) {
    openAddModal(dateStr);
    return;
  }

  openViewModal(found[0].e, found[0].idx);
});

// 페이지 로드 시 기본 상태는 "신규 등록 모드"이므로 저장 버튼만 보이도록 초기화
setButtonMode(false);
