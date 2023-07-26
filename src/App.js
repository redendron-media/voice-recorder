import { useRef, useState } from 'react'
import {GrClose} from 'react-icons/gr'
import {BsMic} from 'react-icons/bs'
import { getDatabase, ref, set,push } from 'firebase/database';
//import { getFirestore, doc, setDoc } from "firebase/firestore";
import { storage,db } from './firebase.js';


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
    setRecordingStatus("inactive");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form data:', firstName, email);
    console.log('Audio URL:', audio);
    console.log('Audio Blob:', audioBlob);
  

    if(audio) {
        
        const formDataRef = ref(db,'formSubmissionsVoiceNotes');

        const newFormEntryRef = push(formDataRef);
        set(newFormEntryRef, {
            firstName: firstName,
            email: email,
            audioUrl:'',
        })
        .then((docRef) =>{
            console.log('Form data and audio URL saved successfully with ID:')

            if (audioBlob) {
                const storageRef = storage.ref();
                const audioFileRef = storageRef.child(`audio_files/${newFormEntryRef.key}.mp3`);
                
                audioFileRef
                .put(audioBlob)
                .then((snapshot) => {
                  console.log('Audio file uploaded successfully!');
                  
                //   audioFileRef.getDownloadURL().then((audioUrl) => {
                //     set(newFormEntryRef, { audioUrl: audioUrl }, { merge: true })
                //     .then(() => {
                //       console.log('Audio URL saved in the database successfully!');
                //     })
                //     .catch((error) => {
                //       console.error('Error saving audio URL in the database: ', error);
                //     });
                //   }) 

                })
                .catch((error) => {
                    console.error('Error uploading audio file: ', error);
                  });
            }
        })  
        .catch((error) => {
            console.error('Error saving form data and audio URL: ', error);
          });
       
        // const storageRef = ref(storage, `${firstName}-${Date.now()}.mp3`);
        // const uploadTask = uploadBytesResumable(storageRef, audioBlob);
        // uploadTask.on('state_changed',
        // (snapshot) =>{

        // },
        // async () =>{
        //     const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        //     db.collection('formSubmissionsVoiceNotes')
        //         .add({
        //             name: firstName,
        //             email: email,
        //             audioURL: downloadURL
        //         }).then(() =>{
        //             alert("Message has been submitted")
        //         })
        // }
        // )
        // uploadTask.on('state_changed', 
        //   (snapshot) => {
        //     // Add some progress functionality here if desired
        //   }, 
        //   (error) => {
        //     console.log(error);
        //   }, 
        //   async () => {
        //     const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        //     // Save the form data to Firestore
        //     await setDoc(doc(db, "formSubmissionsVoiceNotes", `${firstName}-${Date.now()}`), {
        //       name: firstName,
        //       email: email,
        //       audioURL: downloadURL
        //     });
        //   } );
    }

    else {
        alert('Please record a voice note')
    }  
   
  }

    return (
        <div  className='bg-[#DCD1C6] w-full h-screen align-middle content-center justify-center'>
            <div className='flex-col bg-white p-6 justify-self-center align-middle mx-auto w-1/3 shadow-lg'>
                <div className='w-[50%]'>
                    <label htmlFor="first_name" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>First Name</label>
                    <input  
                        type="text" id="first_name" 
                        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${recordingStatus !== 'recording' && 'required'}`} 
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)} 
                        required/>
                </div>
                <div className='w-[50%] my-6'>
                    <label htmlFor="email" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Email</label>
                    <input  
                        type="email" id="email" 
                        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${recordingStatus !== 'recording' && 'required'}`} 
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required/>
                </div>
                <div className='flex items-center justify-between gap-5'>
                    <div className='flex items-center gap-4'>
                        {recordingStatus === 'recording' ? <GrClose className='text-xl cursor-pointer' onClick={stopRecording}/> : <BsMic className='text-xl text-gray-500 cursor-pointer' onClick={startRecording}/>}
                    </div>
                </div>
                <div className='mt-5'>
                    <audio controls src={audio}></audio>
                </div>
                <div className=' mt-6'>
                    <GrClose className='text-xl cursor-pointer' onClick={handleSubmit}/>
                </div>
            </div>
        </div>
    );
}

export default App;
