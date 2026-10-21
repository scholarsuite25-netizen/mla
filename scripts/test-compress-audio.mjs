import fs from "node:fs";
import wav from "wav";
import lamejs from "lamejs";

const inputWav = "D:\\Living Your Best Life - Own Who You Are And Want To Be.wav";
const outputMp3 = "C:\\Users\\Registrar\\Music\\mla\\scripts\\test-output.mp3";

console.log(`Reading input: ${inputWav}`);
const stat = fs.statSync(inputWav);
console.log(`Original WAV size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);

const fileBuffer = fs.readFileSync(inputWav);
const reader = new wav.Reader();

reader.on("format", (format) => {
  console.log("Audio Format:", format);
  const channels = format.channels;
  const sampleRate = format.sampleRate;
  // 96 kbps for voice gives broadcast quality with 92% compression
  const kbps = 96;
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
  const mp3Data = [];

  reader.on("data", (chunk) => {
    // 16-bit PCM buffer to Int16Array
    const sampleCount = chunk.length / 2;
    const samples = new Int16Array(chunk.buffer, chunk.byteOffset, sampleCount);

    let mp3buf;
    if (channels === 1) {
      mp3buf = mp3encoder.encodeBuffer(samples);
    } else {
      // De-interleave stereo
      const left = new Int16Array(sampleCount / 2);
      const right = new Int16Array(sampleCount / 2);
      for (let i = 0; i < sampleCount / 2; i++) {
        left[i] = samples[i * 2];
        right[i] = samples[i * 2 + 1];
      }
      mp3buf = mp3encoder.encodeBuffer(left, right);
    }

    if (mp3buf.length > 0) {
      mp3Data.push(Buffer.from(mp3buf));
    }
  });

  reader.on("end", () => {
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(Buffer.from(mp3buf));
    }
    const finalMp3 = Buffer.concat(mp3Data);
    fs.writeFileSync(outputMp3, finalMp3);
    console.log(`Compressed MP3 size: ${(finalMp3.length / (1024 * 1024)).toFixed(2)} MB`);
    const reduction = ((1 - finalMp3.length / stat.size) * 100).toFixed(1);
    console.log(`Space Saved: ${reduction}% reduction!`);
  });
});

reader.end(fileBuffer);
