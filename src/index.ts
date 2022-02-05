const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const ffmetadata = require('ffmetadata');
const Audd = require('audd.io').Audd;

type AuddResult = {
    artist: string,
    title: string,
    album: string,
    release_date: string,
    label: string,
    timecode: string // '00:10'
    song_link: string
}

type AuddResponse = {
    status: 'success' | null,
    result: AuddResult
}

const audioFiles = getAudioFilesFromArgs(process.argv);

let tmpDirectory: string;

// start here

const audd_secret: string | undefined = process.env.AUDD_SECRET;

if (typeof audd_secret === 'undefined') {
    throw new Error(`No Audd.io API key found. Make sure to set the AUDD_SECRET environment variable to your Audd.io API key`);
}

const audd = new Audd(audd_secret);

const ffmpeg = require('fluent-ffmpeg');

audioFiles.forEach(doEverything);

async function doEverything(audioFilePath: string) {
    const sample = await createSample(audioFilePath);
    const data = await identifySample(sample);

    if (data.status === 'success' && data.result !== null) {
        addAuddMetadataToFile(audioFilePath, data.result);
    } else {
        console.log(`No data found for "${audioFilePath}"`);
    }
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

async function identifySample(sampleFilePath: string): Promise<AuddResponse> {
    return audd.recognize.fromFile(sampleFilePath)
}

async function addAuddMetadataToFile(originalFilePath: string, metadata: AuddResult) {
    const { artist, title, album, label, release_date } = metadata;

    const data = {
        title,
        artist,
        album,
        label,
        date: release_date
    }

    ffmetadata.write(originalFilePath, data, function (err: any) {
        if (err) console.error("Error writing metadata");
        else console.log("Data written");
    })
}

async function createTmpDirectory() {
    if (tmpDirectory) {
        return tmpDirectory;
    }

    return fs.mkdtemp(path.join(os.tmpdir(), 'music-info-updater'));
}

/**
 * Parses the Node process arguments and returns provided files
 * @param {string[]} args 
 * @returns {string[]} audioFilePaths
 */
function getAudioFilesFromArgs(args: string[]): string[] {
    return args.filter(arg => arg.match(/.*\.(m4a)/))
}