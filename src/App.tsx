import { useEffect, useMemo, useState } from 'react';

// ---------- Types ----------
type TabId =
  | 'RAGE'
  | 'LEGIT'
  | 'VISUALS'
  | 'AGENTS'
  | 'MISC'
  | 'CONFIG'
  | 'SCRIPTS'
  | 'SKINS';

interface Agent {
  id: string;
  name: string;
  faction: 'CT' | 'T';
  rarity: 'Covert' | 'Classified' | 'Restricted' | 'Mil-Spec';
  kd: number;
  wr: number;
  hs: number;
  matches: number;
  accent: string;
  code: string;
}

// ---------- Data ----------
const AGENTS: Agent[] = [
  { id: 'a1', name: 'Reznik "The Wolf"',        faction: 'T',  rarity: 'Covert',     kd: 3.42, wr: 78, hs: 64, matches: 1284, accent: '#ff3d4d', code: 'NVA-01' },
  { id: 'a2', name: 'Sabel "Phantom"',          faction: 'CT', rarity: 'Covert',     kd: 2.98, wr: 71, hs: 58, matches: 982,  accent: '#00e0ff', code: 'NVA-02' },
  { id: 'a3', name: 'Kovalenko "Rook"',         faction: 'CT', rarity: 'Classified', kd: 2.11, wr: 66, hs: 49, matches: 2145, accent: '#a855f7', code: 'NVA-03' },
  { id: 'a4', name: 'Volk "Serpent"',           faction: 'T',  rarity: 'Classified', kd: 2.77, wr: 69, hs: 71, matches: 1433, accent: '#38ff8c', code: 'NVA-04' },
  { id: 'a5', name: 'Dasha "Spectre"',          faction: 'T',  rarity: 'Restricted', kd: 1.92, wr: 58, hs: 44, matches: 742,  accent: '#ffc83d', code: 'NVA-05' },
  { id: 'a6', name: 'Moreno "Corsair"',         faction: 'CT', rarity: 'Restricted', kd: 1.74, wr: 55, hs: 38, matches: 612,  accent: '#ff7a00', code: 'NVA-06' },
  { id: 'a7', name: 'Ivanov "Havoc"',           faction: 'T',  rarity: 'Mil-Spec',   kd: 1.40, wr: 51, hs: 33, matches: 488,  accent: '#7dd3fc', code: 'NVA-07' },
  { id: 'a8', name: 'Lindqvist "Owl"',          faction: 'CT', rarity: 'Mil-Spec',   kd: 1.22, wr: 49, hs: 29, matches: 301,  accent: '#f472b6', code: 'NVA-08' },
];

const TABS: { id: TabId; icon: string; badge?: string }[] = [
  { id: 'RAGE',    icon: '🎯', badge: 'ON' },
  { id: 'LEGIT',   icon: '🔫' },
  { id: 'VISUALS', icon: '👁' },
  { id: 'AGENTS',  icon: '🦹', badge: 'NEW' },
  { id: 'SCRIPTS', icon: '⚡' },
  { id: 'MISC',    icon: '⚙' },
  { id: 'SKINS',   icon: '💎' },
  { id: 'CONFIG',  icon: '📁' },
];

const WEAPONS = ['AK-47', 'M4A4', 'AWP', 'Desert Eagle', 'USP-S', 'Glock-18', 'SCAR-20', 'G3SG1'];

// ---------- Helpers ----------
const rarityColor: Record<Agent['rarity'], string> = {
  'Covert':     '#ff3d4d',
  'Classified': '#a855f7',
  'Restricted': '#3b82f6',
  'Mil-Spec':   '#4b8a4b',
};

