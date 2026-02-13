// 카드 슬라이더 초기화
$(document).ready(function () {
  $(".cards-slider").slick({
    // 무한 반복
    infinite: true,

    // 항상 3개 보이게 고정
    slidesToShow: 3,

    // 한 번에 넘길 개수
    slidesToScroll: 1,

    // 전환 속도
    speed: 700,

    arrows: false,
    dots: true,
  });
});
