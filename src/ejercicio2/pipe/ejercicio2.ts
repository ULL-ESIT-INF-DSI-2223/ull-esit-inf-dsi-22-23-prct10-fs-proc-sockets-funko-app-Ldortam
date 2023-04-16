import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {spawn} from 'child_process';

/**
 * Funcion de comandos para ejercicio con pipe
 */
export function commands() {
    const commands = hideBin(process.argv);

    yargs(commands)
    .command('info', 'File info', {
        file: {
            description: 'file',
            type: 'string',
            demandOption: true
        },
        lines: {
            description: 'lines',
            demandOption: false
        },
        words: {
            description: 'words',
            demandOption: false
        },
        characters: {
            description: 'chars',
            demandOption: false
        }
    }, (argv) => {
        let lines = false;
        let words = false;
        let chars = false;
        if (argv.lines) {
            lines = true;
        }
        if(argv.words) {
            words = true;
        }
        if(argv.characters) {
            chars = true;
        }
        if (lines) {
            const lines = spawn( 'grep', ['-c', '^', argv.file]);
            lines.stdout.pipe(process.stdout);
        }
        if (words) {
            const fileContent = spawn('cat', [argv.file]);
            const wc = spawn('wc', ['-w']);
            fileContent.stdout.pipe(wc.stdin);
            wc.stdout.pipe(process.stdout);
        }
        if (chars) {
            const fileContent = spawn('cat', [argv.file]);
            const wc = spawn('wc', ['-c']);
            fileContent.stdout.pipe(wc.stdin);
            wc.stdout.pipe(process.stdout);
        }
    })
    .help()
    .argv;
}

commands();