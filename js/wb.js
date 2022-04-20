
let wb;
let selectedAircraft;
let grid;

const stationZeroFuelMassId = "ZFM";
const stationTakeoffMassId = "TOM";
let stationZeroFuelMass;
let stationTakeoffMass;

let takeoffLeverArm;
let takeoffMoment;
let takeoffWeight;
let zeroFuelLeverArm;
let zeroFuelMoment;
let zeroFuelWeight;

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;


const innerTabHtml = `
  <div class="row" style="margin-top: 30px;">
    <div class="col-sm-6">
        <figure class="figure">
            <table class="table" id="wbTable">
              <thead>
              <tr class="text-nowrap">
                <th>Station</th>
                <th></th>
                <th>Masse<br/>(kg)</th>
                <th class="text-end">Bras de<br/>levier (m)</th>
                <th class="text-end">Moment<br/>(m.kg)</th>
              </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
            <figcaption id="weighingReportInfo" class="figure-caption text-end"></figcaption>
        </figure>
    </div>
    <div class="col-sm-6">
      <canvas id="wb" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
    </div>
  </div>
`

/**************************************************************************************************************/


$(document).ready(function () {
    $.getJSON("json/wb.json", function (data) {
        init(data);
        buildNavTabs();
        registerTabEvents();
    });
});

function init(data) {
    wb = data;
}

function buildNavTabs() {
    for (let aircraftId = 0; aircraftId < wb.aircrafts.length; aircraftId++) {
        $("#nav-tab").append(`
            <button class="nav-link" id="nav-${aircraftId}-tab" data-bs-toggle="tab">${wb.aircrafts[aircraftId].callSign}</button>
`)
    }
}


function registerTabEvents() {
    for (let aircraftId = 0; aircraftId < wb.aircrafts.length; aircraftId++) {
        $(`#nav-${aircraftId}-tab`).click(function () {
            selectedAircraft = wb.aircrafts[aircraftId];
            grid = selectedAircraft.grid;
            $("#nav-tabContent").html(innerTabHtml);
            loadAircraft();
            buildWbTable();
            fillWbTable();
            registerEvents();
            anythingChanged();
        })
    }
}

function loadAircraft() {
    stationZeroFuelMass = {
        id: stationZeroFuelMassId,
        name: wb.stationZeroFuelMassName,
        editable: false,
        weight: 0.0,
        leverArm: 0.0,
        maxWeight: 0,
        warningIfMaxWeightExceeded : false
    };

    stationTakeoffMass = {
        id: stationTakeoffMassId,
        name: `${wb.stationTakeoffMassName} (max : ${selectedAircraft.maxTakeoffWeight} kg)`,
        editable: false,
        weight: 0.0,
        leverArm: 0.0,
        maxWeight: 0,
        warningIfMaxWeightExceeded : false
    };
}

/**************************************************************************************************************/

function buildWbTable() {
    const tableBody = $("#wbTable tbody");
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length - 1; i++) {
        tableBody.append(wbRow(stations[i]));
    }
    tableBody.append(wbZeroFuelRow());
    tableBody.append(wbRow(stations[stations.length - 1]));
    tableBody.append(wbTakeoffRow());
    $("#weighingReportInfo").html(`Basé sur la fiche de pesée du ${selectedAircraft.weighingReportDate}`);
}


function wbZeroFuelRow() {
    return uneditableWbRow(stationZeroFuelMass);
}

function wbTakeoffRow() {
    return uneditableWbRow(stationTakeoffMass);
}

function wbRow(station) {
    if (station.editable) {
        return editableWbRow(station);
    } else {
        return uneditableWbRow(station);
    }
}

function editableWbRow(station) {
    return `
          <tr id="station${station.id}Row">
            <td class="text-nowrap" id="station${station.id}Name"></td>
            <td>
              <input class="slider" id="station${station.id}WeightSlider" max="${station.maxWeight}" min="0" type="range" value="0">
            </td>
            <td>
              <input class="form-control form-control-sm input-right-4" id="station${station.id}WeightInput" type="text" value="0">
            </td>
            <td class="text-end" id="station${station.id}LeverArm"></td>
            <td class="text-end" id="station${station.id}Moment"></td>
          </tr>
`;
}

function uneditableWbRow(station) {
    return `
          <tr id="station${station.id}Row">
            <td class="text-nowrap" id="station${station.id}Name"></td>
            <td></td>
            <td>
              <input class="form-control form-control-sm input-right-4" disabled id="station${station.id}WeightInput" type="text" value="0">
            </td>
            <td class="text-end" id="station${station.id}LeverArm"></td>
            <td class="text-end" id="station${station.id}Moment"></td>
          </tr>
`;
}


