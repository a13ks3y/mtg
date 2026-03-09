function randomInt(from, to) {
    return Math.floor(Math.random() * (to - from)) + from;
}
class App {
    paused = true;
    firstRun = true;
    level = 1;
    score = 0;
    highScore = parseInt(localStorage.getItem('highScore')) || 0;
    targetScore = 1000;
    moves = 20;
    gameOver = false;
    constructor(canvasElement) {
        this.ctx = canvasElement.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.boundLoop = this.loop.bind(this);
        this.hudFont = 'bold 20px Arial';
        this.updateCanvasSize();
        this.startLoop();
        this.createGrid();
        let timer;
        window.addEventListener('resize', e => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                this.updateCanvasSize();
                this.createGrid(true, true); // Don't reset score on resize, keep moves
            }, 100);
        });
        this.ctx.canvas.addEventListener('click', this.click.bind(this));
        //CELL_SPEED = 3;

        const audioToggle = document.getElementById('audioToggle');
        audioToggle.innerText = audioMan.enabled ? '🔊' : '🔈';
        audioToggle.addEventListener('click', () => {
            const isEnabled = audioMan.toggle();
            audioToggle.innerText = isEnabled ? '🔊' : '🔈';
        });
    }
    click(e) {
        if (this.gameOver) {
            this.createGrid(false);
            return;
        }

        const mx = e.offsetX;
        const my = e.offsetY;
        const mc = Math.floor(mx / CELL_SIZE);
        const mr = Math.floor(my / CELL_SIZE);
        const gem = this.grid.getGem(mc, mr);
        if (gem) {
            if (this.selected) {
                const isAdjacent = Math.abs(gem.c - this.selected.c) + Math.abs(gem.r - this.selected.r) === 1;
                if (isAdjacent) {
                    this.switchGems(this.selected, gem);
                    this.grid.checked = false;
                    const matches = this.grid.getMatches();
                    if (matches.all && matches.all.length) {
                        this.moves--;
                    } else {
                        this.switchGems(this.selected, gem);
                    }
                }
                this.selected = null;
            } else {
                this.selected = gem;
            }
        } else {
            this.selected = null;
        }
    }
    switchGems(gemA, gemB) {
        audioMan.playSwap();
        //const gemAIndex = this.grid.getIndex(gemA.c, gemA.r);
        //const gemBIndex = this.grid.getIndex(gemB.c, gemB.r);
        const gemAValue = gemA.v;
        gemA.v = gemB.v;
        gemB.v = gemAValue;
    }
    createGrid(isNextLevel = false, isResize = false) {
        if (this.transitioning) return;
        this.transitioning = true;
        if (!isNextLevel) {
            this.score = 0; this.highScore = parseInt(localStorage.getItem("highScore")) || 0;
            this.level = 1;
        }
        
        this.targetScore = this.level * 1000;
        if (!isResize) {
            this.moves = Math.max(10, 25 - this.level * 2);
        }
        this.gameOver = false;
        
        this.ctx.canvas.classList.add('level-transition');
        setTimeout(() => {
            const cols = Math.floor(this.ctx.canvas.width / CELL_SIZE);
            const rows = Math.floor(this.ctx.canvas.height / CELL_SIZE);
            this.ctx.canvas.width = cols * CELL_SIZE;
            this.ctx.canvas.height = rows * CELL_SIZE;
            this.grid = new Grid(cols, rows, this.score);
            
            // Allow layout to process the size change, then remove the transition class
            requestAnimationFrame(() => {
                this.ctx.canvas.classList.remove('level-transition');
                this.transitioning = false;
            });
        }, 300); // 300ms for halfway transition
    }
    startLoop() {
        if (this.paused) {
            this.paused = false;
            this.lastTick = performance.now();
            requestAnimationFrame(this.boundLoop);
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
        if (!this.grid) return;
        const ctx = this.ctx;
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        this.grid.render(ctx);

        if (this.grid.score > this.highScore) {
            this.highScore = this.grid.score;
        }
        
        ctx.fillStyle = "white";
        if (ctx.font !== this.hudFont) ctx.font = this.hudFont;
        ctx.fillText("High Score: " + this.highScore, 20, 30);
        ctx.fillText("Level: " + this.level, 20, 60);
        ctx.fillText("Score: " + (this.grid.score || 0) + (this.grid.combo > 1 ? "  Combo x" + this.grid.combo : ""), 20, 90);
        ctx.fillText("Target: " + this.targetScore, 20, 120);
        ctx.fillText("Moves: " + this.moves, 20, 150);

        if (this.gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = "red";
            ctx.font = "bold 48px Arial";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.font = "bold 24px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Click to Restart", ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
            ctx.textAlign = "left";
        } else if (this.selected) {
            const M = 2;
            ctx.strokeStyle = 'cyan';
            ctx.strokeRect(Math.round(this.selected.x + M), Math.round(this.selected.y + M), CELL_SIZE - M,CELL_SIZE - M);
        }
    }
    logic(dtt) {
        if (!this.grid || this.gameOver) return;
        this.grid.logic(dtt);
        if (this.grid.score > this.highScore) {
            this.highScore = this.grid.score;
            localStorage.setItem('highScore', String(this.highScore));
        }
        if (!this.grid.isFalling && this.firstRun) {
            this.firstRun = false;
        }

        // Check level progression/gameOver only when the grid is stable
        if (!this.transitioning && !this.grid.isFalling && !this.grid.hasActiveMatches) {
            if (this.grid.score >= this.targetScore) {
                this.level++;
                this.score = this.grid.score;
                this.createGrid(true);
            } else if (this.moves <= 0) {
                this.gameOver = true;
                if (this.grid.score > this.highScore) {
                    this.highScore = this.grid.score;
                    localStorage.setItem('highScore', this.highScore);
                }
            }
        }
    }
    loop() {
        const now = performance.now();
        const dt = now - this.lastTick;
        if (dt > 0) {
            const dtt = Math.min(dt / 1000, 0.05); // cap delta to 50ms to prevent huge jumps
            this.logic(dtt);
            this.render();
            this.lastTick = now;
        }
        !this.paused && requestAnimationFrame(this.boundLoop);
    }
}

const app = new App(document.getElementById('ctx'));
