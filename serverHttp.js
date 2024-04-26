const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const WebSocketServer = require('websocket').server;
const http = require('http');
const path = require("path");
const { match } = require('assert');

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
      if (user.nick === nick && user.pass === pass) {
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


app.post('/login', async (req, res) => {
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
      if (user.nick === nick && user.pass === pass) {
        exist = true;
      }
    });

    if (exist) {
      return res.json({ exist: true, message: 'User found' });
    } else {
      return res.json({ exist: false, message: 'User not found' });
    }
  });
});

app.post('/logOut', async (req, res) => {
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
      if (user.nick === nick && user.pass === pass) {
        exist = true;
      }
    });

    if (exist) {
      return res.json({ exist: true, message: 'User found' });
    } else {
      return res.json({ exist: false, message: 'User not found' });
    }
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

let connexions = [];

ws_server.on('request', (request) => {
  const conn = request.accept(null, request.origin);

  conn.on('message', (message) => {
    if (message.type === 'utf8') {
      try {
        console.log(message.utf8Data);
        const userData = JSON.parse(message.utf8Data);

        //send users connected first time log in
        if (userData.request === "getConnectedUsers") {
          const connectedUsers = connexions.map(conn => ({ nick: conn.nick, pass: conn.pass }));
          conn.send(JSON.stringify({ connectedUsers: connectedUsers }));
        }

        //send message
        if (userData.send) {
          let messageObj = { from: userData.nickAuthor, message: userData.message };
          let userToSendMsg = connexions.find(conn => conn.nick === userData.nickMsg);
          if (userData.nickMsg !== 'all') {
            if (userToSendMsg) {
              userToSendMsg.conn.send(JSON.stringify(messageObj));
            }
          } else {
            connexions.forEach(conn => {
              if(typeof conn.nick !== 'undefined' && conn.nick !== 'undefined'){
                conn.conn.send(JSON.stringify(messageObj));
              }
            });
          }

        }

        //manage match
        if(userData.match){
          connToMatch = connexions.find(conexion => conexion.nick === userData.nickOpponent && conexion.pass === userData.passOpponent);
          if(connToMatch){
            connToMatch.conn.send(JSON.stringify({ "match": true, "nickChallenger": userData.nickChallenger, "passChallenger": userData.passChallenger, "nickOpponent": userData.nickOpponent, "passOpponent": userData.passOpponent }));
          } else {
            console.log("not found");
          }
        }

        if(userData.acceptedMatch){
          console.log(userData, "acceptedMatch");
          connToMatchChallenger = connexions.find(conexion => conexion.nick === userData.nickChallenger && conexion.pass === userData.passChallenger);
          console.log(connToMatchChallenger, "**");
          connToMatchChallenger.conn.send(JSON.stringify({ "acceptedMatch": true, "nickChallenger": userData.nickChallenger, "passChallenger": userData.passChallenger, "nickOpponent": userData.nickOpponent, "passOpponent": userData.passOpponent }));
        } else if(userData.acceptedMatch == false) {
          console.log(userData, "Not acceptedMatch");
          connToMatchChallenger = connexions.find(conexion => conexion.nick === userData.nickChallenger && conexion.pass === userData.passChallenger);
          console.log(connToMatchChallenger, "?");
          connToMatchChallenger.conn.send(JSON.stringify({ "acceptedMatch": false, "nickChallenger": userData.nickChallenger, "passChallenger": userData.passChallenger, "nickOpponent": userData.nickOpponent, "passOpponent": userData.passOpponent }));
        }

        //add conexion
        userData.conn = conn;
        addConn(connexions, userData.nick, userData.pass, userData.conn);

        //to close connexion
        let connToDelete;
        let addUser = true;

        if (userData.close) {
          connToDelete = connexions.find(conexion => conexion.nick === userData.nick && conexion.pass === userData.pass);
          if (connToDelete) {
            addUser = false;
            connToDelete.conn.close();
            connexions.splice(connexions.indexOf(connToDelete), 1);
          }
        }

        //send all conexiones new user logged in
        connexions.forEach(conn => {
          conn.conn.send(JSON.stringify({ "nick": userData.nick, "pass": userData.pass, "addUser": addUser }));
        });

      } catch (error) {
        console.error("Error al analizar los datos del usuario:", error);
      }
    }
  });

  conn.on('close', () => {
    console.log("Tancada la connexió");
  });
});


function addConn(connexions, nick, pass, conn) {

  const existUser = connexions.some(user => user.nick === nick && user.pass === pass);

  if (!existUser) {
    connexions.push({ nick: nick, pass: pass, conn: conn });
    console.log(`Usuario ${nick} añadido.`);
  } else {
    console.log(`El usuario ${nick} ya existe.`);
  }
}


