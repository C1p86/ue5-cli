import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import {Settings} from "./settings.mjs";

class Project_C {

    constructor() {
    }

    checkIfProjectPathIsValid(projectPath) {
        if(fs.existsSync(projectPath + "/*.uproject")) {
            Settings.addProject(projectPath);
            return true;
        }
        return false;
    };

    GetUprojectFilePath(projectPath) {
        var UProject = "";
        fs.readdirSync(projectPath).forEach(file => {
            if (path.extname(file) === ".uproject") {
                UProject = projectPath + '/' + file;
            }
        });
        return UProject;
    }

    GetUProject(projectPath) {
        var UProject = "";
        let files = fs.readdirSync(projectPath);
        files.forEach(file => {
            if (path.extname(file) === ".uproject") {
                var obj = JSON.parse(fs.readFileSync(projectPath + '/' + file, 'utf8'));
                UProject = obj;
            }
        });
        return UProject;
    }

    getUeVersion(projectPath) {
        return {
            ProjectPath: projectPath,
            EngineVersion: this.GetUProject(projectPath).EngineAssociation
        };
    }

};

let Project = new Project_C();

program.command('getUeVersion')
    .description('Get Unreal Engine version')
    .option('-p', '--project <project>', Settings.GetConfig().defaultProjectPath)
    .action((options) => {
        console.log(Project.getUeVersion(options.p));
    });



    program.command('getUProject')
    .description('Get Unreal Engine Uproject')
    .option('-p', '--project <project>', Settings.GetConfig().defaultProjectPath)
    .action((options) => {
        console.log(Project.GetUProject(options.p));
    });

export {Project};