'use strict';
let express = require('express');
let app = express();

app.get('*', (req, res) => {
	res.send('<h1>Bitcoin Bottlecaps</h1>' + 
		`<h3>${req.path}</h3>`);
})

app.listen(process.env.PORT || 80);
