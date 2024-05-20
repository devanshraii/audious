
import { useState, useRef } from 'react';
import Slider from 'react-slider';
import 'tailwindcss/tailwind.css';
import { audioBufferToWav } from '../utils/audioUtils';

const AudioTrimmer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setAudioFile(url);

    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
      setEnd(audio.duration);
    });
  };

  const handleTrim = async () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const response = await fetch(audioFile);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const startSample = Math.floor(start * audioBuffer.sampleRate);
    const endSample = Math.floor(end * audioBuffer.sampleRate);
    const trimmedAudioBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      endSample - startSample,
      audioBuffer.sampleRate
    );

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      trimmedAudioBuffer.copyToChannel(
        audioBuffer.getChannelData(i).slice(startSample, endSample),
        i
      );
    }

    const trimmedBlob = audioBufferToWav(trimmedAudioBuffer);
    const trimmedUrl = URL.createObjectURL(trimmedBlob);
    const link = document.createElement('a');
    link.href = trimmedUrl;
    link.download = 'trimmed-audio.wav';
    link.click();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Audio Trimmer</h1>
      <div className="flex flex-col items-center mb-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="mb-4 px-4 py-2 border border-gray-300 rounded"
        />
        {audioFile && (
          <>
            <audio ref={audioRef} controls src={audioFile} className="mb-4"></audio>
            <div className="w-full max-w-lg">
              <Slider
                value={[start, end]}
                onChange={([newStart, newEnd]) => {
                  setStart(newStart);
                  setEnd(newEnd);
                }}
                min={0}
                max={audioDuration}
                step={1}
                className="mb-4"
                thumbClassName="bg-blue-500 h-4 w-4 rounded-full"
                trackClassName="bg-gray-300 h-2 rounded-full"
              />
              <div className="flex justify-between text-sm mb-4">
                <span>Start: {start.toFixed(2)}s</span>
                <span>End: {end.toFixed(2)}s</span>
              </div>
              <button
                onClick={handleTrim}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Trim Audio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioTrimmer;
