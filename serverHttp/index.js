console.log("a");
document.getElementById("register").addEventListener("click", function(){
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

// Define WebSocket event handlers
socket.onopen = function (evt) {
  console.log("Conectat amb el servidor");
  socket.send("Hola server");
};

socket.onmessage = function (evt) {
  console.log("text del servidor:", evt.data);
};

socket.onclose = function (evt) {
  console.log("El server tanca la connexio");
};

document.getElementById("login").addEventListener("click", function(){
  console.log("login");
  // Connection should already be established at this point
  // You can send additional messages or perform actions upon login
});

