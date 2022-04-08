

$(document).ready(function () {

    for (let i = 1; i < 10; i++) {
        $(`#nav-${i}-tab`).click(function () {
            $("#nav-tabContent").html("Jajaja " + i);
        })
    }

});

