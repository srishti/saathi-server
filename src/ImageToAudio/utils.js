// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertStrToJson = (text) => {
    let parsedJson;
    try {
        const validJsonText = text.replace(
            /(['"])?([a-zA-Z0-9_]+)(['"])?\s*:\s*(['"]?)(.*?)\4\s*/g,
            (match, p1, p2, p3, p4, p5) => {
                return `"${p2}": "${p5.replace(/"/g, '\\"')}"`;
            }
        );

        // Step 2: Replace single quotes around the JSON string
        const validJsonTextDoubleQuotes = validJsonText.replace(/'/g, '"');
        parsedJson = JSON.parse(validJsonTextDoubleQuotes);
        /** parsed JSON will not be undefined if it is parsed successfully because undefined is not a valid JSON */
        return parsedJson;
    } catch (e) {
        /** returning undefined because null, boolean, string, array or object is a valid JSON whereas undefined is invalid JSON  */
        return undefined;
    }
};

// This is for robust handling of cases
function convertToJsonCompatibleString(str) {
    let result = '';
    let inQuotes = false;
    let currentQuote = null;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === "'" || char === '"') {
            if (inQuotes && char === currentQuote) {
                inQuotes = false;
                currentQuote = null;
            } else if (!inQuotes) {
                inQuotes = true;
                currentQuote = char;
            }
            result += '"';
        } else if (char === '\\' && inQuotes && str[i + 1] === currentQuote) {
            result += '\\' + currentQuote;
            i++; // Skip the next character
        } else {
            result += char;
        }
    }

    return result;
}

// const validJsonText = convertToJsonCompatibleString(text);

module.exports = {
    convertStrToJson,
};
