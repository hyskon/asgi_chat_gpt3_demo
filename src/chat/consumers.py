# chat/consumers.py
import json
import os
import openai
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from dotenv import load_dotenv
from .models import Message

User = get_user_model()
class ChatConsumer(AsyncWebsocketConsumer):
    async def fetch_messages(self, data):
        messages = Message.last_20_messages()
        content = {
            'messages': self.messages_to_json(messages)
        }
        self.send_message(content)
    
    async def new_message(self, data):
        author = data['from']
        # TODO: Refactor this
        author_user = User.objects.filter(username=author).first()
        message = Message.objects.create(
            author=author_user, 
            content=data['message'])
        content = {
            'command': 'new_message',
            'message': self.message_to_json(message)
        }
        return await self.send_chat_message(content)
    
    def messages_to_json(self, messages):
        result = []
        for message in messages:
            result.append(self.message_to_json(message))
        return result
    
    def message_to_json(self, message):
        return {
            'author': message.author.username,
            'content': message.content,
            'timestamp': str(message.timestamp)
        }
        
    commands = {
        "fetch_messages": fetch_messages,
        "new_message": new_message,
    }
    
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
        data = json.loads(text_data)
        await self.commands[data['command']](self, data)
    
    async def send_chat_message(self, message):
        # TODO: make this conditional, so only when user input @GPT the openai is called
        # # Send message to OpenAI        
        response = await self.send_to_openai(message)
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
    
    async def send_message(self, message):
        await self.send(text_data=json.dumps(message))

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))
        await self.send(text_data=json.dumps({
            "command": "javascript",
            "code": f'document.getElementById("chat-log").value;'
        }))    
    
    # Openai API call    
    async def send_to_openai(self, message):
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