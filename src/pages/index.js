import { useState, useRef, useEffect } from 'react';
import Slider from 'react-slider';
import 'tailwindcss/tailwind.css';

export default function Home() {
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioFile && audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
        setEndTime(audioRef.current.duration);
      };
    }
  }, [audioFile]);

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleTrim = async () => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('start', startTime.toString());
    formData.append('end', endTime.toString());

    const response = await fetch('/api/trim', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trimmed-audio.mp3';
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Audio Trimmer</h1>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="mb-4"
      />
      {audioFile && (
        <div className="w-full">
          <audio controls ref={audioRef} className="w-full mb-4">
            <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
          </audio>
          <div className="mb-4">
            <label className="block text-lg">Start Time: {startTime.toFixed(2)}s</label>
            <Slider
              min={0}
              max={duration}
              value={startTime}
              onChange={(value) => setStartTime(value)}
              className="mt-2"
              thumbClassName="bg-blue-500 w-4 h-4 rounded-full"
              trackClassName="bg-gray-300 h-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg">End Time: {endTime.toFixed(2)}s</label>
            <Slider
              min={0}
              max={duration}
              value={endTime}
              onChange={(value) => setEndTime(value)}
              className="mt-2"
              thumbClassName="bg-blue-500 w-4 h-4 rounded-full"
              trackClassName="bg-gray-300 h-2 rounded"
            />
          </div>
          <button
            onClick={handleTrim}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Trim Audio
          </button>
        </div>
      )}
    </div>
  );
}
