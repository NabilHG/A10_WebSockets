
let info = document.getElementById("info");

document.getElementById("register").addEventListener("click", function () {
    if (!matchOnGoing) {
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
    } else {
        alertForbiddenAction();
    }
});

let socket;
let matchOnGoing = false;
let turn = '';

document.getElementById("login").addEventListener('click', function () {
    if (!matchOnGoing) {
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

                                                let nickClick = this.getAttribute('data-nick');
                                                let passClick = this.getAttribute('data-pass');
                                                //adding info to a div to have the last user click, necessary to start the game
                                                document.getElementById('usersClicked').setAttribute("data-nick", nickClick);
                                                document.getElementById('usersClicked').setAttribute("data-pass", passClick);
                                            })
                                            usersConnectedElement.appendChild(divToAppend);
                                        }
                                    }
                                }
                            }

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

                                        let nickClick = this.getAttribute('data-nick');
                                        let passClick = this.getAttribute('data-pass');
                                        //adding info to a div to have the last user click, necessary to start the game
                                        document.getElementById('usersClicked').setAttribute("data-nick", nickClick);
                                        document.getElementById('usersClicked').setAttribute("data-pass", passClick);
                                    })
                                    document.getElementById("usersConnected").appendChild(divToAppend);
                                }
                            }

                            //handling message
                            if (dataUser.message) {
                                let chat = document.getElementById("chat");
                                let divToAppend = document.createElement("div");
                                divToAppend.innerHTML = "From " + dataUser.from + ": " + dataUser.message;
                                chat.appendChild(divToAppend);
                            }

                            //handling turn
                            if (dataUser.turn) {
                                turn = dataUser.turn;
                                let infoMatchTurn = document.getElementById("infoMatch");
                                infoMatchTurn.classList.remove('d-none');
                                infoMatchTurn.classList.add('d-flex');
                                infoMatchTurn.innerHTML = "Turn: " + turn;
                                let cells = document.querySelectorAll('[data-cell-index]');
                                for (let i = 0; i < dataUser.board.length; i++) {
                                    cells[i].innerHTML = dataUser.board[i];
                                }

                                //checking board
                                if(dataUser.winner !== null){
                                    matchOnGoing = false;
                                    if(dataUser.winner !== "Draw"){
                                        let symbol = dataUser.winner == 'X' ? 'X' : 'O';
                                        if(symbol == 'X'){
                                            infoMatchTurn.innerHTML = "<b>&nbsp" + dataUser.nickChallenger + "&nbsp</b> has won";
                                        } else {
                                            infoMatchTurn.innerHTML = "<b>&nbsp" + dataUser.nickOpponent + "&nbsp</b> has won";
                                        }
                                    } else {
                                        infoMatchTurn.innerHTML = "<b>Draw</b>";
                                    }
                                }
                            }

                            //handling match
                            if (dataUser.match) {
                                let infoMatch = document.getElementById("infoMatch");
                                let btnAccept = document.getElementById("btnAccept");
                                let btnDecline = document.getElementById("btnDecline");
                                infoMatch.classList.remove('d-none');
                                infoMatch.classList.add('d-flex');
                                infoMatch.innerHTML = "<b>" + dataUser.nickChallenger + "</b> &nbsp is challenging you to a game. Would you accept?";
                                //showing buttons
                                btnAccept.classList.remove('d-none');
                                btnAccept.classList.add('d-flex');
                                btnDecline.classList.remove('d-none');
                                btnDecline.classList.add('d-flex');

                                //handling decision
                                btnAccept.addEventListener('click', function () {
                                    btnAccept.classList.remove('d-flex');
                                    btnAccept.classList.add('d-none');
                                    btnDecline.classList.remove('d-flex');
                                    btnDecline.classList.add('d-none');
                                    matchOnGoing = true;
                                    infoMatch.innerHTML = "Turn: " + dataUser.nickChallenger;
                                    showPlayersPlaying(dataUser.nickChallenger, dataUser.passChallenger, dataUser.nickOpponent, dataUser.passOpponent);
                                    socket.send(JSON.stringify({ "acceptedMatch": true, "nickChallenger": dataUser.nickChallenger, "passChallenger": dataUser.passChallenger, "nickOpponent": dataUser.nickOpponent, "passOpponent": dataUser.passOpponent }));
                                });

                                btnDecline.addEventListener('click', function () {
                                    infoMatch.classList.remove('d-flex');
                                    infoMatch.classList.add('d-none');
                                    btnAccept.classList.remove('d-flex');
                                    btnAccept.classList.add('d-none');
                                    btnDecline.classList.remove('d-flex');
                                    btnDecline.classList.add('d-none');
                                    socket.send(JSON.stringify({ "acceptedMatch": false, "nickChallenger": dataUser.nickChallenger, "passChallenger": dataUser.passChallenger, "nickOpponent": dataUser.nickOpponent, "passOpponent": dataUser.passOpponent }));
                                });
                            }

                            if (dataUser.acceptedMatch) {
                                let infoMatch = document.getElementById("infoMatch");
                                infoMatch.innerHTML = "<b>" + dataUser.nickOpponent + "</b> &nbsp has accepted the match<br>Turn: " + dataUser.nickChallenger;
                                infoMatch.classList.remove('d-none');
                                infoMatch.classList.add('d-flex');
                                showPlayersPlaying(dataUser.nickChallenger, dataUser.passChallenger, dataUser.nickOpponent, dataUser.passOpponent);
                                turn = dataUser.nickChallenger;
                            } else if (dataUser.acceptedMatch == false) {
                                matchOnGoing = false;
                                let infoMatch = document.getElementById("infoMatch");
                                infoMatch.classList.remove('d-none');
                                infoMatch.classList.add('d-flex');
                                infoMatch.innerHTML = "<b>" + dataUser.nickOpponent + "</b> &nbsp has decline the match";
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
    } else {
        alertForbiddenAction();
    }

});

