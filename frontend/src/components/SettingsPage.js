import React, { useState } from 'react';
import '../stylesheets/SettingsPage.css';

const SettingsPage = ({ handleLogout, toggleDarkMode, isDarkMode}) => {
    const [activeTab, setActiveTab] = useState('Configuration');
    const [showLogoutModal, setShowLogoutModal] = useState(false); // For showing logout confirmation modal
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationChoice, setNotificationChoice] = useState('All new activity or messages');
    const [showPopup, setShowPopup] = useState(false); // For showing notification pop-up

    const containerClass = isDarkMode ? 'settings-container dark-mode' : 'settings-container';
    const buttonClass = isDarkMode ? 'nav-item dark-mode' : 'nav-item';

    const renderContent = () => {
        switch (activeTab) {
            case 'Configuration':
                return (
                    <div className="section">
                        <h2>Transfer</h2>
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
                        <p>Customize the appearance of the app. Automatically switch between day and night themes.</p>
                        {/*<div className="theme-selection">
                            <div className="theme-option">
                                <input type="radio" name="theme" id="light" value="light" />
                                <label htmlFor="light">Light</label>
                            </div>
                            <div className="theme-option">
                                <input type="radio" name="theme" id="dark" value="dark" />
                                <label htmlFor="dark">Dark</label>
                            </div>
                        </div>
                        <button className="primary-button">Update preferences</button>*/}
                        <button className="toggle-button" onClick={toggleDarkMode}>
                            Toggle Dark Mode
                        </button>
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
                                    value="All new activity or messages"
                                    checked={notificationChoice === 'All new activity or messages'}
                                    onChange={(e) => setNotificationChoice(e.target.value)}
                                />
                                <label>All new activity or messages</label>
                            </div>
                            <div className="notification-option">
                                <input
                                    type="radio"
                                    name="notification"
                                    value="Urgent activity or messages only"
                                    checked={notificationChoice === 'Urgent activity or messages only'}
                                    onChange={(e) => setNotificationChoice(e.target.value)}
                                />
                                <label>Urgent activity or messages only</label>
                            </div>
                            <div className="notification-option">
                                <input
                                    type="radio"
                                    name="notification"
                                    value="Nothing"
                                    checked={notificationChoice === 'Nothing'}
                                    onChange={(e) => setNotificationChoice(e.target.value)}
                                />
                                <label>Nothing</label>
                            </div>
                        </form>
                        <button className="primary-button" onClick={() => handleNotificationUpdate()}>
                            Update notifications
                        </button>
                    </div>
                );
            case 'Logout':
                return (
                    <div className="section">
                        <button className="logout-button" onClick={() => setShowLogoutModal(true)}>Log Out</button>
                    </div>
                );
            default:
                return null;
        }
    };

    // Handle Notification Update
    const handleNotificationUpdate = () => {
        let message = '';
        if (notificationChoice === 'Nothing') {
            message = 'You will not be notified.';
        } else {
            message = `You will receive ${notificationChoice.toLowerCase()}.`;
        }
        setNotificationMessage(message);
        showNotification(message, 'success');
    };

    // Function to show notifications in the bottom-right corner
    const showNotification = (message, type) => {
        setNotificationMessage(message);
        setShowPopup(true); // Show the pop-up

        // Hide after 3 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    // Confirm Logout Modal
    const renderLogoutModal = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to log out?</p>
                <button className="confirm-button" onClick={handleLogout}>Yes, Log Out</button>
                <button className="cancel-button" onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
        </div>
    );

    return (
        <div className={containerClass}>
        <div className="settings-container">
            <div className="side">
                <button className={`nav-item ${activeTab === 'Configuration' ? 'active' : ''}`} onClick={() => setActiveTab('Configuration')}>Transfer</button>
                <button className={`nav-item ${activeTab === 'Appearance' ? 'active' : ''}`} onClick={() => setActiveTab('Appearance')}>Appearance</button>
                <button className={`nav-item ${activeTab === 'Notifications' ? 'active' : ''}`} onClick={() => setActiveTab('Notifications')}>Notifications</button>
                <button className={`nav-item ${activeTab === 'Logout' ? 'active' : ''}`} onClick={() => setActiveTab('Logout')}>Log Out</button>
            </div>
            <div className="content-area">
                {renderContent()}
            </div>

            {/* Render Logout Modal */}
            {showLogoutModal && renderLogoutModal()}

            {/* Notification Pop-up */}
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
