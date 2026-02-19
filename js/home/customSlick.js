$(document).ready(function () {
  $(".cards-slider").slick({
    infinite: true,
    slidesToShow: 3,

    slidesToScroll: 1,
    speed: 700,

    arrows: false,
    dots: true,
  });

  // 마우스 올리면 즉시 멈추고, 떼면 다시 움직이게
  $(".live-alert-notice").slick({
    infinite: true,
    slidesToShow: 5,

    autoplay: true,
    autoplaySpeed: 0,
    speed: 4000, // 천천히 흘러가게 (숫자 크게 하면 더 느려짐)
    cssEase: "linear",

    arrows: false,
    dots: false,
    draggable: false,
    swipe: false,
  });
});
