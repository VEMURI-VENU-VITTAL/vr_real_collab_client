// Create analyser for a MediaStream (remote or local)
export function createVoiceAnalyser(stream) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();

  const source = ctx.createMediaStreamSource(stream);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;            // frequency resolution
  analyser.smoothingTimeConstant = 0.8;

  // Optional: avoid feedback by NOT connecting to destination
  // source.connect(analyser) only
  source.connect(analyser);

  const freqData = new Uint8Array(analyser.frequencyBinCount);
  const timeData = new Uint8Array(analyser.fftSize);

  return { ctx, source, analyser, freqData, timeData };
}

export function getRmsLoudness(analyser, timeData) {
  analyser.getByteTimeDomainData(timeData); // values 0..255 around 128

  let sumSquares = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = (timeData[i] - 128) / 128; // normalize to -1..1
    sumSquares += v * v;
  }
  const rms = Math.sqrt(sumSquares / timeData.length); // 0..~1
  return rms;
}

export function mapMouthOpen(rms) {
  // tweak these for your voice + mic level
  const min = 0.02;     // below this => closed
  const max = 0.12;     // above this => fully open

  let x = (rms - min) / (max - min);
  x = Math.max(0, Math.min(1, x));

  // make it more expressive
  return Math.pow(x, 0.7);
}