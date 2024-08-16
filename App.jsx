import React, { useState,useRef, useEffect } from 'react';
import { FaUser } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";
import './App.css';
import './normal.css';
import axios from 'axios';
import Typingeffect from './components/Typingeffect';
import { FaMicrophone } from "react-icons/fa6";
import { IoSendSharp } from "react-icons/io5";
// import Input from './components/Input';
// import Navbar from './components/Navbar';
// import Sidebar from './components/Sidebar';

const App = () => {
  // Add state for input and chat log
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob , setAudioBlob] = useState(null);

  // Reference for the chat log container
  const chatLogRef = useRef(null);

  //clear chats
  function clearChat(){
    setChatLog([]);
  }

  // function for startrecording
  const startRecording = () => {
    setRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        setRecording(false);
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // Record for 5 seconds
    });
  };

  // function to send Audio to backend
  const sendAudioToBackend = async () => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");

    try {
      const res = await axios.post('http://localhost:3000/transcribe', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { user: "bot", message: res.data.message },
      ]);
    } catch (err) {
      console.error(err);
    }
  };
   // function to handlesubmit
  async function handleSubmit(e) {
    e.preventDefault();
    const userMessage = input;
    setChatLog([...chatLog, { user: "me", message: userMessage }]);
    setInput("");

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { user: "bot", message: data.message },
      ]);
    } catch (error) {
      console.error('Error:', error);
    }



  }

  // scroll to the bottom of the chat log when new messages are added
  useEffect(() => {
    chatLogRef.current?.scrollIntoView({ behavior: "smooth"});
  }, [chatLog]);

  return (
    <div className='App'>
      {/* Sidebar component */}
      <aside className='sidemenu'>
        {/* Side menu button */}
        <div className='side-menu-button' onClick={clearChat} >
          <span>+</span>
          New chat
        </div>
      </aside>

      {/* Chatbox section */}
      <section className='chatbox'>
        {/* Coding the chatbot interface */}
        <div className='chat-log'>
          {/* Display existing chat messages */}
          {chatLog.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.user === "me" ? "" : "chatgpt"}`}>
              <div className='chat-message-center'>
                {/* Adding an avatar */}
                <div className={`avatar ${chat.user === "me" ? "" : "chatgpt"}`}>
                  {chat.user === "me" ? <FaUser className='icon' /> : <RiRobot2Fill className='bot' />}
                </div>
                <div className='message'>
                  {chat.user === "me" ? chat.message : <Typingeffect message = {chat.message} />}
                </div>
              </div>
            </div>
          ))}
          {/* reference element for Auto-scroll */}
          <div ref ={chatLogRef}></div>
        </div>

        {/* Chat-input part */}
        <div className='chat-input-holder'>
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='chat-input-textarea'
              placeholder='Type your prompt...'
            />
          </form>
          <button onClick={startRecording} disabled={recording} className='mic-button'>
            {recording ? "Recording..." : <FaMicrophone />}
          </button>
          {audioBlob && <button onClick={sendAudioToBackend} className='send-audio-button'><IoSendSharp /></button>}
        </div>
      </section>
    </div>
  );
}

export default App;
