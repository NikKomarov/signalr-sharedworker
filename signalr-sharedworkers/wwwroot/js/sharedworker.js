importScripts('/lib/@aspnet/signalr/dist/webworker/signalr.js');

var connection = null;
var clients = new Array();

onconnect = function (e) {
    var port = e.ports[0];
    clients.push(port);
    port.onmessage = function (e) {
        if (e.data.type === 'init') {
            if (connection === null) {
                connection = new signalR.HubConnectionBuilder()
                    .withUrl(e.data.location + "/chatHub")
                    .build();

                connection.on("ReceiveMessage", function (user, message) {
                    console.log(clients);

                    //отправляем сообщение всем
                    //for (var i = 0; i < clients.length; i++) {
                    //    clients[i].postMessage(`https://www.google.ru/search?q=${message}`);
                    //}

                    //отправляем сообщение только последнему, так как он скорее всего самый живой
                    clients[clients.length - 1].postMessage(
                        {
                            type: 'openUrl',
                            url: `https://www.google.ru/search?q=${message}`
                        });

                });

                connection.start().then(function () {
                    port.postMessage('connected');
                });
            }
            else {
                port.postMessage('connection already established');
            }
        } else if (e.data.type === 'message' && connection.connectionState == signalR.HubConnectionState.Connected) {
            connection.invoke("sendmessage", e.data.user, e.data.message);
        } else if (e.data.type === 'message') {
            port.postMessage('attempted to send message while disconnected.');
        } else if (e.data.type === 'close') {
            clients.splice(clients.indexOf(port), 1);
        }
        else {
            port.postMessage('wrong message type');
        }
    };
};
