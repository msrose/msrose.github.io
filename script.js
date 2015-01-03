$(document).ready(function() {
  var $menu = $("#menu");
  if($menu) {
    $.ajax({
      url: "menu.html",
      success: function(data) {
        $menu.html(data);
      }
    });
  }
});