// ---------- Reusable UI ----------
function Toggle({ checked, onChange, label, hotkey }: { checked: boolean; onChange: (v: boolean) => void; label: string; hotkey?: string }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 border-l-2 transition-colors cursor-pointer group ${
        checked ? 'border-[var(--nl-accent)] bg-[#141923]' : 'border-[#1c2230] bg-[#0f131a] hover:bg-[#141923]'
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-2">
        <span className={`font-ui text-[13px] font-semibold tracking-wide ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {label}
        </span>
        {hotkey && (
          <span className="font-mono text-[10px] text-slate-500 border border-[#222a3c] px-1 rounded-sm">[{hotkey}]</span>
        )}
      </div>
      <div className={`relative w-8 h-[16px] rounded-sm transition-colors ${checked ? 'bg-[var(--nl-accent)] glow-red' : 'bg-[#1c2230]'}`}>
        <div className={`absolute top-[1px] w-[14px] h-[14px] bg-white/90 shadow transition-all ${checked ? 'left-[17px]' : 'left-[1px]'}`} />
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 100, suffix = '', color = 'red' }: {
  label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; suffix?: string; color?: 'red' | 'cyan' | 'green' | 'purple';
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const colorMap = {
    red: 'var(--nl-accent)',
    cyan: 'var(--nl-accent-2)',
    green: 'var(--nl-green)',
    purple: '#a855f7',
  } as const;
  return (
    <div className="px-3 py-2 bg-[#0f131a] border-l-2 border-[#1c2230]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-ui text-[12px] font-semibold text-slate-300 tracking-wide uppercase">{label}</span>
        <span className="font-mono text-[11px]" style={{ color: colorMap[color] }}>{value}{suffix}</span>
      </div>
      <div className="relative h-1 bg-[#1c2230] rounded-sm">
        <div className="absolute left-0 top-0 h-full rounded-sm" style={{ width: `${pct}%`, background: colorMap[color], boxShadow: `0 0 6px ${colorMap[color]}` }} />
        <input
          type="range"
          className="nl-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-[10px] h-[14px] bg-white shadow pointer-events-none"
             style={{ left: `calc(${pct}% - 5px)`, boxShadow: `0 0 6px ${colorMap[color]}` }} />
      </div>
    </div>
  );
}

function Dropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 py-2 bg-[#0f131a] border-l-2 border-[#1c2230]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-ui text-[12px] font-semibold text-slate-300 tracking-wide uppercase">{label}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-[#0a0d12] border border-[#222a3c] px-2 py-1 font-mono text-[11px] text-white hover:border-[var(--nl-accent)] transition-colors"
        >
          <span>{value}</span>
          <span className="text-[var(--nl-accent)]">▾</span>
        </button>
        {open && (
          <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-[#0f131a] border border-[var(--nl-accent)] shadow-2xl">
            {options.map((o) => (
              <div
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className={`px-2 py-1 font-mono text-[11px] cursor-pointer hover:bg-[var(--nl-accent)] hover:text-white transition-colors ${o === value ? 'text-[var(--nl-accent)]' : 'text-slate-300'}`}
              >
                {o}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupTitle({ children, count }: { children: React.ReactNode; count?: number | string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1c2230] bg-gradient-to-r from-[#141923] to-transparent">
      <div className="w-1 h-3 bg-[var(--nl-accent)]" />
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-white font-bold">{children}</span>
      {count !== undefined && (
        <span className="font-mono text-[10px] text-[var(--nl-accent-2)] border border-[var(--nl-accent-2)]/40 px-1.5 py-[1px] rounded-sm">{count}</span>
      )}
    </div>
  );
}

function KeyBind({ keyName, label }: { keyName: string; label: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f131a] border-l-2 border-[#1c2230]">
      <span className="font-ui text-[12px] text-slate-400">{label}</span>
      <span className="font-mono text-[11px] bg-[#0a0d12] border border-[#222a3c] px-2 py-[1px] text-white min-w-[36px] text-center">{keyName}</span>
    </div>
  );
}

// ---------- Game Background (the "match" HUD behind menu) ----------
function GameBackground({ hits, targetName }: { hits: number[]; targetName: string }) {
  const [enemies, setEnemies] = useState<{ id: number; x: number; y: number; hp: number; name: string; weapon: string; angle: number }[]>([]);
  const [timer, setTimer] = useState(247);
  const [ctScore, tScore] = [12, 9];

  useEffect(() => {
    const names = ['s1mple.hvh', 'ZywOo.aim', 'NiKo!', 'device.', 'ropz^', 'Twistzz', 'mONESY_', 'Ax1Le'];
    const weapons = ['AK-47', 'AWP', 'M4A4', 'Deagle', 'SCAR-20'];
    const list = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 30 + Math.random() * 40,
      hp: Math.floor(60 + Math.random() * 40),
      name: names[i % names.length],
      weapon: weapons[Math.floor(Math.random() * weapons.length)],
      angle: Math.random() * 360,
    }));
    setEnemies(list);
    const t = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 247)), 1000);
    const m = setInterval(() => {
      setEnemies((arr) => arr.map((e) => ({
        ...e,
        x: Math.max(5, Math.min(95, e.x + (Math.random() - 0.5) * 1.2)),
        y: Math.max(20, Math.min(85, e.y + (Math.random() - 0.5) * 0.8)),
        angle: e.angle + (Math.random() - 0.5) * 4,
      })));
    }, 900);
    return () => { clearInterval(t); clearInterval(m); };
  }, []);

  const radarDots = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    x: 50 + (Math.sin(i * 1.7) * 35) + (Math.random() - 0.5) * 4,
    y: 50 + (Math.cos(i * 1.3) * 35) + (Math.random() - 0.5) * 4,
    team: i % 3 === 0 ? 'T' : i % 5 === 0 ? 'CT' : 'none',
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background gradient: Dust2-like hazy scene */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#3a2a1a_0%,#1a1208_40%,#050810_100%)]" />
      {/* Faux map geometry */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b6f47" />
            <stop offset="100%" stopColor="#2e2417" />
          </linearGradient>
        </defs>
        <polygon points="0,0 450,0 550,180 300,420 0,500" fill="url(#wall)" opacity="0.6" />
        <polygon points="1600,0 1200,0 1100,220 1400,380 1600,320" fill="url(#wall)" opacity="0.55" />
        <rect x="600" y="620" width="420" height="280" fill="#241a10" opacity="0.7" />
        <rect x="0" y="700" width="260" height="200" fill="#1c1408" opacity="0.7" />
        <polygon points="1300,700 1600,650 1600,900 1250,900" fill="#22180c" opacity="0.7" />
        <rect x="480" y="120" width="120" height="60" fill="#2a1e0e" opacity="0.7" />
        <rect x="960" y="80" width="140" height="70" fill="#2a1e0e" opacity="0.7" />
      </svg>
      {/* Sky haze */}
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[#5a3a1c]/40 via-[#3a2612]/20 to-transparent" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines" />

      {/* Crosshair centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 crosshair" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--nl-accent-2)] shadow-[0_0_6px_var(--nl-accent-2)]" />

      {/* Enemy boxes (simulated ESP) */}
      {enemies.map((e) => (
        <div key={e.id} className="absolute" style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translate(-50%, -50%)' }}>
          {/* Skeleton head dot */}
          <div className="relative w-14 h-20 border border-[var(--nl-accent)] glow-red">
            <div className="absolute -left-[1px] top-[30%] w-2 h-2 border border-[var(--nl-accent)] bg-transparent" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-[var(--nl-accent)]">
              <div className="absolute inset-1 rounded-full bg-[var(--nl-accent)]/80" />
            </div>
            <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[var(--nl-accent)]" />
            {/* HP bar */}
            <div className="absolute -top-6 left-0 w-14 h-1 bg-black/80">
              <div className="h-full bg-[var(--nl-accent)]" style={{ width: `${e.hp}%` }} />
            </div>
            <div className="absolute -top-[26px] left-0 font-mono text-[10px] neon-red font-bold">{e.hp}</div>
          </div>
          <div className="mt-1 text-center font-mono text-[10px] neon-red whitespace-nowrap">
            {e.name}
            <div className="text-[9px] text-slate-300" style={{ textShadow: 'none' }}>{e.weapon}</div>
          </div>
        </div>
      ))}

      {/* Hitmarkers */}
      {hits.map((h) => (
        <div key={h} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--nl-accent)] font-display text-2xl font-black anim-hit" style={{ textShadow: '0 0 10px #ff3d4d' }}>
          ✦ HIT
        </div>
      ))}

      {/* Top HUD: scoreboard */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-0 mt-2 font-display">
        <div className="bg-[#1a3a6b]/80 border border-[#4d8ff0]/40 px-4 py-1 clip-btn">
          <span className="text-[#6fb0ff] font-black text-lg">CT</span>
          <span className="ml-2 text-white font-black text-lg">{ctScore}</span>
        </div>
        <div className="bg-black/70 border border-[#2a2a2a] px-4 py-1">
          <span className="text-slate-300 font-mono text-sm">
            {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="bg-[#6b2a1a]/80 border border-[#ff6b4d]/40 px-4 py-1 clip-btn">
          <span className="text-[#ffb06f] font-black text-lg">{tScore}</span>
          <span className="ml-2 text-white font-black text-lg">T</span>
        </div>
      </div>

      {/* Bottom left: radar */}
      <div className="absolute bottom-4 left-4 w-40 h-40 rounded-full border-2 border-[var(--nl-accent-2)]/60 bg-[#0a1820]/80 overflow-hidden glow-cyan">
        <div className="absolute inset-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="absolute rounded-full border border-[var(--nl-accent-2)]/20"
                 style={{
                   inset: `${i * 12}%`,
                 }} />
          ))}
          <div className="absolute left-1/2 top-1/2 w-px h-full bg-[var(--nl-accent-2)]/30" />
          <div className="absolute left-1/2 top-1/2 w-full h-px bg-[var(--nl-accent-2)]/30" />
        </div>
        {/* Sweep */}
        <div className="absolute inset-0 radar-sweep">
          <div className="absolute left-1/2 top-1/2 w-1/2 h-px bg-gradient-to-r from-[var(--nl-accent-2)] to-transparent origin-left" style={{ transform: 'rotate(0deg)' }} />
        </div>
        {/* Dots */}
        {radarDots.map((d, i) => (
          <div key={i}
               className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
               style={{
                 left: `${d.x}%`, top: `${d.y}%`,
                 background: d.team === 'T' ? '#ffb06f' : d.team === 'CT' ? '#6fb0ff' : '#555',
                 boxShadow: d.team !== 'none' ? `0 0 4px ${d.team === 'T' ? '#ffb06f' : '#6fb0ff'}` : undefined,
               }} />
        ))}
        {/* Player in center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--nl-accent-2)]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', boxShadow: '0 0 6px var(--nl-accent-2)' }} />
      </div>

      {/* Bottom right: ammo/health */}
      <div className="absolute bottom-4 right-4 flex items-end gap-3 font-display">
        <div className="text-right">
          <div className="text-[10px] text-slate-400 tracking-widest">HEALTH</div>
          <div className="text-4xl font-black neon-green">100</div>
        </div>
        <div className="w-px h-10 bg-[var(--nl-accent)]/50" />
        <div>
          <div className="text-[10px] text-slate-400 tracking-widest text-right">ARMOR</div>
          <div className="text-4xl font-black neon-cyan">100</div>
        </div>
        <div className="w-px h-10 bg-[var(--nl-accent)]/50" />
        <div className="text-right">
          <div className="text-[10px] text-slate-400 tracking-widest">AK-47</div>
          <div className="font-mono">
            <span className="text-4xl font-black neon-red">30</span>
            <span className="text-lg text-slate-500">/90</span>
          </div>
        </div>
      </div>

      {/* Kill feed top right */}
      <div className="absolute top-3 right-3 space-y-1 font-mono text-[11px]">
        {[
          { k: 'mONESY_', v: targetName, w: 'ak47', hs: true },
          { k: 'ZywOo.aim', v: 'device.', w: 'awp', hs: false },
          { k: targetName, v: 'Twistzz', w: 'deagle', hs: true },
          { k: 'NiKo!', v: 'ropz^', w: 'scar20', hs: false },
        ].slice(0, 4).map((kill, i) => (
          <div key={i} className="flex items-center gap-2 bg-black/60 border border-[#222] px-2 py-0.5">
            <span className={kill.k === targetName ? 'neon-red' : 'text-[#6fb0ff]'}>{kill.k}</span>
            <span className="text-slate-500">[{kill.hs ? '★HS' : 'KILL'}]</span>
            <span className="text-slate-400 text-[10px]">{kill.w}</span>
            <span className="text-[#ffb06f]">{kill.v}</span>
          </div>
        ))}
      </div>

      {/* Watermark */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-[var(--nl-accent)] rounded-full pulse-red" />
        <div>
          <div className="font-display text-[11px] tracking-[0.25em] neon-red">NEVERLOSE.CC</div>
          <div className="font-mono text-[9px] text-slate-500">v4.3.27 — PRIME · 243 FPS · {targetName}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab contents ----------
function RageTab() {
  const [enabled, setEnabled] = useState(true);
  const [aimkey] = useState('Mouse 5');
  const [fov, setFov] = useState(18);
  const [hitchance, setHitchance] = useState(82);
  const [mindmg, setMindmg] = useState(24);
  const [baim, setBaim] = useState(40);
  const [autowall, setAutowall] = useState(true);
  const [doubletap, setDoubletap] = useState(true);
  const [hideshots, setHideshots] = useState(true);
  const [onkey, setOnkey] = useState(true);
  const [desync, setDesync] = useState(true);
  const [desyncSide, setDesyncSide] = useState('Right');
  const [yaw, setYaw] = useState(180);
  const [antiaim, setAntiaim] = useState('Full Jitter');
  const [pitch, setPitch] = useState('Down');
  const [resolver, setResolver] = useState('Bruteforce');
  const [exploits, setExploits] = useState('Shift');
  const [weapon, setWeapon] = useState('AK-47');

  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-3 pb-4">
      {/* Master */}
      <div>
        <GroupTitle>Master Switch</GroupTitle>
        <div className="px-3 py-2.5 bg-gradient-to-r from-[#1a0d12] to-[#0f131a] border-l-2 border-[var(--nl-accent)] flex items-center justify-between">
          <div>
            <div className="font-display text-base font-black neon-red tracking-wider">RAGEBOT ACTIVE</div>
            <div className="font-mono text-[10px] text-slate-400">TARGETING: ENEMY · 3/6 VALID</div>
          </div>
          <button onClick={() => setEnabled(!enabled)}
                  className={`px-5 py-1.5 font-display text-sm font-black tracking-wider clip-btn transition-all ${enabled ? 'bg-[var(--nl-accent)] text-white glow-red' : 'bg-[#1c2230] text-slate-400'}`}>
            {enabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* Aimbot */}
      <div>
        <GroupTitle count="07">Aimbot — {weapon}</GroupTitle>
        <div className="grid grid-cols-1 gap-[2px]">
          <div className="px-3 py-1 bg-[#0f131a] flex items-center gap-2 border-l-2 border-[var(--nl-accent)]">
            <span className="font-ui text-[11px] text-slate-400 w-24">CONFIG PRESET</span>
            <div className="flex gap-1 flex-wrap">
              {WEAPONS.map((w) => (
                <button key={w}
                        onClick={() => setWeapon(w)}
                        className={`px-2 py-0.5 font-mono text-[10px] clip-btn transition-colors ${
                          weapon === w ? 'bg-[var(--nl-accent)] text-white' : 'bg-[#1c2230] text-slate-400 hover:bg-[#252c3d]'
                        }`}>
                  {w}
                </button>
              ))}
            </div>
          </div>
          <Toggle checked={onkey} onChange={setOnkey} label="Enable on key" hotkey={aimkey} />
          <Toggle checked={autowall} onChange={setAutowall} label="Autowall penetration" />
          <Toggle checked={doubletap} onChange={setDoubletap} label="Double tap exploit" hotkey="SHIFT" />
          <Toggle checked={hideshots} onChange={setHideshots} label="Hide shots" />
          <Slider label="Field of View" value={fov} onChange={setFov} min={1} max={180} suffix="°" color="red" />
          <Slider label="Hit Chance" value={hitchance} onChange={setHitchance} min={1} max={100} suffix="%" color="red" />
          <Slider label="Min Damage" value={mindmg} onChange={setMindmg} min={1} max={100} suffix="hp" color="red" />
          <Slider label="Force body aim" value={baim} onChange={setBaim} min={0} max={100} suffix="%" color="purple" />
        </div>
      </div>

      {/* Hitbox selection */}
      <div>
        <GroupTitle>Hitbox Priority</GroupTitle>
        <div className="px-3 py-2 bg-[#0f131a] grid grid-cols-4 gap-1">
          {['Head', 'Chest', 'Stomach', 'Arms', 'Legs', 'Neck', 'Pelvis'].map((h) => {
            const on = ['Head', 'Chest', 'Neck'].includes(h);
            return (
              <button key={h} className={`py-1 font-mono text-[11px] clip-btn border ${on ? 'bg-[var(--nl-accent)] border-[var(--nl-accent)] text-white glow-red' : 'bg-[#0a0d12] border-[#222a3c] text-slate-400'}`}>
                {h.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Anti-Aim */}
      <div>
        <GroupTitle count="AA">Anti-Aim</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={desync} onChange={setDesync} label="Desync" hotkey="ALT" />
          <Dropdown label="Yaw Base" value={antiaim} options={['Static', 'Jitter', 'Full Jitter', 'Random', 'Reverse', 'Zero']} onChange={setAntiaim} />
          <Dropdown label="Pitch" value={pitch} options={['Off', 'Up', 'Down', 'Zero', 'Random']} onChange={setPitch} />
          <Dropdown label="Desync Side" value={desyncSide} options={['Left', 'Right', 'Random', 'Switch']} onChange={setDesyncSide} />
          <Slider label="Yaw Offset" value={yaw} onChange={setYaw} min={0} max={180} suffix="°" color="cyan" />
        </div>
      </div>

      {/* Resolver */}
      <div>
        <GroupTitle>Resolver</GroupTitle>
        <div className="space-y-[2px]">
          <Dropdown label="Mode" value={resolver} options={['Off', 'Bruteforce', 'Adaptive', 'AI Neural', 'Legacy']} onChange={setResolver} />
          <Dropdown label="Exploits" value={exploits} options={['None', 'Shift', 'Crouch Offset', 'Edge', 'Stand-Up']} onChange={setExploits} />
          <Toggle checked={true} onChange={() => {}} label="Bruteforce desync" />
          <Toggle checked={true} onChange={() => {}} label="Force safe point" />
          <Toggle checked={false} onChange={() => {}} label="Body resolver" />
        </div>
      </div>
    </div>
  );
}

function AgentsTab({ setTargetName }: { targetName: string; setTargetName: (s: string) => void }) {
  const [selected, setSelected] = useState<Agent>(AGENTS[0]);
  const [filter, setFilter] = useState<'ALL' | 'CT' | 'T'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = AGENTS.filter((a) => (filter === 'ALL' || a.faction === filter) && a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col gap-2">
      <GroupTitle count={AGENTS.length}>Operator Roster — Agents</GroupTitle>
      <div className="flex gap-1 px-3">
        {(['ALL', 'CT', 'T'] as const).map((f) => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-0.5 font-display text-[11px] font-bold tracking-wider clip-btn ${
              filter === f ? 'bg-[var(--nl-accent)] text-white glow-red' : 'bg-[#1c2230] text-slate-400 hover:text-white'
            }`}>
            {f}
          </button>
        ))}
        <div className="flex-1 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH OPERATORS..."
            className="w-full bg-[#0a0d12] border border-[#222a3c] focus:border-[var(--nl-accent)] outline-none px-2 py-1 font-mono text-[11px] text-white placeholder-slate-600"
          />
        </div>
      </div>

      <div className="nl-scroll overflow-y-auto flex-1 grid grid-cols-2 gap-1.5 px-3 pb-2">
        {filtered.map((a) => {
          const active = selected.id === a.id;
          return (
            <div key={a.id}
              onClick={() => setSelected(a)}
              className={`relative cursor-pointer border-l-2 p-2 transition-all ${
                active ? 'bg-[#1a0d12] border-[var(--nl-accent)] glow-red' : 'bg-[#0f131a] border-[#1c2230] hover:border-[var(--nl-accent)]/50'
              }`}>
              <div className="flex items-start gap-2">
                {/* Avatar */}
                <div className="relative w-12 h-14 flex-shrink-0 overflow-hidden border border-[#222a3c]" style={{ background: `linear-gradient(135deg, ${a.accent}40, #0a0d12 70%)` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 48 56" className="w-full h-full">
                      <circle cx="24" cy="14" r="7" fill={a.accent} opacity="0.85" />
                      <path d="M10 50 C10 34 38 34 38 50 Z" fill={a.accent} opacity="0.7" />
                      <rect x="20" y="10" width="8" height="3" fill="#0a0d12" />
                      <rect x="22" y="20" width="4" height="2" fill="#0a0d12" />
                    </svg>
                  </div>
                  <div className="absolute top-0 left-0 font-mono text-[8px] px-1 bg-black/70 text-white">{a.faction}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-display text-[10px] font-black tracking-wider truncate" style={{ color: rarityColor[a.rarity] }}>{a.rarity.toUpperCase()}</span>
                  </div>
                  <div className="font-ui text-[12px] font-bold text-white truncate leading-tight">{a.name}</div>
                  <div className="font-mono text-[9px] text-slate-500 mt-0.5">{a.code}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                    <span className="neon-red">K/D {a.kd}</span>
                    <span className="text-slate-400">WR {a.wr}%</span>
                  </div>
                </div>
              </div>
              {active && (
                <div className="absolute -right-0 top-0 bg-[var(--nl-accent)] px-1 font-mono text-[9px] text-white">EQUIPPED</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected agent details panel */}
      <div className="border-t border-[#1c2230] bg-[#0f131a] p-3">
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 overflow-hidden border border-[var(--nl-accent)] glow-red" style={{ background: `linear-gradient(135deg, ${selected.accent}, #0a0d12 80%)` }}>
            <svg viewBox="0 0 48 56" className="w-full h-full">
              <circle cx="24" cy="16" r="8" fill="url(#agrad)" opacity="0.9" />
              <path d="M6 56 C6 34 42 34 42 56 Z" fill="url(#agrad2)" opacity="0.9" />
              <defs>
                <linearGradient id="agrad"><stop stopColor="#fff" offset="0"/><stop stopColor={selected.accent} offset="1"/></linearGradient>
                <linearGradient id="agrad2"><stop stopColor={selected.accent} offset="0"/><stop stopColor="#0a0d12" offset="1"/></linearGradient>
              </defs>
            </svg>
            <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--nl-green)] rounded-full glow-green" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm" style={{ color: rarityColor[selected.rarity] }}>{selected.rarity}</span>
              <span className="font-mono text-[10px] text-slate-500">{selected.code}</span>
              <span className={`font-display text-[10px] font-bold px-1.5 ${selected.faction === 'CT' ? 'bg-[#1a3a6b] text-[#6fb0ff]' : 'bg-[#6b2a1a] text-[#ffb06f]'}`}>{selected.faction}</span>
            </div>
            <div className="font-display text-xl font-black text-white leading-none mt-0.5">{selected.name}</div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">
              Matches: <span className="text-white">{selected.matches.toLocaleString()}</span> ·
              HS%: <span className="neon-red ml-1">{selected.hs}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-3">
          <div className="bg-[#0a0d12] p-2 border-l-2 border-[var(--nl-accent)]">
            <div className="font-mono text-[9px] text-slate-500">K/D RATIO</div>
            <div className="font-display text-lg font-black neon-red">{selected.kd}</div>
            <div className="h-1 bg-[#1c2230] mt-1"><div className="h-full bg-[var(--nl-accent)]" style={{ width: `${Math.min(100, selected.kd * 25)}%` }} /></div>
          </div>
          <div className="bg-[#0a0d12] p-2 border-l-2 border-[var(--nl-accent-2)]">
            <div className="font-mono text-[9px] text-slate-500">WIN RATE</div>
            <div className="font-display text-lg font-black neon-cyan">{selected.wr}%</div>
            <div className="h-1 bg-[#1c2230] mt-1"><div className="h-full bg-[var(--nl-accent-2)]" style={{ width: `${selected.wr}%` }} /></div>
          </div>
          <div className="bg-[#0a0d12] p-2 border-l-2 border-[var(--nl-green)]">
            <div className="font-mono text-[9px] text-slate-500">HEADSHOT</div>
            <div className="font-display text-lg font-black neon-green">{selected.hs}%</div>
            <div className="h-1 bg-[#1c2230] mt-1"><div className="h-full bg-[var(--nl-green)]" style={{ width: `${selected.hs}%` }} /></div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTargetName(selected.name.split(' ')[0])}
            className="flex-1 bg-[var(--nl-accent)] hover:bg-[#ff5b6a] text-white font-display text-xs font-black tracking-wider py-2 clip-btn glow-red transition-colors">
            ▶ DEPLOY OPERATOR
          </button>
          <button className="px-4 bg-[#1c2230] hover:bg-[#252c3d] text-white font-mono text-xs py-2 clip-btn">
            CUSTOMIZE
          </button>
          <button className="px-4 bg-[#1c2230] hover:bg-[#252c3d] text-white font-mono text-xs py-2 clip-btn">
            ★
          </button>
        </div>
      </div>
    </div>
  );
}

function VisualsTab() {
  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-3 pb-4">
      <div>
        <GroupTitle>Player ESP</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Box ESP" />
          <Toggle checked={true} onChange={() => {}} label="Skeleton / bones" hotkey="F3" />
          <Toggle checked={true} onChange={() => {}} label="Health bars" />
          <Toggle checked={true} onChange={() => {}} label="Name & weapon" />
          <Toggle checked={false} onChange={() => {}} label="Radar ESP" />
          <Toggle checked={true} onChange={() => {}} label="Dormant players" />
          <Dropdown label="Box type" value="Corner 3D" options={['2D Box', 'Corner 3D', 'Full Box', 'Name only']} onChange={() => {}} />
          <Slider label="ESP opacity" value={85} onChange={() => {}} min={0} max={100} suffix="%" color="cyan" />
        </div>
      </div>
      <div>
        <GroupTitle>Chams</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Player chams" />
          <Dropdown label="Material" value="Flat shaded" options={['Flat shaded', 'Textured', 'Wireframe', 'Glow', 'Neon']} onChange={() => {}} />
          <Toggle checked={true} onChange={() => {}} label="Visible only coloring" />
          <Toggle checked={false} onChange={() => {}} label="Arms chams" />
          <Toggle checked={true} onChange={() => {}} label="Weapon chams" />
        </div>
      </div>
      <div>
        <GroupTitle>World / Visuals</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Remove smoke" />
          <Toggle checked={true} onChange={() => {}} label="No flash" />
          <Toggle checked={true} onChange={() => {}} label="FOV Changer" />
          <Slider label="Custom FOV" value={103} onChange={() => {}} min={60} max={150} suffix="°" color="cyan" />
          <Slider label="Viewmodel FOV" value={68} onChange={() => {}} min={40} max={120} suffix="°" color="cyan" />
          <Toggle checked={false} onChange={() => {}} label="Night mode" />
          <Toggle checked={true} onChange={() => {}} label="Skybox editor" />
        </div>
      </div>
      <div>
        <GroupTitle>HUD</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Watermark" />
          <Toggle checked={true} onChange={() => {}} label="Spectator list" />
          <Toggle checked={true} onChange={() => {}} label="FPS / velocity counter" />
          <Toggle checked={true} onChange={() => {}} label="Hit marker" />
          <Toggle checked={true} onChange={() => {}} label="Damage logs" />
          <Toggle checked={false} onChange={() => {}} label="Custom crosshair" />
        </div>
      </div>
    </div>
  );
}

function LegitTab() {
  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-3 pb-4">
      <div>
        <GroupTitle>Legit Aimbot</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Enabled" hotkey="ALT" />
          <Slider label="FOV" value={3} onChange={() => {}} min={1} max={15} suffix="°" color="cyan" />
          <Slider label="Smooth" value={35} onChange={() => {}} min={1} max={100} suffix="%" color="green" />
          <Slider label="RCS X" value={80} onChange={() => {}} min={0} max={100} suffix="%" color="cyan" />
          <Slider label="RCS Y" value={75} onChange={() => {}} min={0} max={100} suffix="%" color="cyan" />
          <Toggle checked={true} onChange={() => {}} label="Aim at teammates" />
          <Toggle checked={false} onChange={() => {}} label="Aim at enemies" />
        </div>
      </div>
      <div>
        <GroupTitle>Triggerbot</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Enabled" hotkey="SHIFT" />
          <Slider label="Hit Chance" value={65} onChange={() => {}} min={0} max={100} suffix="%" color="red" />
          <Slider label="Delay" value={12} onChange={() => {}} min={0} max={200} suffix="ms" color="purple" />
          <Toggle checked={true} onChange={() => {}} label="Ignore smoke" />
          <Toggle checked={true} onChange={() => {}} label="Ignore flash" />
        </div>
      </div>
      <div>
        <GroupTitle>Visuals</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Glow" />
          <Slider label="Glow thickness" value={2} onChange={() => {}} min={1} max={10} color="green" />
          <Toggle checked={false} onChange={() => {}} label="Crosshair sniper lines" />
        </div>
      </div>
    </div>
  );
}

