module.exports.ERROR = {
    SAVE_AUDIO_FILE: 'Could not save audio file',
    TRANSLATE_API_ERROR: 'Error occurred when processing translation request',
    TTS_API_ERROR: 'Error occurred when processing TTS request',
};

module.exports.CORS_OPTIONS = {
    origin: '*', // TODO: Change to pre-prod testing URL
    methods: 'POST',
    allowedHeaders: 'Content-Type',
    optionsSuccessStatus: 204,
};
