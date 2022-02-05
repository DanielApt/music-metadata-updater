const fs = require('fs/promises');
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const Audd = require('audd.io').Audd;
const ffmetadata = require("ffmetadata");

const os = require('os');
const INPUT_DIRECTORY = path.join(__dirname, '../input');
const OUTPUT_DIRECTORY = path.join(__dirname, '../output');

const isDebug = process.env.DEBUG === "1";

let tmpDirectory;

const audd = new Audd('xx');

async function getDirectories() {
    console.log(`Looking into INPUT_DIRECTORY: ${INPUT_DIRECTORY}`);
    return fs.readdir(INPUT_DIRECTORY);
}

async function getMusicFiles(fileNames) {
    const musicFiles = fileNames.filter(file => file.match(/.*\.m4a$/));
    console.log(`Found the following music files: ${musicFiles.join('\n')}`);
    return musicFiles;
}

async function createNewOutputDirectory() {
    await fs.rmdir(OUTPUT_DIRECTORY, {recursive: true});
    return fs.mkdir(OUTPUT_DIRECTORY);
}

async function createTempDirectory() {
    return fs.mkdtemp(path.join(os.tmpdir(), 'music-info-updater'));
}

async function createSamples(fileNames) {
    return fileNames.map(file => {
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
    });
}

async function mockApiRequest() {
    const failData = {status: 'success', result: null}

    const successData = {
        status: 'success',
        result: {
            artist: 'Lou Reed',
            title: 'Wild Child',
            album: 'Eska Rock Gramy Co Chcemy',
            release_date: '2016-03-18',
            label: 'Sony Music Entertainment',
            timecode: '00:14',
            song_link: 'https://lis.tn/vtUhyb'
        }
    }

    return new Promise(resolve => {
        const randomTimer = Math.random() * 1000;
        setTimeout(() => {
            resolve(randomTimer > 100 ? successData : failData)
        }, randomTimer);
    })
}

async function identifySamples(sampleFilePaths) {
    console.log('Calling the Audd API');

    if (isDebug) {
        return sampleFilePaths.map(path => mockApiRequest().then(result => ({tmpFilePath: path, ...result})))
    } else {
        return sampleFilePaths.map(path => audd.recognize.fromFile(path).then(result => ({tmpFilePath: path, ...result})))
    }
}

async function addMetadataToOriginalFiles(sampleDataList) {
    sampleDataList.forEach((async sampleData => {
        const fileName = path.basename(sampleData.tmpFilePath);
        const originalInputFile = path.join(INPUT_DIRECTORY, fileName);
        const outputFile = path.join(OUTPUT_DIRECTORY, fileName);

        console.log(`Creating a copy into ${outputFile}`);
        await fs.copyFile(originalInputFile, outputFile);

        if (sampleData.result === undefined || sampleData.result === null) {
            return
        }
        const {artist, title, album, label, release_date} = sampleData.result;

        const data = {
            title,
            artist,
            album,
            label,
            date: release_date
        }

        ffmetadata.write(outputFile, data, function (err) {
            if (err) console.error("Error writing metadata");
            else console.log("Data written");
        });
    }));
}

async function deleteTmpDirectory() {
    return fs.rmdir(tmpDirectory, {recursive: true});
}

createNewOutputDirectory()
    .then(createTempDirectory)
    .then(result => {
        // store it once created
        console.log(`Storing tmp directory in ${result}`);
        tmpDirectory = result;
    })
    .then(getDirectories)
    .then(getMusicFiles)
    .then(createSamples)// create 20s samples for each song
    .then(results => Promise.all(results))
    .then(identifySamples)// Call an API to get the music information
    .then(results => Promise.all(results))
    .then(addMetadataToOriginalFiles)
    .then(deleteTmpDirectory)
    .then(() => console.log(`ALL DONE.\n\nTake a look at the ${OUTPUT_DIRECTORY}`));