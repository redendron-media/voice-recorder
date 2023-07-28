import axios from 'axios';

const baseURL = "https://www.wix.com/_api/34a31dcb-4913-4bf5-82cc-ecccf5713f06/wix-data"; // replace with your wix site id

const wixAPI = axios.create({
  baseURL: baseURL,
});

export const submitDataToWix = (data) => {
  return wixAPI.post('/collections/voiceNoteSubmissions', data)
    .then(response => response.data)
    .catch(err => console.error("Error: ", err));
};
