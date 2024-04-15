
let info = document.getElementById("info");

document.getElementById("register").addEventListener("click", function () {
    console.log("client")
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
        console.log(data);
        info.innerHTML = JSON.stringify(data.message); // Aquí puedes manipular los datos como desees
    })
    .catch((error) => {
        console.error('Error:', error);
        const messageElement = document.getElementById("message");
    });
});

let socket;

document.getElementById("login").addEventListener('click', function () {

    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', nick);
    form.append('pass', pass);

    console.log(nick, pass, "info");
    console.log(JSON.stringify({ "nick": nick, "pass": pass }));
    fetch("http://localhost:3000/login", {
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
                    socket = new WebSocket("ws://localhost:8090");
                    socket.onopen = function (evt) {
                        console.log("Conectat amb el servidor");
                        socket.send(JSON.stringify({ "nick": nick, "pass": pass }));
                    };
                }
            }
        )
    }).catch(error => console.error('Error:', error));
});

document.getElementById("logOut").addEventListener('click', function () {

    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', nick);
    form.append('pass', pass);

    console.log(nick, pass, "info");
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
                    console.log("cerrando desde el cliente");
                    socket.send(JSON.stringify({ "nick": nick, "pass": pass, "close": true }));
                    socket.onclose = function (evt) {
                        console.log("Log Out");
                    }
                }
            }
        )
    }).catch(error => console.error('Error:', error));
});



// socket.onmessage = function (evt) {
//     console.log("text del servidor:", evt.data);
// };






