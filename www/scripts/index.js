'use strict';

let RANDOMNESS_CHARS = '0123456789abcdefghijklnopqrstuvwxyzABCDEFGHIJKLNOPQRSTUVWXYZ';
function genRandomness(len) {
    len = len || 32;
    let out = '';
    for (let i = 0; i < len; i++) {
        let index = Math.floor(Math.random() * RANDOMNESS_CHARS.length);
        out += RANDOMNESS_CHARS[index];
    }
    return out;
}

function populateRandomness() {
    $('#randomnessInput').val(genRandomness());
}

function mintSingleCap(capValue, keypair) {
    let $el = $('<div class="row list-group-item-text"></div>');
    let $canvas = $('<canvas class="col-xs-4"></canvas>');
    let address = keypair.getAddress();
    let capUri = `http://btcp.trade/${address}`;
    qr.canvas({
        canvas: $canvas[0],
        value: capUri,
    });
    $el.append($canvas);
    let $controls = $('<div class="col-xs-8"> </div>');
    $controls.append(`
        <div class="row">
            <div><small>${address}</small></div>
            <div>
                <strong>Value</strong> 
                <span>${capValue}ƀ</span>
            </div>
        </div>
    `);
    $controls.append(`
        <div class="row">
            <a class="btn btn-success btn-sm btn-block"
                href="bitcoin:${address}?amount=${capValue / 1e6}">
                Fund
            </a>
        </div>
    `);

    $el.append($controls);
    return $el;
}

$(document).ready(() => {
    populateRandomness();
    $('#mintForm').submit((e) => {
        e.preventDefault();
        $('#capsOutput').html('');
        let capsAmount = +$('#capsAmountInput').val();
        let capsValue = +$('#capsValueInput').val();
        let $capsOutput = $('#capsOutput');
        let seed = $('#randomnessInput').val();
        for (let i = 0; i < capsAmount; i++) {
            let rng = () => {
                return new bitcoin.Buffer.Buffer(`${i}${seed}`.slice(0, 32));
            };
            let keypair = bitcoin.bitcoin.ECPair.makeRandom({rng: rng});
            let $cap = mintSingleCap(capsValue, keypair);
            let $li = $('<li class="list-group-item"></li>');
            $li.append($cap);
            $capsOutput.append($li);
        }
        populateRandomness();
    });
});