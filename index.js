document.getElementById("register").addEventListener("click", function(){
    console.log("client")
    let form = new FormData();
    let nick = document.getElementById("nick").value;
    let pass = document.getElementById("pass").value;
    form.append('nick', JSON.stringify(nick));
    form.append('pass', JSON.stringify(pass));

    fetch("http://localhost:8001/register", {
        method: "POST",
        body: form
    })
        .then(
            (resp) => {
                resp.json().then(
                    (respJSON) => {
                        console.log(respJSON);
                        console.log(resp);
                    }
                )
            }
        )
});

let socket = new WebSocket("ws://localhost:8002");


document.getElementById("login").addEventListener("click", function(){
    console.log("login");
    socket.onopen = function (evt) {
    console.log("Conectat amb el servidor");
    socket.send("Hola server");
    }
    socket.onmessage = function (evt) {
    console.log("text del servidor:", evt.data);
    }
    socket.onclose = function (evt) {
    console.log("El server tanca la connexio");
    }

})
