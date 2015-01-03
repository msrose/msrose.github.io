(function($) {
  var routes = {
    "blog": "blog.html",
    "projects": "projects.html",
    "contact": "contact.html"
  };

  $(document).ready(function() {
    var $content = $("#content");

    function changePage(hash) {
      var path = hash.slice(2);
      var url = path in routes ? routes[path] : "blog.html";

      $.ajax({
        url: url,
        success: function(data) {
          $content.html(data);
        }
      });
    }

    changePage(window.location.hash);

    $(window).on("hashchange", function() {
      changePage(window.location.hash);
    });
  });
})(jQuery);
