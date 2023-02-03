import React from 'react';
import Sidepanel from './Sidepanel/Sidepanel';
import WebSocketInstance from '../websocket';


class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.chatLogRef = React.createRef();

    this.waitForSocketConnection(() => {
      WebSocketInstance.addCallbacks(
        this.setMessages.bind(this), 
        this.addMessages.bind(this))
      WebSocketInstance.fetchMessages(this.props.currentUser);
    });
  }

  componentDidUpdate() {
    this.chatLogRef.current.scrollTop = this.chatLogRef.current.scrollHeight;
  }

  waitForSocketConnection(callback) {
    const component = this;
    setTimeout(            
        function () {
          if (WebSocketInstance.state() === 1){
              console.log('connection is secure');                
              callback();                
              return
          } else {
              console.log('waiting for connection...');
              component.waitForSocketConnection(callback);
          }
    }, 100);
  }

  addMessages(message) {
    this.setState({ 
      messages: [...this.state.messages, message]
    });
  }

  setMessages(messages) {
    this.setState({
      messages: messages.reverse()
    });
  }  

  messageChangeHandler = (e) => {
    this.setState({
      message: e.target.value
    })
  }

  sendMessageHandler = (e) => {
    e.preventDefault();
    const messageObject = {
      from : 'Hylke',
      content: this.state.message
    };
    WebSocketInstance.newChatMessage(messageObject);
    this.setState({
      message: ''
    })
  }

  handleTimestamp(message) {
    const timeBack = Math.round((new Date().getTime() - new Date(message.timestamp).getTime())/60000)
    if (timeBack > 0 && timeBack < 60) {
      return timeBack + ' minute ago';
    } else if (timeBack > 60 && timeBack < 1440) {
      return Math.round(timeBack/60) + ' hour ago';
    } else if (timeBack < 1){
      return '';
    } else {
      return Math.round(timeBack/60/24) + ' days ago';
    }
  }

  renderMessages = (messages) => {
    const currentUser = "Hylke";
    return messages.map((message, i) => (
        <li 
            key={message.id} 
            className={message.author === currentUser ? 'sent' : 'replies'}>
            <img src="http://emilcarlsson.se/assets/mikeross.png" />
            <p>{message.content}
                <br />
                <small className={message.author === currentUser ? 'sent' : 'replies'}>
                {this.handleTimestamp(message)}
                </small>
            </p>
        </li>
    ));
  }

  render() {
      const messages = this.state.messages;
      return (
        <div id="frame">
          <Sidepanel />
          <div className="content">
            <div className="contact-profile">
              <img src="" alt="" />
              <p>User</p>
              <div className="social-media">
                <i className="fa fa-facebook" aria-hidden="true"></i>
                <i className="fa fa-twitter" aria-hidden="true"></i>
                <i className="fa fa-instagram" aria-hidden="true"></i>
              </div>
            </div>
            <div className="messages">
              <ul id="chat-log" ref={this.chatLogRef}>
                {
                  messages &&
                  this.renderMessages(messages)
                }
              </ul>
            </div>
            <div className="message-input">
              <form onSubmit={this.sendMessageHandler}>
                <div className="wrap">
                  <input 
                      onChange={this.messageChangeHandler}
                      value={this.state.message}
                      id="chat-message-input" 
                      type="text" 
                      placeholder="Write your message..." />
                  <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                  <button id="chat-message-submit" className="submit">
                    <i className="fa fa-paper-plane" aria-hidden="true"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
  }
}

export default Chat