function MiscTab() {
  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-3 pb-4">
      <div>
        <GroupTitle>Movement</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Bunny Hop" hotkey="SPACE" />
          <Toggle checked={true} onChange={() => {}} label="Auto strafe" />
          <Toggle checked={false} onChange={() => {}} label="Edge jump" hotkey="MWHEELDOWN" />
          <Toggle checked={true} onChange={() => {}} label="Fast stop" />
          <Slider label="Jump height" value={100} onChange={() => {}} min={0} max={200} suffix="%" color="red" />
        </div>
      </div>
      <div>
        <GroupTitle>Settings</GroupTitle>
        <div className="space-y-[2px]">
          <Toggle checked={true} onChange={() => {}} label="Auto accept match" />
          <Toggle checked={true} onChange={() => {}} label="Fast plant" />
          <Toggle checked={false} onChange={() => {}} label="Auto defuse" />
          <Toggle checked={true} onChange={() => {}} label="Clan tag spammer" />
          <Toggle checked={true} onChange={() => {}} label="Chat wheel spam" />
          <Toggle checked={false} onChange={() => {}} label="Block bots" />
          <KeyBind keyName="INS" label="Panic key (unload)" />
          <KeyBind keyName="END" label="Screenshot cleaner" />
          <KeyBind keyName="HOME" label="Menu toggle" />
        </div>
      </div>
    </div>
  );
}

