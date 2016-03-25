'use strict';

function mintSingleCap(capValue, keypair) {
    var $el = $('<div class="row list-group-item-text"></div>');
    var $canvas = $('<canvas class="qrcode col-xs-4"></canvas>');
    var address = keypair.getAddress();
    var priv = bitcoin.base58.encode(keypair.d.toBuffer(32));
    var capUri = 'http://btcp.trade/' + address + ':' + priv;
    qr.canvas({
        canvas: $canvas[0],
        value: capUri
    });
    $el.append($canvas);
    var $controls = $('<div class="col-xs-8"> </div>');
    $controls.append('\n        <div class="row">\n            <div><small>' + address + '</small></div>\n            <div>\n                <strong>Value</strong> \n                <span>' + capValue + 'ƀ</span>\n            </div>\n        </div>\n    ');
    $controls.append('\n        <div class="row">\n            <a class="btn btn-success btn-sm btn-block"\n                href="bitcoin:' + address + '?amount=' + capValue / 1e6 + '">\n                Fund\n            </a>\n        </div>\n    ');

    $el.append($controls);
    return {
        $el: $el,
        address: address
    };
}

$(document).ready(function () {
    $('#mintForm').submit(function (e) {
        e.preventDefault();
        var $capsOutput = $('#capsOutput');
        $capsOutput.html('');
        var capsAmount = +$('#capsAmountInput').val();
        var capsValue = +$('#capsValueInput').val();
        var addresses = [];
        for (var i = 0; i < capsAmount; i++) {
            var keypair = bitcoin.bitcoin.ECPair.makeRandom();
            var cap = mintSingleCap(capsValue, keypair);
            var $li = $('<li class="list-group-item"></li>');
            $li.append(cap.$el);
            $capsOutput.append($li);
            addresses.push(cap.address);
        }
        var $qrCodes = $capsOutput.find('canvas.qrcode');
        var $canvas = $('<canvas></canvas>');
        var height = $qrCodes.attr('height');
        $canvas.attr('height', height * $qrCodes.length);
        var ctx = $canvas[0].getContext('2d');
        $qrCodes.each(function (i, $qrCode) {
            var qrCodeDataURL = $qrCode.toDataURL();
            var image = new Image();
            image.onload = function () {
                ctx.drawImage(image, 0, height * i);
            };
            image.src = qrCodeDataURL;
        });
        var $printable = $('#printable');

        var $link = $('<a class="btn btn-default btn-lg btn-block">Download</a>');
        $link.click(function () {
            var canvasDataURL = $canvas[0].toDataURL('image/png');
            $link.attr('href', canvasDataURL);
            var hash = bitcoin.bitcoin.crypto.hash160(addresses.join(''));
            $link.attr('download', 'btcp-' + bitcoin.base58.encode(hash) + '.png');
        });
        $printable.append($link);
    });
});