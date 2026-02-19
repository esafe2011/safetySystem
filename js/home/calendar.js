//캘린더 그리는 파일(+더보기: 달력엔 3개까지만, 나머지는 더보기 팝업에만 / 화살표함수X / 템플릿리터럴로 DOM생성X)

const calendarHead = document.getElementById("yearMonth");
const prevButton = document.querySelector(".calendar-nav button:first-child");
const nextButton = document.querySelector(".calendar-nav button:last-child");
const daysList = document.querySelector(".days");
const scheduleList = document.querySelector(".schedule-list");

// 지금 보는 년월
let currentDate = new Date();

// 캘린더 전체 다시 그리기
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  calendarHead.textContent = year + "년 " + (month + 1) + "월";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  daysList.innerHTML = "";

  // 이전달 날짜들
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevLast = new Date(prevYear, prevMonth + 1, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevLast - i;
    const li = document.createElement("li");
    li.classList.add("day", "prev-month");

    const time = document.createElement("time");
    time.textContent = dayNum;

    if (new Date(prevYear, prevMonth, dayNum).getDay() % 6 === 0) {
      time.classList.add("weekend");
    }

    li.appendChild(time);
    daysList.appendChild(li);
  }

  //주마다 텍스트 1번만 보이게(월 전체 공유)
  const renderedRangeTextMap = {};

  // 이번달 날짜들
  for (let day = 1; day <= lastDate; day++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = year + "-" + mm + "-" + dd;

    const li = document.createElement("li");
    li.classList.add("day");

    const time = document.createElement("time");
    time.setAttribute("datetime", dateStr);
    time.textContent = day;

    if (new Date(year, month, day).getDay() % 6 === 0) {
      time.classList.add("weekend");
    }

    li.appendChild(time);

    // 일정이 있을 때만 표시 (events가 없으면 그냥 날짜만 보여줌)
    if (typeof events !== "undefined" && Array.isArray(events)) {
      const dayEvents = events.filter(function (e) {
        return e && e.date === dateStr;
      });

      if (dayEvents.length > 0) {
        li.classList.add("has-event");

        const ul = document.createElement("ul");
        ul.classList.add("event-list");

        //달력에는 최대 3개까지만 표시(4개째부터는 더보기 팝업에서만)
        const MAX_VISIBLE = 3;
        const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);

        visibleEvents.forEach(function (ev) {
          const eventLi = document.createElement("li");
          eventLi.classList.add("event", ev.color || "gray");

          const safeTitle = ev.title || "제목 없음";

          //클릭용 제목 보관(텍스트 숨겨도 상세보기 가능)
          eventLi.setAttribute("data-title", safeTitle);

          //DOM은 createElement로만 생성(IE 대응)
          const textSpan = document.createElement("span");
          textSpan.className = "event-text";
          textSpan.appendChild(document.createTextNode(safeTitle));
          eventLi.appendChild(textSpan);

          const isRange = ev && ev.rangeStart && ev.rangeEnd && ev.rangeStart !== ev.rangeEnd;

          if (isRange) {
            eventLi.classList.add("is-range");

            // 시작/끝/중간
            if (dateStr === ev.rangeStart) eventLi.classList.add("range-start");
            else if (dateStr === ev.rangeEnd) eventLi.classList.add("range-end");
            else eventLi.classList.add("range-mid");

            // 주차가 끊기는 지점(토요일 끝 / 일요일 시작)도 둥글게 처리
            const dow = new Date(year, month, day).getDay(); // 0=일 ... 6=토
            if (dow === 6 && dateStr !== ev.rangeEnd) eventLi.classList.add("range-week-end");
            if (dow === 0 && dateStr !== ev.rangeStart) eventLi.classList.add("range-week-start");

            //주마다 텍스트 1번만 표시(막대는 매일 다 그림)
            if (ev.rangeId) {
              const weekIndex = Math.floor((day + firstDay - 1) / 7);
              const weekKey = ev.rangeId + "_" + weekIndex;

              if (renderedRangeTextMap[weekKey]) {
                textSpan.style.display = "none";
              } else {
                renderedRangeTextMap[weekKey] = true;
              }
            }
          }

          ul.appendChild(eventLi);
        });

        //3개 초과면 더보기 1개만 추가(달력에는 더 이상 일정 추가 안 함)
        if (dayEvents.length > MAX_VISIBLE) {
          const moreLi = document.createElement("li");
          moreLi.className = "event more-btn";
          moreLi.appendChild(document.createTextNode("+" + (dayEvents.length - MAX_VISIBLE) + " 더보기"));

          moreLi.addEventListener("click", function (e) {
            e.stopPropagation();
            openMoreModal(dateStr);
          });

          ul.appendChild(moreLi);
        }

        li.appendChild(ul);
      }
    }

    daysList.appendChild(li);
  }

  function setupDayClickEvents() {
    // 기존 이벤트 모두 제거
    daysList.removeEventListener("click", handleDayClick);
    // 새로 걸기
    daysList.addEventListener("click", handleDayClick);
  }

  // 다음달 날짜들 (칸 맞추기)
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const remain = 42 - (firstDay + lastDate);

  for (let i = 0; i < remain; i++) {
    const dayNum = i + 1;
    const li = document.createElement("li");
    li.classList.add("day", "next-month");

    const time = document.createElement("time");
    time.textContent = dayNum;

    if (new Date(nextYear, nextMonth, dayNum).getDay() % 6 === 0) {
      time.classList.add("weekend");
    }

    li.appendChild(time);
    daysList.appendChild(li);
  }

  renderSchedule();
  setupDayClickEvents();

  // 클릭 이벤트 다시 걸기
  daysList.removeEventListener("click", handleDayClick);
  daysList.addEventListener("click", handleDayClick);
}

