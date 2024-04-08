const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const WebSocketServer = require('websocket').server;
const http = require('http'); 
const path =require("path")

const app = express();
app.use(express.static(path.join(__dirname, 'serverHttp')));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET, POST, OPTIONS',
  headers: 'Content-Type, Authorization'
}));

app.use(bodyParser.json());

const userDataFile = 'user_data.json';

const server = app.listen(3000, () => {
  console.log("Server started at 3000");
});

app.post('/register', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(500).json({ message: 'Error parsing the form data' });
    }

    const data = fields;
    const nick = data.nick[0];
    const pass = data.pass[0];

    let userData = [];
    try {
      userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('User data file not found, creating a new one.');
      } else {
        console.error('Error reading user data:', err);
        return res.status(500).json({ message: 'Error reading user data' });
      }
    }
 
    let exist = false;
    userData.forEach(user => {
        if(user.nick === nick && user.pass === pass){
          exist = true;
        }
    });

    if (exist) {
      return res.json({ message: 'User already registered' });
    }

    userData.push({ nick, pass });
    const updatedUserData = JSON.stringify(userData, null, 2);

    fs.writeFile(userDataFile, updatedUserData, err => {
      if (err) {
        console.error('Error writing user data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      console.log('User data saved successfully!');
      return res.json({ message: 'Registration successful' });
    });
  });
});





app.post('/login', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(500).json({ message: 'Error parsing the form data' });
    }

    const { nick, pass } = fields;

    let userData = [];
    try {
      userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('User data file not found.');
        return res.status(500).json({ message: 'User data file not found' });
      } else {
        console.error('Error reading user data:', err);
        return res.status(500).json({ message: 'Error reading user data' });
      }
    }

    // Verificar si el usuario existe
    let exist = false;
    userData.forEach(user => {
        if(user.nick === nick && user.pass === pass){
          exist = true;
        }
    });

    return res.json({ exist });
  });
});



//WebSocket server

const websocketserver = http.createServer((req, res) => {
  res.write('resposta');
  res.end()
  });
  
websocketserver.listen(8090, () => { 
console.log("WebSocketServer 8090"); 
});

const ws_server = new WebSocketServer({
    httpServer: websocketserver,
    autoAcceptConnections: false
});

ws_server.on('request', (request) => {
    const connexio = request.accept(null, request.origin);
    connexio.sendUTF('Hola Cliente');

    connexio.on('message', (message) => {
        console.log("Missatge rebut", message.utf8Data);
    });
    connexio.on('close', () => {
        connexio.close();
        console.log("Tancada la connexió");
    })
});

