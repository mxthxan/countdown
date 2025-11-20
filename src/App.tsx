import { useEffect, useState } from 'react';
import { Zap, Wifi, AlertTriangle } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  remove,
  Database 
} from 'firebase/database';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDHsn9n-tZUZQ_ksu7JW0UFHCmEL_6GTNA",
  authDomain: "countdown1-73932.firebaseapp.com",
  databaseURL: "https://countdown1-73932-default-rtdb.firebaseio.com",
  projectId: "countdown1-73932",
  storageBucket: "countdown1-73932.firebasestorage.app",
  messagingSenderId: "913943646076",
  appId: "1:913943646076:web:94bdaaa73964cee2c89ef9",
  measurementId: "G-98S26PBQBL"
};

const app = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);


// --- TYPE DEFINITIONS ---
interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
}

interface RealtimeData {
    endTime: number; // UTC timestamp in milliseconds
}

// --- TIME BLOCK COMPONENT ---
function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="text-8xl md:text-9xl lg:text-10xl font-black font-mono text-lime-400 drop-shadow-[0_0_30px_rgba(163,230,53,0.9)] tracking-tighter">
          {value}
        </div>
        <div className="absolute inset-0 text-8xl md:text-9xl lg:text-10xl font-black font-mono text-lime-400/20 blur-sm tracking-tighter">
          {value}
        </div>
      </div>
      <span className="text-xs md:text-sm font-mono text-cyan-400/70 tracking-widest mt-2">
        {label}
      </span>
    </div>
  );
}


