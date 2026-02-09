window.addEventListener("keydown", async (e) => {
  if (e.code === "Space") {
    e.preventDefault();

    // Resume AudioContext (REQUIRED)
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    // Play sound
    if (sound && !sound.isPlaying) {

      sound.play();
      console.log("isPlaying:", audioContext.state);
      analyser = new THREE.AudioAnalyser(sound, 32);
    }
  }
});