function showPlayersPlaying(nickChallenger, passChallenger, nickOpponent, passOpponent) {
    let playersPlaying = document.getElementById("playersPlaying");
    playersPlaying.classList.remove('d-none');
    playersPlaying.classList.add('d-flex');
    playersPlaying.innerHTML = "Current match " + nickChallenger + " as &nbsp <b>X</b> &nbsp and " + nickOpponent + " as &nbsp <b>O</b>";

    document.getElementById("playerChallenger").setAttribute("data-nick", nickChallenger);
    document.getElementById("playerChallenger").setAttribute("data-pass", passChallenger);
    document.getElementById("playerOpponent").setAttribute("data-nick", nickOpponent);
    document.getElementById("playerOpponent").setAttribute("data-pass", passOpponent);
}

document.getElementById("logOut").addEventListener('click', function () {
    if (!matchOnGoing) {
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
    } else {
        alertForbiddenAction();
    }
});

document.getElementById("btnSend").addEventListener('click', function () {
    let input = document.getElementById("inputMsg");
    let nick = extractContentNick(input.value);
    let message = extractContentMsg(input.value);
    let nickAuthor = document.getElementById("nick").value;
    let chat = document.getElementById("chat");
    let divToAppend = document.createElement("div");
    divToAppend.innerHTML = "To " + nick + ": " + message;
    chat.appendChild(divToAppend);
    socket.send(JSON.stringify({ "message": message, "nickMsg": nick, "nickAuthor": nickAuthor, "send": true }));
});

function extractContentNick(msg) {
    const match = msg.match(/\[@(.*?)\]/);
    if (match && match[1]) {
        return match[1];
    }
    return "all";
}

function extractContentMsg(msg) {
    const match = msg.match(/.*\](.*)/);
    if (match && match[1]) {
        return match[1];
    }
    return msg;
}

