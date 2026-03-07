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
        
        ctx.save();
        ctx.globalAlpha = this.a;
        
        if (this.special === 'bomb') {
            ctx.beginPath();
            ctx.arc(this.x + CELL_SIZE/2, this.y + CELL_SIZE/2, CELL_SIZE/2.2, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.fill();
        } else if (this.special === 'row') {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.fillRect(this.x, this.y + CELL_SIZE/2 - 4, CELL_SIZE, 8);
        } else if (this.special === 'col') {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
            ctx.fillRect(this.x + CELL_SIZE/2 - 4, this.y, 8, CELL_SIZE);
        }

        ctx.font = fontSize + 'px monospace';
        ctx.fillStyle = 'rgba(255,255,255, 1)';
        ctx.fillText(this.v, this.x + CELL_SIZE / 4, this.y + CELL_SIZE / 1.5);
        ctx.restore();
    }
    moveTo(x, y) {
        this.target = {x, y};
    }
    logic(dtt) {
        if (this.target) {
            const speed = CELL_SPEED * 2.5;
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            
            if (Math.abs(dx) > 1) {
                this.x += Math.sign(dx) * speed * dtt;
            } else {
                this.x = this.target.x;
            }
            
            if (Math.abs(dy) > 1) {
                this.y += Math.sign(dy) * speed * dtt;
            } else {
                this.y = this.target.y;
            }
            
            if (this.x === this.target.x && this.y === this.target.y) {
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
