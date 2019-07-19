// This function increases the navbar's background opacity from 0% to 90% as the offset from the top of the page increases
$(window).scroll(function() {
  var n = $(".navbar"),
    dist = n.offset().top;

  n.css("background-color", "rgba(202, 235, 242," + dist / 450 + ")");

  if (dist / 450 > ".9") {
    n.css("background-color", "rgba(202, 235, 242, .9");
  }
});
