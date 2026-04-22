import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';

// --- Types ---
interface FileSystem {
  [key: string]: string | FileSystem;
}

interface LogEntry {
  id: string;
  type: 'info' | 'error' | 'success' | 'warning' | 'input' | 'raw';
  content: string;
  path?: string;
}

// --- Constants ---
const INITIAL_FS: FileSystem = {
  "~": {
    "projects": {
      "ai_assistant.py": "# Shadow AI Core\nprint('Initializing...')",
      "vault.aes": "[ENCRYPTED DATA]"
    },
    "logs": {
      "auth.log": "2023-10-01: Login success from 192.168.1.1"
    },
    "readme.txt": "Selamat datang di Shadow VM.\nGunakan 'help' untuk bantuan."
  }
};

const MatrixBackground = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    updateSize();

    const fontSize = 14;
    const columns = Math.ceil(window.innerWidth / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const chars = "0123456789ABCDEFHIJKLMNOPQRSTUVXYZ@#$%&*+-";

    let animationFrame: number;

    const draw = () => {
      ctx.fillStyle = "rgba(5, 7, 5, 0.05)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    window.addEventListener('resize', updateSize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateSize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${active ? 'opacity-30' : 'opacity-0'}`}
      style={{ display: active ? 'block' : 'none' }}
    />
  );
};

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentDir, setCurrentDir] = useState("~");
  const [fs, setFs] = useState<FileSystem>(INITIAL_FS);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [clock, setClock] = useState("");
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const print = useCallback((content: string, type: LogEntry['type'] = 'info', path?: string) => {
    setLogs(prev => [...prev.slice(-100), { id: Math.random().toString(36), type, content, path }]);
  }, []);

  const getDir = (path: string): FileSystem => {
    if (path === "~") return fs["~"] as FileSystem;
    const parts = path.split('/');
    const sub = (fs["~"] as FileSystem)[parts[1]];
    return (sub && typeof sub === 'object') ? sub : (fs["~"] as FileSystem);
  };

  // --- Commands ---
  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    print(raw, 'input', currentDir);
    setHistory(prev => [raw, ...prev]);
    setHistIdx(-1);

    const [cmd, ...args] = raw.split(/\s+/);
    
    switch (cmd.toLowerCase()) {
      case 'help':
        print(`
<span class="text-amber-400">Sistem Bantuan Shadow VM</span>
---------------------------------------
<span class="text-green-400">ls</span>             Daftar file/folder
<span class="text-green-400">cd [dir]</span>       Pindah direktori
<span class="text-green-400">cat [file]</span>     Baca isi file
<span class="text-green-400">mkdir [name]</span>   Buat direktori baru
<span class="text-green-400">clear</span>          Bersihkan layar
<span class="text-green-400">neofetch</span>       Informasi sistem
<span class="text-green-400">matrix</span>         Jalankan simulasi Matrix
<span class="text-green-400">whoami</span>         User saat ini
<span class="text-green-400">uptime</span>         Waktu aktif sistem
<span class="text-green-400">exit</span>           Restart VM
        `, 'raw');
        break;

      case 'whoami':
        print("root");
        break;

      case 'uptime':
        const time = Math.floor(performance.now() / 1000);
        print(`up ${time} seconds, load average: 0.00, 0.01, 0.05`);
        break;

      case 'ls': {
        const dir = getDir(currentDir);
        const items = Object.keys(dir).map(item => {
          return typeof dir[item] === 'object' 
            ? `<span class="text-amber-400 font-bold">${item}/</span>` 
            : `<span>${item}</span>`;
        }).join('  ');
        print(items || "Direktori kosong", 'raw');
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === "~") {
          setCurrentDir("~");
        } else if (target === "..") {
          setCurrentDir("~");
        } else {
          const dir = getDir(currentDir);
          if (dir[target] && typeof dir[target] === 'object') {
            setCurrentDir(`~/${target}`);
          } else {
            print(`cd: ${target}: No such directory`, 'error');
          }
        }
        break;
      }

      case 'cat': {
        const file = args[0];
        const dir = getDir(currentDir);
        if (dir[file] && typeof dir[file] === 'string') {
          print(dir[file], 'raw');
        } else {
          print(`cat: ${file}: No such file`, 'error');
        }
        break;
      }

      case 'mkdir': {
        const name = args[0];
        if (!name) {
          print("mkdir: missing operand", 'error');
        } else {
          const dir = getDir(currentDir);
          const newFs = { ...fs };
          if (currentDir === "~") {
            (newFs["~"] as FileSystem)[name] = {};
          } else {
            const parts = currentDir.split('/');
            ((newFs["~"] as FileSystem)[parts[1]] as FileSystem)[name] = {};
          }
          setFs(newFs);
          print(`Directory '${name}' created.`);
        }
        break;
      }

      case 'neofetch':
        print(`
<pre class="text-green-400 leading-tight">
       _,met$$$$$gg.          <span class="text-amber-400">root</span>@<span class="text-amber-400">shadow-vm</span>
    ,g$$$$$$$$$$$$$$$P.       -----------------
  ,g$$P"     """Y$$.".        <span class="text-green-400">OS</span>: ShadowOS 3.0.0 aarch64
 ,$$P'              \`$$$.     <span class="text-green-400">Kernel</span>: 5.10.0-shadow-main
',$$P       ,ggs.     \`$$b:   <span class="text-green-400">Uptime</span>: ${Math.floor(performance.now() / 60000)} mins
\`d$$'     ,$P"'   .    $$$    <span class="text-green-400">Packages</span>: 420 (dpkg)
 $$P      d$'     ,    $$P    <span class="text-green-400">Shell</span>: shadow-sh 1.0
 $$:      $$.   -    ,d$$'    <span class="text-green-400">Terminal</span>: XTerm-256color
 $$;      Y$b._   _,d$P'      <span class="text-green-400">CPU</span>: ARM Cortex-A53 (4) @ 1.4GHz
 Y$$.    \`.\`"Y$$$$P"'         <span class="text-green-400">Memory</span>: 512MB / 1536MB
 \`$$b      "-.__</pre>
        `, 'raw');
        break;

      case 'matrix':
        setIsMatrixActive(true);
        print("Matrix simulation started. Simulation will end in 10s.");
        setTimeout(() => setIsMatrixActive(false), 10000);
        break;

      case 'clear':
        setLogs([]);
        break;

      case 'exit':
        print("System rebooting...", 'warning');
        setTimeout(() => window.location.reload(), 1000);
        break;

      default:
        print(`Command not found: ${cmd}`, 'error');
    }
  };

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const bootSequence = [
      "Initializing Shadow Kernel v3.0.0...",
      "Checking hardware... <span class='text-green-400'>OK</span>",
      "Loading virtual file system... <span class='text-green-400'>OK</span>",
      "Starting network services... <span class='text-green-400'>OK</span>",
      "Welcome to <span class='text-amber-400 font-bold'>SHADOW VM</span>",
      "Type 'help' to begin."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < bootSequence.length) {
        print(bootSequence[current], 'raw');
        current++;
      } else {
        setIsBooting(false);
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [print]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput("");
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        const newIdx = histIdx + 1;
        setHistIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        const newIdx = histIdx - 1;
        setHistIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistIdx(-1);
        setInput("");
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'ls', 'cd', 'cat', 'mkdir', 'clear', 'neofetch', 'matrix', 'whoami', 'uptime', 'exit'];
      const match = commands.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#050705] relative overflow-hidden select-none p-4 md:p-6">
      <div className="crt-overlay pointer-events-none fixed inset-0 z-50 flicker opacity-10" />
      <MatrixBackground active={isMatrixActive} />

      {/* Top System Rail */}
      <header className="flex justify-between items-center border-b border-[#008f11] pb-2 mb-4 text-[10px] sm:text-[11px] tracking-widest uppercase z-20 shrink-0">
        <div className="flex gap-4 md:gap-6">
          <span><span className="opacity-50">SYS:</span> SHADOW-OS</span>
          <span className="hidden sm:inline"><span className="opacity-50">LOC:</span> 127.0.0.1</span>
          <span><span className="opacity-50">USR:</span> ROOT</span>
        </div>
        <div className="flex gap-4">
          <span className="hidden md:inline">CPU: 12.4%</span>
          <span className="hidden lg:inline">RAM: 512MB/1536MB</span>
          <span className="text-[#ffb300] font-mono tabular-nums">{clock}</span>
        </div>
      </header>

      {/* Main Content Area with Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 md:gap-6 relative overflow-hidden">
        
        {/* Left: Terminal Output (8 columns on md+) */}
        <main 
          ref={outputRef}
          className="col-span-12 md:col-span-8 flex flex-col overflow-y-auto pr-2 text-[13px] sm:text-sm font-mono z-10 scroll-smooth custom-scrollbar"
          onClick={() => inputRef.current?.focus()}
        >
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className="mb-1 leading-relaxed"
              >
                {log.type === 'input' ? (
                  <div className="flex gap-2 items-start shrink-0">
                    <span className="text-[#ff3131] font-bold shrink-0">root@shadow:</span>
                    <span className="text-[#008f11] mr-1 shrink-0">~#</span>
                    <span className="text-white break-all">{log.content}</span>
                  </div>
                ) : (
                  <div 
                    className={`
                      ${log.type === 'error' ? 'text-[#ff3131]' : ''}
                      ${log.type === 'warning' ? 'text-amber-400' : ''}
                      ${log.type === 'success' ? 'text-green-400' : ''}
                      ${log.type === 'info' && 'opacity-70'}
                      break-all
                    `}
                    dangerouslySetInnerHTML={{ __html: log.content.startsWith('<pre') ? log.content : log.content }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </main>

        {/* Right: Monitoring Panels (Hidden on mobile or 4 columns on md+) */}
        <aside className="hidden md:flex md:col-span-4 flex-col gap-6 z-10 overflow-y-auto custom-scrollbar pr-1">
          {/* Active Processes */}
          <div className="bg-[#0a0f0a] p-4 border border-[#008f11]/20">
            <h3 className="text-[10px] text-[#008f11] mb-3 uppercase tracking-tighter font-bold">Active Processes</h3>
            <div className="text-[11px] space-y-2">
              <div className="flex justify-between items-center"><span className="opacity-70">shadow_daemon</span><span className="text-[#ffb300] bg-[#ffb300]/10 px-1">RUN</span></div>
              <div className="flex justify-between items-center">
                <span className="opacity-70">matrix_sim</span>
                <span className={isMatrixActive ? "text-[#ffb300] bg-[#ffb300]/10 px-1" : "opacity-30"}>{isMatrixActive ? "RUN" : "IDL"}</span>
              </div>
              <div className="flex justify-between items-center"><span className="opacity-70">auth_vault</span><span className="text-[#ffb300] bg-[#ffb300]/10 px-1">RUN</span></div>
              <div className="flex justify-between items-center"><span className="opacity-70">tty_sh</span><span className="text-[#ffb300] bg-[#ffb300]/10 px-1">RUN</span></div>
            </div>
          </div>

          {/* Network Traffic */}
          <div className="bg-[#0a0f0a] p-4 border border-[#008f11]/20">
            <h3 className="text-[10px] text-[#008f11] mb-3 uppercase tracking-tighter font-bold">Network Traffic</h3>
            <div className="h-20 flex items-end gap-1 mb-2">
              {[20, 35, 65, 45, 90, 75, 55, 40, 80, 50].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="flex-1 bg-[#008f11]/40"
                  transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                />
              ))}
            </div>
            <p className="text-[10px] opacity-40">PACKET_RX: 1.2MB/s</p>
          </div>

          {/* Encrypted Vaults */}
          <div className="bg-[#0a0f0a] p-4 border border-[#008f11]/20">
            <h3 className="text-[10px] text-[#008f11] mb-3 uppercase tracking-tighter font-bold">Encrypted Vaults</h3>
            <div className="grid grid-cols-5 gap-2">
              <div className="h-6 bg-[#00ff41] opacity-80 animate-pulse"></div>
              <div className="h-6 bg-[#00ff41] opacity-60"></div>
              <div className="h-6 bg-[#00ff41] opacity-40"></div>
              <div className="h-6 bg-[#008f11] opacity-20"></div>
              <div className="h-6 bg-[#008f11] opacity-10"></div>
            </div>
          </div>

          {/* Security Alert */}
          <div className="mt-auto p-3 bg-[#0a0f0a] border border-[#ff3131]/30">
            <p className="text-[10px] leading-relaxed">
              <span className="text-[#ff3131] font-bold">WRN:</span> Unauthorized access logged via encrypted tunnel 0xFA-32.
            </p>
          </div>
        </aside>

      </div>

      {/* Bottom Input Bar */}
      <footer className="mt-auto pt-4 border-t border-[#111] flex items-center z-20 shrink-0">
        <span className="text-[#ff3131] font-bold mr-2 text-[13px] sm:text-sm">root@shadow:</span>
        <span className="text-[#008f11] mr-2 text-[13px] sm:text-sm">{currentDir === '~' ? '~#' : `${currentDir.replace('~/', '')}#`}</span>
        <div className="flex-1 flex items-center relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            disabled={isBooting}
            className="w-full bg-transparent border-none outline-none text-white font-mono text-[13px] sm:text-sm caret-transparent"
          />
          {/* Custom blinking cursor at the end of input if focused */}
          {!isBooting && (
             <div 
              className="absolute pointer-events-none w-2 h-4 bg-[#00ff41] animate-pulse"
              style={{ 
                left: `${input.length * 8.5}px`, // Simplified approach to cursor position
                display: document.activeElement === inputRef.current ? 'block' : 'none'
              }}
            />
          )}
        </div>
        <div className="hidden lg:block text-[10px] opacity-30 tracking-tighter">OS_STATE: READY_FOR_INPUT</div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #008f11/30;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #008f11;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
