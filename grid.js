class Grid {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.cells = [];

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
        this.createGems();
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
        let vMatch = [];
        for (let c = 0; c < this.cols; c++) {
            vMatch = [];
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
                    }
                    vMatch = [];
                }
            }
        }
        //vMatches.flat().forEach(gem => gem.remove = true);

        const hMatches = [];
        let hMatch = [];
        for (let r = 0; r < this.rows; r++) {
            hMatch = [];
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
                    }
                    hMatch = [];
                }
            }
        }
        //hMatches.flat().forEach(gem => gem.remove = true);

        return hMatches.flat().concat(vMatches.flat());
    }
    logic(dtt) {
        this.isFalling = false;
        for (let cell of this.cells) {
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
        if (!this.isFalling) {
            for (let cell of this.cells) {
                cell.checkLast(this.rows);
            }
            const matches = this.getMatches();
            matches.forEach(gem => gem.remove = true);
        }
    }
    render(ctx) {
        for (let cell of this.cells) {
            cell.render(ctx);
        }
        for (let cell of this.cells) {
            cell.gem?.render(ctx);
        }
    }
    getGem(c, r) {
        const cell = this.getCell(c, r);
        if (cell) return cell.gem;
        return null;
    }
}
