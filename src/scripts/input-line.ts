import * as readline from "readline";

const inputLine = (props: { message: string; }) => {
    return new Promise<string>((resolve, reject) => {
        try {
            const rli = readline.createInterface(process.stdin, process.stdout);
            rli.setPrompt(`${props.message}`);
            rli.on("line", (line) => {
                try {
                    rli.close();
                    resolve(line);
                } catch(err) {
                    reject(err);
                }
            });
            rli.prompt();
        } catch(err) {
            reject(err);
        }
    });
};

export default inputLine;