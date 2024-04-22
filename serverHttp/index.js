
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
                        console.log(document.getElementById("nick").value, "?");
                        let dataUser = JSON.parse(data.data);

                        console.log("text del servidor:", dataUser);
                        console.log("NICK:", dataUser.nick);
                        console.log("Add:", dataUser.addUser);
                        let userConnectedDisplay = document.getElementById("usersConnected").getElementsByTagName("div");

                        let userConnectedArray = Array.from(userConnectedDisplay);

                        for (let i = 0; i < userConnectedArray.length; i++) {
                            const element = userConnectedArray[i];
                            let nickUserDisplay = element.getAttribute("data-nick");
                            let passUserDisplay = element.getAttribute("data-pass");

                            // check if user exist
                            if (dataUser.nick === nickUserDisplay && dataUser.pass === passUserDisplay) {
                                if (!dataUser.addUser) {
                                    element.remove();
                                }
                                break;
                            }
                        }

                        if (!userConnectedArray.some(element => element.getAttribute("data-nick") === dataUser.nick && element.getAttribute("data-pass") === dataUser.pass)) {
                            let divToAppend = document.createElement("div");
                            divToAppend.setAttribute("data-nick", dataUser.nick);
                            divToAppend.setAttribute("data-pass", dataUser.pass);
                            divToAppend.innerHTML = dataUser.nick;

                            document.getElementById("usersConnected").appendChild(divToAppend);
                        }

                    };

                    socket.onopen = function (evt) {
                        //TODO
                        //Request to server all the users connected
                        info.innerHTML = "Login successful, with user: " + nick;
                        //checking connexion is ready
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({ "nick": nick, "pass": pass }));
                        }
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
                console.log(respJson,"asdsd");
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