document.querySelectorAll('[data-cell-index]').forEach(function (cell) {
    cell.addEventListener('click', function () {
        if (turn === document.getElementById("nick").value) {
            let nickChallenger = document.getElementById("playerChallenger").getAttribute("data-nick");
            let passChallenger = document.getElementById("playerChallenger").getAttribute("data-pass");
            let nickOpponent = document.getElementById("playerOpponent").getAttribute("data-nick");
            let passOpponent = document.getElementById("playerOpponent").getAttribute("data-pass");

            if (cell.innerHTML.trim() === "") {
                if (matchOnGoing) {
                    let indexToPlace;
                    if (turn == nickChallenger) {
                        cell.innerHTML = "X";
                        indexToPlace = cell.getAttribute('data-cell-index');
                    } else if (turn == nickOpponent) {
                        cell.innerHTML = "O";
                        indexToPlace = cell.getAttribute('data-cell-index');
                    }
                    if (turn.trim() === nickOpponent.trim()) {
                        turn = nickChallenger;
                    } else if (turn.trim() === nickChallenger.trim()) {
                        turn = nickOpponent;
                    }
                    let infoMatchTurn = document.getElementById("infoMatch");
                    infoMatchTurn.classList.remove('d-none');
                    infoMatchTurn.classList.add('d-flex');
                    infoMatchTurn.innerHTML = "Turn: " + turn;
                    socket.send(JSON.stringify({ "turn": turn, "cell": cell.getAttribute('data-cell-index'), "indexToPlace": indexToPlace, "nickChallenger": nickChallenger, "passChallenger": passChallenger, "nickOpponent": nickOpponent, "passOpponent": passOpponent }));
                }
            } else {
                let infoMatchTurn = document.getElementById("infoMatch");
                infoMatchTurn.classList.remove('d-none');
                infoMatchTurn.classList.add('d-flex');
                infoMatchTurn.innerHTML = "That cell has already content";
            }
        } else {
            let infoMatchNotTurn = document.getElementById("infoMatch");
            infoMatchNotTurn.classList.remove('d-none');
            infoMatchNotTurn.classList.add('d-flex');
            infoMatchNotTurn.innerHTML = "<b>&nbsp;Not your turn</b>";
        }
    });
});

document.getElementById("btnStart").addEventListener('click', function () {
    if (!matchOnGoing) {
        let userClicked = document.getElementById("usersClicked");
        let nickOpponent = userClicked.getAttribute('data-nick');
        let passOpponent = userClicked.getAttribute('data-pass');
        let nickChallenger = document.getElementById("nick").value;
        let passChallenger = document.getElementById("pass").value;
        if (nickOpponent == '' && passOpponent == '') {
            document.getElementById('errorNotify').innerHTML = "Before starting a match, choose an opponent";
        } else {
            document.getElementById('errorNotify').innerHTML = "";
            let infoMatchPreview = document.getElementById("infoMatch");
            infoMatchPreview.classList.remove('d-none');
            infoMatchPreview.classList.add('d-flex');
            infoMatchPreview.innerHTML = "Waiting for <b>&nbsp;" + nickOpponent + "&nbsp;</b> to accept the match";
            matchOnGoing = true;
            socket.send(JSON.stringify({ "match": true, "nickChallenger": nickChallenger, "passChallenger": passChallenger, "nickOpponent": nickOpponent, "passOpponent": passOpponent }));
        }
    } else {
        alertForbiddenAction();
    }
});

function alertForbiddenAction() {
    let infoMatchOnGoing = document.getElementById("infoMatch");

    infoMatchOnGoing.classList.remove('d-none');
    infoMatchOnGoing.classList.add('d-flex');

    infoMatchOnGoing.innerHTML = "Can not do that action while playing";

    setTimeout(() => {
        infoMatchOnGoing.classList.remove('d-flex');
        infoMatchOnGoing.classList.add('d-none');
        showingForbbidenAction = false;
    }, 2000);
}