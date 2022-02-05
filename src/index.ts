const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const ffmetadata = require('ffmetadata');
const Audd = require('audd.io').Audd;

const audioFiles = getAudioFilesFromArgs(process.argv);

let tmpDirectory: string;

// start here

const audd_secret: string|undefined = process.env.AUDD_SECRET;

if (typeof audd_secret === 'undefined') {
    throw new Error(`No Audd.io API key found. Make sure to set the AUDD_SECRET environment variable to your Audd.io API key`);
}

const audd = new Audd(audd_secret);

const ffmpeg = require('fluent-ffmpeg');

audioFiles.forEach(doEverything);

async function doEverything(audioFilePath: string) {
    const sample = await createSample(audioFilePath);
    const data = await identifySample(sample);
    console.log(data);
}

async function createSample(audioFilePath: string): Promise<string> {
    const temporaryStorage = await createTmpDirectory();

    const outputFilePath = path.join(temporaryStorage, path.basename(audioFilePath));

    return new Promise(function (resolve, reject) {
        ffmpeg(audioFilePath)
            .inputOption('-t 20')
            .output(outputFilePath)
            .on('end', function () {
                resolve(outputFilePath)
            })
            .on('error', reject)
            .run();
    });
}

async function identifySample(sampleFilePath: string): Promise<any> {
    return audd.recognize.fromFile(sampleFilePath)
}

// createTmpDirectory().then(result => tmpDirectory = result);




async function createTmpDirectory() {
    if (tmpDirectory) {
        return tmpDirectory;
    }

    return fs.mkdtemp(path.join(os.tmpdir(), 'music-info-updater'));
}

/*
function createSamples(audioFilePath: string) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(INPUT_DIRECTORY, file);
        const outputFilePath = path.join(tmpDirectory, file);

        ffmpeg(filePath)
            .inputOption('-t 20') // 20 seconds
            .output(outputFilePath)
            .on('end', () => {
                console.log(`Created 20 second sample: ${outputFilePath}`);
                return resolve(outputFilePath)
            })
            .on('error', error => reject(error))
            .run()
    })
}

function updateMetadata(audioFilePath: string) {
    const data = {
        artist: "It is working"
    };

    ffmetadata.write(audioFilePath, data, function (err: any) {
        if (err) {
            console.error(`Cannot write data with ffmetadata to ${audioFilePath}.\n\n${err}`, err.stack);
        } else {
            console.log(`Succeeded in writing to ${audioFilePath}`);
        }
    })
}*/

/**
 * Parses the Node process arguments and returns provided files
 * @param {string[]} args 
 * @returns {string[]} audioFilePaths
 */
function getAudioFilesFromArgs(args: string[]): string[] {
    return args.filter(arg => arg.match(/.*\.(m4a)/))
}