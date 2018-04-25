const express = require('express');
const app = express()
const http = require('http');
const server = http.createServer(app);

const rp = require('request-promise');
const fs = require('fs');
const path = require('path');

app.use(express.static(__dirname+'/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/speak', (req, res) => {
	let option = {
		method: 'GET',
		uri: 'https://code.responsivevoice.org/getvoice.php',
		qs: {
			t: req.query.text,
			tl: 'vi',
			sv: '',
			vn: '',
			pitch: '0.5',
			rate: '0.5',
			vol: '1',
		},
		headers: {
			'referer': 'https://responsivevoice.org/text-to-speech-languages/van-ban-de-noi-trong-tieng-viet/',
			'accept-encodeing': 'identity;q=1, *;q=0',
			'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
			'range': 'bytes=0-',
			'chrome-proxy': 'frfr'
		},
		encoding: 'binary'
	}

	rp(option).then(res1 => {
		console.log('--text converted');
		let audio_path = '/audio/audio-cde.mp3';
		fs.writeFileSync(__dirname+'/public/'+audio_path, res1, 'binary');

		res.send(audio_path);
	}).catch(err => {
		console.log(err);
	});

});

//
server.listen(8004, () => console.log('ok'));