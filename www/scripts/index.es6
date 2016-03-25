'use strict';

function mintSingleCap(capValue, keypair) {
    let $el = $('<div class="row list-group-item-text"></div>');
    let $canvas = $('<canvas class="col-xs-4"></canvas>');
    let address = keypair.getAddress();
    let priv = bitcoin.base58.encode(keypair.d.toBuffer(32));
    let capUri = `http://btcp.trade/${address}:${priv}`;
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
    $('#mintForm').submit((e) => {
        e.preventDefault();
        let $capsOutput = $('#capsOutput');
        $capsOutput.html('');
        let capsAmount = +$('#capsAmountInput').val();
        let capsValue = +$('#capsValueInput').val();
        for (let i = 0; i < capsAmount; i++) {
            let keypair = bitcoin.bitcoin.ECPair.makeRandom();
            let $cap = mintSingleCap(capsValue, keypair);
            let $li = $('<li class="list-group-item"></li>');
            $li.append($cap);
            $capsOutput.append($li);
        }
    });
});