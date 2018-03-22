$(function(){
   var arr = window.location.href.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
   var path = arr[5];
    if (path==="" || path==="/") {
      $('.main-hand').removeClass("nav-active");
      $('.sticky-hand').removeClass("nav-active");
      $('.platform-nav').addClass("nav-active");
    }
    if (path.slice(0,5)==="/blog") {
      $('.main-hand').removeClass("nav-active");
      $('.sticky-hand').removeClass("nav-active");
      $('.blog-nav').addClass("nav-active");
    }
    if (path.slice(0,5)!='/blog') {
      $('#blogcloud').css("display","none");
    }
    if (path==="/diensten") {
      $('.main-hand').removeClass("nav-active");
      $('.sticky-hand').removeClass("nav-active");
      $('.diensten-nav').addClass("nav-active");
    }
    if (path==="/tools") {
      $('.main-hand').removeClass("nav-active");
      $('.sticky-hand').removeClass("nav-active");
      $('.tools-nav').addClass("nav-active");
    }
    if (path ==="/contact") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.contact-nav').addClass("sidenav-active");
    }
    if (path ==="/terms") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.terms-nav').addClass("sidenav-active");
    }
    if (path ==="/privacy") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.privacy-nav').addClass("sidenav-active");
    }
    if (path ==="/about") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.about-nav').addClass("sidenav-active");
    }
    if (path ==="/auth/login") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.login-nav').addClass("sidenav-active");
    }
    if (path ==="/auth/profile") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.profile-nav').addClass("sidenav-active");
    }
    if (path ==="/logout") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.logout-nav').addClass("sidenav-active");
    }
    if (path ==="/auth/signup") {
      $('footer a').removeClass("sidenav-active");
      $('.nav li a').removeClass("sidenav-active");
      $('.signup-nav').addClass("sidenav-active");
    }
})
