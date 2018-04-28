const express = require('express');
const app = express()
const http = require('http');
const server = http.createServer(app);
const cookieParser = require('cookie-parser');

const rp = require('request-promise');
const fs = require('fs');
const path = require('path');

app.use(cookieParser());

app.get('/', (req, res, next) => {
	let session_id;
	if (req.cookies.session) {
		session_id = req.cookies.session;
		console.log('>>speaker-session[old]: ' + session_id);
	} else {
		session_id = String(Math.random()).substr(2, 6);
		res.cookie('session', session_id, {maxAge: 86400000});
		console.log('>>speaker-session: ' + session_id);
	}
	next();
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

app.use(express.static(__dirname+'/public'));
server.listen(8004, () => console.log('ok'));