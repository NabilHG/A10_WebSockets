
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
                        let dataUser = JSON.parse(data.data);
                        console.log("text del servidor:", dataUser);
                        console.log("NICK:", dataUser.nick);
                        let userConnectedDisplay = document.getElementById("usersConnected").getElementsByTagName("div");

                        // Convierte userConnectedDisplay en un array utilizando Array.from
                        let userConnectedArray = Array.from(userConnectedDisplay);

                        // Ahora puedes usar forEach en userConnectedArray
                        userConnectedArray.forEach(function (element) {
                            let nickUserDisplay = element.getAttribute("data-nick");
                            let passUserDisplay = element.getAttribute("data-pass");
                            console.log(dataUser.nick, "nickFromServe");
                            console.log(nickUserDisplay, "nickFromFront");

                            if (dataUser.nick == nickUserDisplay && dataUser.pass == passUserDisplay && !dataUser.addUser) {
                                console.log("delete from view");
                            }

                            let divToAppend = document.createElement("div");
                            divToAppend.setAttribute("data-nick", nickUserDisplay);
                            divToAppend.setAttribute("data-pass", passUserDisplay);
                            divToAppend.innerHTML = nickUserDisplay;

                            // Agrega el nuevo div al final del div con el ID "usersConnected"
                            document.getElementById("usersConnected").appendChild(divToAppend);
                        });


                        console.log(userConnectedDisplay[0].getAttribute("data-nick"));
                    };
                    socket.onopen = function (evt) {
                        info.innerHTML = "Login successful, with user: " + nick;
                        socket.send(JSON.stringify({ "nick": nick, "pass": pass }));
                    };
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
                console.log(respJson);
                if (respJson.exist) {
                    socket.send(JSON.stringify({ "nick": nick, "pass": pass, "close": true }));
                    socket.onclose = function (evt) {
                        info.innerHTML = "Log out successful, with user: " + nick;
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









