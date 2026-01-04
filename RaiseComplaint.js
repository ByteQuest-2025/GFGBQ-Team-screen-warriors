import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { grievanceContract } from '../utils/contract';
import axios from 'axios';

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = location.state?.account;

  const [complaintText, setComplaintText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [inputType, setInputType] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authorities, setAuthorities] = useState([]);
  const [citizenCity, setCitizenCity] = useState('');
  const [loadingAuthorities, setLoadingAuthorities] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (account) {
      loadCitizenData();
      loadAllAuthorities();
    }
  }, [account]);

  const loadCitizenData = async () => {
    try {
      const citizen = await grievanceContract.methods.citizens(account).call();
      setCitizenCity(citizen.city || '');
    } catch (err) {
      console.error('Failed to load citizen data:', err);
    }
  };

  const loadAllAuthorities = async () => {
    setLoadingAuthorities(true);
    try {
      const allAuthorityAddresses = await grievanceContract.methods.getAllAuthorities().call();
      
      if (!allAuthorityAddresses || allAuthorityAddresses.length === 0) {
        setError('No authorities are registered yet.');
        setAuthorities([]);
        return;
      }
      
      const registeredAuthorities = [];
      for (const address of allAuthorityAddresses) {
        try {
          const authorityData = await grievanceContract.methods.authorities(address).call();
          if (authorityData.registered) {
            registeredAuthorities.push({
              walletAddress: authorityData.walletAddress,
              role: authorityData.role,
              jurisdiction: authorityData.jurisdiction,
              officialName: authorityData.officialName,
              officerId: authorityData.officerId
            });
          }
        } catch (err) { console.error(err); }
      }
      
      setAuthorities(registeredAuthorities);
    } catch (err) {
      console.error('Failed to load authorities:', err);
      setError('Failed to load authorities from blockchain.');
    } finally {
      setLoadingAuthorities(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL('');
    audioChunksRef.current = [];
  };

  const handleFileChange = (e) => {
    setMediaFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!account) throw new Error('Wallet not connected');
      if (!complaintText.trim()) throw new Error('Please describe your complaint');
      if (authorities.length === 0) throw new Error('No authorities available.');

      let classificationResult;
      let finalComplaintText = complaintText;
      let mediaUrlForBlockchain = ""; 

      // --- 1. IMAGE FLOW ---
      if (inputType === 'image' && mediaFile) {
        const formData = new FormData();
        formData.append('image', mediaFile);
        formData.append('text', complaintText);

        // Upload to backend
        const response = await axios.post('http://localhost:5000/api/analyze-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        classificationResult = response.data;
        
        // --- CRITICAL FIX: GET URL FROM BACKEND ---
        mediaUrlForBlockchain = classificationResult.media_url; 
        
        console.log("Image URL received:", mediaUrlForBlockchain); // Check console to verify

        finalComplaintText = `${complaintText}. [AI Analysis: ${classificationResult.description}]`;

      // --- 2. VOICE FLOW ---
      } else if (inputType === 'voice' && audioBlob) {
         const formData = new FormData();
         formData.append('audio', audioBlob, 'voice_recording.webm');
         formData.append('text', complaintText);

         const response = await axios.post('http://localhost:5000/api/analyze-audio', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
         });

         classificationResult = response.data;
         mediaUrlForBlockchain = classificationResult.media_url;
         finalComplaintText = `${complaintText}. [Voice Note Attached]`;

      // --- 3. TEXT FLOW ---
      } else {
        const response = await axios.post('http://localhost:5000/api/classify-complaint', { text: complaintText });
        classificationResult = response.data;
      }

      // --- GET AUTHORITY ---
      const authorityResponse = await axios.post('http://localhost:5000/api/get-authority-by-category', {
          category: classificationResult.category,
          region: citizenCity,
          authorities: authorities
      });

      if (!authorityResponse.data.authority) {
         throw new Error(`No ${classificationResult.category} authority found.`);
      }
      const assignedAuthority = authorityResponse.data.authority;

      // --- BLOCKCHAIN SUBMISSION ---
      console.log("Submitting to blockchain with URL:", mediaUrlForBlockchain);

      const tx = await grievanceContract.methods
        .raiseComplaint(
          finalComplaintText,
          classificationResult.category,
          mediaUrlForBlockchain || '', // Send the URL here!
          classificationResult.summary,
          classificationResult.urgency,
          assignedAuthority
        )
        .send({ from: account });

      console.log('Complaint submitted:', tx);
      alert('Complaint raised successfully!');
      navigate('/citizen-dashboard', { state: { account } });

    } catch (err) {
      console.error('Error raising complaint:', err);
      setError(err.message || 'Failed to raise complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="raise-complaint-container">
      <div className="raise-complaint-card">
        <h2>Raise a Complaint</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-type-selector">
          <button type="button" className={inputType === 'text' ? 'active' : ''} onClick={() => setInputType('text')}>Text</button>
          <button type="button" className={inputType === 'image' ? 'active' : ''} onClick={() => setInputType('image')}>Image</button>
          <button type="button" className={inputType === 'voice' ? 'active' : ''} onClick={() => setInputType('voice')}>Voice</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} required />
          </div>

          {inputType === 'image' && (
            <div className="form-group">
              <input type="file" onChange={handleFileChange} accept="image/*" />
            </div>
          )}

          {inputType === 'voice' && (
            <div className="form-group">
               {!audioBlob ? (
                  <button type="button" onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
               ) : (
                  <div>
                    <audio controls src={audioURL} />
                    <button type="button" onClick={deleteRecording}>Delete</button>
                  </div>
               )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/citizen-dashboard', { state: { account } })}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseComplaint;