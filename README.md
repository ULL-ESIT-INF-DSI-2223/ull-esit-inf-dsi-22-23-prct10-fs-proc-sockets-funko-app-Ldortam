# Informe de práctica
#### Autora: Laura Dorta Marrero

## Índice
1. [Resumen](#resumen)
2. [Coveralls](#coveralls)
2. [Práctica](#práctica)
3. [Modificación](#modificación)
4. [Conclusiones](#conclusiones)
5. [Referencias](#referencias)

## Resumen
<!-- qué se hace y para que se hace -->
Esta práctica consiste en resolver tres ejercicios haciendo uso de lo aprendido en clase, el módulo `fs`, el módulo `child_process` y el módulo `net`. Será necesario familiarizarse con la clase `EvenmEmmiter` del módulo `Events`, además de volver a utilizar los paquetes `yargs` y `chalk`.

## Coveralls

[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-Ldortam/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct10-fs-proc-sockets-funko-app-Ldortam?branch=main)

## Práctica
<!-- Explicar desarrollo de la prácica -->
1. [Ejercicio 1](#ejercicio-1)
2. [Ejercicio 2](#ejercicio-2)
2. [Ejercicio 3](#ejercicio-3)

### Ejercicio 1
En este ejercicio se nos da el siguiente ejemplo de código que hace uso del módulo `fs`:

```typescript
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];

  access(filename, constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filename} does not exist`);
    } else {
      console.log(`Starting to watch file ${filename}`);

      const watcher = watch(process.argv[2]);

      watcher.on('change', () => {
        console.log(`File ${filename} has been modified somehow`);
      });

      console.log(`File ${filename} is no longer watched`);
    }
  });
}
```

Y se nos hacen las siguiente preguntas:

- Realizar la traza de ejecucción (paso a paso):

    Suponiendo que durante la ejecución del programa no hay error alguno y se introduce el nombre de un fichero que es detectable y accesible. Para empezar entrará a la pila de llamadas la función access y al ejecutarse, esta saldrá de la pila de llamadas y el resultado de su ejecución pasará a la cola de manejadores. Esto significa que 
    ``` typescript
    console.log("Starting to watch file ${filename}"); 
    ``` 
    pasará a la pila de llamadas para ejecutarse. Tras esto, entrará a la pila de llamadas la función watch, que se ejecutará en segundo plano al tratarse de una función asíncrona. Seguidamente se añadirá a la pila de llamadas la creación del listener sobre watcher. Para finalizar, pasará a la pila de llamadas la última sentencia del callback, 
    ``` typescript 
    console.log("File ${filename} is no longer watched");
    ```
    , ejecutándose y mostrando el contenido por pantalla.

    La pila de llamadas y la cola de manejadores están vacías y en el registro de eventos de la API se encuentra el listener de watcher. Cada vez que suceda un cambio en el fichero, watcher emitirá eventos change. Estos eventos desencadenarán que el callback del listener pase a la cola de manejadores, tras lo que pasarán en orden de entrada a la pila de llamadas, ejecutándose en orden LIFO (Last In, First Out).

- ¿Qué hace la función access? 
    Esta se utiliza para verificar si un archivo o directorio existe y si el usuario actual tiene permiso de acceso para realizar la operación especificada en el archivo o directorio.

- ¿Para qué sirve el objeto constants?
    Este contiene constantes que representan modos de acceso para archivos y directorios.

### Ejercicio 2

Este ejercicio consiste en almacenar información sobre el número de líneas, palabras o caracteres que contiene un fichero de texto y mostrar de esa información lo que desee el usuario.

El ejercicio se lleva a cabo de dos maneras distintas:
- Haciendo uso del método pipe de un Stream para poder redirigir la salida de un comando hacia otro.

- Sin hacer uso del método pipe, solamente creando los subprocesos necesarios y registrando manejadores a aquellos eventos necesarios para implementar la funcionalidad solicitada.

#### PIPE
```typescript
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
```

#### NO PIPE 
```typescript
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
```

## Modificación
Este ejercicio, explicado de la manera más sencilla, consistía en crear una conexion entre un servidor y un cliente haciendo uso de sockets. Por tanto, se creó un .ts para el sservidor, otro para el cliente y otro llamado eventEmitterClient, además del .json que era como se transmitían los mensajes.

No llegué a terminar este código.

### SERVIDOR
```typescript
import net from 'net';
import {watchFile} from 'fs';

/**
 * Nombre del fichero a usar
 */
  const fileName = 'mensaje.json'
  /**
   * Servidor conectado con el servidor
   */
  net.createServer((connection) => {
    console.log('A client has connected.');
/**
 * Manda mensaje del fichero
 */
    connection.write(JSON.stringify({'type': 'read', 'file': fileName}) +
      '\n');

    watchFile(fileName, (curr, prev) => {
      connection.write(JSON.stringify({
        'type': 'change', 'prevSize': prev.size, 'currSize': curr.size}) +
         '\n');
    });

    connection.on('close', () => {
      console.log('A client has disconnected.');
    });
  }).listen(60300, () => {
    console.log('Waiting for clients to connect.');
  });

```

### CLIENTE
```typescript
import {connect} from 'net';
import {MessageEventEmitterClient} from './eventEmitterClient.js';
/**
 * Constante cliente que utiliza la clase MessageEventEmitterClient
 * para conectarse
 */
const client = new MessageEventEmitterClient(connect({port: 60300}));
/**
 * Recibe mensaje del servidor
 */
client.on('message', (message) => {
  if (message.type === 'watch') {
    console.log(`Connection established: watching file ${message.file}`);
  } else if (message.type === 'change') {
    console.log('File has been modified.');
    console.log(`Previous size: ${message.prevSize}`);
    console.log(`Current size: ${message.currSize}`);
  } else {
    console.log(`Message type ${message.type} is not valid`);
  }
});
```

### EVENTEMITTERCLIENT SOURCE
```typescript
import {EventEmitter} from 'events';
/**
 * Clase MEssageEventEmmiter del Cliente
 */
export class MessageEventEmitterClient extends EventEmitter {
    /**
     * Constructor de la clase
     * @param connection Elemento de la clase EventEmiter
     */
  constructor(connection: EventEmitter) {
    super();

    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;

      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        this.emit('message', JSON.parse(message));
        messageLimit = wholeData.indexOf('\n');
      }
    });
  }
}
```

### EVENTEMITTERCLIENT TEST
```typescript
import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitterClient} from '../../src/mod/eventEmitterClient';

describe('MessageEventEmitterClient', () => {
  it('Should emit a message event once it gets a complete message', (done) => {
    const socket = new EventEmitter();
    const client = new MessageEventEmitterClient(socket);

    client.on('message', (message) => {
      expect(message).to.be.eql({'type': 'change', 'prev': 13, 'curr': 26});
      done();
    });

    socket.emit('data', '{"type": "change", "prev": 13');
    socket.emit('data', ', "curr": 26}');
    socket.emit('data', '\n');
  });
});
```

## Conclusiones
<!-- propuestas de mejoras, con que me quedé al final -->
En conclusión esta práctica nos ha hecho trabajar de manera más directa con muchas de las funcionalidades de Node y viendo que la mayoría de estos conceptos son fundamentales para la programación de hoy en día es importante que se vean y práctiquen. 

## Referencias

[Práctica referenciada](https://ull-esit-inf-dsi-2223.github.io/prct09-filesystem-funko-app/).

[Estructura básica de proyecto](https://ull-esit-inf-dsi-2223.github.io/typescript-theory/typescript-project-setup.html).

[GitHub Pages](https://pages.github.com/).