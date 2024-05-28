#!/usr/bin/env node

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

function newProject(projectName) {
    var returnCode
    if (argv["ue"] == undefined) {
        returnCode = shell.exec("git clone https://github.com/C1p86/UE5-Boilerplate.git " + projectName).code;
    } else {
        returnCode = shell.exec("git clone --branch " + argv["ue"] + " https://github.com/C1p86/UE5-Boilerplate.git " + projectName).code;
    }
    
    if (returnCode!=0) {
        consola.error(new Error("Unable to create project in " + projectName));
        process.exit(returnCode);
    } else {
        consola.success("Project created in " + projectName);
    }
}


function createModule(moduleName) {
    if(!isProjectDirectory()) {
        consola.error(new Error("Not a project directory"));
        process.exit(-10);
    }

    if(shell.cd ("Source").code!=0) {
        if (shell.mkdir("Source").code!=0) {
            consola.error(new Error("Unable to create Source folder"));
            process.exit(-11);
        }
        if(shell.cd("Source").code!=0) {
            consola.error(new Error("Unable to enter Source folder"));
            process.exit(-12);
        }
    }
    var returnCode = shell.exec("git clone https://github.com/C1p86/UnrealModule.git " + moduleName).code;

    if (returnCode!=0) {
        consola.error(new Error("Unable to create module in " + moduleName));
        process.exit(returnCode);
    } else {
        consola.success("Project created in " + moduleName);
    }
}

function isProjectDirectory() {
    var result = shell.find('-maxdepth 0', '.').filter(function(file) { return file.match(/\.uproject$/); });
    console.log(result);
    return result.length===1;
}