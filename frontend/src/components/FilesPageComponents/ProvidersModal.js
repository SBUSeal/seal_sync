import React from 'react'

const ProvidersModal = ({providers, setProviders, selectedProvider, setSelectedProvider, balance, setIsProvidersModalOpen, downloadFile }) => {
  
    const closeModal = () => {
        setIsProvidersModalOpen(false)
        setProviders([])
    }

    console.log("Providers: ", providers);
    
    
    return (
    <div className="modal">
    <div className="modal-content" style={{width: "600px"}}>
        <h2> Found Providers </h2>
            {providers.map((provider, index) => (
            <div
                key={index}
                className={`provider-item ${ selectedProvider && selectedProvider.peer_id === provider.peer_id && selectedProvider.price === provider.price ? 'selected' : ''}`}
                onClick={() => setSelectedProvider(provider)}
            >
                <p>Peer ID: {provider.peer_id}</p>
                <p>Price: {provider.price} STK </p>
            </div>
            ))}

        <h2> Your Balance: {balance} STK</h2>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',  
            alignItems: 'center',
            marginTop: '50px'
        }}>
            <div className='modal-actions'>
            <button onClick={closeModal} style={{fontSize: '20px'}}> Close </button>
            </div>
            <div className='modal-actions'>
            <button onClick={downloadFile} style={{fontSize: '20px'}}>Download</button>
            </div>
        </div>
        </div>
    </div>
  )
}

export default ProvidersModal
