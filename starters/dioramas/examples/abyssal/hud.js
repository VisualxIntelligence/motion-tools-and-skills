// The instrument panel: an odometer-style depth readout that rolls like a mechanical counter,
// environmental readouts, the rail marker and the dive log.
const PLACES = 5; // 10,935 needs five digits

export function odometer(el) {
  el.innerHTML = '';
  const cols = [];
  for (let k = PLACES - 1; k >= 0; k--) {
    const c = document.createElement('span');
    c.className = 'col';
    const strip = document.createElement('span');
    strip.innerHTML = '01234567890'.split('').map(d => `<i>${d}</i>`).join('');
    c.appendChild(strip);
    el.appendChild(c);
    cols.push({ el: c, strip, k, last: -1, lead: null });
    if (k === 3) { const s = document.createElement('span'); s.className = 'sep'; s.textContent = ','; el.appendChild(s); cols.sep = s; }
  }
  const unit = document.createElement('span');
  unit.className = 'unit'; unit.textContent = 'm';
  el.appendChild(unit);
  return {
    set(v) {
      v = Math.max(0, v);
      for (const c of cols) {
        const p = 10 ** c.k;
        let pos;
        // Detent: each wheel rests on its digit and snaps over in the last third of a count, like a mechanical counter.
        const snap = f => { const x = Math.min(1, Math.max(0, (f - 0.66) / 0.34)); return x * x * (3 - 2 * x); };
        if (c.k === 0) pos = Math.floor(v) % 10 + snap(v % 1);
        else {
          const digit = Math.floor(v / p) % 10;
          const lower = v % p;
          // Carry: the digit rolls only while the digits below it pass from 9 to 0.
          pos = digit + snap(Math.max(0, lower - (p - 1)));
        }
        const q = Math.round(pos * 1000) / 1000;
        if (q !== c.last) { c.strip.style.transform = `translateY(${(-q).toFixed(3)}em)`; c.last = q; }
        const lead = v < p && c.k > 0;
        if (lead !== c.lead) { c.el.classList.toggle('lead', lead); c.lead = lead; }
      }
      cols.sep.classList.toggle('lead', v < 1000);
    },
  };
}

// Depth profile of the Mariana Trench water column (approximate, for the readouts).
const TEMP = [[0, 27.2], [60, 26.4], [120, 23.5], [200, 19], [350, 11], [600, 6.5], [1000, 4.1], [2000, 2.2], [4000, 1.5], [6000, 1.55], [8000, 1.9], [10935, 2.4]];
export function tempAt(d) {
  for (let i = 1; i < TEMP.length; i++) {
    if (d <= TEMP[i][0]) { const [a, ta] = TEMP[i - 1], [b, tb] = TEMP[i]; return ta + (tb - ta) * (d - a) / (b - a); }
  }
  return 2.4;
}
export const pressureAt = d => 1 + d / 10.08;
export const lightAt = d => 100 * Math.exp(-0.023 * d);
export function fmtLight(l) {
  if (l >= 10) return l.toFixed(0);
  if (l >= 0.1) return l.toFixed(1);
  if (l < 1e-12) return '0.0';
  const e = Math.floor(Math.log10(l));
  return `${(l / 10 ** e).toFixed(1)}e${e}`;
}
export function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = Math.floor(s) % 60;
  return `T+ ${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
export function zoneAt(d) {
  if (d < 200) return 'Epipelagic';
  if (d < 1000) return 'Mesopelagic';
  if (d < 4000) return 'Bathypelagic';
  if (d < 6000) return 'Abyssopelagic';
  if (d < 10900) return 'Hadopelagic';
  return 'Challenger Deep';
}

export const LOG = [
  [0, '06:40', 'Released from the A-frame. Vents open.'],
  [45, '06:41', 'Support ship’s hull out of sight'],
  [200, '06:43', 'Red wavelengths gone. Hull reads grey.'],
  [750, '06:52', 'Floodlights on'],
  [1000, '06:57', 'Sunlight: none detected'],
  [2300, '07:18', 'Sonar contact, bearing 040'],
  [4900, '08:02', 'Plume detected. Vent fluid 380 °C'],
  [6000, '08:20', 'Entering the trench'],
  [10900, '09:42', 'Touchdown. Challenger Deep.'],
];
