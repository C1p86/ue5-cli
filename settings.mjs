import Conf from 'conf';
import inquirer from "inquirer";
import { program } from 'commander';

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

const schema = {
    default_build_path: {
        type: 'string',
        default: default_build_path
    },
};

 export class Settings_C {


    constructor() {
        this.config = new Conf({projectName: 'ue5-cli', schema: schema});
    }

    dump() {
        console.log(this.config.get());
    }

    GetConfig() {
        return this.config.get();
    }

    addUePath(version, path) {
        if (!path) {
            inquirer.prompt([{
                type: 'input',
                name: 'path',
                message: 'Enter the path of the Unreal Engine ' + version + ':',
                default: ''
            }]).then(answers => {
                path = answers.path;
                var ue = this.config.get('ue');
                ue[`${version}`] = {'path': path}
                this.config.set('ue', ue);
            });
            
        } else {
            var ue = this.config.get('ue');
            ue[`${version}`] = {'path': path}
            this.config.set('ue', ue);
        }
        
    }

    removeUePath(version) {
        var ue = this.config.get('ue');
        delete ue[version];
        this.config.set('ue', ue);
    }

    addProject(projectUrl) {
        var projects = this.config.get('projects');
        projects.push(projectUrl);
        this.config.set('projects', projects);
    }

    removeProject(projectUrl) {
        var projects = this.config.get('projects');
        projects = projects.filter(e => e !== projectUrl);
        this.config.set('projects', projects);
    }

    getUePath(version) {
        var ue = this.config.get('ue');
        return ue[version].path;
    }

};

let Settings = new Settings_C();

program.command('addue')
    .description('Add Unreal Engine path')
    .argument('<version>', 'UE version')
    .argument('[path]', 'UE path')
    .action((version, path, options) => {
        Settings.addUePath(version, path);
    });

program.command('removeue')
    .description('Remove Unreal Engine path')
    .argument('<version>', 'UE version')
    .action((version, options) => {
        Settings.removeUePath(version);
    });

program.command('listue')
    .description('List Unreal Engine paths')
    .action((options) => {
        Settings.dump();
    });




export { Settings };