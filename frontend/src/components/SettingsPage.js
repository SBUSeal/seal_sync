import React, { useEffect, useState } from 'react';
import '../stylesheets/SettingsPage.css';

const SettingsPage = ({ handleLogout, isDarkMode, setIsDarkMode, notifStatus, setNotifStatus }) => {

    const [activeTab, setActiveTab] = useState('Configuration');
    const [showLogoutModal, setShowLogoutModal] = useState(false); 
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationChoice, setNotificationChoice] = useState('All new activity or messages');
    const [showPopup, setShowPopup] = useState(false);

  
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }, [isDarkMode]); 


    const handleThemeChange = () => {
        setIsDarkMode(!isDarkMode); 
    };

    const containerClass = isDarkMode ? 'settings-container dark-mode' : 'settings-container';
    const buttonClass = isDarkMode ? 'nav-item dark-mode' : 'nav-item';

    const renderContent = () => {
        switch (activeTab) {
            case 'Configuration':
                return (
                    <div className="section">
                        <h2>Configuration</h2>
                        <div className="input-group">
                            <label>Save Folder</label>
                            <input type="text" placeholder="Enter new save directory" className="input-field" />
                        </div>
                        <div className="input-group">
                            <label>Upload Limit</label>
                            <input type="number" placeholder="0" className="input-field" />
                            <span className="input-addon">Mbps</span>
                        </div>
                        <div className="input-group">
                            <label>Download Limit</label>
                            <input type="number" placeholder="0" className="input-field" />
                            <span className="input-addon">Mbps</span>
                        </div>
                        <button className="primary-button">Save Changes</button>
                    </div>
                );
            case 'Appearance':
                return (
                    <div className="section">
                        <h2>Appearance</h2>
                        <p>Customize the appearance of the app. Switch between light and dark themes.</p>
                        <div className="theme-selection">
                            <button className="theme-toggle-button" onClick={handleThemeChange}>
                                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                            </button>
                        </div>
                    </div>
                );
            case 'Notifications':
                return (
                    <div className="section">
                        <h2>Notifications</h2>
                        <p>Configure how you receive notifications.</p>
                        <form>
                            <div className="notification-option">
                                <input
                                    type="radio"
                                    name="notification"
                                    //value="All new activity or messages"
                                    value = "All" 
                                    //checked={notificationChoice === 'All new activity or messages'}
                                    checked={notifStatus === 'All'}
                                    //onChange={(e) => setNotificationChoice(e.target.value)}
                                    onChange={() => setNotifStatus('All')}
                                />
                                <label>All notifications</label>
                            </div>
                            <div className="notification-option">
                                <input
                                    type="radio"
                                    name="notification"
                                    //value="Urgent activity or messages only"
                                    value="Urgent"
                                    //checked={notificationChoice === 'Urgent activity or messages only'}
                                    checked={notifStatus === 'Urgent'}
                                    //onChange={(e) => setNotificationChoice(e.target.value)}
                                    onChange={() => setNotifStatus('Urgent')}
                                />
                                <label>Urgent notifications only</label>
                            </div>
                            <div className="notification-option">
                                <input
                                    type="radio"
                                    name="notification"
                                    value="Nothing"
                                    checked={notificationChoice === 'Nothing'}
                                    //onChange={(e) => setNotificationChoice(e.target.value)}
                                    onChange={() => setNotifStatus('Nothing')}
                                />
                                <label>No notifications</label>
                            </div>
                        </form>
                        <button className="primary-button" onClick={() => handleNotificationUpdate()}>
                            Update notifications
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };


    const handleNotificationUpdate = () => {
        let message = '';
        /*if (notificationChoice === 'Nothing') {
            message = 'You will not be notified.';
        } else {
            message = `You will receive ${notificationChoice.toLowerCase()}.`;
        }
        setNotificationMessage(message);*/
        if(notifStatus === 'Nothing') {
            message = 'You will not be notified.';
        } else if(notifStatus === 'Urgent') {
            message = 'You will only receive urgent notifications.';
        } else {
            message = 'You will receive all notifications.';
        }
        showNotification(message, 'success');
    };

   
    const showNotification = (message, type) => {
        console.log("Message in showNotification function is:"+message);
        console.log("Type in showNotification function is:"+type);
        /*if(notifStatus === 'Nothing') return;
        if(notifStatus === 'Urgent') return;//type !== 'urgent'*/
        setNotificationMessage(message);
        setShowPopup(true); 

        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

   
    const renderLogoutModal = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to log out?</p>
                {/* Confirm logout and trigger the logout function */}
                <button className="confirm-button" onClick={handleLogout}>Yes, Log Out</button>
                <button className="cancel-button" onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
        </div>
    );

    return (
        <div className={containerClass}>
        <div className="settings-container">
            <div className="side">
                <button className={`nav-item ${activeTab === 'Configuration' ? 'active' : ''}`} onClick={() => setActiveTab('Configuration')}>Config</button>
                <button className={`nav-item ${activeTab === 'Appearance' ? 'active' : ''}`} onClick={() => setActiveTab('Appearance')}>Appearance</button>
                <button className={`nav-item ${activeTab === 'Notifications' ? 'active' : ''}`} onClick={() => setActiveTab('Notifications')}>Notifications</button>
        
                <button className="nav-item" onClick={() => setShowLogoutModal(true)}>Log Out</button>
            </div>
            <div className="content-area">
                {renderContent()}
            </div>

           
            {showLogoutModal && renderLogoutModal()}

           
            {showPopup && (
                <div className="notification-popup">
                    {notificationMessage}
                </div>
            )}
        </div>
        </div>
    );
};

export default SettingsPage;
