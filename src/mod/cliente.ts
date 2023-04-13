
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
