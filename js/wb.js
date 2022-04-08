
let wb;
let selectedAircraft;

let someValue = 0;

const stationZeroFuelMassId = "ZFM";
const stationTakeoffMassId = "TOM";
let stationZeroFuelMass;
let stationTakeoffMass;


const GRAPH_TOP = 25;
const GRAPH_BOTTOM = 375;
const GRAPH_LEFT = 25;
const GRAPH_RIGHT = 475;

const GRAPH_HEIGHT = 350;
const GRAPH_WIDTH = 450;

const innerTabHtml = `
  <div class="row">
    <div class="col-sm-6">
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
    </div>
    <div class="col-sm-6">
      <canvas height="450" id="wb" width="550"></canvas>
    </div>
  </div>
`

/**************************************************************************************************************/


$(document).ready(function () {
    $.getJSON("json/wb.json", function (data) {
        init(data);
        registerTabEvents();
    });
});

function init(data) {
    wb = data;
}


function registerTabEvents() {
    for (let aircraftId = 0; aircraftId < 9; aircraftId++) {
        $(`#nav-${aircraftId}-tab`).click(function () {
            selectedAircraft = wb.aircrafts[aircraftId];
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
    someValue = weight;
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
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length - 1; i++) {
        stationZeroFuelWeight += stationWeight(stations[i]);
        stationZeroFuelMoment += stationMoment(stations[i]);
    }
    zeroFuelMassWeightInput.val(format0Digit(stationZeroFuelWeight));
    zeroFuelMassMoment.html(format3Digit(stationZeroFuelMoment));
    zeroFuelMassLeverArm.html(format3Digit(stationZeroFuelMoment / stationZeroFuelWeight));
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
    const stations = selectedAircraft.stations;
    for (let i = 0; i < stations.length; i++) {
        stationTakeoffWeight += stationWeight(stations[i]);
        stationTakeoffMoment += stationMoment(stations[i]);
    }
    takeoffMassWeightInput.val(format0Digit(stationTakeoffWeight));
    takeoffMassMoment.html(format3Digit(stationTakeoffMoment));
    takeoffMassLeverArm.html(format3Digit(stationTakeoffMoment / stationTakeoffWeight));

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

function format0Digit(num) {
    return num.toFixed(0);
}

/**************************************************************************************************************/


function draw() {

    if (isInWarning()) {
        // Don't draw anything here !
        return;
    }

    const canvas = document.getElementById("wb");
    const context = canvas.getContext("2d");

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
    context.lineTo(someValue, someValue);
    context.stroke();

}
