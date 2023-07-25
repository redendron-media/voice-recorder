import './App.css';
import { useRef, useState,useEffect } from 'react'
import { BsMic } from 'react-icons/bs';
import {GrClose} from 'react-icons/gr'

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
//       <div className="audio-controls">
//       <button onClick={startRecording} type="button">
//           Start Recording
//       </button>
//       {recordingStatus === "recording" ? (
//       <button onClick={stopRecording} type="button">
//           Stop Recording
//       </button>
//       ) : null}
//        <audio src={audio} controls></audio>
//   </div>
        <div className='bg-[#DCD1C6] w-full h-screen content-center justify-center'>
            <form className='flex-col bg-white p-6 justify-self-center align-middle mx-auto w-1/3 shadow-lg'>
                <div className='w-[50%]'>
                    <label for="first_name" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>First Name</label>
                    <input type="text" id="first_name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="First Name" required/>
                </div>
                <div className='w-[50%] my-6'>
                    <label for="email" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Email</label>
                    <input type="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Email" required/>
                </div>
                <div>
                    {recordingStatus === 'recording' ? (
                         <button onClick={stopRecording} className='flex items-center justify-center w-12 h-12 rounded-full bg-transparent hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200 shadow-xl'>
                         <GrClose className='text-2xl' />
                     </button>
                    ):(
                        <button onClick={startRecording} className='flex items-center justify-center w-12 h-12 rounded-full bg-transparent hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200 shadow-xl'>
                        <BsMic className='text-2xl' />
                    </button>
                    )}
                </div>
                <div className='my-6'>
                        <button type='submit ' className='bg-[#2a3135] text-white p-2 w-26 text-lg shadow-md rounded'>Submit</button>
                </div>
            </form>
            
        </div>
    );
};

export default App;
