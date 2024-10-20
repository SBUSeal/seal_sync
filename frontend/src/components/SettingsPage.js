import React from 'react';
import '../stylesheets/SettingsPage.css';

const SettingsPage = ({toggleDarkMode}) => {
    return (
        <div className="settings-container">
            <div className="section">
                <h2>Custom Configuration</h2>
                <input 
                    type="text" 
                    placeholder="/ip4/127.0.0.1/tcp/5001" 
                    className="input-field" 
                />
                <button className="primary-button">Submit</button>
            </div>

            <div className="section">
                <h2>Shareable Links</h2>
                <input 
                    type="text" 
                    value="https://ipfs.io" 
                    className="input-field" 
                    readOnly 
                />
                <button className="primary-button">Share</button>
            </div>

            <div className="section">
                <h2>Publishing Keys</h2>
                <input 
                    type="text" 
                    value="kuhyddhu727w9gvjcidcd" 
                    className="input-field" 
                    readOnly 
                />
                <button className="secondary-button">+ Generate Keys</button>
            </div>


            <div className="section">
                <h2>Theme</h2>
                <button className="toggle-button" onClick={toggleDarkMode}>
                    Toggle Dark Mode
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
