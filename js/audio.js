// ===== audio.js — процедурные звуки на WebAudio (без внешних ассетов) =====
// Ленивая инициализация AudioContext по первому действию пользователя.

const Sfx = {
  ctx: null,
  enabled: true,
};

Sfx.init = function () {
  if (this.ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) this.ctx = new AC();
  } catch (e) { this.ctx = null; }
};

// Простой тон с огибающей
Sfx._tone = function (freq, dur, type, gain, startAt) {
  if (!this.ctx) return;
  const t0 = this.ctx.currentTime + (startAt || 0);
  const osc = this.ctx.createOscillator();
  const g = this.ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.08, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(this.ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
};

Sfx._noise = function (dur, gain) {
  if (!this.ctx) return;
  const t0 = this.ctx.currentTime;
  const bufSize = Math.floor(this.ctx.sampleRate * dur);
  const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = this.ctx.createBufferSource(); src.buffer = buf;
  const g = this.ctx.createGain(); g.gain.value = gain || 0.05;
  src.connect(g); g.connect(this.ctx.destination);
  src.start(t0);
};

Sfx.play = function (name) {
  if (!this.enabled) return;
  if (!this.ctx) this.init();
  if (!this.ctx) return;
  if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  switch (name) {
    case 'buy':
      this._tone(660, 0.08, 'square', 0.05);
      this._tone(880, 0.10, 'square', 0.04, 0.06);
      break;
    case 'sell':
      this._tone(520, 0.07, 'triangle', 0.07);
      this._tone(780, 0.09, 'triangle', 0.06, 0.05);
      break;
    case 'click':
      this._tone(300, 0.05, 'sine', 0.06);
      break;
    case 'achievement':
      this._tone(523, 0.12, 'sine', 0.07);
      this._tone(659, 0.12, 'sine', 0.07, 0.10);
      this._tone(784, 0.18, 'sine', 0.07, 0.20);
      break;
    case 'prestige':
      this._tone(392, 0.15, 'sawtooth', 0.05);
      this._tone(523, 0.15, 'sawtooth', 0.05, 0.12);
      this._tone(659, 0.15, 'sawtooth', 0.05, 0.24);
      this._tone(1046, 0.30, 'sine', 0.06, 0.36);
      break;
    case 'error':
      this._tone(180, 0.18, 'sawtooth', 0.06);
      break;
    case 'offline':
      this._tone(440, 0.1, 'triangle', 0.06);
      this._tone(660, 0.14, 'triangle', 0.06, 0.08);
      break;
    default:
      this._noise(0.05, 0.03);
  }
};

Sfx.ambientOn = false;
Sfx.ambientNodes = null;

Sfx.startAmbient = function () {
  if (this.ambientNodes) return;
  if (!this.ctx) this.init();
  if (!this.ctx) return;
  if (this.ctx.state === 'suspended') this.ctx.resume().catch(function () {});
  const ctx = this.ctx;
  const master = ctx.createGain(); master.gain.value = 0.03; master.connect(ctx.destination);
  const freqs = [110, 164.81, 220];
  const oscs = [];
  freqs.forEach(function (f, idx) {
    const o = ctx.createOscillator();
    o.type = idx === 2 ? 'triangle' : 'sine';
    o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = 0.5 / (idx + 1);
    o.connect(g); g.connect(master); o.start();
    oscs.push({ o: o, g: g });
  });
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.012;
  lfo.connect(lfoGain); lfoGain.connect(master.gain); lfo.start();
  this.ambientNodes = { master: master, oscs: oscs, lfo: lfo, lfoGain: lfoGain };
};

Sfx.stopAmbient = function () {
  const a = this.ambientNodes; if (!a) return;
  try {
    a.oscs.forEach(function (x) { x.o.stop(); x.o.disconnect(); });
    a.lfo.stop(); a.lfo.disconnect(); a.master.disconnect();
  } catch (e) {}
  this.ambientNodes = null;
};

Sfx.setAmbient = function (on) {
  this.ambientOn = !!on;
  if (on) this.startAmbient(); else this.stopAmbient();
};

Sfx.setEnabled = function (on) {
  this.enabled = !!on;
  if (on) this.init();
};