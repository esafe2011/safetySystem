// 캘린더 초기화 및 렌더링
const calendarHead = document.getElementById("yearMonth");
const prevButton = document.querySelector(".calendar-nav button:first-child");
const nextButton = document.querySelector(".calendar-nav button:last-child");
const daysList = document.querySelector(".days");
const scheduleList = document.querySelector(".schedule-list");

// 이벤트 데이터 배열
const events = [
  { date: "2026-02-02", title: "PSM 준비심사", color: "red" },
  { date: "2026-02-03", title: "근로자 정기교육", color: "orange" },
  { date: "2026-02-04", title: "안전 점검", color: "purple" },
  { date: "2026-02-05", title: "안전 점검", color: "purple" },
  { date: "2026-02-06", title: "안전보건회의", color: "blue" },
  { date: "2026-02-10", title: "소방훈련", color: "green" },
];

// 현재 달
let currentDate = new Date();

// 캘린더 렌더링 함수
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  calendarHead.textContent = year + " " + (month + 1) + "월";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  daysList.innerHTML = "";

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevLastDate = new Date(prevYear, prevMonth + 1, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevLastDate - i;
    const thisDate = new Date(prevYear, prevMonth, dayNum);
    const weekday = thisDate.getDay();

    const li = document.createElement("li");
    li.classList.add("day");
    li.classList.add("prev-month");

    const time = document.createElement("time");
    time.textContent = dayNum;

    if (weekday === 0 || weekday === 6) {
      time.classList.add("weekend");
    }

    li.appendChild(time);
    daysList.appendChild(li);
  }

  for (let day = 1; day <= lastDate; day++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = year + "-" + mm + "-" + dd;

    const thisDate = new Date(year, month, day);
    const weekday = thisDate.getDay();

    const li = document.createElement("li");
    li.classList.add("day");

    const time = document.createElement("time");
    time.setAttribute("datetime", dateStr);
    time.textContent = day;

    if (weekday === 0 || weekday === 6) {
      time.classList.add("weekend");
    }

    li.appendChild(time);

    //filter 대신 for로 동일 로직 수행
    const dayEvents = [];
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (e && e.date === dateStr) {
        dayEvents.push(e);
      }
    }

    if (dayEvents.length > 0) {
      li.classList.add("has-event");

      const ul = document.createElement("ul");
      ul.classList.add("event-list");

      dayEvents.forEach(function (ev) {
        const eventLi = document.createElement("li");
        eventLi.classList.add("event");
        eventLi.classList.add(ev.color);
        eventLi.textContent = ev.title;
        ul.appendChild(eventLi);
      });

      li.appendChild(ul);
    }

    daysList.appendChild(li);
  }

  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const totalCells = 42;
  const filledCells = firstDay + lastDate;

  for (let i = 0; i < totalCells - filledCells; i++) {
    const dayNum = i + 1;
    const thisDate = new Date(nextYear, nextMonth, dayNum);
    const weekday = thisDate.getDay();

    const li = document.createElement("li");
    li.classList.add("day");
    li.classList.add("next-month");

    const time = document.createElement("time");
    time.textContent = dayNum;

    if (weekday === 0 || weekday === 6) {
      time.classList.add("weekend");
    }

    li.appendChild(time);
    daysList.appendChild(li);
  }

  renderSchedule();
}

// 세부일정 렌더링
function renderSchedule() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  scheduleList.innerHTML = "";

  //filter 대신 for로 동일 로직 수행
  const monthEvents = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!e || !e.date) continue;

    const parts = e.date.split("-");
    const eYear = Number(parts[0]);
    const eMonth = Number(parts[1]);

    if (eYear === year && eMonth - 1 === month) {
      monthEvents.push(e);
    }
  }

  monthEvents.forEach(function (ev) {
    const li = document.createElement("li");

    const time = document.createElement("time");
    time.setAttribute("datetime", ev.date);
    time.textContent = ev.date.replace(/-/g, ".");

    const p = document.createElement("p");
    p.textContent = ev.title;

    li.appendChild(time);
    li.appendChild(p);
    scheduleList.appendChild(li);
  });
}

// 이전달 클릭 이벤트 추가
prevButton.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

// 다음달 클릭 이벤트 추가
nextButton.addEventListener("click", function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// 초기 렌더링
renderCalendar();
