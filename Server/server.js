//configuring environmental variables
require('dotenv').config();

//setting up external APIs
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const deepai = require('deepai'); 
deepai.setApiKey(process.env.DEEPAI_KEY);


//setting up server, cors and web sockets
const util = require('util');
const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: 'chrome-extension://okffaginjdbcdkkhoepjeghoiegbhohf',
    credentials : true
  }, 
  pingTimeout: 6,
  pingInterval: 25
});


//Whenever someone connects, this gets executed
io.on('connection', (socket) => {
   console.log('A user connected: '+socket.handshake.address);
   let audioData = '';

   socket.on('audioData', (data) => {
      console.log('Audio data')
      audioData += data;
   });

   socket.on('getNotes', async (data) => {
    console.log(audioData.length);
    
    const request = {
      audio: {
        content: audioData
      },
      config: {
        encoding: "WAV",
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        audioChannelCount: 1,
      }
    };
  
    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);

    console.log(util.inspect(response, false, null, true))



    //  deepai.callStandardApi("summarization", { text: data })
    //  .then(summary => {
    //    socket.emit('notes',JSON.stringify({response: summary}));
    //  })
    //  .catch(error => {
    //    console.log('Error in DeepAI api'+error);
    //    socket.emit('notes',JSON.stringify({error : 'Error in DeepAI api'+error}));
    //  })

     socket.emit('notes','Smit Desai');
   })

   socket.on('disconnect', () => console.log('A user disconnected') );
});

server.listen(3000, () => console.log('listening on *:3000') );


//https://stackoverflow.com/questions/17301269/can-websocket-addresses-carry-parameters

//https://stackoverflow.com/questions/56453937/how-to-google-speech-to-text-using-blob-sent-from-browser-to-nodejs-server
//https://medium.com/@ragymorkos/gettineg-monochannel-16-bit-signed-integer-pcm-audio-samples-from-the-microphone-in-the-browser-8d4abf81164d
//https://hacks.mozilla.org/2014/06/easy-audio-capture-with-the-mediarecorder-api/
//https://medium.com/ideas-at-igenius/delivering-a-smooth-cross-browser-speech-to-text-experience-b1e1f1f194a2

//https://stackoverflow.com/questions/48874118/porting-scriptprocessor-based-application-to-audioworklet
//https://stackoverflow.com/questions/57507737/send-microphone-audio-recorder-from-browser-to-google-speech-to-text-javascrip