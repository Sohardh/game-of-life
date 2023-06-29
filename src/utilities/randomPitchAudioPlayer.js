async function playAudioWithPitch(audioUrl, pitch) {
  const audioContext = new AudioContext();
  const audioElement = new Audio(audioUrl);
  audioElement.volume = 0.05
  const source = audioContext.createMediaElementSource(audioElement);

  const pitchShift = audioContext.createScriptProcessor(4096, 1, 1);
  pitchShift.onaudioprocess = function (event) {
    const inputBuffer = event.inputBuffer;
    const outputBuffer = event.outputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    const outputData = outputBuffer.getChannelData(0);

    for (let i = 0; i < inputBuffer.length; i++) {
      const idx = Math.floor(i / pitch);
      outputData[i] = inputData[idx] || 0;
    }
  };

  source.connect(pitchShift);
  pitchShift.connect(audioContext.destination);

 await  audioElement.play();
}
export default playAudioWithPitch;