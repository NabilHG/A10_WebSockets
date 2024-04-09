console.log("a");
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
            console.log(resp.json);
            return resp.json();
        })
        .then((respJSON) => {
            console.log(respJSON.message);
            const messageElement = document.getElementById("message"); // Assuming you have an element for displaying messages
            //messageElement.innerText = respJSON.message; // Set the message content
        })
        .catch((error) => {
            console.error('Error:', error);
            const messageElement = document.getElementById("message");
            //messageElement.innerText = "Registration failed"; // Generic error message
        });
});

let socket = new WebSocket("ws://localhost:8090");

document.getElementById("login").addEventListener('click', function () {

    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', nick);
    form.append('pass', pass);

    console.log(nick, pass, "info");
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
                    socket.onopen = function (evt) {
                        console.log("Conectat amb el servidor");
                        socket.send('{nick:' + nick + ', pass:' + pass + '}');
                    };
                }
            }
        )
    }).catch(error => console.error('Error:', error));



})


socket.onmessage = function (evt) {
    console.log("text del servidor:", evt.data);
};

socket.onclose = function (evt) {
    console.log("El server tanca la connexio");
};



