import './App.css';
import { useRef, useState,useEffect } from 'react'

function App() {
const [permission, setPermission] = useState(false);
const mediaRecorder = useRef(null);
const [recordingStatus, setRecordingStatus] = useState("inactive");
const [stream, setStream] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);
const [audio, setAudio] = useState(null);
 
    const getMicrophonePermission = async () => {  
        try{
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,

        });
            return (streamData);
        }catch(err){
            alert(err.message);
            return null;
        }    
        };

    const startRecording = async () => {
        const streamData = await getMicrophonePermission();
        if (streamData) {
            // Permission granted, continue with the rest of the function
            setPermission(true);
            setStream(streamData);
            setRecordingStatus("recording");
            const media = new MediaRecorder(streamData, { type: 'audio/mpeg' });
            mediaRecorder.current = media;
            mediaRecorder.current.start();
            let localAudioChunks = [];
            mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
            };
            setAudioChunks(localAudioChunks);
        } else {
            alert('Microphone access not granted')
        }
        };

    const stopRecording = () => {
      setRecordingStatus("inactive");
      //stops the recording instance
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        //creates a blob file from the audiochunks data
         const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        //creates a playable URL from the blob file.
         const audioUrl = URL.createObjectURL(audioBlob);
         setAudio(audioUrl);
         setAudioChunks([]);
      };
    };

    return (
      <div className="audio-controls">
      {!permission ? (
      <button onClick={getMicrophonePermission} type="button">
          Get Microphone
      </button>
      ) : null}
      {permission && recordingStatus === "inactive" ? (
      <button onClick={startRecording} type="button">
          Start Recording
      </button>
      ) : null}
      {recordingStatus === "recording" ? (
      <button onClick={stopRecording} type="button">
          Stop Recording
      </button>
      ) : null}
       <audio src={audio} controls></audio>

...
  </div>
    );
};

export default App;
