
const material = 0;
const wire_size = 1;
const max_temp = 2;
const num_bundle = 3;
const num_carrying_current = 4;
const individ_amp = 5;
const total_amp = 6;

const coeff1_lookup = {
    "28": 0.733,
    "26": 1.02,
    "24": 1.37,
    "22": 1.75,
    "20": 2.27,
    "18": 2.82,
    "16": 3.33,
    "14": 4.23,
    "12": 5.8,
    "10": 7.64,
    "8": 10.8,
    "6": 13.5,
    "4": 18.1,
    "2": 25.8,
    "1": 31.2,
    "0": 34.2,
    "00": 37.8,
    "000": 43.1,
    "0000": 47.4
};

const coeff2_lookup = {
    "28": 0.435,
    "26": 0.446,
    "24": 0.444,
    "22": 0.448,
    "20": 0.452,
    "18": 0.466,
    "16": 0.464,
    "14": 0.476,
    "12": 0.472,
    "10": 0.471,
    "8": 0.495,
    "6": 0.508,
    "4": 0.509,
    "2": 0.501,
    "1": 0.494,
    "0": 0.503,
    "00": 0.514,
    "000": 0.518,
    "0000": 0.538
};

const material_lookup = {
    "aluminum": 0.8,
    "copper": 1
}

const table_row_html = '\
    <td>\
        <select name="material" class="update">\
            <option value="copper">Copper</option>\
            <option value="aluminum">Aluminum</option>\
        </select>\
    </td>\
    <td>\
        <select name="gauge" class="update">\
            <option value="28">28 AWG</option>\
            <option value="26">26 AWG</option>\
            <option value="24">24 AWG</option>\
            <option value="22" selected>22 AWG</option>\
            <option value="20">20 AWG</option>\
            <option value="18">18 AWG</option>\
            <option value="16">16 AWG</option>\
            <option value="14">14 AWG</option>\
            <option value="12">12 AWG</option>\
            <option value="10">10 AWG</option>\
            <option value="8">8 AWG</option>\
            <option value="6">6 AWG</option>\
            <option value="4">4 AWG</option>\
            <option value="2">2 AWG</option>\
            <option value="0">1/0 AWG</option>\
            <option value="00">2/0 AWG</option>\
            <option value="000">3/0 AWG</option>\
            <option value="0000">4/0 AWG</option>\
        </select>\
    </td>\
    <td>\
        <input type="number" class="update" name="max_temp" value="130" min="30" max="200">\
    </td>\
    <td>\
        <input type="number" class="update" name="num_bundle" value="3" min="0">\
    </td>\
    <td>\
        <input type="number" class="update" name="num_carrying_current"" value="2" min="0">\
    </td>\
    <td>0.0 A</td>\
    <td>0.0 A</td>';

var table = document.getElementById("table");
var altitude = document.getElementById("altitude");
var total_ampacity_label = document.getElementById("total_bundle_capacity");
var add_row_button = document.getElementById("add_row_button");

const updaters = document.querySelectorAll('.update');
updaters.forEach(el => el.addEventListener('input', calcAmpacity));

add_row_button.addEventListener("click", addRow);

updaters.item(0).dispatchEvent(new Event("input"));

function calcAmpacity(e) {

    var table_len = table.rows.length;
    var wires_in_bundle = 0;
    var wires_carrying_current = 0;

    var ampacities = new Array(table_len + 1);
    for (i = 1; i < table_len; i++) {
        var row = table.rows.item(i).cells;
        wires_in_bundle += parseInt(row.item(num_bundle).firstElementChild.value);
        wires_carrying_current += parseInt(row.item(num_carrying_current).firstElementChild.value);
        var temp = parseInt(row.item(max_temp).firstElementChild.value);
        var coeff1 = coeff1_lookup[row.item(wire_size).firstElementChild.value];
        var coeff2 = coeff2_lookup[row.item(wire_size).firstElementChild.value];
        ampacities[i] = coeff1 * (temp ** coeff2) * material_lookup[row.item(material).firstElementChild.value];
    }

    var bundle_loading = wires_carrying_current / wires_in_bundle;
    var rounded_bundle_loading = Math.ceil(bundle_loading * 5) / 5;
    let bundle_loading_derate = 0;
    if (wires_in_bundle > 40) {
        switch (rounded_bundle_loading) {
            case 0.2: bundle_loading_derate = 0.5;
            break;
            case 0.4: bundle_loading_derate = 0.392;
            break;
            case 0.6: bundle_loading_derate = 0.33;
            break;
            case 0.8: bundle_loading_derate = 0.3;
        }
    } else {
        switch(rounded_bundle_loading) {
            case 0.2:
                bundle_loading_derate = 1.02 - 0.0335 * wires_in_bundle
                        + 7.93e-4 * wires_in_bundle * wires_in_bundle
                        - 7.06e-6 * wires_in_bundle * wires_in_bundle * wires_in_bundle;
                break;
            case 0.4:
                bundle_loading_derate = 1.03 - 0.0657 * wires_in_bundle
                        + 3.24e-3 * wires_in_bundle * wires_in_bundle
                        - 8.02e-5 * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        +7.58e-7 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle;
                break;
            case 0.6:
                bundle_loading_derate = 1.1 - 0.121 * wires_in_bundle
                        + 0.0116 * wires_in_bundle * wires_in_bundle
                        - 6.89e-4 * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        + 2.32e-5 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        - 4.05e-7 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        + 2.83e-9 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle;
                break;
            case 0.8:
                bundle_loading_derate = 1.11 - 0.138 * wires_in_bundle
                        + 0.014 * wires_in_bundle * wires_in_bundle
                        - 8.45e-4 * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        + 2.88e-5 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        - 5.04e-7 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        + 3.53e-9 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle;
                break;
            case 1:
                bundle_loading_derate = 1.12 - 0.163 * wires_in_bundle
                        + 0.0181 * wires_in_bundle * wires_in_bundle
                        - 1.16e-3 * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        + 4.08e-5 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        - 7.29e-7 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle
                        + 5.17e-9 * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle * wires_in_bundle;
                break;
        }
    }
    if (altitude.value > 100) {
        altitude.value = 100;
    } else if (altitude.value < 0) {
        altitude.value = 0;
    }
    var altitude_derate = 1 - .00517 * altitude.value
            + 3.86e-5 * altitude.value * altitude.value
            - 1.7e-7 * altitude.value * altitude.value * altitude.value;

    var derate = bundle_loading_derate * altitude_derate;

    var total_bundle_ampacity = 0.0;
    for (i = 1; i < table_len; i++) {
        var ampacity = ampacities[i] * derate;
        table.rows.item(i).cells.item(individ_amp).innerHTML = ampacity.toFixed(1) + " A";
        var total_ampacity = ampacity * table.rows.item(i).cells.item(num_bundle).firstElementChild.value * bundle_loading;
        table.rows.item(i).cells.item(total_amp).innerHTML = total_ampacity.toFixed(1) + " A";
        total_bundle_ampacity += total_ampacity;
    }
    total_ampacity_label.innerHTML = total_bundle_ampacity.toFixed(1) + " A";
}

function addRow(e) {
    var new_row = table.insertRow(table.rows.length);
    new_row.innerHTML = table_row_html;
    var updaters = document.querySelectorAll('.update');
    updaters.forEach(el => el.addEventListener('input', calcAmpacity));
    calcAmpacity(e);
}