// 오른쪽 이번달 일정 목록
function renderSchedule() {
  scheduleList.innerHTML = "";

  if (typeof events === "undefined" || !Array.isArray(events)) {
    return;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const thisMonthEvents = events.filter(function (e) {
    if (!e || !e.date) return false;
    const parts = e.date.split("-");
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    return y === year && m === month;
  });

  thisMonthEvents.forEach(function (ev) {
    const li = document.createElement("li");
    const time = document.createElement("time");
    time.setAttribute("datetime", ev.date);
    time.textContent = ev.date ? ev.date.replace(/-/g, ".") : "날짜 없음";

    const p = document.createElement("p");
    p.textContent = ev.title || "제목 없음";

    li.appendChild(time);
    li.appendChild(p);
    scheduleList.appendChild(li);
  });
}

// daysList 클릭 이벤트 처리 함수
function handleDayClick(e) {
  const target = e.target;

  // 일정 박스(.event)를 클릭했을 때 → 일정보기 모달만 열기
  if (target.closest(".event")) {
    e.stopPropagation();

    const eventLi = target.closest(".event");

    //더보기 버튼은 여기서 처리하지 않음(자기 클릭핸들러가 openMoreModal 호출)
    if (eventLi.classList.contains("more-btn")) {
      return;
    }

    const title = eventLi.getAttribute("data-title") || eventLi.textContent.trim();
    const dateStr = eventLi.closest(".day").querySelector("time").getAttribute("datetime");

    let foundEvent = null;
    let foundIndex = -1;

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (ev.date === dateStr && ev.title === title) {
        foundEvent = ev;
        foundIndex = i;
        break;
      }
    }

    if (foundEvent) {
      openViewModal(foundEvent, foundIndex);
    }

    return;
  }

  // .day를 클릭했을 때 → 일정등록 모달만 열기
  const day = target.closest(".day");
  if (!day) return;

  if (day.classList.contains("prev-month") || day.classList.contains("next-month")) {
    return;
  }

  const time = day.querySelector("time");
  if (!time) return;

  const dateStr = time.getAttribute("datetime");
  openAddModal(dateStr);
}

// 버튼들(화살표 함수 X)
prevButton.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextButton.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// 처음 시작
renderCalendar();
