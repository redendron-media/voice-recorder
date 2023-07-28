import { useRef, useState } from 'react'
import { IoMdSquare } from 'react-icons/io'
import { BsMic } from 'react-icons/bs'
import { getDatabase, ref, set, push, update } from 'firebase/database';
import { storage, db } from './firebase.js';
import { uploadBytes,ref as storageref, getDownloadURL } from 'firebase/storage';
import logo from './assets/Logo.png';
import footerImg from './assets/footer.png';
import { Checkbox } from 'flowbite-react';

function App() {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const getMicrophonePermission = async () => {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      return streamData;
    } catch (err) {
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
      const media = new MediaRecorder(streamData, { type: "audio/mpeg" });
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
      alert("Microphone access not granted");
    }
  };

  const stopRecording = () => {
    setRecordingStatus("recorded");
    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioBlob(audioBlob);
      setAudioChunks([]);
    };
  };

  const handleSubmit = async () => {
    if (audio) {
      const formDataRef = ref(db, "formSubmissionsVoiceNotes");

      const newFormEntryRef = push(formDataRef);

      set(newFormEntryRef, {
        firstName: firstName,
        email: email,
        audioUrl: "",
        date: Date.now(),
      }).then((docRef) => {
        console.log("Form data and audio URL saved successfully with ID:");

        if (audioBlob) {
          const filename = `${Date.now()}.mp3`;
          const storageRef = storageref(storage, filename);

          uploadBytes(storageRef, audioBlob)
            .then((snapshot) => {
              console.log("Uploaded a blob or file!");

              getDownloadURL(storageRef)
              .then((audioUrl) =>{
                update(newFormEntryRef, {audioUrl: audioUrl})
                .then(() =>{
                  alert('Thank you! Your response has received');
                })
                .catch((error) =>{
                   console.error('Error saving audio URL in the database:', error);
                })
              })

            }).catch((error) => {
              console.error("Error uploading file: ", error);
            });
        } else {
          console.error("No audio data to upload");
        }
      });
      const response = await submitDataToWix({ firstName, email, audioUrl });
      console.log(response);
    } else {
      alert("Please record a voice note");
    }
  };

  return (
    <div className='bg-[#DCD1C6] flex w-full flex-col h-screen items-center justify-between'>
      <section id='header' className=' w-full flex  justify-center items-center py-8 min-h-[101px] bg-[#E1BBB2]'>
        <img className='w-[12%] h-auto' src={logo}  />
      </section>
      <div className='flex-col bg-white h-auto px-12 py-16  my-8  justify-self-center align min-h-0 mx-auto w-3/4 md:w-1/2 lg:w-1/3 shadow-lg rounded-md'>
        <div className='w-[100%] justify-center'>
          <label htmlFor="first_name" className='block mb-2 text-md font-medium text-gray-900 dark:text-white'>First Name</label>
          <input
            type="text"
            id="first_name"
            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
              recordingStatus !== "recording" && "required"
            }`}
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="w-[100%] my-6">
          <label
            htmlFor="email"
            className="block mb-2 text-md font-medium text-gray-900 dark:text-white"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
              recordingStatus !== "recording" && "required"
            }`}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='flex items-center gap-x-6 my-8'>
          <div className='flex items-center min-h-[55px]'>
            {recordingStatus === 'recording' ?
              <IoMdSquare className='flex p-2  w-10 h-10 cursor-pointer rounded-full bg-transparent hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200 shadow-xl ' onClick={stopRecording} /> :
              <BsMic className='flex p-2 w-10 h-10 cursor-pointer rounded-full bg-transparent hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200 shadow-xl' onClick={startRecording} />
            }
          </div>
          <div>
            {recordingStatus === "inactive" ||
            recordingStatus === "recording" ? (
              <></>
            ) : (
              <audio controls src={audio}></audio>
            )}
          </div>
        </div>
        <div className='flex flex-row items-start gap-x-4'>
          <input
            type='checkbox'
            id='consent'
            checked= {isChecked}
            onChange={handleCheckboxChange}
            className='w-6 h-6 focus:outline-none'
          />
          <label htmlFor='consent'> I confirm that I want to receive content from this company using any contact information I provide.</label>
        </div>
        <div className='mt-8'>
          <button className='shadow-md bg-[#2A3135] py-2 px-4 rounded-md text-xl  text-white cursor-pointer' onClick={handleSubmit}>Submit</button>
        </div>
      </div>
      <section id='footer' className='w-full  flex justify-center items-center py-8 min-h-[180px] bg-[#E1BBB2]'>
        <img className='w-[12%] h-auto' src={footerImg}/>
      </section>
    </div>
  );
}

export default App;
