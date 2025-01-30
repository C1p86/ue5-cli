import Conf from 'conf';
import inquirer from "inquirer";
import { program } from 'commander';
import ora from "ora";
import chalk from "chalk";

import regedit from "regedit";

import shell from 'node-exec';


const UE_WIN_REGISTRY_PATH = 'HKCU\\SOFTWARE\\Epic Games\\Unreal Engine\\Builds';
let default_build_path = "";

switch (process.platform) {
    case 'win32':
        default_build_path = "%homepath%/Documents/Unreal Project/Builds/"
        break;
    case 'darwin':
        case 'linux':
        default_build_path = "~/Documents/Unreal Project/Builds/"
        break;
    default:
        console.log('This is an unknown OS');
}

let WindowsUeInstallations = null;

const schema = {
    default_build_path: {
        type: 'string',
        default: default_build_path
    },
    defaultProjectPath:  {
        type: 'string'
    }
};

 export class Settings_C {


    constructor() {
        this.config = new Conf({projectName: 'ue5cli', schema});
    }

    dump() {
        console.log("Dump config", this.config.get());
    }

    GetConfig() {
        return this.config.get();
    }

    GetProjects() {
        return this.config.get('projects');
    }

    GetDefaultProject() {
        return this.config.get('defaultProjectPath');
    }


    async addUePath(version= null, path = null, showSpinner = true) {
        if (!version) {
            await inquirer
            .prompt([
            {
                type: "input",
                name: "version",
                message: `Please enter the version:`,
            },
            ])
            .then((answers) => {
                version = answers.version;
            });
        }
        if (!path) {
            await inquirer
            .prompt([
            {
                type: "input",
                name: "path",
                message: `No ${version} path found. Please enter the path of the Unreal Engine ${version}:`,
            },
            ])
            .then((answers) => {
                console.log("A", answers);
                path = answers.path;
            });
        }
        if (!version || !path) {
            console.log("Version and path are required", version, path);
            return false;
        }

        switch (process.platform) {
            case 'win32':
                var key = {};
                key[UE_WIN_REGISTRY_PATH] = {};
                key[UE_WIN_REGISTRY_PATH][version] = {
                    value: path,
                    type: 'REG_SZ'
                };
                let spinner;
                if (showSpinner) spinner = ora(`Adding ${version}: ${path} to Windows Registry...`).start(); // Start the spinner
                await regedit.promisified.putValue(key);
                if (showSpinner) spinner.succeed(`Added ${version}: ${path} to Windows Registry!`); // Stop the spinner
                return path; //TODO check if it was successful
                break;
            default:
                console.log("Function only implemented for windows");
                return false;
                break;
        }
        return false;
        
    }

    async removeUePath(version, showSpinner = true) {
        let cancel = false;
        if (!version) {
            let versions = await this.getUePaths();

            let choices = [];
            for (const [key, value] of Object.entries(versions)) {
                choices.push({name: `${key} --> ${value}`, value: key});
              }
            
            choices.push(new inquirer.Separator());
            choices.push({name: "Cancel", value: "cancel"});

            await inquirer
            .prompt([
            {
                type: "list",
                name: "version",
                message: `Please enter the version:`,
                choices: choices,
                default: "cancel"
            },
            ])
            .then((answers) => {
                if (answers.version == "cancel") {
                    cancel = true;
                    return;
                }
                version = answers.version;
            });
        }
        if (cancel) return false;
        if (!version) {
            console.log("Version is required");
            return false;
        }

        switch (process.platform) {
            case 'win32':
                let spinner;
                if (showSpinner) spinner = ora(`Removing ${version} from Windows Registry...`).start(); // Start the spinner
                let query = 'REG DELETE "' + UE_WIN_REGISTRY_PATH + '" /v ' + version + ' /f';
                await shell.run(query).then(function(res) {
                    console.log('delete success');
                }).catch(function(err) {
                    console.log('delete error');
                });
                if (showSpinner) spinner.succeed(`Removed ${version} from Windows Registry!`); // Stop the spinner
                return true; //TODO check if it was successful
                break;
            default:
                console.log("Function only implemented for windows");
                return false;
                break;
        }
        return false;
    }

    async getUePathsFromRegistry(showSpinner = true) {
        if (process.platform != 'win32') return null;
        let spinner;
        if (showSpinner) spinner = ora(`Checking existing UE installations...`).start();
        var data = await regedit.promisified.list(UE_WIN_REGISTRY_PATH);
        var input = data[UE_WIN_REGISTRY_PATH].values;
        if (showSpinner) spinner.stop();
        return WindowsUeInstallations = Object.keys(input).reduce((acc, key) => {
            acc[key] = input[key].value;
            return acc;
          }, {});
    }

    async getUePaths() {
        switch (process.platform) {
            case 'win32':
                if (!WindowsUeInstallations) {
                    return await this.getUePathsFromRegistry();
                }
                return WindowsUeInstallations;
                return;
                break;
            case 'TODO':
                var ue = this.config.get('ue');
                return ue[version].path;
                break;
            default:
                console.log("Questa funzione è stata implementata solo per windows");
                return;
                break;
        }
    }

    async getUePath(version) {
        if (this.getUePath[version]) {
            return await this.getUePath[version];
        } else {
            return await this.addUePath(version);
        }
    }

    addProject(projectUrl) {
        var projects = this.config.get('projects') || [];
        projects.push(projectUrl);
        this.config.set('projects', projects);
    }

    removeProject(projectUrl) {
        console.log("Removing project:", projectUrl);
        var projects = this.config.get('projects');
        projects = projects.filter(e => e !== projectUrl);
        this.config.set('projects', projects);
    }

    setDefaultProject(projectPath) {
        console.log("Set default project:", projectPath);
        this.config.set('defaultProjectPath', projectPath);
    }

    
};

let Settings = new Settings_C();

program.command('projectadd')
    .description('Add Unreal Engine path')
    .argument('<projectPath>', '.uproject path (directory only)')
    .option('--default', 'set as default project')
    .action((projectPath, options) => {
        Settings.addProject(projectPath);
        if (options.default) {
            Settings.setDefaultProject(projectPath);
        }
    });

    program.command('projectlist')
    .description('List projects')
    .action((options) => {
        console.log(Settings.GetProjects());
    });

program.command('projectremove')
    .description('Remove Unreal Engine path')
    .argument('<projectPath>', '.uproject path (directory only)')
    .action((projectPath, options) => {
        Settings.removeProject(projectPath);
    });

program.command('ueadd')
    .description('Add Unreal Engine path')
    .argument('[version]', 'UE version')
    .argument('[path]', 'UE path')
    .action((version, path, options) => {
        Settings.addUePath(version, path);
    });

program.command('ueremove')
    .description('Remove Unreal Engine path')
    .argument('[version]', 'UE version')
    .action((version, options) => {
        Settings.removeUePath(version);
    });

program.command('uelist')
    .description('List Unreal Engine paths')
    .action((options) => {
        (async function() {
            let ues = await Settings.getUePaths();
            console.log(ues);
        })(); 
    });

    program.command("projectsetedefault")
    .description("Set default project")
    .argument("<project>", "project to set as default")
    .action((project) => {
        Settings.setDefaultProject(project);
    });

    program.command("projectgetdefault")
    .description("Get default project")
    .action(() => {
        console.log(Settings.GetDefaultProject());
    });


export { Settings };