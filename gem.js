const GEM_VALUES = ['🍕', '🍌', '🥥', '🍄', '🍒'];
class Gem {
    constructor(c, r) {
        this.remove = false;
        this.c = c;
        this.r = r;
        this.x = c * CELL_SIZE;
        this.y = r * CELL_SIZE;
        this.v = GEM_VALUES[Math.floor(Math.random()*GEM_VALUES.length)];
        this.a = 1;
        this.removed = false;
        this.target = null;
        this.special = null;
    }
    render(ctx) {
        if (this.removed) return;
        const fontSize = Math.floor(CELL_SIZE / 2);
        const prevAlpha = ctx.globalAlpha;
        if (ctx.globalAlpha !== this.a) ctx.globalAlpha = this.a;
        
        if (this.special === 'bomb') {
            ctx.beginPath();
            ctx.arc(Math.round(this.x + CELL_SIZE/2), Math.round(this.y + CELL_SIZE/2), Math.round(CELL_SIZE/2.2), 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.fill();
        } else if (this.special === 'row') {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.fillRect(Math.round(this.x), Math.round(this.y + CELL_SIZE/2 - 4), CELL_SIZE, 8);
        } else if (this.special === 'col') {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
            ctx.fillRect(Math.round(this.x + CELL_SIZE/2 - 4), Math.round(this.y), 8, CELL_SIZE);
        }

        const font = fontSize + 'px monospace';
        if (ctx.font !== font) ctx.font = font;
        if (ctx.fillStyle !== '#ffffff') ctx.fillStyle = '#ffffff';
        ctx.fillText(this.v, Math.round(this.x + CELL_SIZE / 4), Math.round(this.y + CELL_SIZE / 1.5));
        ctx.globalAlpha = prevAlpha;
    }
    moveTo(x, y) {
        this.target = {x, y};
    }
    logic(dtt) {
        if (this.target) {
            const speed = CELL_SPEED * 2.5;
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const maxStep = speed * dtt;
            
            if (Math.abs(dx) > maxStep) {
                this.x += Math.sign(dx) * maxStep;
            } else {
                this.x = this.target.x;
            }
            
            if (Math.abs(dy) > maxStep) {
                this.y += Math.sign(dy) * maxStep;
            } else {
                this.y = this.target.y;
            }
            
            if (Math.abs(this.target.x - this.x) < 0.001 && Math.abs(this.target.y - this.y) < 0.001) {
                this.x = this.target.x;
                this.y = this.target.y;
                this.target = null;
                if (typeof audioMan !== 'undefined' && audioMan) {
                    audioMan.playFall();
                }
            }
        }
        if (this.remove) {
            this.a -= 3 * dtt; // Fade out quickly
            if (this.a <= 0) {
                this.removed = true;
                this.a = 0;
            }
        }
    }
}
