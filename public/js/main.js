$(document).ready(function() {
    $("div.as-vertical-tab-menu>div.list-group>a").click(function(e) {
        e.preventDefault();
        $(this).siblings('a.active').removeClass("active");
        $(this).addClass("active");
        var index = $(this).index();
        $("div.as-vertical-tab>div.as-vertical-tab-content").removeClass("active");
        $("div.as-vertical-tab>div.as-vertical-tab-content").eq(index).addClass("active");
    });


    //STICKYNAVIGATION HOVERS
    $('.platform-nav').hover(
      function() {
        $('#platform-sticky').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
        $('#platform-main').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        })
      },
      function() {
        $('#platform-sticky').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter": ""
        });
        $('#platform-main').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter": ""
        });
      }
    );
    $('.tools-nav').hover(
      function() {
        $('#tools-sticky').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
        $('#tools-main').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter":"drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
      },
      function() {
        $('#tools-sticky').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter":""
        });
        $('#tools-main').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter":""
        });
      }
    );
    $('.diensten-nav').hover(
      function() {
        $('#diensten-sticky').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter":"drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
        $('#diensten-main').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter":"drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
      },
      function() {
        $('#diensten-sticky').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter": ""
        });
        $('#diensten-main').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter": ""
        });
      }
    );
    $('.blog-nav').hover(
      function() {
        $('#blog-sticky').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
            "-ms-filter":"drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
        $('#blog-main').css({
          "-webkit-filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "filter": "drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)",
          "-ms-filter":"drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black)"
        });
      },
      function() {
        $('#blog-sticky').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter":""
        });
        $('#blog-main').css({
          "-webkit-filter": "",
          "filter": "",
          "-ms-filter":""
        });
      }
    );

    $('.content-section img').addClass("img-responsive img-center");

    //TAGCLOUD
    $.fn.tagcloud.defaults = {
      size: {start: 9, end: 15, unit: 'pt'},
      color: {start: '#a5a5a5', end: '#f75e5b'}
    };

    $(function () {
      $('#blogcloud a').tagcloud();
  });


});
