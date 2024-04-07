const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const WebSocketServer = require('websocket').server;

// Http server
const app = express();
app.use(cors());
app.use(bodyParser.json());

const userDataFile = 'user_data.json';

app.post('/register', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8001');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        const nick = fields.nick;
        const pass = fields.pass;

        // Create user object
        const user = {
            nick,
            pass
        };

        // Read existing user data (if any)
        let userData = [];
        try {
          userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
        } catch (err) {
          if (err.code === 'ENOENT') {
            userData = []; // Initialize empty array if file doesn't exist
            console.log('User data file not found, creating a new one.');
          } else if (err.message === 'Unexpected end of JSON input') {
            console.error('Error reading user data: Unexpected end of JSON input. Check for missing braces or extra characters in the file.');
          } else {
            console.error('Error reading user data:', err);
          }
        }
        

        // Add new user to the data
        userData.push(user);

        // Stringify the updated user data
        const updatedUserData = JSON.stringify(userData, null, 2);

        fs.writeFile(userDataFile, updatedUserData, (err) => {
            if (err) {
                console.error('Error writing user data:', err);
        
                // Check for specific error codes and provide informative messages
                if (err.code === 'ENOENT') {
                    res.status(500).json({ message: 'Failed to save user data: File not found.' });
                } else if (err.code === 'EACCES') {
                    res.status(500).json({ message: 'Failed to save user data: Permission error.' });
                } else {
                    // Handle other generic errors
                    res.status(500).json({ message: 'Registration failed' });
                }
                return;
            }
            console.log('User data saved successfully!');
            res.json({ message: 'Registration successful' }); // Send success message
        });
        
    });
});

const server = app.listen(8001, () => {
    console.log("Server started at 8001");
});

//WebSocket server
const ws_server = new WebSocketServer({
    httpServer: server,
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
