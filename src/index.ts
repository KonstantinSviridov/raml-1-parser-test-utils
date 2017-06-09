import impl = require("./impl");
import valuesCompare = require("./valuesCompare");

export const TRAVIS_COMMIT_MESSAGE = 'TRAVIS_COMMIT_MESSAGE';

export const TRAVIS_TRIGGER_FILE_NAME = "trigger.txt";

export function rootDir(currentDir:string) {
    return impl.rootDir(currentDir);
}

export function configureSecurity(homeDir:string) {
    return impl.configureSecurity(homeDir);
}

export function setSSHUrl(workingDir:string){
    return impl.setSSHUrl(workingDir);
}

export function setGitUser(workingDir:string){
    return impl.setGitUser(workingDir);
}

export function contributeTheStorage(
    workingDir:string,
    paths:string[],
    messageOrFileName:string,
    messageFromFile=false){

    return impl.contributeTheStorage(workingDir,paths,messageOrFileName,messageFromFile);
}

export function extractValueFromTravisCommitMessage(tag:string):string{
    return impl.extractValueFromTravisCommitMessage(tag);
}

export function cloneRepository(dir:string,uri:string,params?:any){
    return impl.cloneRepository(dir,uri,params);
}

export function checkoutCommit(dir:string,commitId:string){
    return impl.checkoutCommit(dir,commitId);
}

export function getLastCommitId(wrkDir:string){
    return impl.getLastCommitId(wrkDir);
}

export function isWindows():boolean{
    return impl.isWindows();
}

export function deleteFolderRecursive(folder : string) {
    return impl.deleteFolderRecursive(folder);
};

export interface Difference {

    message(label0?:string,label1?:string):string

    values():any[]

    path():string
}

export function compare(arg0:any,arg1:any):Difference[] {
    return valuesCompare.compare(arg0,arg1);
}

export function insertDummyChanges(rootDir:string,fileName:string=TRAVIS_TRIGGER_FILE_NAME){
    return impl.insertDummyChanges(rootDir,fileName);
}