
// declare graph start and end
var GRAPH_TOP = 25;
var GRAPH_BOTTOM = 375;
var GRAPH_LEFT = 25;
var GRAPH_RIGHT = 475;

var GRAPH_HEIGHT = 350;
var GRAPH_WIDTH = 450;

var frontRow = 0;

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
    context.lineTo(frontRow, frontRow);
    context.stroke();

}


$(document).ready(function () {
    registerEvents()
    draw();
});

function registerEvents() {
    $("#frontRow").on("input", change);
    $("#frontRowSlider").on("input", changeS);
}

function change() {
    frontRow = $("#frontRow").val();
    $("#frontRowSlider").val(frontRow);
    draw();
}

function changeS() {
    frontRow = $("#frontRowSlider").val();
    $("#frontRow").val(frontRow);
    draw();
}