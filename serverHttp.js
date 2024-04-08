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

app.post('/register', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const nick = fields.nick;
    const pass = fields.pass;

    const user = {
      nick,
      pass
    };

    let userData = [];
    try {
      userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') {
        userData = [];
        console.log('User data file not found, creating a new one.');
      } else if (err.message === 'Unexpected end of JSON input') {
        console.error('Error reading user data: Unexpected end of JSON input. Check for missing braces or extra characters in the file.');
      } else {
        console.error('Error reading user data:', err);
      }
    }

    userData.push(user);

    const updatedUserData = JSON.stringify(userData, null, 2);

    fs.writeFile(userDataFile, updatedUserData, (err) => {
      if (err) {
        console.error('Error writing user data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      console.log('User data saved successfully!');
      return res.json({ message: 'Registration successful' });
    });
  });
});

const server = app.listen(3000, () => {
  console.log("Server started at 3000");
});
// const server = http.createServer( (req,res)=>{
//    console.log("Server iniciat a 8089",req)

//   let filePath = path.join(__dirname, req.url);
//   fs.access(filePath,fs.constants.F_OK,(error)=>{
//       if(error){
//           res.write("recurs innexistent");
//           res.end();
//           return;
//       }
//       fs.readFile(filePath,(err,data)=>{
//           if(err){
//               res.write("no s'ha pogut llegir el recurs")
//               res.end();
//               return;
//           }
//           res.write(data);
//           res.end();
//           return;
//       })
//   })
// })
// server.listen(8089,()=>{
//   console.log("Server iniciat a 8089")
// })

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
    console.log("WebSocket");
    const connexio = request.accept(null, request.origin);
    connexio.on('message', (message) => {
        console.log("Missatge rebut", message.utf8Data);
    });
    connexio.on('close', () => {
        connexio.close();
        console.log("Tancada la connexió");
    })
});
