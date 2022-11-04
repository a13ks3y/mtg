let CELL_SIZE = 64;
let CELL_SPEED = 256;
class Cell {
    constructor(c, r, prev, next) {
        this.c = c;
        this.r = r;
        this.x = c * CELL_SIZE;
        this.y = r * CELL_SIZE;
        this.gem = null;
        this.next = next;
        this.prev = prev;
    }
    logic(dtt, rows) {
        if (this.gem) {
            this.gem.logic(dtt);

            if (this.next && !this.next.gem) {
                this.gem.moveTo(this.next.x, this.next.y);
                        this.next.gem = this.gem;
                        this.gem = null;
                // (function wait(){
                //     if (!this.gem.target) {
                //         this.next.gem = this.gem;
                //         this.gem = null;
                //     } else {
                //         setTimeout(wait.bind(this), 66);
                //     }
                // }.bind(this)());
            }

        }
    }
    checkLast(rows) {
        if (this.isLast()) {
            this.gem = new Gem(this.c, -1);
            this.gem.moveTo(this.x, this.y);
        }
    }
    isLast() {
        if (this.prev) {
            if (this.prev.gem) {
                return false;
            }
            return this.prev.isLast();
        } else {
            return !this.gem;
        }
    }
    render(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 1, this.y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        //this.debug(ctx);
    }

    debug(ctx) {
        if (this.remove) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.font = '12px monospace';
        ctx.fillStyle = 'white';
        ctx.fillText(`c: ${this.c} r: ${this.r}`, this.x, this.y + 12);
    }
}
