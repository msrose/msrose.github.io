window.dragdrop = (function() {
  function buildOptions(options, defaults) {
    for(var property in defaults) {
      if(!options[property]) {
        options[property] = defaults[property];
      }
    }
  }

  function randHex(max) {
    max = max || parseInt("FFFFFF", 16);
    var hexVal = parseInt(Math.random() * max + 1).toString(16);
    while(hexVal.length < 6) {
      hexVal = "0" + hexVal;
    }
    return "#" + hexVal;
  }

  function isPerfectSquare(n) {
    var sqrt = Math.sqrt(n);
    return parseInt(sqrt) === sqrt;
  }

  var defaults = {
    numSquares: 1,
    squareSize: 100,
    squareColors: ["gray"],
    showNumbering: false,
    randomColors: null,
    border: { size: 0, format: "solid", color: "black" },
    snapToGrid: false,
    autoFill: "*x*"
  };

  function Dragdrop(options) {
    options = options || {};

    buildOptions(options, defaults);
    buildOptions(options.border, defaults.border);

    if(options.randomColors) {
      var colors = [];
      for(var i = 0; i < options.randomColors; i++) {
        colors.push(randHex());
      }

      options.squareColors = colors;
    }

    for(var property in options) {
      this[property] = options[property];
    }
  }

  Dragdrop.prototype.draw = function(containerId) {
    var options = this;
    var dragItem = null;
    var initialLeft;
    var initialTop;
    var initialPageX;
    var initialPageY;
    var currentHighIndex = 1;
    var lazyRows = false;
    var lazyCols = false;
    var dimensions;

    var squareStyles = {
      border: this.border.size + "px " + this.border.format + " " + this.border.color,
      fontSize: this.squareSize / 2 + "px",
      height: this.squareSize - this.border.size * 2 + "px",
      width: this.squareSize - this.border.size * 2 + "px"
    };

    var container = document.getElementById(containerId);
    container.style.position = "relative";
    container.style.overflow = "hidden";
    if(this.autoFill) {
      dimensions = this.autoFill.split("x");
      if(dimensions[0] === "*") {
        lazyRows = true;
      } else {
        container.style.height = parseInt(dimensions[0]) * this.squareSize + "px";
      }
      if(dimensions[1] === "*") {
        lazyCols = true;
      } else {
        container.style.width = parseInt(dimensions[1]) * this.squareSize + "px";
      }
      if(lazyRows && lazyCols) {
        var size = parseInt(Math.sqrt(this.numSquares) + (isPerfectSquare(this.numSquares) ? 0 : 1)) * this.squareSize + "px";
        container.style.height = size;
        container.style.width = size;
        lazyRows = false;
        lazyCols = false;
      }
    }

    var containerHeight = parseInt(container.style.height);
    var containerWidth = parseInt(container.style.width);

    var squaresPerRow = lazyCols ? this.numSquares / dimensions[0] : parseInt(containerWidth / this.squareSize);
    var col = 0;
    var row = 0;
    var colTotal = 0;
    var rowTotal = 0;

    for(var i = 0; i < this.numSquares; i++) {
      var newSquare = document.createElement("div");
      newSquare.className = "dragdrop square";

      squareStyles.left = col * this.squareSize + "px";
      squareStyles.top = row * this.squareSize + "px";

      col++;
      if (col >= squaresPerRow) {
        colTotal = col;
        col = 0;
        row++;
        rowTotal = row + 1;
      }

      if(this.squareColors.length > 0) {
        squareStyles.backgroundColor = this.squareColors[i % this.squareColors.length];
      }

      for(var property in squareStyles) {
        newSquare.style[property] = squareStyles[property];
      }

      newSquare.onmousedown = function(e) {
        dragItem = this;
        dragItem.style.zIndex = currentHighIndex;
        currentHighIndex++;
        initialTop = dragItem.offsetTop;
        initialLeft = dragItem.offsetLeft;
        initialPageY = e.pageY;
        initialPageX = e.pageX;
      };

      if(this.showNumbering) {
        var divLabel = document.createElement("span");
        divLabel.style.lineHeight = this.squareSize - this.border.size * 2 + "px";
        divLabel.innerText = i + 1;
        newSquare.appendChild(divLabel);
      }

      container.appendChild(newSquare);
    }

    if(lazyCols) {
      containerWidth = colTotal * this.squareSize;
      container.style.width = containerWidth + "px";
    } else if(lazyRows) {
      containerHeight = rowTotal * this.squareSize;
      container.style.height = containerHeight + "px";
    }

    //bind event to container AND account for cursor position due to browser compatibility
    container.onmousemove = function(e) {
      if(dragItem) {
        if(this.offsetTop <= e.pageY && e.pageY <= this.offsetTop + this.offsetHeight) {
          dragItem.style.top = initialTop + e.pageY - initialPageY + "px";
        }
        if(this.offsetLeft <= e.pageX && e.pageX <= this.offsetLeft + this.offsetWidth) {
          dragItem.style.left = initialLeft + e.pageX - initialPageX + "px";
        }
      }
      e.preventDefault();
    };

    var getSnapOffset = function(item, prop) {
      var offsetMagnitude = item[prop] % options.squareSize;
      return offsetMagnitude < options.squareSize / 2 ? -offsetMagnitude : options.squareSize - offsetMagnitude;
    };

    window.onmouseup = (function(mouseup) {
      return function(e) {
        if(mouseup) {
          mouseup(e);
        }
        if(dragItem && options.snapToGrid) {
          var snapTop = dragItem.offsetTop + getSnapOffset(dragItem, "offsetTop");
          var snapLeft = dragItem.offsetLeft + getSnapOffset(dragItem, "offsetLeft");
          if(snapTop >= containerHeight) {
            snapTop = containerHeight - options.squareSize;
          } else if(snapTop < 0) {
            snapTop = 0;
          }
          if(snapLeft >= containerWidth) {
            snapLeft = containerWidth - options.squareSize;
          } else if(snapLeft < 0) {
            snapLeft = 0;
          }
          dragItem.style.top = snapTop + "px";
          dragItem.style.left = snapLeft + "px";
        }
        dragItem = null;
      };
    })(window.onmouseup);
  };

  return {
    create: function(options) {
      return new Dragdrop(options);
    },
    defaults: defaults
  };
})();
