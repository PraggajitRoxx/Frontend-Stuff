import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const Typingeffect = ({ message }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(message.slice(0, index));
      index += 1;
      if (index > message.length) {
        clearInterval(interval);
      }
    }, 50); // Adjust the speed here
    return () => clearInterval(interval);
  }, [message]);

  return <span><ReactMarkdown>{displayedText}</ReactMarkdown></span>;
};

export default Typingeffect;
