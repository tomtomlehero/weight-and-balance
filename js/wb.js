
// declare graph start and end
var GRAPH_TOP = 25;
var GRAPH_BOTTOM = 375;
var GRAPH_LEFT = 25;
var GRAPH_RIGHT = 475;

var GRAPH_HEIGHT = 350;
var GRAPH_WIDTH = 450;

var wb;

var station1Weight = 0;
var station2Weight = 0;

function draw() {
    var canvas = document.getElementById( "wb" );
    var context = canvas.getContext( "2d");

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
    context.lineTo(station1Weight, station1Weight);
    context.stroke();

}


$(document).ready(function () {
    loadJson();
    // populateWbTable();
    registerEvents();
    draw();
});

function loadJson() {
    $.getJSON("json/wb.json", function(data){
        wb = data;
        console.log(wb);
    }).fail(function(){
        console.log("An error has occurred.");
    });
}

function populateWbTable() {
    var row =
        '          <tr class="">' +
        '            <td>Sièges avant</td>' +
        '            <td><input class="slider" id="station1WeightSlider" max="200" min="0" type="range" value="0"></td>' +
        '            <td>' +
        '              <input class="form-control form-control-sm" id="station1WeightInput" type="text" value="0">' +
        '            </td>' +
        '            <td>2,045</td>' +
        '            <td>368,100</td>' +
        '          </tr>';
    $("#wbTable tbody").append(row);
}


function registerEvents() {
    $("#station1WeightInput").on("input", station1WeightInputChanged);
    $("#station1WeightSlider").on("input", station1WeightSliderChanged);

    $("#station2WeightInput").on("input", station2WeightInputChanged);
    $("#station2WeightSlider").on("input", station2WeightSliderChanged);

}


function station1WeightChanged(fromComponent, toComponent) {
    station1Weight = $(fromComponent).val();
    $(toComponent).val(station1Weight);
    draw();
}

function station1WeightInputChanged() {
    station1WeightChanged("#station1WeightInput", "#station1WeightSlider")
}

function station1WeightSliderChanged() {
    station1WeightChanged("#station1WeightSlider", "#station1WeightInput")
}


function station2WeightChanged(fromComponent, toComponent) {
    station2Weight = $(fromComponent).val();
    $(toComponent).val(station2Weight);
    $("#station2Moment").html(formatNumber(station2Weight * 3.627, 3));
    if (station2Weight > 91) {
        $("#station2Row").addClass("bg-danger");
    } else {
        $("#station2Row").removeClass("bg-danger");
    }
    draw();
}


function station2WeightInputChanged() {
    station2WeightChanged("#station2WeightInput", "#station2WeightSlider")
}

function station2WeightSliderChanged() {
    station2WeightChanged("#station2WeightSlider", "#station2WeightInput")
}


function formatNumber(num, numberOfDigits) {
    // return (Math.round(num * 100) / 100).toFixed(numberOfDigits);
    return num.toFixed(numberOfDigits);
}