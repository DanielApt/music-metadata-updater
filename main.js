const ffmetadata = require('ffmetadata');
const audioFiles = getAudioFilesFromArgs(process.argv);

audioFiles.forEach(updateMetadata);

function updateMetadata(audioFilePath) {
    const data = {
        artist: "It is working"
    };
    
    ffmetadata.write(audioFilePath, data, function (err) {
        if (err) {
            console.error(`Cannot write data with ffmetadata to ${audioFilePath}.\n\n${err}`, err.stack);
        } else {
            console.log(`Succeeded in writing to ${audioFilePath}`);
        }
    })
}

/**
 * Parses the Node process arguments and returns provided files
 * @param {string[]} arguments 
 * @returns {string[]} audioFilePaths
 */
function getAudioFilesFromArgs(arguments) {
    return arguments.filter(arg => arg.match(/.*\.(m4a)/))
}