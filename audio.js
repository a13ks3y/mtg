class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('audioEnabled') === 'true';
        this.bgmOscillator = null;
        this.bgmGain = null;
        this.bgmInterval = null;
        this.queue = [];
        this.isProcessingQueue = false;
        this.lastPlayTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('audioEnabled', this.enabled);
        if (this.enabled) {
            this.init();
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.playBGM();
        } else {
            this.stopBGM();
        }
        return this.enabled;
    }

    playTone(freq, type, duration, vol=0.1) {
        if (!this.enabled || !this.ctx) return;
        if (this.queue.length > 5) return; // Cap the queue to prevent massive delays
        this.queue.push({freq, type, duration, vol});
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }

    processQueue() {
        if (this.queue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }
        this.isProcessingQueue = true;
        
        const now = this.ctx.currentTime;
        const playTime = Math.max(now, this.lastPlayTime + 0.05); // 50ms min gap
        this.lastPlayTime = playTime;

        const {freq, type, duration, vol} = this.queue.shift();

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, playTime);
            gain.gain.setValueAtTime(vol, playTime);
            gain.gain.exponentialRampToValueAtTime(0.01, playTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(playTime);
            osc.stop(playTime + duration);
        } catch (e) {
            // Context might not be ready
        }

        setTimeout(() => this.processQueue(), 50);
    }

    playSwap() {
        this.playTone(400, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(600, 'sine', 0.15, 0.1), 50);
    }

    playFall() {
        this.playTone(200, 'triangle', 0.05, 0.05);
    }

    playMatch(combo = 1) {
        const baseFreq = 440 + (combo * 110);
        this.playTone(baseFreq, 'square', 0.2, 0.15);
        setTimeout(() => this.playTone(baseFreq * 1.5, 'square', 0.3, 0.1), 100);
    }

    playBGM() {
        if (!this.enabled || !this.ctx) return;
        if (this.bgmInterval) return;

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.05;
        this.bgmGain.connect(this.ctx.destination);

        const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
        let noteIndex = 0;

        this.bgmInterval = setInterval(() => {
            if (!this.enabled) {
                this.stopBGM();
                return;
            }
            try {
                const osc = this.ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = notes[noteIndex % notes.length];
                
                const noteGain = this.ctx.createGain();
                noteGain.gain.setValueAtTime(1, this.ctx.currentTime);
                noteGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                
                osc.connect(noteGain);
                noteGain.connect(this.bgmGain);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            } catch (e) {}
            
            noteIndex++;
        }, 400);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        if (this.bgmGain) {
            this.bgmGain.disconnect();
            this.bgmGain = null;
        }
    }
}

const audioMan = new AudioManager();
