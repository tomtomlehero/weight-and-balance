// declare graph start and end
var GRAPH_TOP = 25;
var GRAPH_BOTTOM = 375;
var GRAPH_LEFT = 25;
var GRAPH_RIGHT = 475;

var GRAPH_HEIGHT = 350;
var GRAPH_WIDTH = 450;

var wb;

var station2Weight = 0;
var station3Weight = 0;
var station4Weight = 0;

function draw() {
    var canvas = document.getElementById("wb");
    var context = canvas.getContext("2d");

// clear canvas (if another graph was previously drawn)
    context.clearRect(0, 0, 500, 400);

// draw X and Y axis
    context.beginPath();
    context.moveTo(GRAPH_LEFT, GRAPH_BOTTOM);
    context.lineTo(GRAPH_RIGHT, GRAPH_BOTTOM);
    context.lineTo(GRAPH_RIGHT, GRAPH_TOP);
    context.stroke();

// draw reference line at the top of the graph
    context.beginPath();
// set light grey color for reference lines
    context.strokeStyle = "#BBB";
    context.moveTo(GRAPH_LEFT, GRAPH_TOP);
    context.lineTo(GRAPH_RIGHT, GRAPH_TOP);
    context.stroke();

// draw reference line 3/4 up from the bottom of the graph
    context.beginPath();
    context.moveTo(GRAPH_LEFT, (GRAPH_HEIGHT) / 4 * 3 + GRAPH_TOP);
    context.lineTo(GRAPH_RIGHT, (GRAPH_HEIGHT) / 4 * 3 + GRAPH_TOP);
    context.stroke();

// draw reference line 1/2 way up the graph
    context.beginPath();
    context.moveTo(GRAPH_LEFT, (GRAPH_HEIGHT) / 2 + GRAPH_TOP);
    context.lineTo(GRAPH_RIGHT, (GRAPH_HEIGHT) / 2 + GRAPH_TOP);
    context.stroke();

// draw reference line 1/4 up from the bottom of the graph
    context.beginPath();
    context.moveTo(GRAPH_LEFT, (GRAPH_HEIGHT) / 4 + GRAPH_TOP);
    context.lineTo(GRAPH_RIGHT, (GRAPH_HEIGHT) / 4 + GRAPH_TOP);
    context.stroke();

    context.beginPath();
    context.strokeStyle = "#339";
    context.moveTo(GRAPH_LEFT, GRAPH_TOP);
    context.lineTo(station2Weight, station2Weight);
    context.stroke();

}


$(document).ready(function () {
    $.getJSON("json/wb.json", function (data) {
        wb = data;
        console.log(wb);
        // populateWbTable();
        setup();
        registerEvents();
        draw();
    });
});

function populateWbTable() {
    var row =
        '          <tr class="">' +
        '            <td>Sièges avant</td>' +
        '            <td><input class="slider" id="station2WeightSlider" max="200" min="0" type="range" value="0"></td>' +
        '            <td>' +
        '              <input class="form-control form-control-sm" id="station2WeightInput" type="text" value="0">' +
        '            </td>' +
        '            <td>2,045</td>' +
        '            <td>368,100</td>' +
        '          </tr>';
    $("#wbTable tbody").append(row);
}

function setup() {
    var aircraft = wb.aircrafts[0];
    var stations = aircraft.stations;
    for (var i = 0; i < stations.length; i++) {
        var station = stations[i];
        console.log(station.name);
        $("#station1Name").html(station.name);
        $("#station1WeightInput").val(station.weight);
        $("#station1LeverArm").html(format3Digits(station.leverArm));
        $("#station1Moment").html(format3Digits(station.weight * station.leverArm));
    }
}


function registerEvents() {
    $("#station2WeightInput").on("input", function () {
        station2WeightChanged("#station2WeightInput", "#station2WeightSlider");
    });
    $("#station2WeightSlider").on("input", function () {
        station2WeightChanged("#station2WeightSlider", "#station2WeightInput");
    });

    $("#station3WeightInput").on("input", function () {
        station3WeightChanged("#station3WeightInput", "#station3WeightSlider");
    });
    $("#station3WeightSlider").on("input", function () {
        station3WeightChanged("#station3WeightSlider", "#station3WeightInput");
    });

    $("#station4WeightInput").on("input", function () {
        station4WeightChanged("#station4WeightInput", "#station4WeightSlider");
    });
    $("#station4WeightSlider").on("input", function () {
        station4WeightChanged("#station4WeightSlider", "#station4WeightInput");
    });

}


function station2WeightChanged(fromComponent, toComponent) {
    station2Weight = $(fromComponent).val();
    $(toComponent).val(station2Weight);
    $("#station2Moment").html(format3Digits(station2Weight * 2.045));
    draw();
}


function station3WeightChanged(fromComponent, toComponent) {
    station3Weight = $(fromComponent).val();
    $(toComponent).val(station3Weight);
    $("#station3Moment").html(format3Digits(station3Weight * 3.627));
    if (station3Weight > 91) {
        $("#station3Row").addClass("bg-danger");
    } else {
        $("#station3Row").removeClass("bg-danger");
    }
    draw();
}

function station4WeightChanged(fromComponent, toComponent) {
    station4Weight = $(fromComponent).val();
    $(toComponent).val(station4Weight);
    $("#station4Moment").html(format3Digits(station4Weight * 3.627));
    if (station4Weight > 131) {
        $("#station4Row").addClass("bg-danger");
    } else {
        $("#station4Row").removeClass("bg-danger");
    }
    draw();
}


function format3Digits(num) {
    return num.toFixed(3).replace('.', ',');
}