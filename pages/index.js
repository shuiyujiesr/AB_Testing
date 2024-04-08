import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [images, setImages] = useState([]);
  // Tracks which image to display on the left and right, respectively
  const [leftImageIndex, setLeftImageIndex] = useState(0);
  const [rightImageIndex, setRightImageIndex] = useState(1);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSelectedSide, setLastSelectedSide] = useState(null); // Initially, no side is selected
  const [clickedMessage, setClickedMessage] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images');
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  const startTest = () => {
    if (userName.trim() !== '') {
      setIsTestStarted(true);
    }
  };

  const handleImageClick = (clickedIndex) => {
    // Determine and set the last selected side based on the clicked image
    setLastSelectedSide(clickedIndex === leftImageIndex ? 'left' : 'right');
  
    const newIndex = Math.max(leftImageIndex, rightImageIndex) + 1;
  
    // Update the index for the non-selected side to the next image in the sequence
    if (clickedIndex === leftImageIndex && newIndex < images.length) {
      setRightImageIndex(newIndex);
    } else if (clickedIndex === rightImageIndex && newIndex < images.length) {
      setLeftImageIndex(newIndex);
    }
  
    // Check for test completion: it's complete when no more images to compare
    if (newIndex >= images.length) {
      setIsTestCompleted(true);
    }
      // Show a click confirmation message
    const clickedSide = clickedIndex === leftImageIndex ? 'left' : 'right';
    setClickedMessage(`You clicked the image on the ${clickedSide}.`);

      // Clear the message after 2 seconds
    setTimeout(() => setClickedMessage(''), 2000);
 
  };

  const sendTestResult = async () => {
    if (!isTestCompleted || !userName || lastSelectedSide === null) return;
  
    // Determine the correct image index based on the last selected side
    const selectedImageIndex = lastSelectedSide === 'left' ? leftImageIndex : rightImageIndex;
    const selectedImagePath = images[selectedImageIndex];
  
    try {
      const response = await fetch('/api/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, selectedImagePath }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Test result stored successfully:', data.message);
      } else {
        console.error('Error storing test result:', data.error);
      }
    } catch (error) {
      console.error('Error storing test result:', error);
    }
  };
  

  // Call sendTestResult when the test is completed
  useEffect(() => {
    if (isTestCompleted) {
      sendTestResult(); // Existing function to handle results
      sendEmailResult(); // New function to send the email
    }
  }, [isTestCompleted, userName, leftImageIndex, rightImageIndex, images, lastSelectedSide]);


  if (isLoading) {
    return <div>Loading images...</div>;
  }

  if (!isTestStarted) {
    return (
      <div className="name-input-container">
        <h1>Welcome to the CORH A/B Test</h1>
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" />
        <button onClick={startTest}>Start</button>
        {/* Display a loading message or progress indicator here if desired */}
      </div>
    );
  }

  const sendEmailResult = async () => {
    if (!isTestCompleted || !userName || lastSelectedSide === null) return;
  
    const selectedImageIndex = lastSelectedSide === 'left' ? leftImageIndex : rightImageIndex;
    const selectedImagePath = images[selectedImageIndex];
  
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, selectedImagePath }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Email sent successfully:', data.status);
      } else {
        console.error('Error sending email:', data.status);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  

  return (
    <div className="test-container">
      {isTestStarted && !isTestCompleted && (
        <>
          <div className="header">
            <h1>Which image do you prefer?</h1>
            {/* Render the clickedMessage here */}
            {clickedMessage && (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    zIndex: 1000
  }}>
    {clickedMessage}
  </div>
)}
          </div>
          <div className="image-container" style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div className="image-wrapper" onClick={() => handleImageClick(leftImageIndex)}>
              <Image src={`/images/${images[leftImageIndex]}`} alt="Left Image" width={1500} height={900} priority/>
              <p>{`Image ${leftImageIndex}`}</p>
            </div>
            {rightImageIndex < images.length && (
              <div className="image-wrapper" onClick={() => handleImageClick(rightImageIndex)}>
                <Image src={`/images/${images[rightImageIndex]}`} alt="Right Image" width={1500} height={900} priority/>
                <p>{`Image ${rightImageIndex}`}</p>
              </div>
            )}
          </div>
        </>
      )}
      {isTestCompleted && (
        <div className="conclusion-container">
          <h2>Test Completed, Thank You, {userName}!</h2>
          <button onClick={() => window.location.reload(true)}>Restart</button>
        </div>
      )}
    </div>
  );
  
}
