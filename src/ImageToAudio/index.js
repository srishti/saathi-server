const { VertexAI } = require('@google-cloud/vertexai');
const { SYSTEM_INSTRUCTION_1 } = require('./SystemInstruction.js');
const { convertStrToJson } = require('./utils.js');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
    project: 'hackmee-saathi-0622',
    location: 'us-central1',
});
const model = 'gemini-1.5-flash-001';

const generativeModalFn = ({ systemInstruction }) => {
    const _systemInstruction = `${SYSTEM_INSTRUCTION_1} ${
        systemInstruction ? systemInstruction : ''
    }.`;

    console.log('_systemInstruction', _systemInstruction);

    return vertex_ai.preview.getGenerativeModel({
        model: model,
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.4,
            topP: 0.61,
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
        ],
        // systemInstruction: {
        //     parts: [{ text: SYSTEM_INSTRUCTION }],
        // },
        systemInstruction: _systemInstruction,
    });
};

const generateContent = (params) => {
    const { image, language, systemInstruction } = params;

    return new Promise(async (resolve, reject) => {
        try {
            const req = {
                contents: [
                    {
                        role: 'user',
                        // This is a sample `parts`
                        // parts: [image1, { text: `summarize this image` }],
                        parts: [
                            {
                                fileData: {
                                    fileUri: image,
                                    mimeType: 'image/jpeg',
                                },
                            },
                            { text: `language = ${language}` },
                        ],
                    },
                ],
            };

            const streamingResp = await generativeModalFn({
                systemInstruction,
            }).generateContentStream(req);

            // for await (const item of streamingResp.stream) {
            //     process.stdout.write(
            //         'stream chunk: ' + JSON.stringify(item) + '\n'
            //     );
            // }

            // process.stdout.write(
            //     'aggregated response: ' +
            //         JSON.stringify(await streamingResp.response)
            // );

            const result = await streamingResp.response;
            const { content } = result.candidates[0];
            const { text } = content.parts[0];
            const parsedText = convertStrToJson(text);

            if (parsedText) {
                console.log({
                    message: parsedText.message,
                    tts_language_code: parsedText.tts_language_code,
                });
                resolve({
                    message: parsedText.message,
                    tts_language_code: parsedText.tts_language_code,
                });
            } else {
                throw new Error(`Not able to parse Text: ${text}`);
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
};

const imageToText = (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const { languageCode, language, image, textToAudio } = params;
            const { language, image, textToAudio, systemInstruction } = params;

            const { message, tts_language_code } = await generateContent({
                image,
                language,
                systemInstruction,
            });

            const audioResult = await textToAudio({
                text: message,
                languageCode: tts_language_code,
            });

            resolve(audioResult);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    imageToText,
};
