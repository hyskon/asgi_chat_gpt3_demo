import React from 'react';
import { createRoot } from 'react-dom/client';
import Chat from './containers/Chat';
import WebSocketInstance from './websocket';

class App extends React.Component {
  componentDidMount() {
    WebSocketInstance.connect();
  }

  render() {
    return (
      <Chat />
    );
  }
}

createRoot(document.getElementById('app')).render(<App />);