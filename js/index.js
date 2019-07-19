"use strict";

$(function() {
  // Canvas references
  var canvas = document.getElementById("pixel-canvas");
  var gridCanvas = document.getElementById("grid-overlay");
  var resizedCanvas = document.getElementById("resized-canvas");
  var ctx = canvas.getContext("2d");
  var ctxGrid = gridCanvas.getContext("2d");
  var ctxResized = resizedCanvas.getContext("2d");

  // Initial state
  var state = {
    mode: "draw",
    canvasDrawn: false,
    hasBg: false,
    size: 20,
    inputSize: 20,
    color: "",
    colorBg: "",
    mousedown: false,
    preview: false
  };

  // Set initial menu state
  menuToggle();
  // Determine initial form parameters
  adjustMaxCanvasSize();

  ///////////////////////////////////////////////////////////////////////////////
  // EVENTS
  ///////////////////////////////////////////////////////////////////////////////

  // Change max canvas width and height based on window size
  $(window).resize(adjustMaxCanvasSize);

  // changes state's size and updates maximum canvas width and height
  $("#input-size").change(function() {
    state.inputSize = Number($("#input-size").val());
    adjustMaxCanvasSize();
  });

  $("#bg-picker").spectrum({
    allowEmpty: true,
    preferredFormat: "hex",
    showInput: true,
    chooseText: "Accept",
    cancelText: "Nevermind",
    hide: function(e) {
      if (e !== null) {
        state.colorBg = e.toHexString();
      }
    }
  });

  // Build new canvas
  $("#create-new").submit(function(e) {
    e.preventDefault();

    var container = $(".main");
    var width = Number($("#input-width").val());
    var height = Number($("#input-height").val());
    state.size = state.inputSize;

    canvas.width = width * state.size;
    canvas.height = height * state.size;
    gridCanvas.width = width * state.size;
    gridCanvas.height = height * state.size;
    resizedCanvas.width = width;
    resizedCanvas.height = height;

    $("#resized-canvas").css("border", "1px solid #919191");
    $("#resized-canvas").css("padding", "3px");
    container.css("background-color", "#ffffff");
    container.css("width", canvas.width + 50 + "px");
    container.css("height", canvas.height + 95 + "px");
    container.css("border", "1px solid #919191");
    container.css("border-radius", "10px 10px 10px 10px");

    drawBackground();
    drawGrid();
    buildColorPicker();
    state.canvasDrawn = true;
  });

  // fill cells on click, for mobile compatibility
  $("#pixel-canvas").click(function(e) {
    fillCell(e);
  });

  // set mousedown state true
  $("#pixel-canvas").mousedown(function() {
    state.mousedown = true;
  });

  // if mousedown state is true, fill cells on mouseover
  canvas.addEventListener("mousemove", function(e) {
    if (state.mousedown) {
      fillCell(e);
    }
  });

  // set mousedown state to false if previously true
  canvas.addEventListener("mouseup", function() {
    if (state.mousedown) {
      state.mousedown = false;
    }
  });

  // Toggle eraser
  $("#eraser").click(function() {
    if (state.mode === "draw") {
      state.mode = "erase";
      $("#eraser").css("background-color", "#c26323");
    } else {
      state.mode = "draw";
      $("#eraser").css("background-color", "#80ac28");
    }
  });

  // Clear canvas
  $("#clear").click(function() {
    if (state.hasBg) {
      ctx.fillStyle = state.colorBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctxResized.fillStyle = state.colorBg;
      ctxResized.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height);
    } else {
      canvas.width = canvas.width;
      resizedCanvas.width = resizedCanvas.width;
    }
  });

  // Toggle grid lines
  $("#toggle-grid").click(function() {
    $("#grid-overlay").toggle();
  });

  // Toggle preview display
  $("#preview").click(function() {
    if (state.preview === false) {
      state.preview = true;
      $("#preview-content").css("display", "block");
      $("#preview").css("background-color", "#c26323");
      $("#preview").prop("value", "Hide Preview");
    } else {
      state.preview = false;
      $("#preview-content").css("display", "none");
      $("#preview").css("background-color", "#80ac28");
      $("#preview").prop("value", "Show Preview");
    }
  });

  // Download canvas at preview size
  document.querySelector("#save-pixel").addEventListener(
    "click",
    function() {
      save(resizedCanvas, "pixel-graphic.png");
    },
    false
  );

  // Download canvas at editor size
  document.querySelector("#save-full").addEventListener(
    "click",
    function() {
      save(canvas, "pixel-graphic-full.png");
    },
    false
  );

  // Menu slide toggle for small screens
  $(".dropdown-link").on("click", function() {
    $(".dropdown").slideToggle("400", function() {
      $(window).resize(function() {
        if ($(window).width() < 768 && $(".dropdown").is(":hidden")) {
          $(".dropdown").slideToggle();
        }
      });
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  // FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////////

  // initial menu toggle for small screens
  function menuToggle() {
    if (window.innerWidth < 768) {
      $(".dropdown").slideToggle("400");
    }
  }

  // Change maximum canvas width and height based on window size and cell size
  function adjustMaxCanvasSize() {
    var windowWidth = window.innerWidth;
    var numFitSm = parseInt(0.8 * windowWidth / state.inputSize, 10); // for smaller screens
    var numFitLg = parseInt(0.65 * windowWidth / state.inputSize, 10); // for large screens
    function update(widthText, heightText, maxWidth, maxHeight) {
      widthText = document.createTextNode(widthText);
      heightText = document.createTextNode(heightText);
      $("#width-label").html(widthText.data);
      $("#height-label").html(heightText.data);
      $("#input-width").attr("max", maxWidth);
      $("#input-height").attr("max", maxHeight);
    }
    if (windowWidth >= 768) {
      update(
        "Width (max " + numFitLg + "): ",
        "Height (max " + numFitLg * 2 + "): ",
        numFitLg,
        numFitLg * 2
      );
    } else {
      update(
        "Width (max " + numFitSm + "): ",
        "Height (max " + numFitLg * 2 + "): ",
        numFitSm,
        numFitSm * 2
      );
    }
  }

  // Draw background color
  function drawBackground() {
    if ($("#bg-picker").spectrum("get") !== null) {
      state.hasBg = true;
      ctx.fillStyle = state.colorBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctxResized.fillStyle = state.colorBg;
      ctxResized.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height);
    } else {
      state.hasBg = false;
    }
  }

  // Create grid lines
  function drawGrid() {
    for (var i = state.size; i <= gridCanvas.width; i += state.size) {
      ctxGrid.moveTo(0.5 + i, state.size - state.size);
      ctxGrid.lineTo(0.5 + i, gridCanvas.height);
    }
    for (var j = state.size; j <= gridCanvas.height; j += state.size) {
      ctxGrid.moveTo(state.size - state.size, 0.5 + j);
      ctxGrid.lineTo(gridCanvas.width, 0.5 + j);
    }
    ctxGrid.strokeStyle = "#919191";
    ctxGrid.strokeRect(0, 0, gridCanvas.width, gridCanvas.height);
    ctxGrid.lineWidth = 0.5;
    ctxGrid.stroke();
  }

  // Build the color picker
  function buildColorPicker() {
    // modify the DOM
    var container = $("#color-container");
    if (!state.canvasDrawn) {
      var label = document.createElement("p");
      var labelText = document.createTextNode("Color: ");
      label.className = "colorLabel";
      label.appendChild(labelText);
      var colorPicker = document.createElement("input");
      colorPicker.id = "color-picker";
      container.append(label);
      container.append(colorPicker);
    }
    container.css("top", canvas.height + 15 + "px");

    // create Spectrum color picker
    $("#color-picker").spectrum({
      preferredFormat: "hex",
      showInput: true,
      showInitial: true,
      showPaletteOnly: true,
      hideAfterPaletteSelect: true,
      togglePaletteOnly: true,
      maxSelectionSize: 5,
      togglePaletteMoreText: "More",
      togglePaletteLessText: "Less",
      chooseText: "Accept",
      cancelText: "Nevermind",
      color: "#1abc9c",
      palette: [
        ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e"],
        ["#f1c40f", "#e67e22", "#e74c3c", "#dc4496", "#95a5a6"],
        ["000000", "ffffff"]
      ],
      hide: function(e) {
        state.color = e.toHexString();
      }
    });
    state.color = $("#color-picker")
      .spectrum("get")
      .toHexString();
  }

  // Fill or clear cells and draw resizedCanvas to match main canvas
  function fillCell(e) {
    // calculate cell location
    var cx = ~~(e.offsetX / state.size);
    var cy = ~~(e.offsetY / state.size);

    if (state.mode == "draw" && state.canvasDrawn) {
      // fill the cell
      ctx.fillStyle = state.color;
      ctxResized.fillStyle = state.color;
      ctx.fillRect(cx * state.size, cy * state.size, state.size, state.size);
      ctxResized.fillRect(cx, cy, 1, 1);
    } else if (state.mode == "erase" && state.canvasDrawn) {
      // erase the cell
      if (state.hasBg) {
        ctx.fillStyle = state.colorBg;
        ctxResized.fillStyle = state.colorBg;
        ctx.fillRect(cx * state.size, cy * state.size, state.size, state.size);
        ctxResized.fillRect(cx, cy, 1, 1);
      } else {
        ctx.clearRect(cx * state.size, cy * state.size, state.size, state.size);
        ctxResized.clearRect(cx, cy, 1, 1);
      }
    }
  }

  // Convert and download given canvas to computer
  function save(c, fileName) {
    if(state.canvasDrawn) {
      if ("msToBlob" in c) {
        var blob = c.msToBlob(); // for IE10+ compatibility
        navigator.msSaveBlob(blob, fileName);
      } else {
        var link = document.createElement("a");
        link.href = c.toDataURL();
        link.target = "_blank";
        link.download = fileName;
        document.body.appendChild(link); // for Firefox and Opera compatibility
        link.click();
        document.body.removeChild(link);
      }
    }
    }
});
