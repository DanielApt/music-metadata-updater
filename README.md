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

[![](https://mermaid.ink/img/pako:eNptkctKBDEQRX-lqJUyMyIusxho1IULUZxtb8pOdVuQx5iHMAzz71Y_FJHOqhLOubkkZ-yiZTSY-bNy6PhBaEjk2wC6XpIMEsgBVSsRenG82-83B_JHx9PWwH1iKgx3t5C5i8FOx7P-hxu1plp7I1EVcg58zdJBUmcIUiQGaF6fZm8B1dmtNDDQWLvongtZKgRX0gN9kTh6d3z9P2bzvHaZBmnyKXOGPDWdtVV27PLb_41LTWGpIKGPydMI4hY96yxWH_Q8prVYPthzi0ZHyz1VV1psw0XRetTm_GilxISmJ5d5i1RLPJxCh6akyj_Q8ikLdfkG9jSUyA)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNptkctKBDEQRX-lqJUyMyIusxho1IULUZxtb8pOdVuQx5iHMAzz71Y_FJHOqhLOubkkZ-yiZTSY-bNy6PhBaEjk2wC6XpIMEsgBVSsRenG82-83B_JHx9PWwH1iKgx3t5C5i8FOx7P-hxu1plp7I1EVcg58zdJBUmcIUiQGaF6fZm8B1dmtNDDQWLvongtZKgRX0gN9kTh6d3z9P2bzvHaZBmnyKXOGPDWdtVV27PLb_41LTWGpIKGPydMI4hY96yxWH_Q8prVYPthzi0ZHyz1VV1psw0XRetTm_GilxISmJ5d5i1RLPJxCh6akyj_Q8ikLdfkG9jSUyA)

```mermaid
sequenceDiagram
    Original audio file->>+Sample file: Create 20 second file
    Sample file->>+Audd.io: Call music recognition API
    Audd.io->>-Original audio file: Add music metadata (if available)
    Audd.io->>+Music recognition API: Analyses sample
    Music recognition API->>-Audd.io: Return music information
```
