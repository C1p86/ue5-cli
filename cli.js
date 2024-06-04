#!/usr/bin/env node

import https from 'https'; // or 'https' for https:// URLs
import fs from 'fs';

import StreamZip  from 'node-stream-zip';




import { consola, createConsola } from "consola";
import shell from 'shelljs';
import minimist from 'minimist';


//consola.info("Using consola 3.0.0");
//consola.start("Building project...");
//consola.warn("A new version of consola is available: 3.0.1");
//consola.success("Project built!");
//consola.error(new Error("This is an example error. Everything is fine!"));
//consola.box("I am a simple box");

//console.log(process.argv);

var argv = minimist(process.argv.slice(2));

argv["ue"]==undefined ? argv["ue"] = "main" : null;

switch (argv._[0]) {
    default:
        consola.error(new Error("No command specified"));
        break;
        case "new":
            newProject(argv._[1]);
            break;
        case "module":
            createModule(argv._[1]);
            break;
}


//------------------------------------------------------------

async function newProject(projectName) {
    if (fs.existsSync(projectName)) {
        consola.error("Project directory already exists");
        process.exit(-101);
    }

    var returnCode = await downloadZipFromGithub("C1p86", "UE5-Boilerplate", argv["ue"], projectName);

    if (!returnCode) {
        consola.error("Unable to create project in " + projectName);
        process.exit(-102);
    } else {
        consola.success("Project created in " + projectName);
    }
}


async function createModule(moduleName) {
    if(!isProjectDirectory()) {
        consola.error("Not a project directory");
        process.exit(-201);
    }

    if(shell.cd ("Source").code!=0) {
        if (shell.mkdir("Source").code!=0) {
            consola.error("Unable to create Source folder");
            process.exit(-202);
        }
        if(shell.cd("Source").code!=0) {
            consola.error("Unable to enter Source folder");
            process.exit(-203);
        }
    }
    var returnCode = await downloadZipFromGithub("C1p86", "UnrealModule", argv["ue"], moduleName);

    if (!returnCode) {
        consola.error("Unable to create module in " + moduleName);
        process.exit(returnCode);
    } else {
        //TODO: rinominare cartelle, file e nomi interni
        iterateOnFiles(moduleName, (file) => {
            console.log(file);
        })

        consola.success("Project created in " + moduleName);
    }
}

function isProjectDirectory() {
    var result = shell.find('-maxdepth 0', '.').filter(function(file) { return file.match(/\.uproject$/); });
    console.log(result);
    return result.length===1;
}

async function extractFile(orig, dest, content) {
    console.log("Extract: " + orig + " to " + dest + " with content " + content);
    const zip = new StreamZip.async({file: orig});
    var returnCode = await zip.extract(content, dest, (err) => {
        consola.error("Error extracting file: " + err);
        return false;
    });
    await zip.close();
    return true;
}

function downloadFile(url, filename) {
    return new Promise(function(resolve, reject) {

        https.get(url, function(response) {
            console.log(response.statusCode);

            if (response.statusCode !== 200) {
                reject(new Error("Error downloading file"));
            }
            response.pipe(fs.createWriteStream(filename+".zip"))
            .on('close', function () {
                resolve(true);
            });
        })
        
        
    })
}

async function downloadZipFromGithub(user, repo, branch, destinationFolder) {
    const url = "https://codeload.github.com/"+user+"/"+repo+"/zip/refs/heads/"+branch;
    console.log(url);
    var download = await downloadFile(url, "temp");
    if (!download) {
        console.error("Unable to download file");
        return -1;
    }
    var extractionResult = await extractFile("./temp.zip", destinationFolder, repo+'-'+branch);
    if (extractionResult) {
        fs.unlinkSync("temp.zip");
        return true;
    } else {
        return false;
    }
}

function iterateOnFiles(dir, lambda) {
    const fileList = fs.readdirSync(dir)
    for (const file of fileList) {
        const fileName = `${dir}/${file}`
        if (fs.statSync(fileName).isDirectory()) {
            iterateOnFiles(fileName, lambda)
        } else {
            lambda(fileName)
        }
    }
}
