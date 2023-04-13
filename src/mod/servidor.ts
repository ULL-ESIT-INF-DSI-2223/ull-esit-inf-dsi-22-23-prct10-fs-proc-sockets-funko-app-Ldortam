import net from 'net';
import {watchFile} from 'fs';


  const fileName = 'mensaje.json'
  net.createServer((connection) => {
    console.log('A client has connected.');

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
