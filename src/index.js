const express = require('express');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Translate } = require('@google-cloud/translate').v2;
const fs = require('fs');
const util = require('util');
const cors = require('cors');
require('dotenv').config();

const Constants = require('./constants');

const app = express();

app.use(bodyParser.json());
app.use(cors(Constants.CORS_OPTIONS));
app.use(express.static('public'));

// Creates a client for Text-to-Speech
const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * Function to translate text from one language to another language
 * @param {string} text original text to be translated
 * @param {string} languageCode target language code for translation
 * @returns translated text
 */
const translateText = async ({ text, languageCode }) => {
    try {
        // Creates a client for Translation
        const translateClient = new Translate();

        // Translate the text to the specified language
        const [translation] = await translateClient.translate(text, {
            format: 'text',
            to: languageCode,
        });
        console.log(
            `Original text: ${text}, Language Code: ${languageCode}, Translated text: ${translation}`
        );

        return translation;
    } catch (err) {
        console.log(`${Constants.ERROR.TRANSLATE_API_ERROR}`);
    }
};

/**
 * Function to convert text to speech
 */
const convertTextToSpeech = async ({ translation, languageCode }) => {
    const request = {
        input: { text: translation },
        voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    return response;
};

/**
 * Function to save audio file locally in the server
 * @param {*} audioContent audio buffer content
 */
const saveAudioFile = async (audioContent) => {
    try {
        const writeFile = util.promisify(fs.writeFile);
        const fileName = `output_${Date.now()}.mp3`;
        const filePath = `public/audio/${fileName}`;
        await writeFile(filePath, audioContent, 'binary');
        return fileName;
    } catch (err) {
        console.log(Constants.ERROR.SAVE_AUDIO_FILE);
    }
};

/**
 * Function to get URL of the audio file saved locally on the server
 * @param {string} protocol HTTP or HTTPS
 * @param {string} host hostname of the server
 * @param {string} fileName name of the audio file
 * @returns
 */
const getAudioFileUrl = ({ protocol, host, fileName }) =>
    `${protocol}://${host}/audio/${fileName}`;

/**
 * POST endpoint to translate text to the specified language and convert it to speech
 */
app.post('/tts', async (req, res) => {
    const { text, languageCode } = req.body;

    try {
        // translate original text to given language
        const translation = await translateText({ text, languageCode });

        // convert translated text to speech
        const audioResponse = await convertTextToSpeech({
            translation,
            languageCode,
        });

        // save audio file locally on the server
        const fileName = await saveAudioFile(audioResponse.audioContent);

        // send URL of the audio file in the response
        res.status(200).send({
            url: getAudioFileUrl({
                protocol: req.protocol,
                host: req.get('host'),
                fileName,
            }),
        });
    } catch (error) {
        console.error(`${Constants.ERROR.API_ERROR}: `, error);
        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
