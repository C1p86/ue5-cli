import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import {Settings} from "./settings.mjs";

class Project_C {

    constructor() {
    }

    existsFileWithExtension(directory, ext) {
        if (ext[0] !== '.')  ext = '.' + ext;
        ext = ext.toLowerCase().trim();
        if (!fs.existsSync(directory)) {
            return false;
        }
    
        const files = fs.readdirSync(directory);
        return files.some(file => path.extname(file).toLowerCase() === ext);
    }

    getUProjectFilePath(projectPath) {
        if (ext[0] !== '.')  ext = '.' + ext;
        ext = ext.toLowerCase().trim();
        if (!fs.existsSync(directory)) {
            return false;
        }
        const files = fs.readdirSync(directory);
        files.forEach(file => {
            if (path.extname(file).toLowerCase() === ext) {
                console.log("AAA", path.normalize(directory + '/' + file) );
            }
        });
        return false;
    }

    checkIfProjectPathIsValid(projectPath) {
        if(this.existsFileWithExtension(projectPath, "uproject")) {
            Settings.addProject(projectPath);
            return true;
        }
        return false;
    };

    async getUePathPerProject(projectPath) {
        if (this.checkIfProjectPathIsValid(projectPath)) {
            return await Settings.getUePath(await this.getUeVersion(projectPath).EngineVersion);
        }
        return false;
    }

    getUProject(projectPath) {
        if (this.checkIfProjectPathIsValid(projectPath)) {
        }
    }

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

    async getUeVersion(projectPath) {
        console.log("Getting UE version for project", projectPath);
        const engineVersion = await this.GetUProject(projectPath).EngineAssociation;
        return {
            ProjectPath: projectPath,
            EngineVersion: engineVersion
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