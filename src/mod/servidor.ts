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
