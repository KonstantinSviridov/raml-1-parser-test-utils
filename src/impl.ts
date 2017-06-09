/// <reference path="../typings/main.d.ts" />
import fs = require("fs");
import path = require("path");
import devEnvInstaller = require("dev-env-installer");
import cp = require('child_process')
import index = require("./index");

export function rootDir(currentDir:string) {
    let rootDir = currentDir;
    while (!fs.existsSync(path.resolve(rootDir, "package.json"))) {
        rootDir = path.resolve(rootDir, "../");
    }
    return rootDir;
}

export function configureSecurity(homeDir:string) {
    let TRAVIS_KEY_PUBLIC = process.env.TRAVIS_KEY_PUBLIC;
    let TRAVIS_KEY_PRIVATE = process.env.TRAVIS_KEY_PRIVATE;
    if (TRAVIS_KEY_PUBLIC && TRAVIS_KEY_PRIVATE) {

        console.log(`home dir: ${homeDir}`);

        let sshDir = path.resolve(homeDir, ".ssh");
        if (!fs.existsSync(sshDir)) {
            fs.mkdirSync(sshDir);
        }
        let keyPrivate = path.resolve(sshDir, "id_rsa");
        let keyPublic = path.resolve(sshDir, "id_rsa.pub");

        let privateKeyFormatted = "\n";
        for (var i = 0; i < TRAVIS_KEY_PRIVATE.length; i += 64) {
            let ind = Math.min(i + 64, TRAVIS_KEY_PRIVATE.length);
            privateKeyFormatted += TRAVIS_KEY_PRIVATE.substring(i, ind);
            privateKeyFormatted += "\n";
        }

        let keyPrivateContent = `-----BEGIN RSA PRIVATE KEY-----${privateKeyFormatted}-----END RSA PRIVATE KEY-----\n`;
        let keyPublicContent = `ssh-rsa ${TRAVIS_KEY_PUBLIC} RSA-1024\n`;

        fs.writeFileSync(keyPrivate, keyPrivateContent);
        fs.writeFileSync(keyPublic, keyPublicContent);
        fs.chmodSync(keyPrivate, 16832);
        fs.chmodSync(keyPublic, 16832);
    }
}

export function setSSHUrl(workingDir:string){

    let repoSlug = process.env.TRAVIS_REPO_SLUG;
    if(!repoSlug){
        return;
    }
    let command = `git remote set-url origin git@github.com:${repoSlug}.git`;
    devEnvInstaller.utils.execProcess(command,workingDir,true);
}

export function setGitUser(workingDir:string){

    let email = process.env.GITHUB_EMAIL;
    if(email){
        devEnvInstaller.utils.execProcess(`git config --global user.email "${email}"`,workingDir,true);
    }
    let name = process.env.GITHUB_USERNAME;
    if(name){
        devEnvInstaller.utils.execProcess(`git config --global user.name "${name}"`,workingDir,true);
    }
}

export function contributeTheStorage(
    workingDir:string,
    paths:string[],
    messageOrFileName:string,
    messageFromFile=false){

    let rd = workingDir;

    paths.forEach(p=>{
        let addFilesCommand = `git add ${p}`;
        devEnvInstaller.utils.execProcess(addFilesCommand,rd,true);
    });

    let commitCommand:string;
    if(messageFromFile){
        commitCommand = `git commit -F \"${messageOrFileName}\"`;
    }
    else {
        commitCommand = `git commit -m \"${messageOrFileName}\"`;
    }
    devEnvInstaller.utils.execProcess(commitCommand,rd,true);

    let pushCommand = "git push origin HEAD:master";
    devEnvInstaller.utils.execProcess(pushCommand,rd,true);
}

export function extractValueFromTravisCommitMessage(tag:string):string{

    let commitMessage = process.env[index.TRAVIS_COMMIT_MESSAGE];
    if(!commitMessage) {
        return null;
    }

    let ind = commitMessage.indexOf(tag);
    if (ind < 0) {
        return null;
    }
    ind += tag.length;
    let ind2 = commitMessage.indexOf("\n", ind);
    if (ind2 < 0) {
        ind2 = commitMessage.length;
    }
    let value = commitMessage.substring(ind, ind2);
    if (value.length > 0 && value.charAt(0) == "=") {
        value = value.substring(1).trim();
    }
    if (value.length==0) {
        return null;
    }
    return value;
}

export function cloneRepository(dir:string,uri:string,params?:any){

    let paramStr = "";
    if(params){
        Object.keys(params).forEach(x=>{
            let val = params[x];
            paramStr += ' ';
            paramStr += x;
            if(val!=null){
                if(val.length>0 && val.charAt(0)!="="){
                    paramStr += " ";
                }
                paramStr += val;
            }
        });
    }

    let command = `git clone ${uri}${paramStr}`;
    devEnvInstaller.utils.execProcess(command,dir,true);
}

export function checkoutCommit(dir:string,commitId:string){
    let command = `git checkout ${commitId}`;
    devEnvInstaller.utils.execProcess(command,dir,true);
}

export function getLastCommitId(wrkDir:string){

    let command = "git log --format=\"%H\" -n 1";
    var logObj = cp.execSync(
        command,
        {
            cwd: wrkDir,
            encoding: 'utf8'
        });
    let result = logObj.toString().trim();
    return result;
}

export function isWindows():boolean{
    let osId = process.platform;
    return osId.indexOf("win") == 0;
}

export function deleteFolderRecursive(folder : string) {
    if(fs.existsSync(folder) ) {
        if(fs.lstatSync(folder).isSymbolicLink()){
            fs.unlinkSync(folder);
            return;
        }
        fs.readdirSync(folder).forEach(fileName=>{
            var childPath = path.join(folder, fileName);
            if(fs.lstatSync(childPath).isDirectory()) {
                deleteFolderRecursive(childPath);
            } else {
                fs.unlinkSync(childPath);
            }
        });

        fs.rmdirSync(folder);
    }
};

export function insertDummyChanges(rootDir:string,fileName:string){
    let triggerFilePath = path.resolve(rootDir,fileName);
    let triggerFileContent = fs.readFileSync(triggerFilePath,"utf-8");
    let triggerFileContentTrim = triggerFileContent.trim();
    if(triggerFileContent==triggerFileContentTrim){
        triggerFileContent = triggerFileContent + " ";
    }
    else{
        triggerFileContent = triggerFileContentTrim;
    }
    fs.writeFileSync(triggerFilePath,triggerFileContent);
}