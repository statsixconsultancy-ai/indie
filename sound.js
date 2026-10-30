/* A film score made live in the browser (no audio files): a slow ambient drone in a big room, soft whooshes between scenes,
   and a clapperboard clap. Starts silent; the Sound button turns it on. */
(() => {
  'use strict';
  const btn = document.getElementById('sndBtn'); if (!btn) return;
  let ctx = null, master = null, on = false, noiseBuf = null, lfoNodes = [];
  const label = btn.querySelector('b');

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    /* a big, dark room: reverb from decaying noise */
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const verb = ctx.createConvolver(); verb.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.55; verb.connect(wet); wet.connect(master);
    const dry = ctx.createGain(); dry.gain.value = 0.7; dry.connect(master);
    const bus = ctx.createGain(); bus.gain.value = 0.5; bus.connect(dry); bus.connect(verb);
    /* the drone: low saws and a triangle through a slowly breathing filter */
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 3; lp.connect(bus);
    [[55, 'sawtooth', 0], [82.41, 'sawtooth', 6], [110, 'triangle', -5], [164.81, 'sine', 3]].forEach(([f, type, det], i) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; const g = ctx.createGain(); g.gain.value = [0.22, 0.14, 0.16, 0.05][i]; o.connect(g); g.connect(lp); o.start(); lfoNodes.push(o);
    });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); lfoNodes.push(lfo);
    /* a faint high shimmer that swells in and out */
    const sh = ctx.createOscillator(); sh.type = 'sine'; sh.frequency.value = 659.25; const sg = ctx.createGain(); sg.gain.value = 0.012; const sl = ctx.createOscillator(); sl.frequency.value = 0.11; const slg = ctx.createGain(); slg.gain.value = 0.01; sl.connect(slg); slg.connect(sg.gain); sh.connect(sg); sg.connect(bus); sh.start(); sl.start(); lfoNodes.push(sh, sl);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    window.cineSound.bus = bus;
  }

  function noiseHit({ f0, f1, dur, vol, type = 'bandpass', q = 1.2 }) {
    if (!ctx || !on) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = type; bp.Q.value = q; bp.frequency.setValueAtTime(f0, ctx.currentTime); bp.frequency.exponentialRampToValueAtTime(f1, ctx.currentTime + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(bp); bp.connect(g); g.connect(window.cineSound.bus); src.start(); src.stop(ctx.currentTime + dur + 0.05);
  }
  window.cineSound = {
    bus: null,
    whoosh() { noiseHit({ f0: 180, f1: 2200, dur: 1.1, vol: 0.5 }); },
    clap() { noiseHit({ f0: 3200, f1: 900, dur: 0.14, vol: 0.9, q: 0.6 }); if (ctx && on) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18); g.gain.setValueAtTime(0.5, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2); o.connect(g); g.connect(window.cineSound.bus); o.start(); o.stop(ctx.currentTime + 0.25); } },
    get on() { return on; }
  };

  function set(v) {
    on = v; btn.setAttribute('aria-pressed', String(v)); btn.classList.toggle('on', v); label.textContent = v ? 'Sound on' : 'Sound off';
    if (!ctx) build();
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(v ? 0.55 : 0, ctx.currentTime, v ? 1.2 : 0.4);
    try { localStorage.setItem('indie-sound', v ? '1' : '0'); } catch (e) {}
  }
  btn.addEventListener('click', () => set(!on));
  addEventListener('stopchange', () => { if (on) window.cineSound.whoosh(); });
})();
