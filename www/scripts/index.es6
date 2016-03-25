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
            <div><h5>${address}</h5></div>
            <h4>
                <a href="bitcoin:${address}?amount=${capValue / 1e6}">
                    Fund ${capValue} bits
                </a>
            </h4>
        </div>
    `);

    $el.append($controls);
    return {
        $el,
        address
    };
}

$(document).ready(() => {
    $('#mintForm').submit((e) => {
        e.preventDefault();
        let $capsOutput = $('#capsOutput');
        $capsOutput.html('');
        let capsAmount = +$('#capsAmountInput').val();
        let capsValue = +$('#capsValueInput').val();
        let addresses = [];
        for (let i = 0; i < capsAmount; i++) {
            let keypair = bitcoin.bitcoin.ECPair.makeRandom();
            let cap = mintSingleCap(capsValue, keypair);
            let $li = $('<li class="list-group-item"></li>');
            $li.append(cap.$el);
            $capsOutput.append($li);
            addresses.push(cap.address);
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

        $('#printable').show();
        let $printableLink = $("#printableLink");
        $printableLink.click(() => {
            let canvasDataURL = $canvas[0].toDataURL('image/png');
            $printableLink.attr('href', canvasDataURL);
            let hash = bitcoin.bitcoin.crypto.hash160(addresses.join(''));
            $printableLink.attr('download', `btcp-${bitcoin.base58.encode(hash)}.png`);
        });
    });
});