// --- MAIN APP COMPONENT ---
const App = () => {
  const [timeLeft, setTimeLeft] = useState<TimeState>({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- 1. REALTIME DATABASE LISTENER (Cross-device sync) ---
  useEffect(() => {
    const countdownRef = ref(database, 'countdown-state');
    
    // Set up the real-time listener
    const unsubscribe = onValue(countdownRef, (snapshot) => {
      setIsLoading(false);
      const data = snapshot.val() as RealtimeData | null;
      
      if (data && data.endTime) {
        const endTime = data.endTime;
        const now = Date.now();
        
        if (endTime > now) {
          const remaining = Math.floor((endTime - now) / 1000);
          const hours = Math.floor(remaining / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          
          setTimeLeft({ hours, minutes, seconds });
          setIsRunning(true);
        } else {
          // Countdown has finished
          setIsRunning(false);
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        }
      } else {
        // No active countdown in the database
        setIsRunning(false);
        // Only reset the visual state to 24 hours if it's currently at 0
        if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
           setTimeLeft({ hours: 24, minutes: 0, seconds: 0 });
        }
      }
    }, (error) => {
        console.error("Realtime Database listen failed:", error);
        setErrorMessage(`Realtime Database sync failed: ${error.message}. Check your security rules.`);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. LOCAL COUNTDOWN TIMER (Smooth client-side updates) ---
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Countdown reached 0 locally.
          setIsRunning(false);
          
          // Clear Realtime Database state (This triggers the sync for others)
          const countdownRef = ref(database, 'countdown-state');
          remove(countdownRef).catch(console.error);
          
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // --- 3. START/STOP HANDLER ---
  const handleStartCountdown = async () => {
    const countdownRef = ref(database, 'countdown-state');
    
    if (!isRunning) {
      // Start countdown: calculate end time (24 hours from now)
      const endTime = Date.now() + (24 * 60 * 60 * 1000);
      
      try {
        await set(countdownRef, { endTime });
        // The onValue listener handles state updates
      } catch (error) {
        console.error('Failed to start countdown:', error);
        setErrorMessage('ERROR: Failed to start countdown. Permissions denied?');
      }
    } else {
      // Stop countdown: remove document
      try {
        await remove(countdownRef);
        // The onValue listener handles state updates
      } catch (error) {
        console.error('Failed to stop countdown:', error);
        setErrorMessage('ERROR: Failed to stop countdown. Permissions denied?');
      }
    }
  };


  // --- RENDERING ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-xl animate-pulse">
          INITIALIZING NEURAL LINK...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Error Message Display (replaces alert()) */}
      {errorMessage && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-800/90 text-white p-4 flex items-center justify-center font-mono">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {errorMessage}
          <button onClick={() => setErrorMessage(null)} className="ml-4 text-xs underline">
            [DISMISS]
          </button>
        </div>
      )}

      {/* CSS STYLES (Inline for single-file mandate) */}
      <style>{`
        .rain-drop {
          position: absolute;
          width: 2px;
          height: 20px;
          background: linear-gradient(transparent, #22d3ee);
          animation: rain-fall linear infinite;
        }

        @keyframes rain-fall {
          to {
            transform: translateY(100vh);
          }
        }

        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        .cyber-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        .cyber-divider {
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #22d3ee 50%,
            transparent
          );
        }

        .cyber-button {
          position: relative;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #0e7490 0%, #ec4899 100%);
          border: 2px solid #22d3ee;
          color: white;
          font-family: monospace;
          overflow: hidden;
          transition: all 0.3s;
        }

        .cyber-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ec4899 0%, #a3e635 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .cyber-button:hover::before {
          opacity: 1;
        }

        .cyber-button:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.6);
          transform: translateY(-2px);
        }

        .hologram-frame {
          animation: hologram-flicker 2s infinite;
        }

        @keyframes hologram-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        @keyframes scan {
          from {
            top: 0;
          }
          to {
            top: 100%;
          }
        }

        .animate-scan {
          animation: scan 2s linear infinite;
        }

        .glitch-text {
          animation: glitch 3s infinite;
        }

        .glitch-title {
          animation: glitch 5s infinite;
        }

        @keyframes glitch {
          0%, 90%, 100% {
            transform: translate(0);
          }
          92% {
            transform: translate(-2px, 2px);
          }
          94% {
            transform: translate(2px, -2px);
          }
          96% {
            transform: translate(-2px, -2px);
          }
          98% {
            transform: translate(2px, 2px);
          }
        }

        .poster-container {
          position: relative;
          transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);
          transition: transform 0.3s;
        }

        .poster-container:hover {
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.02);
        }
      `}</style>
      {/* END CSS STYLES */}

      <div className="rain-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="scanlines" />

      <div className="cyber-grid" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-black pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="pt-8 pb-4 px-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-mono text-sm tracking-widest glitch-text">
                SYSTEM_ONLINE
              </span>
            </div>
            <div className="flex items-center gap-2 text-lime-400 font-mono text-xs">
              <Wifi className="w-4 h-4" />
              <span className="tracking-wider">
                {isRunning ? 'SYNCED_ACROSS_DEVICES' : 'NEURAL_LINK_ACTIVE'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-7xl w-full grid md:grid-cols-3 gap-8 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-none glitch-title">
                  <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.8)]">
                    METAVERSE
                  </span>
                  <br />
                  <span className="text-pink-500 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)]">
                    HACKATHON
                  </span>
                  <br />
                  <span className="text-lime-400 drop-shadow-[0_0_25px_rgba(163,230,53,0.8)]">
                    2025
                  </span>
                </h1>
                <div className="cyber-divider my-4" />
                <p className="text-cyan-300 font-mono text-xs md:text-sm tracking-wider uppercase">
                  24 HR COUNTDOWN // DIGITAL REALM
                </p>
              </div>

              <button onClick={handleStartCountdown} className="w-full cyber-button group text-base md:text-lg">
                <span className="relative z-10 flex items-center justify-center gap-3 font-bold tracking-widest">
                  <Zap className="w-4 h-4 group-hover:animate-spin" />
                  {isRunning ? 'STOP COUNTDOWN' : 'START COUNTDOWN'}
                  <Zap className="w-4 h-4 group-hover:animate-spin" />
                </span>
              </button>

              {isRunning && (
                <div className="text-center text-lime-400 font-mono text-xs animate-pulse">
                  ⚡ SYNCED ACROSS ALL DEVICES ⚡
                </div>
              )}
            </div>

            <div className="relative md:col-span-2 flex flex-col items-center justify-center gap-8">
              <div className="hologram-frame p-12 relative w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 rounded-lg border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.3)]" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />

                <div className="relative z-10">
                  <div className="flex justify-center items-center gap-6 md:gap-8">
                    <TimeBlock value={formatTime(timeLeft.hours)} label="HOURS" />
                    <span className="text-7xl md:text-8xl lg:text-9xl text-cyan-400 font-mono animate-pulse">:</span>
                    <TimeBlock value={formatTime(timeLeft.minutes)} label="MINS" />
                    <span className="text-7xl md:text-8xl lg:text-9xl text-cyan-400 font-mono animate-pulse">:</span>
                    <TimeBlock value={formatTime(timeLeft.seconds)} label="SECS" />
                  </div>

                  <div className="mt-8 flex justify-center gap-4 font-mono text-xs text-lime-400/70">
                    {[...Array(20)].map((_, i) => (
                      <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                        {Math.random() > 0.5 ? '1' : '0'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="poster-container w-full md:w-96">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-black border-2 border-red-500/30 transform rotate-2" />
                <div className="relative bg-gradient-to-br from-gray-900 to-black border-4 border-red-600/50 p-8 shadow-[0_0_60px_rgba(239,68,68,0.4)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 blur-3xl" />

                  <div className="relative space-y-4">
                    <div className="border-3 border-red-600 p-4 bg-black/50">
                      <h2 className="text-4xl md:text-5xl font-black text-center leading-none">
                        <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                          BE
                        </span>
                        <br />
                        <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
                          SILENT
                        </span>
                      </h2>
                    </div>

                    <div className="space-y-3 text-center font-mono">
                      <p className="text-red-400 text-xs tracking-widest uppercase">
                        WARNING // NEURAL SURVEILLANCE ACTIVE
                      </p>
                      <div className="flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 h-6 bg-red-500/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-500 text-xs tracking-wider">
                        UNAUTHORIZED TRANSMISSION DETECTED
                      </p>
                    </div>

                    <div className="border-t-2 border-yellow-600/50 pt-3">
                      <p className="text-yellow-500/70 font-mono text-xs text-center tracking-wider">
                        CORPORATE SECURITY DIVISION // SECTOR 7
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 w-12 h-12 border-2 border-red-500 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-mono text-gray-600">
            <span className="tracking-wider">v2.0.25 // NEURAL_CORE</span>
            <span className="tracking-wider">UPLINK: 99.97% // LATENCY: 12ms</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;