(function($) {
  var numPosts = 4;

  function getPostQuery(id) {
    return $.ajax({
      url: "posts/" + id + ".html"
    });
  }

  function getPostPreview(data, id) {
    var preview = data.substring(0, data.indexOf("</p>"));
    preview += "... <a href=\"#/blog/" + id + "\">Read more</a></p></article>";
    return preview;
  }

  function populateBlogPreviews() {
    var $previews = $("#blog_previews");
    var requests = [];
    for(var i = numPosts; i >= 1; i--) {
      requests.push(getPostQuery(i));
    }
    $.when.apply(undefined, requests).then(function() {
      if(numPosts === 1) {
        $previews.append(getPostPreview(arguments[0], 1));
      } else {
        var id = numPosts;
        for(var i = 0; i < arguments.length; i++) {
          $previews.append(getPostPreview(arguments[i][0], id));
          id--;
        }
      }
    });
  }

  function createDragDropDemo() {
    dragdrop.create({
      numSquares: 25,
      squareSize: 50,
      randomColors: parseInt(Math.random() * 10) + 2,
      border: { size: 1, color: "none" },
      snapToGrid: true,
      autoFill: "*x*",
      showNumbering: false
    }).draw("ddLiveDemo");
  }

  var defaultUrl = {
      url: "projects.html",
      onReady: createDragDropDemo
  };

  var routes = {
    "blog": {
      url: "blog.html",
      onReady: populateBlogPreviews
    },
    "projects": defaultUrl,
    "contact": {
      url: "contact.html"
    },
    "": defaultUrl
  };

  for(var i = 1; i <= numPosts; i++) {
    routes["blog/" + i] = { url: "posts/" + i + ".html" };
  }

  $(document).ready(function() {
    var $content = $("#content");

    function changePage(hash) {
      var path = hash.slice(2);
      var exists = path in routes;
      var url = exists ? routes[path].url : "404.html";

      $.ajax({
        url: url,
        success: function(data) {
          $content.html(data);
          if(exists && routes[path].onReady) {
            routes[path].onReady();
          }
        }
      });
    }

    changePage(window.location.hash);

    $(window).on("hashchange", function() {
      changePage(window.location.hash);
    });
  });
})(jQuery);
