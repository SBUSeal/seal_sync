import React from 'react';
import '../stylesheets/SettingsPage.css';

const SettingsPage = () => {
    return (
        <div className="container">
            <h2>Custom Configuration</h2>
            <input 
                type="text" 
                placeholder="/ip4/127.0.0.1/tcp/5001" 
                className="input-field" 
            />
            <button className="submit-button">Submit</button>

            <h2>Shareable Links</h2>
            <input 
                type="text" 
                value="https://ipfs.io" 
                className="input-field" 
                readOnly 
            />
            <button className="share-button">Share</button>

            <h2>Publishing Keys</h2>
            <input 
                type="text" 
                value="kuhyddhu727w9gvjcidcd" 
                className="input-field" 
                readOnly 
            />
            <button className="generate-button">+ Generate Keys</button>

            
        </div>
    );
};

export default SettingsPage;
