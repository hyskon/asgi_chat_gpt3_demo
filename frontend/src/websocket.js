class WebSocketService {

    static instance = null;
    // will be populated through the convienient methods below
    callbacks = {};

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }


    constructor() { 
        this.socketRef = null;
    }

    connect() {
        const path = 'ws://127.0.0.1:8000/ws/chat/test/';
        this.socketRef = new WebSocket(path);
        this.socketRef.onopen = () => {
            console.log('websocket is open');
        };
        this.socketRef.onmessage = e => {
            // sending a message
        };
        this.socketRef.onerror = e => {
            console.log(e.message);
        };
        this.socketRef.onclose = () => {
            console.log('websocket closed');
            this.connect();
        };
    }

    socketNewMessage(data) {
        const parsedData = JSON.parse(data);
        const command = parsedData.command;
        if (Object.keys(this.callbacks).length === 0){
            return
        }
        if (command === 'messages') {
            this.callbacks[command](parsedData.messages);
        }
        if (command === 'new_message') {
            this.callbacks[command](parsedData.message);
        }
    }
    
    fetchMessages(username) {
        this.sendMessage({
            command: 'fetch_messages',
            username: username
        });
    }

    newChatMessage(message) {
        this.sendMessage({
            command: 'new_messages',
            from: message.from,
            message: message.content
        });
    }

    // Conveniant method for adding callback on the chat class
    addCallbacks(messagesCallback, newMessageCallback) {
        this.callbacks['messages'] = messagesCallback;
        this.callbacks['new_message'] = newMessageCallback;
    }

    // the actual sending of a message to the socket
    sendMessage(data) {
        try {
            this.socketRef.send(JSON.stringify({...data}));
        } catch (err) {
            console.log(err.message);
        }
    }

    state() {
        return this.socketRef.readyState;
    }

    waitForSocketConnection(callback) {
        const socket = this.socketRef;
        const recursion = this.waitForSocketConnection;
        // ensures this method continuously called until it is connected
        setTimeout(            
            function () {
                if (socket.readyState === 1 ){
                    console.log('connection is established');
                    // when connection is established it will stop
                    if (callback != null) {
                        callback();
                    }
                    return
                } else {
                   console.log('waiting for connection');
                   // it will reiterate to establish connection
                   recursion(callback);
                }
        }, 1);
    }
}

// grab an actual instance of the socket connection
const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;
