'use strict';

function mintSingleCap(capValue, keypair) {
    let $el = $('<div class="row list-group-item-text"></div>');
    let $canvas = $('<canvas class="qrcode col-xs-4"></canvas>');
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
        let $qrCodes = $capsOutput.find('canvas.qrcode');
        let $canvas = $('<canvas></canvas>');
        let height = $qrCodes.attr('height');
        $canvas.attr('height', height * $qrCodes.length);
        let ctx = $canvas[0].getContext('2d');
        $qrCodes.each((i, $qrCode) => {
            let qrCodeDataURL = $qrCode.toDataURL();
            let image = new Image();
            image.onload = () => {
                ctx.drawImage(image, 0, height * i);
            };
            image.src = qrCodeDataURL;
        });
        let $printable = $('#printable');

        let $link = $(`<a class="btn btn-default btn-lg btn-block">Download</a>`);
        $link.click((e) => {
            let canvasDataURL = $canvas[0].toDataURL('image/png');
            $link.attr('href', canvasDataURL);
            $link.attr('download', 'bottlecaps.png');
        });
        $printable.append($link);
    });
});