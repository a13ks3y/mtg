class Grid {
    constructor(cols, rows, startingScore = 0) {
        this.cols = cols;
        this.rows = rows;
        this.score = startingScore;
        this.cells = [];
        this.hasActiveMatches = false;
        this._seenId = 1;

        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                this.cells[this.cellIndex(c, r)] = new Cell(c, r);
            }
        }
        for (let cell of this.cells) {
            const prev = this.getCell(cell.c, cell.r - 1);
            const next = this.getCell(cell.c, cell.r + 1);
            cell.prev = prev;
            cell.next = next;
        }
        this.buildBoardCache();
        this.createGems();
    }
    buildBoardCache() {
        const boardCanvas = document.createElement('canvas');
        boardCanvas.width = this.cols * CELL_SIZE;
        boardCanvas.height = this.rows * CELL_SIZE;
        const boardCtx = boardCanvas.getContext('2d');

        boardCtx.fillStyle = 'green';
        boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
        boardCtx.fillStyle = 'black';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;
                boardCtx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        }
        this.boardCache = boardCanvas;
    }
    createGems() {
        for (let cell of this.cells) {
            if (!cell.gem) {
                cell.gem = new Gem(cell.c, cell.r - this.rows);
                cell.gem.moveTo(cell.x, cell.y);
            }
        }
    }
    cellIndex(c, r) {
        return c + r * this.cols;
    }
    getCell(c, r) {
        return this.cells[this.cellIndex(c, r)];
    }

    getMatches() {
        const vMatches = [];
        const flattenedV = [];
        for (let c = 0; c < this.cols; c++) {
            let vMatch = [];
            for (let r = 0; r < this.rows; r++) {
                const gem = this.getGem(c, r);
                const prevGem = vMatch[vMatch.length - 1];
                if (gem) {
                    if (prevGem) {
                        if (prevGem.v === gem.v) {
                            vMatch.push(gem);
                        }
                        if ((prevGem.v !== gem.v) || (r === this.rows - 1)) {
                            if (vMatch.length >= 3) {
                                vMatches.push(vMatch);
                                for (let i = 0; i < vMatch.length; i++) flattenedV.push(vMatch[i]);
                                vMatch = [gem];
                            } else {
                                vMatch = [gem];
                            }
                        }
                    } else {
                        vMatch.push(gem);
                    }
                } else {
                    if (vMatch.length >= 3) {
                        vMatches.push(vMatch);
                        for (let i = 0; i < vMatch.length; i++) flattenedV.push(vMatch[i]);
                    }
                    vMatch = [];
                }
            }
        }

        const hMatches = [];
        const flattenedH = [];
        for (let r = 0; r < this.rows; r++) {
            let hMatch = [];
            for (let c = 0; c < this.cols; c++) {
                const gem = this.getGem(c, r);
                const prevGem = hMatch[hMatch.length - 1];
                if (gem) {
                    if (prevGem) {
                        if (prevGem.v === gem.v) {
                            hMatch.push(gem);
                        }
                        if ((prevGem.v !== gem.v) || (c === this.cols - 1)) {
                            if (hMatch.length >= 3) {
                                hMatches.push(hMatch);
                                for (let i = 0; i < hMatch.length; i++) flattenedH.push(hMatch[i]);
                                hMatch = [gem];
                            } else {
                                hMatch = [gem];
                            }
                        }
                    } else {
                        hMatch.push(gem);
                    }
                } else {
                    if (hMatch.length >= 3) {
                        hMatches.push(hMatch);
                        for (let i = 0; i < hMatch.length; i++) flattenedH.push(hMatch[i]);
                    }
                    hMatch = [];
                }
            }
        }

        const all = flattenedH.slice();
        for (let i = 0; i < flattenedV.length; i++) {
            all.push(flattenedV[i]);
        }

        return {
            hMatches,
            vMatches,
            flattenedH,
            flattenedV,
            all
        };
    }
    combo = 1;
    floatingTexts = [];
    particles = [];

    spawnParticles(x, y, v) {
        if (this.particles.length > 180) return;
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                v: v,
                size: Math.random() * 8 + 12
            });
        }
    }

    addScore(amount, x, y) {
        const points = amount * this.combo;
        this.score += points;
        this.floatingTexts.push({
            text: "+" + points,
            x: x,
            y: y,
            life: 1.0,
            vy: -90
        });
    }

    getPowerupMatches(initialMatches) {
        const seenId = ++this._seenId;
        const matches = [];
        const queue = [];

        for (let i = 0; i < initialMatches.length; i++) {
            const gem = initialMatches[i];
            if (!gem || gem._seenId === seenId) continue;
            gem._seenId = seenId;
            matches.push(gem);
            queue.push(gem);
        }
        
        for (let qi = 0; qi < queue.length; qi++) {
            const current = queue[qi];
            if (current.special === 'row') {
                let r = Math.round(current.y / CELL_SIZE);
                for (let c = 0; c < this.cols; c++) {
                    let g = this.getGem(c, r);
                    if (g && g._seenId !== seenId) {
                        g._seenId = seenId;
                        matches.push(g);
                        queue.push(g);
                    }
                }
            } else if (current.special === 'col') {
                let c = Math.round(current.x / CELL_SIZE);
                for (let r = 0; r < this.rows; r++) {
                    let g = this.getGem(c, r);
                    if (g && g._seenId !== seenId) {
                        g._seenId = seenId;
                        matches.push(g);
                        queue.push(g);
                    }
                }
            } else if (current.special === 'bomb') {
                let cy = Math.round(current.y / CELL_SIZE);
                let cx = Math.round(current.x / CELL_SIZE);
                for (let r = cy - 1; r <= cy + 1; r++) {
                    for (let c = cx - 1; c <= cx + 1; c++) {
                        let g = this.getGem(c, r);
                        if (g && g._seenId !== seenId) {
                            g._seenId = seenId;
                            matches.push(g);
                            queue.push(g);
                        }
                    }
                }
            }
        }
        return matches;
    }

    refillColumns() {
        for (let c = 0; c < this.cols; c++) {
            let spawnCount = 0;
            for (let r = 0; r < this.rows; r++) {
                const cell = this.getCell(c, r);
                if (cell.gem) break;
                spawnCount++;
            }
            for (let i = 0; i < spawnCount; i++) {
                const cell = this.getCell(c, i);
                const gem = new Gem(c, i - spawnCount);
                gem.moveTo(cell.x, cell.y);
                cell.gem = gem;
            }
        }
    }

    logic(dtt) {
        this.isFalling = false;
        for (let i = this.cells.length - 1; i >= 0; i--) {
            let cell = this.cells[i];
            cell.logic(dtt, this.rows);
            if (cell.gem) {
                if (cell.gem.target) {
                    this.isFalling = true;
                }
                if (cell.gem.removed) {
                    cell.gem = null;
                }
            }
        }
        if (this.particles && this.particles.length > 0) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dtt;
                p.y += p.vy * dtt;
                p.vy += 400 * dtt; // gravity
                p.life -= dtt * 1.5;
                if (p.life <= 0) {
                    const last = this.particles.length - 1;
                    this.particles[i] = this.particles[last];
                    this.particles.pop();
                }
            }
        }

        if (this.floatingTexts && this.floatingTexts.length > 0) {
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.y += ft.vy * dtt;
                ft.life -= dtt * 0.9;
                if (ft.life <= 0) {
                    const last = this.floatingTexts.length - 1;
                    this.floatingTexts[i] = this.floatingTexts[last];
                    this.floatingTexts.pop();
                }
            }
        }

        if (!this.isFalling) {
            this.refillColumns();
            const matchData = this.getMatches();
            this.hasActiveMatches = matchData.all && matchData.all.length > 0;
            if (matchData.all && matchData.all.length > 0) {
                audioMan.playMatch(this.combo);
                let matchCount = 0;
                let tx = 0, ty = 0;

                let nextSpecials = new Map();
                let flattenedH = matchData.flattenedH;
                let flattenedV = matchData.flattenedV;

                matchData.hMatches.forEach(group => {
                    if (group.length >= 5) {
                        nextSpecials.set(group[2], 'bomb');
                    } else if (group.length === 4) {
                        if (!nextSpecials.has(group[1])) nextSpecials.set(group[1], 'col');
                    }
                });
                matchData.vMatches.forEach(group => {
                    if (group.length >= 5) {
                        nextSpecials.set(group[2], 'bomb');
                    } else if (group.length === 4) {
                        if (!nextSpecials.has(group[1])) nextSpecials.set(group[1], 'row');
                    }
                });

                const seenId = ++this._seenId;
                for (let i = 0; i < flattenedV.length; i++) {
                    flattenedV[i]._seenId = seenId;
                }
                for (let i = 0; i < flattenedH.length; i++) {
                    const g = flattenedH[i];
                    if (g._seenId === seenId) nextSpecials.set(g, 'bomb');
                }

                let finalMatches = this.getPowerupMatches(matchData.all);
                finalMatches = finalMatches.filter(g => !nextSpecials.has(g));

                nextSpecials.forEach((special, gem) => {
                    gem.special = special;
                });

                finalMatches.forEach(gem => {
                    gem.remove = true;
                    this.spawnParticles(gem.x + CELL_SIZE/2, gem.y + CELL_SIZE/2, gem.v);
                    tx += gem.x;
                    ty += gem.y;
                    matchCount++;
                });
                if (matchCount > 0) {
                    tx /= matchCount;
                    ty /= matchCount;
                    if (!this.scoringDebounce) {
                        this.addScore(matchCount * 10, tx, ty);
                        this.combo++;
                        this.scoringDebounce = true;
                    }
                }
            } else {
                this.hasActiveMatches = false;
                this.combo = 1;
                this.scoringDebounce = false;
            }
        } else {
            this.hasActiveMatches = false;
        }
    }
    render(ctx) {
        ctx.drawImage(this.boardCache, 0, 0);
        for (let cell of this.cells) {
            cell.gem?.render(ctx);
        }

        if (this.particles && this.particles.length) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            let lastFont = '';
            for (let p of this.particles) {
                ctx.globalAlpha = Math.max(0, p.life);
                let currentFont = Math.round(p.size) + 'px monospace';
                if (lastFont !== currentFont) {
                    ctx.font = currentFont;
                    lastFont = currentFont;
                }
                ctx.fillText(p.v, Math.round(p.x - p.size / 2), Math.round(p.y + p.size / 3));
            }
            ctx.globalAlpha = 1;
        }

        if (this.floatingTexts) {
            if (ctx.font !== "bold 35px Arial") ctx.font = "bold 35px Arial";
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                let ft = this.floatingTexts[i];
                ctx.fillStyle = "rgba(255, 255, 0, " + Math.max(0, ft.life) + ")";
                ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
            }
        }
    }
    getGem(c, r) {
        const cell = this.getCell(c, r);
        if (cell && cell.gem && !cell.gem.remove) return cell.gem;
        return null;
    }
}
