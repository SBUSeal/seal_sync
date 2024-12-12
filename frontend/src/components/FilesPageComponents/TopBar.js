import React, {useState} from 'react'
import { DownloadIcon, UploadIcon } from '@radix-ui/react-icons';

const TopBar = ({searchQuery, setSearchQuery, files, filter, setFilteredFiles, setIsDownloadModalOpen, setTempFile, setisUploadModalOpen, setCid, notifStatus}) => {


  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  /*const triggerPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }*/
    const showNotification = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => {
          setNotification({ message: '', type: '' });
      }, 3000);
  };

  const handleAllNotificationsTest = () => {
    console.log('notifStatus in handleAllNotificationsTest:', notifStatus);
    if(notifStatus === 'All') {
      //triggerPopup('This is a test for "All notifications".');
      showNotification('This is a test for "All notifications" setting.', 'success');
    } else {
      console.log('No action taken: Notification setting is not set to "All".');
    }
  };

  const handleUrgentNotificationsTest = () => {
    console.log('notifStatus in handleUrgentNotificationsTest:', notifStatus);
    if (notifStatus === 'All' || notifStatus === 'Urgent') {
      //triggerPopup('This is a test for "Urgent notifications only".');
      showNotification('This is a test for "Urgent notifications" setting.', 'success');
    } else {
      console.log('No action taken: Notification setting is "None".');
    }
  };
    function handleSearchInput(e) {
        const query = e.target.value;
        setSearchQuery(query);

        const filtered = files.filter(file => {
            return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(query.toLowerCase())      
        }
        );    
        setFilteredFiles(filtered);
    }

    function handleDownloadFile() {
        setIsDownloadModalOpen(true)
        setCid("")
    }

    function handleFileUpload(event) {
        const selectedFile = Array.from(event.target.files)[0];
        setTempFile(selectedFile)
        setisUploadModalOpen(true); 
        
      }
  return (
    <div className="top-bar">
        <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchInput}
        />

        <div className="action-buttons">
          <button onClick={handleDownloadFile} className="action-btn">
            <DownloadIcon /> <div className='action-btn-text'> Download </div>
          </button>
          <button className="action-btn">
            <UploadIcon /> 
            <div className='action-btn-text'>Upload</div>
            <input type="file" onChange={handleFileUpload} />
          </button>
        </div>

        {/*<div className="test-buttons">
        <button onClick={handleAllNotificationsTest}>
          Test All Notifications
        </button>
        <button onClick={handleUrgentNotificationsTest}>
          Test Urgent Notifications
        </button>
        </div>*/}
        {/* Notification */}
        {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
    </div>
  )
}

export default TopBar
