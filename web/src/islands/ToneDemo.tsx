import { useEffect, useId, useRef, useState } from 'react';

// Interactive A4 tone for the duty-cycle post: a plain square oscillator, or a variable
// duty cycle square wave built with the Fourier series or a WaveShaperNode.
type Method = 'square' | 'fourier' | 'waveshaper';

const FREQUENCY = 440; // A4
const DUTY_CYCLES = [12.5, 25, 50, 75];

interface Voice {
  osc: OscillatorNode;
  nodes: AudioNode[];
}

function createVoice(ctx: AudioContext, method: Method, dutyPercent: number, destination: AudioNode): Voice {
  const duty = dutyPercent / 100;
  const osc = new OscillatorNode(ctx, { frequency: FREQUENCY });

  if (method === 'square') {
    osc.type = 'square';
    osc.connect(destination);
    return { osc, nodes: [osc] };
  }

  if (method === 'fourier') {
    const harmonics = 64;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    real[0] = 2 * duty - 1; // DC offset
    for (let n = 1; n < harmonics; n++) imag[n] = (2 / (n * Math.PI)) * Math.sin(n * duty * Math.PI * 2);
    osc.setPeriodicWave(ctx.createPeriodicWave(real, imag, { disableNormalization: false }));
    osc.connect(destination);
    return { osc, nodes: [osc] };
  }

  // WaveShaper: bend a sawtooth into a square with a step at the duty cycle point.
  osc.type = 'sawtooth';
  const curve = new Float32Array(2048);
  for (let i = 0; i < curve.length; i++) curve[i] = i / (curve.length - 1) < duty ? 1 : -1;
  const shaper = new WaveShaperNode(ctx, { curve });
  osc.connect(shaper).connect(destination);
  return { osc, nodes: [osc, shaper] };
}

export default function ToneDemo({ method }: { method: Method }) {
  const id = useId();
  const [playing, setPlaying] = useState(false);
  const [duty, setDuty] = useState(50);
  const [volume, setVolume] = useState(30);
  const ctx = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const voice = useRef<Voice | null>(null);

  const stopVoice = () => {
    if (!voice.current) return;
    voice.current.osc.stop();
    voice.current.nodes.forEach((n) => n.disconnect());
    voice.current = null;
  };

  const startVoice = (dutyPercent: number) => {
    ctx.current ??= new AudioContext();
    if (!gain.current) {
      gain.current = new GainNode(ctx.current, { gain: volume / 100 });
      gain.current.connect(ctx.current.destination);
    }
    void ctx.current.resume();
    voice.current = createVoice(ctx.current, method, dutyPercent, gain.current);
    voice.current.osc.start();
  };

  const toggle = () => {
    if (playing) stopVoice();
    else startVoice(duty);
    setPlaying(!playing);
  };

  const changeDuty = (d: number) => {
    setDuty(d);
    if (playing) {
      stopVoice();
      startVoice(d);
    }
  };

  useEffect(() => {
    if (gain.current) gain.current.gain.value = volume / 100;
  }, [volume]);

  // Pages swap without a full reload on this site, so stop the sound when leaving.
  useEffect(() => {
    const shutdown = () => {
      stopVoice();
      void ctx.current?.close();
      ctx.current = null;
      gain.current = null;
      setPlaying(false);
    };
    document.addEventListener('astro:before-swap', shutdown);
    return () => {
      document.removeEventListener('astro:before-swap', shutdown);
      shutdown();
    };
  }, []);

  return (
    <div className="tone-demo">
      <button type="button" className="tone-play" onClick={toggle} aria-pressed={playing}>
        <span aria-hidden="true">{playing ? '■' : '▶'}</span> {playing ? 'Stop' : 'Play'}
      </button>
      {method !== 'square' && (
        <fieldset className="tone-duty">
          <legend>Duty cycle</legend>
          {DUTY_CYCLES.map((d) => (
            <label key={d}>
              <input type="radio" name={`${id}-duty`} checked={duty === d} onChange={() => changeDuty(d)} />
              {d}%
            </label>
          ))}
        </fieldset>
      )}
      <label className="tone-volume">
        <span>Volume {volume}%</span>
        <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
      </label>
    </div>
  );
}
