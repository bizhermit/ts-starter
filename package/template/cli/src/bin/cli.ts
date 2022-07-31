#! /usr/bin/env node

import cli from "@bizhermit/cli-sdk";
import { getNumberTextAsync, getNumberTextSync } from "../dist";

(async () => {
    const cwd = process.cwd();
    const args = cli.getArgs();
    cli.wl(`workingDir: ${cwd}`);
    args.forEach(arg => {
        cli.wl(`  ${arg}`);
    });
    const inputedTextLine = await cli.rl(`input text > `);
    console.log(inputedTextLine);
    
    let text = getNumberTextSync();
    console.log(text);
    text = await getNumberTextAsync();
    console.log(text);
})();