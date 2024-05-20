
export const audioBufferToWav = (buffer) => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const wavDataByteLength = buffer.length * blockAlign;
    const headerByteLength = 44;
    const totalLength = headerByteLength + wavDataByteLength;
    
    const wav = new DataView(new ArrayBuffer(totalLength));
  
    let offset = 0;
  
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        wav.setUint8(offset + i, str.charCodeAt(i));
      }
      offset += str.length;
    };
  
    const writeUint32 = (value) => {
      wav.setUint32(offset, value, true);
      offset += 4;
    };
  
    const writeUint16 = (value) => {
      wav.setUint16(offset, value, true);
      offset += 2;
    };
  
    // RIFF chunk descriptor
    writeString('RIFF');
    writeUint32(totalLength - 8); // file length - 8
    writeString('WAVE');
  
    // fmt sub-chunk
    writeString('fmt ');
    writeUint32(16); // SubChunk1Size (16 for PCM)
    writeUint16(format); // AudioFormat
    writeUint16(numberOfChannels);
    writeUint32(sampleRate);
    writeUint32(byteRate);
    writeUint16(blockAlign);
    writeUint16(bitDepth);
  
    // data sub-chunk
    writeString('data');
    writeUint32(wavDataByteLength);
  
    // Write the PCM samples
    const channelData = [];
    for (let channel = 0; channel < numberOfChannels; channel++) {
      channelData.push(buffer.getChannelData(channel));
    }
  
    let sampleIndex = 0;
    while (sampleIndex < buffer.length) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = channelData[channel][sampleIndex];
        const clampedSample = Math.max(-1, Math.min(1, sample));
        const intSample = clampedSample < 0
          ? clampedSample * 32768
          : clampedSample * 32767;
        wav.setInt16(offset, intSample, true);
        offset += 2;
      }
      sampleIndex++;
    }
  
    return new Blob([wav], { type: 'audio/wav' });
  };
  