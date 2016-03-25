'use strict';

let DEFAULT_FEE = 10000;

function doTransaction(keypair, toAddress, callback) {
    let txBuilder = new bitcoin.bitcoin.TransactionBuilder();

    let fromAddress = keypair.getAddress();
    let amount = 0;
    $.get(`https://bitcoin.toshi.io/api/v0/addresses/${fromAddress}/transactions`)
        .done((res) => {
            res.transactions.forEach((tx) => {
                tx.outputs.forEach((output, i) => {
                    if (output.spent) {
                        return;
                    }
                    txBuilder.addInput(tx.hash, i);
                    amount += output.amount;
                });
            });

            amount -= DEFAULT_FEE;
            if (amount <= 0) {
                $('#alerts').append(`
                    <div class="alert alert-danger" role="alert">Cap balance too low to redeem</div>
                `);
                return;
            }
            txBuilder.addOutput(toAddress, amount);
            txBuilder.inputs.forEach((input, i) => {
                txBuilder.sign(i, keypair);
            });

            let txHex = txBuilder.build().toHex();
            $.ajax({
                method: 'POST',
                url: 'http://btc.blockr.io/api/v1/tx/push',
                data: {hex: txHex},
            })
                .done((res) => {
                    res = JSON.parse(res);
                    if (res.error) {
                        callback(res.error);
                    } else {
                        callback(null, res);
                    }
                })
                .error((err) => {
                    callback(JSON.stringify(err));
                });
        })
        .error((err) => {
            if (err.status === 404) {
                $('#alerts').append(`
                    <div class="alert alert-danger" role="alert">No transactions to redeem</div>
                `);
            }
            else {
                $('#alerts').append(`
                    <div class="alert alert-danger" role="alert">${err.message}</div>
                `);
            }
        });
}

function updateBalances(addr) {
    let $confirmedBalance = $('#confirmedBalance');
    let $unconfirmedBalance = $('#unconfirmedBalance');
    $.get(`https://bitcoin.toshi.io/api/v0/addresses/${addr}`)
        .done((res) => {
            let balance = +res.balance || 0;
            $confirmedBalance.find('span.value').text(balance / 100);

            let unconfirmedBalance = +res.unconfirmed_balance || 0;
            if (unconfirmedBalance !== 0) {
                $unconfirmedBalance.show();
                $unconfirmedBalance.find('span.value').text(unconfirmedBalance / 100);
            }
        })
        .error(() => {
            $confirmedBalance.find('span.value').text(0);
        });
}
$(document).ready(() => {
    let addrAndPriv = window.location.pathname.slice(1).split(':');
    if (!addrAndPriv || addrAndPriv.length !== 2) {
        $('#alerts').append(`
            <div class="alert alert-danger" role="alert">Invalid URI</div>
        `);
        return;
    }
    let addr = addrAndPriv[0];
    $('#address').text(addr);
    updateBalances(addr);
    setInterval(() => updateBalances(addr), 15 * 1000);
    let priv = addrAndPriv[1];
    let privBuffer = bitcoin.base58.decode(priv);
    let d = bitcoin.BigInteger.fromBuffer(privBuffer);
    let keypair = new bitcoin.bitcoin.ECPair(d);
    if (keypair.getAddress() !== addr) {
        $('#alerts').append(`
            <div class="alert alert-danger" role="alert">Private key does not match address</div>
        `);
        return;
    }
    $('#alerts').append(`
        <div class="alert alert-success" role="alert">Bottlecap verified</div>
    `);
    let $redeemButton = $('#redeemButton');
    let $redeemForm = $('#redeemForm');
    $redeemButton.click(() => {
        $redeemForm.slideToggle('fast');
    });
    $redeemForm.submit((e) => {
        e.preventDefault();
        let $redeemAddress = $('#redeemAddress');
        let address = $redeemAddress.val();
        try {
            doTransaction(keypair, address, (err, res) => {
                $redeemAddress.val('');
                if (!err && res) {
                    console.log(JSON.stringify(res));
                }
                else {
                    $('#alerts').append(`
                        <div class="alert alert-danger" role="alert">Transaction error: ${err}</div>
                    `);
                }
            });
        } catch(err) {
            $('#alerts').append(`
                <div class="alert alert-danger" role="alert">Transaction error: ${err.message}</div>
            `);
        }
    });
    let $downloadWIF = $redeemForm.find('#downloadWIFButton');
    $downloadWIF.click(() => {
        let wif = keypair.toWIF();
        $downloadWIF.attr('href', `data:text/plain,${wif}`);
        $downloadWIF.attr('download', `${addr}.wif`);
    });
});