importScripts('/lib/@aspnet/signalr/dist/webworker/signalr.js');

var connection = null;

onmessage = function (e) {
    if (connection === null) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(e.data + "/chatHub")
            .build();

        connection.on("ReceiveMessage", function (user, message) {
            //postMessage(`https://www.google.ru/search?q=${message}`);
            console.log(`https://www.google.ru/search?q=${message}`);
            //window.open('https://www.google.ru/search?q=${message}', '_blank');
        });

        connection.start().then(function () {
            postMessage('connected');
        });
    } else if (connection.connectionState == signalR.HubConnectionState.Connected) {
        connection.invoke("SendMessage", e.data.user, e.data.message);
    } else {
        postMessage('Attempted to send message while disconnected.')
    }
};