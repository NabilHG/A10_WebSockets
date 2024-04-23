
let info = document.getElementById("info");

document.getElementById("register").addEventListener("click", function () {
    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', nick);
    form.append('pass', pass);

    fetch("http://localhost:3000/register", {
        method: "POST",
        body: form,
    })
        .then((resp) => {
            if (!resp.ok) {
                throw new Error('nnnn failed');
            }
            return resp.json(); // Devuelve la promesa que resuelve con los datos JSON
        })
        .then((data) => {
            info.innerHTML = data.message;
        })
        .catch((error) => {
            info.innerHTML = "Error: " + error;
        });
});

let socket;

document.getElementById("login").addEventListener('click', function () {

    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', nick);
    form.append('pass', pass);


    fetch("http://localhost:3000/login", {
        method: "POST",
        body: form,
    }).then(function (resp) {
        if (!resp.ok) {
            throw new Error('Request failed');
        }
        resp.json().then(
            function (respJson) {
                if (respJson.exist) {
                    socket = new WebSocket("ws://localhost:8090");
                    socket.onmessage = function (data) {

                        let userConnectedDisplay = document.getElementById("usersConnected").getElementsByTagName("div");
                        let dataUser = JSON.parse(data.data);
                        console.log(dataUser, "data");
                        
                        // printing all users connected when first log in
                        if (dataUser.connectedUsers) {
                            let usersConnectedElement = document.getElementById("usersConnected");
                            usersConnectedElement.innerHTML = '';

                            if (Array.isArray(dataUser.connectedUsers)) {
                                for (let i = 0; i < dataUser.connectedUsers.length; i++) {
                                    let user = dataUser.connectedUsers[i];
                                    if (user.nick) {
                                        let divToAppend = document.createElement("div");
                                        divToAppend.setAttribute("data-nick", user.nick);
                                        divToAppend.setAttribute("data-pass", user.pass);
                                        divToAppend.textContent = user.nick;
                                        divToAppend.addEventListener('click', function () {
                                            let input = document.getElementById("inputMsg");
                                            input.value = "[@" + this.getAttribute('data-nick') + "]";
                                            console.log(divToAppend.getAttribute('data-nick'), '1');
                                            console.log(divToAppend.getAttribute('data-pass'), '2');
                                        })
                                        usersConnectedElement.appendChild(divToAppend);
                                    }
                                }
                            }
                        }
                        console.log("text del servidor:", dataUser);
                        console.log("NICK:", dataUser.nick);
                        console.log("Add:", dataUser.addUser);

                        let userConnectedArray = Array.from(userConnectedDisplay);
                        //removing any repeated user in the display before uploading
                        for (let i = 0; i < userConnectedArray.length; i++) {
                            const element = userConnectedArray[i];
                            let nickUserDisplay = element.getAttribute("data-nick");
                            let passUserDisplay = element.getAttribute("data-pass");
                            if (dataUser.nick == 'undefined' || nickUserDisplay == 'undefined') {
                                element.remove();
                            }

                            if (dataUser.nick === nickUserDisplay && dataUser.pass === passUserDisplay) {
                                if (!dataUser.addUser) {
                                    element.remove();
                                }
                                break;
                            }
                        }
                        
                        //printing new users connected 
                        if (!userConnectedArray.some(element => element.getAttribute("data-nick") === dataUser.nick && element.getAttribute("data-pass") === dataUser.pass)) {
                            let divToAppend = document.createElement("div");
                            divToAppend.setAttribute("data-nick", dataUser.nick);
                            divToAppend.setAttribute("data-pass", dataUser.pass);
                            divToAppend.innerHTML = dataUser.nick;
                            if (typeof dataUser.nick !== 'undefined' && dataUser.nick !== 'undefined') {
                                divToAppend.addEventListener('click', function () {
                                    let input = document.getElementById("inputMsg");
                                    input.value = "[@" + this.getAttribute('data-nick') + "]";
                                    console.log(divToAppend.getAttribute('data-nick'), '3');
                                    console.log(divToAppend.getAttribute('data-pass'), '4');
                                })
                                document.getElementById("usersConnected").appendChild(divToAppend);
                            }
                        }

                        console.log(dataUser, "send");
                        //handling message
                        if(dataUser.message){
                            console.log("From " + dataUser.from + ": " + dataUser.message);
                        } else{
                            console.log(dataUser.messageObj, "QQ");
                        }
                    };

                    socket.onopen = function (evt) {
                        info.innerHTML = "Login successful, with user: " + nick;
                        //checking connexion is ready
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({ "nick": nick, "pass": pass }));
                        }
                        socket.send(JSON.stringify({ "request": "getConnectedUsers" }));
                    };
                    socket.onclose = function (evt) {
                        info.innerHTML = "Log out successful, with user: " + nick;

                        let userConnectedDisplay = document.getElementById("usersConnected").getElementsByTagName("div");
                        let userConnectedArray = Array.from(userConnectedDisplay);

                        for (let i = 0; i < userConnectedArray.length; i++) {
                            const element = userConnectedArray[i];
                            let nickUserDisplay = element.getAttribute("data-nick");
                            let passUserDisplay = element.getAttribute("data-pass");

                            // check if user exist
                            if (nick === nickUserDisplay && pass === passUserDisplay) {
                                element.remove();
                                break;
                            }
                        }
                    }
                } else {
                    info.innerHTML = respJson.message;
                }
            }
        )
    }).catch((error) => {
        info.innerHTML = "Error: " + error;
    });
});

document.getElementById("logOut").addEventListener('click', function () {

    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', nick);
    form.append('pass', pass);

    fetch("http://localhost:3000/logOut", {
        method: "POST",
        body: form,
    }).then(function (resp) {
        if (!resp.ok) {
            throw new Error('Request failed');
        }
        resp.json().then(
            function (respJson) {
                if (respJson.exist) {
                    socket.send(JSON.stringify({ "nick": nick, "pass": pass, "close": true }));
                } else {
                    info.innerHTML = respJson.message;
                }
            }
        )
    }).catch((error) => {
        info.innerHTML = "Error: " + error;
    });
});

document.getElementById("btnSend").addEventListener('click', function () {
    console.log("dd");
    let input = document.getElementById("inputMsg");
    let nick = extractContentNick(input.value);
    let message = extractContentMsg(input.value);
    let nickAuthor = document.getElementById("nick").value;
    console.log(nick);
    console.log(message);
    console.log("To " + nick + ": " + message);
    socket.send(JSON.stringify({ "message": message, "nickMsg": nick, "nickAuthor": nickAuthor, "send": true }));

});

function extractContentNick(msg) {
    const match = msg.match(/\[@(.*?)\]/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

function extractContentMsg(msg) {
    const match = msg.match(/.*\](.*)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}