function ConfigTab() {
  const configs = ['hvh_prime_v4', 'comp_rage', 'prem_games', 'scrims_legit', 'awp_only', 'pistol_round', 'new_meta_yaoi'];
  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-3 pb-4">
      <GroupTitle>Configurations</GroupTitle>
      <div className="px-3">
        <input
          placeholder="CONFIG NAME..."
          className="w-full bg-[#0a0d12] border border-[#222a3c] focus:border-[var(--nl-accent)] outline-none px-2 py-2 font-mono text-xs text-white placeholder-slate-600"
        />
        <div className="grid grid-cols-2 gap-1 mt-2">
          <button className="bg-[var(--nl-accent)] text-white font-display text-xs font-black tracking-wider py-2 clip-btn glow-red">SAVE</button>
          <button className="bg-[#1c2230] hover:bg-[#252c3d] text-white font-display text-xs font-black tracking-wider py-2 clip-btn">LOAD</button>
        </div>
      </div>
      <GroupTitle count={configs.length}>Saved configs</GroupTitle>
      <div className="px-3 space-y-1">
        {configs.map((c, i) => (
          <div key={c} className="flex items-center justify-between bg-[#0f131a] border-l-2 border-[var(--nl-accent)] px-2 py-1.5 hover:bg-[#141923] transition-colors group">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] text-slate-500">#{(i+1).toString().padStart(2,'0')}</span>
              <span className="font-display text-xs font-bold text-white truncate">{c}</span>
            </div>
            <div className="flex gap-1">
              {i === 0 && <span className="font-mono text-[9px] neon-green border border-[var(--nl-green)]/40 px-1">AUTO-LOAD</span>}
              <button className="font-mono text-[10px] text-[var(--nl-accent-2)] hover:text-white opacity-0 group-hover:opacity-100">LOAD</button>
              <button className="font-mono text-[10px] text-slate-500 hover:text-[var(--nl-accent)] opacity-0 group-hover:opacity-100">DEL</button>
            </div>
          </div>
        ))}
      </div>
      <GroupTitle>Subscription</GroupTitle>
      <div className="px-3">
        <div className="bg-gradient-to-r from-[#1a0d12] via-[#1f1428] to-[#141923] p-3 border-l-2 border-[var(--nl-accent-3)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-[11px] tracking-widest text-[var(--nl-accent-3)] font-black">PRIME — LIFETIME</div>
              <div className="font-mono text-[10px] text-slate-400 mt-0.5">HWID: 4F-A9-2B-7C · UID #28491</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] text-slate-500">EXPIRES</div>
              <div className="font-display text-sm neon-green font-black">NEVER</div>
            </div>
          </div>
          <div className="mt-2 h-1 bg-[#0a0d12]">
            <div className="h-full bg-gradient-to-r from-[var(--nl-accent)] via-[var(--nl-accent-3)] to-[var(--nl-accent-2)]" style={{ width: '100%' }} />
          </div>
          <div className="flex justify-between mt-1 font-mono text-[9px] text-slate-500">
            <span>UNLIMITED</span><span>HVH · MM · FACEIT · PREMIER</span><span>UNDETECTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScriptsTab() {
  const scripts = [
    { name: 'Auto-peek desync',       author: 'raven.',    enabled: true,  cat: 'Movement' },
    { name: 'Fake lag optimizer',     author: 'sini',      enabled: true,  cat: 'Exploits' },
    { name: 'Minimap autostop',       author: 'kaori',     enabled: true,  cat: 'AA' },
    { name: 'Yaw resolver neural',    author: 'vlada',     enabled: false, cat: 'Resolver' },
    { name: 'Clutch helper',          author: 'qw1se',     enabled: true,  cat: 'Utility' },
    { name: 'Fake walk silent',       author: 'nugg3t',    enabled: false, cat: 'Movement' },
    { name: 'Doubletap v2 predictor', author: 'polak',     enabled: true,  cat: 'Exploits' },
    { name: 'AWP quickscope assist',  author: 'skeet',     enabled: true,  cat: 'Weapons' },
  ];
  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-2 pb-4">
      <GroupTitle count={scripts.length}>Lua Scripts — Workshop</GroupTitle>
      <div className="px-3">
        <div className="grid grid-cols-4 gap-1">
          {['ALL', 'AA', 'EXPL', 'WEAP'].map((c, i) => (
            <button key={c} className={`py-1 font-display text-[10px] font-bold tracking-wider clip-btn ${i === 0 ? 'bg-[var(--nl-accent)] text-white glow-red' : 'bg-[#1c2230] text-slate-400'}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="px-3 space-y-1">
        {scripts.map((s, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#0f131a] border-l-2 border-[#1c2230] px-2 py-1.5">
            <div className="w-8 h-8 bg-[#0a0d12] border border-[#222a3c] flex items-center justify-center font-display text-[var(--nl-accent)] text-lg">
              {s.cat[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-ui text-[12px] font-bold text-white truncate">{s.name}</div>
              <div className="font-mono text-[10px] text-slate-500">@{s.author} · {s.cat}</div>
            </div>
            <button
              onClick={() => { /* toggle */ }}
              className={`px-2 font-mono text-[10px] py-0.5 clip-btn ${s.enabled ? 'bg-[var(--nl-green)] text-black' : 'bg-[#1c2230] text-slate-400'}`}>
              {s.enabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
      <div className="px-3">
        <button className="w-full py-2 bg-[#1c2230] hover:bg-[#252c3d] border border-dashed border-[#2a3244] font-display text-xs font-bold tracking-widest text-slate-400 clip-btn">
          + IMPORT LUA SCRIPT
        </button>
      </div>
    </div>
  );
}

function SkinsTab() {
  const skins = [
    { w: 'AK-47', s: 'Fire Serpent', wear: '0.01', stattrak: true, price: 1420 },
    { w: 'AWP', s: 'Dragon Lore', wear: '0.03', stattrak: true, price: 8900 },
    { w: 'M4A4', s: 'Howl', wear: '0.08', stattrak: false, price: 3450 },
    { w: 'USP-S', s: 'Kill Confirmed', wear: '0.12', stattrak: true, price: 620 },
    { w: 'Deagle', s: 'Blaze', wear: '0.05', stattrak: false, price: 890 },
    { w: 'Glock-18', s: 'Fade', wear: '0.02', stattrak: true, price: 1120 },
  ];
  return (
    <div className="nl-scroll overflow-y-auto h-full pr-1 space-y-2 pb-4">
      <GroupTitle>Inventory Skin Changer</GroupTitle>
      <div className="px-3 space-y-1">
        {skins.map((s, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#0f131a] border-l-2 border-[#1c2230] px-2 py-2 hover:border-[var(--nl-accent)] transition-colors">
            <div className="w-12 h-10 bg-gradient-to-br from-[var(--nl-accent)]/20 to-transparent border border-[#222a3c] flex items-center justify-center">
              <span className="font-display text-[var(--nl-accent)] text-xl">▬</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-ui text-[12px] font-bold text-white truncate">
                {s.w} | {s.s}
                {s.stattrak && <span className="ml-2 text-[var(--nl-yellow)] font-mono text-[10px]">StatTrak™</span>}
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                Wear: <span className="text-white">{s.wear}</span> · FN
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-sm font-black neon-green">${s.price}</div>
              <button className="font-mono text-[10px] text-[var(--nl-accent-2)] hover:text-white">EQUIP</button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 pt-1">
        <div className="bg-gradient-to-r from-[#141923] to-[#0f131a] p-2 border-l-2 border-[var(--nl-yellow)] flex items-center justify-between">
          <div className="font-mono text-[10px] text-slate-400">KNIFE</div>
          <div className="font-display text-sm font-black text-[var(--nl-yellow)]">★ Karambit | Fade</div>
        </div>
        <div className="bg-gradient-to-r from-[#141923] to-[#0f131a] p-2 border-l-2 border-[var(--nl-accent-2)] flex items-center justify-between mt-1">
          <div className="font-mono text-[10px] text-slate-400">GLOVES</div>
          <div className="font-display text-sm font-black neon-cyan">★ Sport Gloves | Pandora's Box</div>
        </div>
      </div>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [tab, setTab] = useState<TabId>('RAGE');
  const [targetName, setTargetName] = useState('NeverLose');
  const [hits, setHits] = useState<number[]>([]);
  const [serverTime, setServerTime] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setServerTime(d.toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const triggerHit = () => {
    const id = Date.now() + Math.random();
    setHits((h) => [...h, id]);
    setTimeout(() => setHits((h) => h.filter((x) => x !== id)), 600);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H' || e.key === 'x' || e.key === 'X') triggerHit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-ui text-white">
      {/* Game world under the menu */}
      <GameBackground hits={hits} targetName={targetName} />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-[#0a0d12]/95 border-b border-[#1c2230] flex items-center px-4 z-30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[var(--nl-accent)] to-[#6b0b16] clip-panel glow-red">
            <span className="font-display font-black text-white text-sm">N</span>
          </div>
          <div>
            <div className="font-display font-black tracking-[0.25em] text-sm leading-none flicker">
              <span className="neon-red">NEVER</span><span className="text-white">LOSE</span>
              <span className="text-[var(--nl-accent-2)]">.CC</span>
            </div>
            <div className="font-mono text-[9px] text-slate-500 leading-none mt-0.5">HACK VS HACK · PRIME EDITION · BUILD 4.3.27</div>
          </div>
        </div>

        <div className="h-6 w-px bg-[#1c2230] mx-4" />

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--nl-green)] pulse-red" />
            <span className="text-[var(--nl-green)] font-bold">CONNECTED</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">MATCH: <span className="text-white">de_dust2</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">TICK: <span className="neon-cyan">128</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PING: <span className="neon-red">17ms</span></span>
        </div>

        <div className="ml-auto flex items-center gap-3 font-mono text-[10px] text-slate-400">
          <button onClick={triggerHit} className="px-2 py-0.5 bg-[var(--nl-accent)]/20 border border-[var(--nl-accent)] text-[var(--nl-accent)] hover:bg-[var(--nl-accent)] hover:text-white transition-colors">
            ▶ FIRE (H)
          </button>
          <span>{serverTime}</span>
          <div className="w-px h-6 bg-[#1c2230]" />
          <span className="text-white font-bold">{targetName}</span>
          <span className="text-slate-600">#28491</span>
          <button className="w-6 h-6 bg-[#1c2230] hover:bg-[var(--nl-accent)] transition-colors flex items-center justify-center">
            <span className="text-sm">—</span>
          </button>
          <button className="w-6 h-6 bg-[#1c2230] hover:bg-[var(--nl-accent)] transition-colors flex items-center justify-center">
            <span className="text-sm">□</span>
          </button>
          <button className="w-6 h-6 bg-[#1c2230] hover:bg-[var(--nl-accent)] transition-colors flex items-center justify-center">
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>

      {/* Main body: sidebar + content + right panel */}
      <div className="absolute top-10 left-0 right-0 bottom-0 flex">
        {/* Left tab sidebar */}
        <div className="w-28 bg-[#0a0d12]/95 border-r border-[#1c2230] flex flex-col py-3 backdrop-blur-sm z-20">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 mx-1.5 my-0.5 transition-all clip-btn ${
                  active
                    ? 'bg-[var(--nl-accent)] text-white glow-red'
                    : 'bg-[#0f131a] text-slate-400 hover:bg-[#141923] hover:text-white'
                }`}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="font-display text-[10px] font-black tracking-wider leading-none">{t.id}</span>
                {t.badge && (
                  <span className={`absolute -top-1 -right-1 font-mono text-[8px] font-bold px-1 py-[1px] ${
                    t.badge === 'NEW' ? 'bg-[var(--nl-accent-3)] text-white' : 'bg-[var(--nl-green)] text-black'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="mt-auto px-2 space-y-1">
            <div className="text-[9px] font-mono text-slate-600 text-center">CPU <span className="text-white">12%</span></div>
            <div className="h-1 bg-[#1c2230]"><div className="h-full bg-[var(--nl-green)]" style={{ width: '12%' }} /></div>
            <div className="text-[9px] font-mono text-slate-600 text-center">GPU <span className="text-white">38%</span></div>
            <div className="h-1 bg-[#1c2230]"><div className="h-full bg-[var(--nl-accent-2)]" style={{ width: '38%' }} /></div>
            <div className="text-[9px] font-mono text-slate-600 text-center">FPS <span className="neon-red">243</span></div>
          </div>
        </div>

        {/* Center content panel (the menu) */}
        <div className="w-[520px] max-w-[42vw] bg-[#0a0d12]/95 border-r border-[#1c2230] flex flex-col z-20 backdrop-blur-sm">
          {/* Tab header */}
          <div className="h-10 border-b border-[#1c2230] bg-gradient-to-r from-[#141923] to-transparent flex items-center px-3 gap-3">
            <span className="font-display font-black text-sm tracking-[0.2em] text-white">{tab}</span>
            <span className="font-mono text-[10px] text-slate-500">
              {tab === 'RAGE' && '// primary aimbot module'}
              {tab === 'LEGIT' && '// humanized legit assist'}
              {tab === 'VISUALS' && '// esp & chams rendering'}
              {tab === 'AGENTS' && '// operator selection'}
              {tab === 'MISC' && '// movement & utilities'}
              {tab === 'CONFIG' && '// config management'}
              {tab === 'SCRIPTS' && '// lua scripts engine'}
              {tab === 'SKINS' && '// inventory system'}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 bg-[var(--nl-accent)] rounded-full pulse-red" />
              <span className="font-mono text-[10px] text-[var(--nl-accent)]">LIVE</span>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 min-h-0 p-2">
            {tab === 'RAGE' && <RageTab />}
            {tab === 'LEGIT' && <LegitTab />}
            {tab === 'VISUALS' && <VisualsTab />}
            {tab === 'AGENTS' && <AgentsTab targetName={targetName} setTargetName={setTargetName} />}
            {tab === 'MISC' && <MiscTab />}
            {tab === 'CONFIG' && <ConfigTab />}
            {tab === 'SCRIPTS' && <ScriptsTab />}
            {tab === 'SKINS' && <SkinsTab />}
          </div>
        </div>

        {/* Right side: Target list / players / logs */}
        <div className="flex-1 relative z-10">
          {/* Target list HUD */}
          <div className="absolute top-2 left-2 w-64 bg-[#0a0d12]/85 border border-[#1c2230] backdrop-blur-sm clip-panel">
            <div className="px-3 py-2 border-b border-[#1c2230] bg-gradient-to-r from-[#141923] to-transparent flex items-center gap-2">
              <div className="w-1 h-3 bg-[var(--nl-accent)]" />
              <span className="font-display text-[11px] uppercase tracking-[0.2em] font-bold text-white">Target List</span>
              <span className="ml-auto font-mono text-[10px] neon-red">7</span>
            </div>
            <div className="p-1.5 space-y-1 font-mono text-[10px] max-h-[220px] nl-scroll overflow-y-auto">
              {[
                { n: 's1mple.hvh', hp: 100, dist: 23, resolvable: true, hs: 67 },
                { n: 'ZywOo.aim',  hp: 100, dist: 41, resolvable: true, hs: 34 },
                { n: 'NiKo!',      hp: 78,  dist: 19, resolvable: true, hs: 82 },
                { n: 'device.',    hp: 100, dist: 67, resolvable: false, hs: 12 },
                { n: 'ropz^',      hp: 42,  dist: 12, resolvable: true, hs: 95 },
                { n: 'mONESY_',    hp: 100, dist: 55, resolvable: true, hs: 22 },
                { n: 'Ax1Le',      hp: 8,   dist: 8,  resolvable: true, hs: 100 },
              ].map((p, i) => (
                <div key={i} className={`flex items-center gap-1 px-1 py-0.5 ${i === 2 ? 'bg-[var(--nl-accent)]/20 border-l-2 border-[var(--nl-accent)]' : ''}`}>
                  <div className={`w-1 h-1 ${p.resolvable ? 'bg-[var(--nl-green)]' : 'bg-[var(--nl-yellow)]'}`} />
                  <span className="text-slate-300 flex-1 truncate">{p.n}</span>
                  <span className="text-slate-500 w-6 text-right">{p.dist}m</span>
                  <span className={p.hp < 30 ? 'neon-red w-6 text-right' : 'text-white w-6 text-right'}>{p.hp}</span>
                  <span className={`w-10 text-right ${p.hs > 80 ? 'neon-green' : p.hs > 40 ? 'neon-cyan' : 'text-slate-500'}`}>{p.hs}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Damage logs */}
          <div className="absolute top-2 right-2 w-72 bg-[#0a0d12]/85 border border-[#1c2230] backdrop-blur-sm clip-panel">
            <div className="px-3 py-2 border-b border-[#1c2230] bg-gradient-to-r from-[#141923] to-transparent flex items-center gap-2">
              <div className="w-1 h-3 bg-[var(--nl-accent-2)]" />
              <span className="font-display text-[11px] uppercase tracking-[0.2em] font-bold text-white">Damage Log</span>
              <span className="ml-auto font-mono text-[10px] neon-cyan">12</span>
            </div>
            <div className="p-1.5 space-y-0.5 font-mono text-[10px] max-h-[220px] nl-scroll overflow-y-auto">
              {[
                { t: 'mONESY_', dmg: 100, h: 'head', w: 'ak47' },
                { t: 'Twistzz', dmg: 87,  h: 'chest', w: 'ak47' },
                { t: 'ropz^',    dmg: 41,  h: 'stomach', w: 'deagle' },
                { t: 'NiKo!',    dmg: 24,  h: 'arm', w: 'ak47' },
                { t: 'device.',  dmg: 100, h: 'head', w: 'deagle' },
                { t: 'Ax1Le',    dmg: 100, h: 'head', w: 'scar20' },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-1 px-1 py-0.5 hover:bg-[#141923]">
                  <span className={d.dmg >= 100 ? 'neon-red font-bold' : 'text-slate-300'}>{d.dmg}</span>
                  <span className="text-slate-500">in</span>
                  <span className="text-white flex-1 truncate">{d.t}</span>
                  <span className="text-slate-500">[{d.h}]</span>
                  <span className="text-slate-600">{d.w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="absolute bottom-2 left-2 right-2 flex gap-2">
            <div className="flex-1 bg-[#0a0d12]/85 border border-[#1c2230] backdrop-blur-sm p-2 clip-panel">
              <div className="font-display text-[10px] tracking-widest text-slate-500 mb-1">MATCH PERFORMANCE</div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div className="font-mono text-[9px] text-slate-500">KILLS</div>
                  <div className="font-display text-xl font-black neon-red">34</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-slate-500">DEATHS</div>
                  <div className="font-display text-xl font-black text-white">6</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-slate-500">K/D</div>
                  <div className="font-display text-xl font-black neon-green">5.67</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-slate-500">HS%</div>
                  <div className="font-display text-xl font-black neon-cyan">78</div>
                </div>
              </div>
            </div>
            <div className="w-48 bg-[#0a0d12]/85 border border-[var(--nl-accent)]/40 backdrop-blur-sm p-2 glow-red">
              <div className="font-display text-[10px] tracking-widest neon-red mb-1">// HVH RESOLVER</div>
              <div className="font-mono text-[10px] space-y-0.5">
                <div className="flex justify-between"><span className="text-slate-400">Targets</span><span className="text-white">6</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Resolved</span><span className="neon-green">5</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Misses</span><span className="neon-red">2</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Desync</span><span className="neon-cyan">58°</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#070a0f]/95 border-t border-[#1c2230] flex items-center px-3 gap-4 z-30 font-mono text-[9px] text-slate-500">
        <span className="neon-red">● REC</span>
        <span>CFG: <span className="text-white">hvh_prime_v4</span></span>
        <span>MAP: <span className="text-white">de_dust2</span></span>
        <span>SERVER: <span className="text-white">185.65.134.22:27015</span></span>
        <span className="ml-auto text-[var(--nl-accent-2)]">NeverLose.cc © 2026 — All rights reserved</span>
        <span className="text-slate-600">[INSERT] UNLOAD · [HOME] MENU</span>
      </div>
    </div>
  );
}
