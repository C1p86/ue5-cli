import fs from 'fs';
import path from 'path';
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
        fs.readdirSync(projectPath).forEach(file => {
            if (path.extname(file) === ".uproject") {
                var obj = JSON.parse(fs.readFileSync(projectPath + '/' + file, 'utf8'));
                UProject = obj;
            }
        });
        return UProject;
    }

    getUeVersion(projectPath) {
        return this.GetUProject(projectPath).EngineAssociation;
    }

};

let Project = new Project_C();

export {Project};