//const GEM_VALUES = [ '🍄', '🍒'];
const GEM_VALUES = ['🍕', '🍌', '🥥', '🍄', '🍒'];
class Gem {
    constructor(c, r) {
        this.remove = false;
        this.x = c * CELL_SIZE;
        this.y = r * CELL_SIZE;
        this.v = GEM_VALUES[Math.floor(Math.random()*GEM_VALUES.length)];
        this.a = 1;
    }
    render(ctx) {
        const fontSize = Math.floor(CELL_SIZE / 2);
        ctx.font = fontSize + 'px monospace';
        ctx.fillStyle = `rgba(255,255,255, ${this.a}`;
        ctx.fillText(
            this.v,
            this.x + CELL_SIZE / 2 - fontSize / 1.5,
            this.y + CELL_SIZE - fontSize / 1.5);
        //this.debug(ctx);
    }
    debug(ctx) {
        if (this.remove) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    moveTo(x, y) {
        this.target = { x, y };
    }
    logic(dtt) {
        if (this.target) {
            const dx = this.x - this.target.x;
            const dy = this.y - this.target.y;
            if (dx !== 0) {
                const t = Math.abs(dx) / CELL_SPEED;
                if (t > dtt) {
                    const vx = dx > 0 ? 1 : -1;
                    this.x -= vx * CELL_SPEED * dtt;
                } else {
                    this.x = this.target.x;
                }
            }
            if (dy !== 0) {
                const t = Math.abs(dy) / CELL_SPEED;
                if (t > dtt) {
                    const vy = dy > 0 ? 1 : -1;
                    this.y -= vy * CELL_SPEED * dtt;
                } else {
                    this.y = this.target.y;
                }
            }

            if (dx === 0 && dy === 0) {
                this.x = this.target.x;
                this.y = this.target.y;
                this.target = null;
            }
        }
        if (this.remove) {
            this.a -= 1 * dtt;
            if (this.a <= 0) {
                this.removed = true;
            }
        }
    }

}
