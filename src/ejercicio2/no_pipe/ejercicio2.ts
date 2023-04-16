import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {spawn} from 'child_process';

/**
 * Funcion de comandos para ejercicio sin pipe
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
        characteres: {
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
        if(argv.characteres) {
            chars = true;
        }
        if (lines) {
            const lines = spawn( 'grep', ['-c', '^', argv.file]);
            let linesOutput = 0;
            lines.stdout.on('data', (info) => linesOutput = info);
            lines.on('close', () => { 
            console.log(`Número de líneas: ${linesOutput}`);
            });
        }
        if (words) {
            const cat = spawn('cat', ['src/ejercicio-1/file.txt']);
            
            cat.stdout.on('data', (data) => {
            const wc = spawn('wc', ['-w']);
            wc.stdin.write(data);
            wc.stdin.end();
            wc.stdout.on('data', (data) => {
                console.log(`Número de palabras: ${data}`);
            }); 
            });
        }
        if (chars) {
            const cat = spawn('cat', ['src/ejercicio-1/file.txt']);
        
            cat.stdout.on('data', (data) => {
            const wc = spawn('wc', ['-c']);
            wc.stdin.write(data);
            wc.stdin.end();
            wc.stdout.on('data', (data) => {
                console.log(`Número de caracteres: ${data}`);
            }); 
            });
        }
    })
    .help()
    .argv;
}

commands();