'use strict';

let router = require('express').Router();
module.exports = router;

router.route('/mint')
.post((req, res, next) => {
    let keypairs = req.body.keypairs;
    if (!keypairs) {
        res.send('OK');
    }

});