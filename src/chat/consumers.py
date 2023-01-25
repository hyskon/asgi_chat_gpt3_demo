# chat/consumers.py
import json
import os
import openai
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from dotenv import load_dotenv

# create new consumer for asynchronous requests
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name
        # initialize the history
        self.history = ""
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]        
        # Send message to OpenAI
        response = self.send_to_openai(message)
        # build history
        self.history += message + "\n"
        # Limit chat history to 2048 characters
        self.history = self.history[-2048:]
        # Add bot response to chat history
        self.history += response + "\n"
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": message}
        )
        # Send bot response to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": response}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
        await self.send(text_data=json.dumps({
            "command": "javascript",
            "code": f'document.getElementById("chat-log").value;'
        }))
    # Openai API call    
    def send_to_openai(self, message):
        load_dotenv()
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=f"{self.history}\n{message}\n",
            max_tokens=2048,
            n =1,
            stop=None,
            temperature=0.5
        )
        return response["choices"][0]["text"]