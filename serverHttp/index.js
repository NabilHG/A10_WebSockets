
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
                    socket.onmessage = function (evt) {
                        console.log("text del servidor:", evt.data);
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









