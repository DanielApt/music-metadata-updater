# music-metadata-updater

A CLI script which takes a list of audio files, detects the track information, and then adds the information as metadata to the original file.

## Requirements

You will need:

* NodeJS (v16.13.2 is used here)

## Usage

* `npm install`
* `npm run start [ONE OR MORE AUDIO FILE PATHS]`

## Example

`npm run start ~/Downloads/song.m4a`

## Architecture

```mermaid
sequenceDiagram
    Original audio file->>+Sample file: Create 20 second file
    Sample file->>+Audd.io: Call music recognition API
    Audd.io->>-Original audio file: Add music metadata (if available)
    Audd.io->>+Music recognition API: Analyses sample
    Music recognition API->>-Audd.io: Return music information
```
