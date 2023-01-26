import React from 'react';

const Sidepanel = (props) => (
    <div id="sidepanel">
        <div id="profile">
            <div className="wrap">
                <img id="profile-img" src="{% static 'profile.jpg' %}" className="online" alt="" />
                <p>Hylke Nicola</p>
                <i className="fa fa-chevron-down expand-button" aria-hidden="true"></i>
                <div id="status-options">
                    <ul>
                        <li id="status-online" className="active"><span className="status-circle"></span> <p>Online</p></li>
                        <li id="status-away"><span className="status-circle"></span> <p>Away</p></li>
                        <li id="status-busy"><span className="status-circle"></span> <p>Busy</p></li>
                        <li id="status-offline"><span className="status-circle"></span> <p>Offline</p></li>
                    </ul>
                </div>
                <div id="expanded">
                    {/* <label htmlFor="twitter"><i className="fa fa-facebook fa-fw" aria-hidden="true"></i></label>
                    <input name="twitter" type="text" value="mikeross" />
                    <label htmlFor="twitter"><i className="fa fa-twitter fa-fw" aria-hidden="true"></i></label>
                    <input name="twitter" type="text" value="ross81" />
                    <label htmlFor="twitter"><i className="fa fa-instagram fa-fw" aria-hidden="true"></i></label>
                    <input name="twitter" type="text" value="mike.ross" /> */}
                </div>
            </div>
        </div>
        <div id="search">
            <label htmlFor=""><i className="fa fa-search" aria-hidden="true"></i></label>
            <input type="text" placeholder="Search contacts..." />
        </div>
        <div id="contacts">
            <ul>
                <li className="contact active">
                    <div className="wrap">
                        <span className="contact-status online"></span>
                        <img src="{% static 'gpt.png' %}" alt="" />
                        <div className="meta">
                            <p className="name">ChatGPT</p>
                            <p className="preview">Talk with ChatGPT</p>
                        </div>
                    </div>
                </li>
                <li className="contact">
                    <div className="wrap">
                        <span className="contact-status busy"></span>
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <div className="meta">
                            <p className="name">Random person</p>
                            <p className="preview">Some random tag line here.</p>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div id="bottom-bar">
            <button id="addcontact"><i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Add contact</span></button>
            <button id="settings"><i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span></button>
        </div>
    </div>
)
 export default Sidepanel;