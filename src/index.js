const express = require('express');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Translate } = require('@google-cloud/translate').v2;
const fs = require('fs');
const util = require('util');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: '*', // Allow all origins for testing. Change this to your frontend's URL for production.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.static('public'));

// Creates a client for Text-to-Speech
const client = new textToSpeech.TextToSpeechClient();

// Creates a client for Translation
const translate = new Translate();

app.post('/synthesize', async (req, res) => {
  const { text, languageCode } = req.body;

  try {
    // Translate the text to the specified language
    const [translation] = await translate.translate(text, {
      format: "text",
      to: languageCode
    });
    
    // Synthesize speech for the translated text
    const request = {
      input: { text: translation },
      voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    console.log("translation", languageCode, translation)

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    const fileName = `output_${Date.now()}.mp3`;
    const filePath = `public/audio/${fileName}`; 
    await writeFile(filePath, response.audioContent, 'binary');
    res.status(200).send({ url: `${req.protocol}://${req.get('host')}/audio/${fileName}` });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
