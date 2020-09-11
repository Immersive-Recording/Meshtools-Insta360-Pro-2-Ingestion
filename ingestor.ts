/* tslint:disable:2691*/
import {ensureDirSync, existsSync, copy} from "https://deno.land/std@0.68.0/fs/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { delay } from "https://deno.land/std@0.68.0/async/mod.ts";
import { exec, OutputMode, IExecResponse } from "https://deno.land/x/exec/mod.ts";

const opts = parse(Deno.args);
const inDir = opts?.["_"]?.[0] + "";

function jpgtranCommandGenerator(infile: string, outfile: string):string {
    let command = "jpegtran";
    command += " -copy all";
    command += " -rotate 270";
    if(opts?.c) command += " -crop 3000x3100+0+450";
    command += ` -outfile ${outfile}`;
    command += ` ${infile}`;
    return command;
}

function exiftoolCommandGenerator(file:string, rig:string, date:string): string {
    let command = "exiftool";
    command += `-ExifIFD:SerialNumber="${rig}"`
    command += `-ExifIFD:DateTimeOriginal="${date}"`
    command += `-ExifIFD:FocalLengthIn35mmFormat="59.4034"`
    if(opts?.test)command += "-v3"
    command += ` ${file}`;
    return command;
}

if(!inDir){
    console.log("No Import Directory Given!");
    Deno.exit(1);
}

if(!existsSync(inDir)){
    console.log("Import Directory Is Missing!");
    Deno.exit(1);
}

// Check exiftool
{
    let response: IExecResponse;
    try {
        response = await exec(
            "exiftool",
            { output: OutputMode.Capture },
        );
    } catch (error) {
        response = {status:{code:99,success:false},output:""};
    }
    if(
        response.status.code != 0 ||
        !response.status.success ||
        response.output != "Syntax:  exiftool [OPTIONS] FILE\n\nConsult the exiftool documentation for a full list of options."
        ){
            console.log("Failed to verify exiftool is installed!");
            Deno.exit(2);
        }
}
// Check jpegtran
{let response: IExecResponse;
    try {
        response = await exec(
            "jpegtran -version",
            { output: OutputMode.Capture },
        );
    } catch (error) {
        response = { status: { code: 99, success: false }, output: "" };
    }
    if(
        response.status.code != 0 ||
        !response.status.success ||
        response.output != ""
        ){
            console.log(response);
            console.log("Failed to verify jpegtran is installed!");
            Deno.exit(2);
        }
}


const originExp = /origin_(\d)\.jpg/;

const rootDir: string = "./" + Date.now();
const rigDir: string = rootDir + "/rig";

//ensureDirSync(rootDir);
//ensureDirSync(rigDir);
for (let index = 1; index <= 6; index++) {
    ensureDirSync(`${rigDir}/${index-1}`);
}

let voidQueue: Promise<void>[] = [];
let commandQueue: Promise<IExecResponse>[] = [];
let counter=0;

for await (const dirEntry of Deno.readDir(inDir)) {
    for await (const fileEntry of Deno.readDir(inDir + dirEntry.name)) {
        if(originExp.test(fileEntry.name)){
            let num = parseInt(originExp.exec(fileEntry.name)?.[1] || "1") - 1;
            let filename = `${inDir}/${dirEntry.name}/${fileEntry.name}`
                    const command = jpgtranCommandGenerator(filename, `${rigDir}/${num}/${`${counter}`.padStart(4, "0")}.jpg`);
        //console.log(command);
        commandQueue.push(exec(
            command,
            //{ output: OutputMode.None },
        ));
            //voidQueue.push(copy(filename, `${rigDir}/${num}/${dirEntry.name}.jpg`));
        }
    }
    counter++;
}

await Promise.all(commandQueue);

console.log(`${commandQueue.length} items copied...`)

for (let id = 0; id < counter; id++) {
    for (let rig = 0; rig <= 5; rig++) {
        let fauxDate = `1997:09:02 ${Math.floor((id/60/60))%12}:${Math.floor(id/60)%60}:${id%60}`
        const command = exiftoolCommandGenerator(`${rigDir}/${rig}/${`${id}`.padStart(4, "0")}.jpg`, `Pro2_Subcamera_${rig}`, fauxDate)
        console.log(command);
        /*commandQueue.push(exec(
            command,
            { output: OutputMode.Capture },
        ));*/
        // await delay(1000)
    }
}

await Promise.all(commandQueue);
