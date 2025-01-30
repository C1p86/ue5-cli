import { program } from 'commander';
import {Project} from "./project.mjs";
import {Settings} from "./settings.mjs";
import ora from "ora";
import chalk from "chalk";
import path from 'path';



class Lights_C {

    async buildMap(projectPath, map, showSpinner = true) {
        let spinner;
        if (showSpinner) spinner = ora(`Building lights for map ${map} in project ${projectPath}...`).start();
        if (Project.checkIfProjectPathIsValid(projectPath)) {
            const ProjectVersion = await Project.getUeVersion(projectPath);
            console.log(ProjectVersion);
            let UePath = Project.getUePathPerProject(projectPath);
            const uProjectPath = path.normalize(Project.GetUprojectFilePath(projectPath));

            const script=`${UePath} ${uProjectPath} -run=resavepackages -buildlighting -MapsOnly -ProjectOnly -AllowCommandletRendering -Map=${map} -Log=ue5cli.log > %cd%/ue-cli.log 2>&1`;
            console.log(script);
            //shell.exec(script);
            if (showSpinner) spinner.succeed(`Builded lights for map ${map} in project ${projectPath}!`);
        } else {
            if (showSpinner) spinner.fail(`Unable to build lights for map ${map} in project ${projectPath}, the path is not a valid UE project`);
        }
        
        
        
        
    }

};

const Lights = new Lights_C();



program.command('buildlights')
.description('Build lights for a map')
.argument('<map>', 'map to build')
.option('-p, --project <project>', 'project to build', Settings.GetConfig().defaultProjectPath)
.action((map, options) => {
    (async() => {
        await Lights.buildMap(options.project, map, false);
    })();
});

export { 
 Lights
};