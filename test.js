const audioconcat = require('audioconcat');

let songs = ['./public/audio/222261_0.mp3', './public/audio/222261_1.mp3'];
audioconcat(songs)
  .concat('./public/audio/test.mp3')
  .on('start', function (command) {
    console.log('-ffmpeg process started:', command)
  })
  .on('error', function (err, stdout, stderr) {
    console.error('-Error:', err)
    console.error('-ffmpeg stderr:', stderr)
  });