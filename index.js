function randomInt(from, to) {
    return Math.floor(Math.random() * (to - from)) + from;
}
class App {
    paused = true;
    firstRun = true;
    constructor(canvasElement) {
        this.ctx = canvasElement.getContext('2d');
        this.updateCanvasSize();
        this.startLoop();
        this.createGrid();
        let timer;
        window.addEventListener('resize', e => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                this.updateCanvasSize();
                this.createGrid();
            }, 100);
        });
        this.ctx.canvas.addEventListener('click', this.click.bind(this));
        //CELL_SPEED = 3;
    }
    click(e) {
        const mx = e.offsetX;
        const my = e.offsetY;
        const mc = Math.floor(mx / CELL_SIZE);
        const mr = Math.floor(my / CELL_SIZE);
        const gem = this.grid.getGem(mc, mr);
        if (gem) {
            if (this.selected) {
                this.switchGems(this.selected, gem);
                this.grid.checked = false;
                if (this.grid.getMatches().length) {
                    //this.grid.createGems();
                } else {
                    this.switchGems(this.selected, gem);
                }
                this.selected = false;
            } else {
                this.selected = gem;
            }
        } else {
            this.selected = null;
        }
    }
    switchGems(gemA, gemB) {
        //const gemAIndex = this.grid.getIndex(gemA.c, gemA.r);
        //const gemBIndex = this.grid.getIndex(gemB.c, gemB.r);
        const gemAValue = gemA.v;
        gemA.v = gemB.v;
        gemB.v = gemAValue;
    }
    createGrid() {
        const cols = Math.floor(this.ctx.canvas.width / CELL_SIZE);
        const rows = Math.floor(this.ctx.canvas.height / CELL_SIZE);
        this.ctx.canvas.width = cols * CELL_SIZE;
        this.ctx.canvas.height = rows * CELL_SIZE;
        this.grid = new Grid(cols, rows);
    }
    startLoop() {
        if (this.paused) {
            this.paused = false;
            this.lastTick = Date.now();
            requestAnimationFrame(this.loop.bind(this));
        } else {
            console.error('Already in loop!');
        }
    }

    updateCanvasSize() {
        const parentRect = this.ctx.canvas.parentElement.getBoundingClientRect();
        const canvasWidth = Math.floor(parentRect.width - 8);
        const canvasHeight = Math.floor(parentRect.height - 24);
        this.ctx.canvas.width = canvasWidth;
        this.ctx.canvas.height = canvasHeight;
        if (canvasWidth <= 666) {
            //todo: refactor
            CELL_SIZE = 64;
        }
    }
    render() {
        const ctx = this.ctx;
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        this.grid.render(ctx);
        if (this.selected) {
            const M = 2;
            ctx.strokeStyle = 'cyan';
            ctx.strokeRect(this.selected.x + M, this.selected.y + M, CELL_SIZE - M,CELL_SIZE - M);
        }
    }
    logic(dtt) {
        this.grid.logic(dtt);
        if (!this.grid.isFalling && this.firstRun) {
            //CELL_SPEED = 0.666;
            this.firstRun = false;
        }
    }
    loop() {
        const dt = Date.now() - this.lastTick;
        if (dt > 0) {
            const dtt = dt / 1000;
            this.render();
            this.logic(dtt);
            this.lastTick = Date.now();
        }
        !this.paused && requestAnimationFrame(this.loop.bind(this));
    }
}

const app = new App(document.getElementById('ctx'));
