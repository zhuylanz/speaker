const express = require('express');
const app = express()
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const rp = require('request-promise');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//SERVER CONFIG:
let session_id;
app.get('/', (req, res, next) => {
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

app.post('/speak', (req, res) => {
	let option = {
		method: 'GET',
		uri: 'https://code.responsivevoice.org/getvoice.php',
		qs: {
			t: '',
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

	let accept_length = 2500;
	let text = req.body.text;
	let text_total_part = parseInt(text.length/accept_length);
	let modifier = 0;
	let text_arr = [];
	let option_arr = [];
	let audio_path_arr = [];
	let rp_arr = [];

	text.length%accept_length ? text_total_part+=1 : text_total_part+=0;
	for (var i=0; i<text_total_part; i++) {
		while(true) {
			if (text[(i+1)*accept_length+modifier] != ' ' && text[(i+1)*accept_length+modifier] != undefined) {
				modifier += 1;
			} else {
				break;
			}
		}
		text_arr.push(text.substr(i*accept_length, accept_length+modifier));
		modifier = 0;
		option = JSON.parse(JSON.stringify(option));
		option.qs.t = text_arr[i];
		option_arr.push(option);
	}

	console.log(text_arr.length);
	for (var i in option_arr) {
		rp_arr.push(rp(option_arr[i]));
	}
	Promise.all(rp_arr).then(res_arr => {
		for (var i in res_arr) {
			console.log('--text converted');
			let audio_path = '/audio/'+session_id+'_'+i+'.mp3';
			fs.writeFileSync(__dirname+'/public'+audio_path, res_arr[i], 'binary');
			audio_path_arr.push(audio_path);
		}
		res.send(audio_path_arr);
	}).catch(err => {
		console.log(err);
	});
	// console.log(audio_path_arr)
	// res.send(audio_path_arr);
});

//
app.use(express.static(__dirname+'/public'));
server.listen(8004, () => console.log('Speaker Server is listening on 8004'));