/**************************************************************************************************************/

function fillWbTable() {
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length; i++) {
        fillRow(stations[i]);
    }
    fillRow(stationZeroFuelMass);
    fillRow(stationTakeoffMass);
}

function fillRow(station) {
    $(`#station${station.id}Name`).html(station.name);
    $(`#station${station.id}WeightInput`).val(station.weight);
    $(`#station${station.id}LeverArm`).html(format3Digit(station.leverArm));
    $(`#station${station.id}Moment`).html(format3Digit(station.weight * station.leverArm));
    if (station.editable) {
        $(`#station${station.id}WeightSlider`).val(station.weight);
    }
}


/**************************************************************************************************************/

function registerEvents() {
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length; i++) {
        registerEvent(stations[i]);
    }
}

function registerEvent(station) {
    if (station.editable) {
        $(`#station${station.id}WeightInput`).on("input", function () {
            stationWeightChanged(station,`#station${station.id}WeightInput`, `#station${station.id}WeightSlider`);
        });
        $(`#station${station.id}WeightSlider`).on("input", function () {
            stationWeightChanged(station,`#station${station.id}WeightSlider`, `#station${station.id}WeightInput`);
        });
    }
}

function stationWeightChanged(station, fromComponent, toComponent) {
    let weight = $(fromComponent).val();
    handleNaN(station, weight);
    if (!station.nan) {
        $(toComponent).val(weight);
        $(`#station${station.id}Moment`).html(format3Digit(weight * station.leverArm));
    }
    handleMassExceeded(station, weight);
    anythingChanged();
}

function zeroFuelMassChanged() {

    const zeroFuelMassWeightInput = $(`#station${stationZeroFuelMassId}WeightInput`);
    const zeroFuelMassMoment = $(`#station${stationZeroFuelMassId}Moment`);
    const zeroFuelMassLeverArm = $(`#station${stationZeroFuelMassId}LeverArm`);

    if (isInWarning()) {
        zeroFuelMassWeightInput.val("");
        zeroFuelMassMoment.html("");
        zeroFuelMassLeverArm.html("");
        return;
    }

    let stationZeroFuelWeight = 0;
    let stationZeroFuelMoment = 0;
    let stationZeroFuelLeverArm;
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length - 1; i++) {
        stationZeroFuelWeight += stationWeight(stations[i]);
        stationZeroFuelMoment += stationMoment(stations[i]);
    }
    zeroFuelMassWeightInput.val(format0Digit(stationZeroFuelWeight));
    zeroFuelMassMoment.html(format3Digit(stationZeroFuelMoment));
    stationZeroFuelLeverArm = stationZeroFuelMoment / stationZeroFuelWeight;
    zeroFuelMassLeverArm.html(format3Digit(stationZeroFuelLeverArm));

    zeroFuelWeight = stationZeroFuelWeight;
    zeroFuelMoment = stationZeroFuelMoment;
    zeroFuelLeverArm = stationZeroFuelLeverArm;
}

function takeoffMassChanged() {

    const takeoffMassWeightInput = $(`#station${stationTakeoffMassId}WeightInput`);
    const takeoffMassMoment = $(`#station${stationTakeoffMassId}Moment`);
    const takeoffMassLeverArm = $(`#station${stationTakeoffMassId}LeverArm`);

    if (isInWarning()) {
        takeoffMassWeightInput.val("");
        takeoffMassMoment.html("");
        takeoffMassLeverArm.html("");
        $(`#station${stationTakeoffMassId}Row`).removeClass("bg-danger");
        return;
    }

    let stationTakeoffWeight = 0;
    let stationTakeoffMoment = 0;
    let stationTakeoffLeverArm;
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length; i++) {
        stationTakeoffWeight += stationWeight(stations[i]);
        stationTakeoffMoment += stationMoment(stations[i]);
    }
    takeoffMassWeightInput.val(format0Digit(stationTakeoffWeight));
    takeoffMassMoment.html(format3Digit(stationTakeoffMoment));
    stationTakeoffLeverArm = stationTakeoffMoment / stationTakeoffWeight;
    takeoffMassLeverArm.html(format3Digit(stationTakeoffLeverArm));

    takeoffWeight = stationTakeoffWeight;
    takeoffMoment = stationTakeoffMoment;
    takeoffLeverArm = stationTakeoffLeverArm;

    if (stationTakeoffWeight > selectedAircraft.maxTakeoffWeight) {
        $(`#station${stationTakeoffMassId}Row`).addClass("bg-danger");
    } else {
        $(`#station${stationTakeoffMassId}Row`).removeClass("bg-danger");
    }
}

