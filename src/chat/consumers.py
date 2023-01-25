# chat/consumers.py
import json
import openai
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from dotenv import load_dotenv

class ChatConsumer(WebsocketConsumer):
    # variable as a string that holds the chat history
    # history = ""
    
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = "chat_%s" % self.room_name
        self.history = ""
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        # Send message to OpenAI
        # Add user message to chat history
        self.history += message + "\n"
        # Limit chat history to 2000 tokens
        self.history = self.history[-2000:]
        # Send message to OpenAI
        response = self.send_to_openai(message)
        # Add bot response to chat history
        self.history += response + "\n"
        # Send user messages to room group        
        async_to_sync(self.channel_layer.group_send)(
            self.group_name, 
            {
                "type": "chat_message", 
                "message": message
            }
        )        
        # Send response chatgpt to group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name, 
            {
                "type": "chat_message", 
                "message": response
            }
        )        

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))
        self.send(text_data=json.dumps({
            "command": "javascript",
            "code": f'document.getElementById("chat-log").value;'
        }))

    def send_to_openai(self, message):
        load_dotenv()
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=f"\n{self.history}\n\n{message}\n",
            max_tokens=2048,
            n =1,
            stop=None,
            temperature=0.5
        )
        return response["choices"][0]["text"]