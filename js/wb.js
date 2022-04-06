
let wb;
let someValue = 0;

const stationZeroFuelMassId = "ZFM";
let stationZeroFuelMass;


const GRAPH_TOP = 25;
const GRAPH_BOTTOM = 375;
const GRAPH_LEFT = 25;
const GRAPH_RIGHT = 475;

const GRAPH_HEIGHT = 350;
const GRAPH_WIDTH = 450;


$(document).ready(function () {
    $.getJSON("json/wb.json", function (data) {
        init(data);
        buildWbTable();
        fillWbTable();
        registerEvents();
        anythingChanged();
    });
});


/**************************************************************************************************************/

function init(data) {
    wb = data;

    stationZeroFuelMass = {
        id: stationZeroFuelMassId,
        name: wb.stationZeroFuelMassName,
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
    const stations = wb.aircrafts[0].stations;
    for (let i = 0; i < stations.length - 1; i++) {
        tableBody.append(wbRow(stations[i]));
    }
    tableBody.append(wbZeroFuelRow());
    tableBody.append(wbRow(stations[stations.length - 1]));
}


function wbZeroFuelRow() {
    return uneditableWbRow(stationZeroFuelMass);
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
    const stations = wb.aircrafts[0].stations;
    for (let i = 0; i < stations.length; i++) {
        fillRow(stations[i]);
    }
    fillRow(stationZeroFuelMass);
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
    const stations = wb.aircrafts[0].stations;
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
    const stations = wb.aircrafts[0].stations;
    for (let i = 0; i < stations.length - 1; i++) {
        stationZeroFuelWeight += stationWeight(stations[i]);
        stationZeroFuelMoment += stationMoment(stations[i]);
    }
    zeroFuelMassWeightInput.val(format0Digit(stationZeroFuelWeight));
    zeroFuelMassMoment.html(format3Digit(stationZeroFuelMoment));
    zeroFuelMassLeverArm.html(format3Digit(stationZeroFuelMoment / stationZeroFuelWeight));
}


function anythingChanged() {
    zeroFuelMassChanged();
    draw();
}

function handleNaN(station, weight) {
    if (isNaN(weight)) {
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

    let stations = wb.aircrafts[0].stations;
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