function anythingChanged() {
    zeroFuelMassChanged();
    takeoffMassChanged();
    draw();
}

function handleNaN(station, weight) {
    if (isNaN(weight) || weight.trim() === '') {
        $(`#station${station.id}Row`).addClass("bg-warning");
        station.nan = true;
        $(`#station${station.id}Moment`).html("");
    } else {
        station.nan = false;
        $(`#station${station.id}Row`).removeClass("bg-warning");
    }
}

function handleMassExceeded(station, weight) {
    if (station.warningIfMaxWeightExceeded) {
        if (weight > station.maxWeight) {
            $(`#station${station.id}Row`).addClass("bg-danger");
        } else {
            $(`#station${station.id}Row`).removeClass("bg-danger");
        }
    }
}


/**************************************************************************************************************/

function isInWarning() {

    let stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length; i++) {
        if (!(typeof stations[i].nan === 'undefined') && stations[i].nan) {
            return true;
        }
    }
    return false;
}

function stationMoment(station) {
    let weight = parseFloat($(`#station${station.id}WeightInput`).val());
    return weight * station.leverArm;
}

function stationWeight(station) {
    return parseFloat($(`#station${station.id}WeightInput`).val());
}


function format3Digit(num) {
    return num.toFixed(3).replace('.', ',');
}

function format2Digit(num) {
    return num.toFixed(2).replace('.', ',');
}

function format0Digit(num) {
    return num.toFixed(0);
}

/**************************************************************************************************************/

const MARGIN = 50;

let context;


function y(weight) {
    return ((2 * MARGIN - CANVAS_HEIGHT) * weight + (CANVAS_HEIGHT - MARGIN) * grid.weight.max - MARGIN * grid.weight.min)
        / (grid.weight.max - grid.weight.min);
}

function x(position) {
    return ((CANVAS_WIDTH - 2 * MARGIN) * position + (MARGIN - CANVAS_WIDTH) * grid.position.min + MARGIN * grid.position.max)
        / (grid.position.max - grid.position.min);
}

function drawPlot(x, y, color) {
    context.beginPath();
    context.arc(x, y, 4, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function draw() {

    const canvas = document.getElementById("wb");
    context = canvas.getContext("2d");

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (isInWarning()) {
        context.lineWidth = 10;
        context.strokeStyle = "red";
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        context.stroke();
        context.beginPath();
        context.moveTo(0, CANVAS_HEIGHT);
        context.lineTo(CANVAS_WIDTH, 0);
        context.stroke();
        return;
    }

/*
    context.lineWidth = 1;
    context.strokeStyle = "#335EA1";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(CANVAS_WIDTH, 0);
    context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    context.lineTo(0, CANVAS_HEIGHT);
    context.closePath();
    context.stroke();
*/

    context.lineWidth = 0.5;
    context.strokeStyle = "#3399A1";
    context.fillStyle = "#000";
    context.font = "12px Calibri";
    context.textAlign = "right";
    for (let weight = grid.axes.y.min; weight <= grid.axes.y.max; weight += grid.axes.y.step) {
        context.beginPath();
        context.moveTo(MARGIN, y(weight));
        context.lineTo(CANVAS_WIDTH - MARGIN, y(weight));
        context.stroke();
        context.fillText(weight, MARGIN - 8, y(weight) + 4);
    }

    context.textAlign = "center";
    for (let position = grid.axes.x.min; position <= grid.axes.x.max; position += grid.axes.x.step) {
        context.beginPath();
        context.moveTo(x(position), MARGIN);
        context.lineTo(x(position), CANVAS_HEIGHT - MARGIN);
        context.stroke();
        context.fillText(format2Digit(position), x(position), CANVAS_HEIGHT - MARGIN + 18);
    }

    const cogEnvelope = selectedAircraft.cogEnvelope;
    let position;
    let weight;
    context.lineWidth = 2;
    context.strokeStyle = "#000";
    context.beginPath();
    for (let i = 0; i < cogEnvelope.length; i++) {
        if (i % 2 === 0) {
            position = cogEnvelope[i];
        } else {
            weight = cogEnvelope[i];
            if (i === 1) {
                context.moveTo(x(position), y(weight));
            } else {
                context.lineTo(x(position), y(weight));
            }
        }
    }
    context.closePath();
    context.stroke();

    drawPlot(x(zeroFuelLeverArm), y(zeroFuelWeight), '#d52e53');
    drawPlot(x(takeoffLeverArm), y(takeoffWeight), '#2250c4');
}
