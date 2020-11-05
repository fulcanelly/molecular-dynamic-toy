var c = document.getElementById("cvs");
let ctx = eval(`document.getElementById("cvs").getContext("2d")`);
ctx.lineCap = 'round';
ctx.lineWidth = "3";
let set_up_frame = () => {
    ctx.moveTo(0, 0);
    [
        [0, 0],
        [0, 300],
        [500, 300],
        [500, 0],
        [0, 0]
    ]
        .forEach(dot => {
        ctx.lineTo(...dot);
        ctx.stroke();
    });
};
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    let cc = c;
    cc.width = window.innerWidth;
    cc.height = window.innerHeight;
}
resizeCanvas();
c.onclick = (click) => {
    let pos = {
        x: click.clientX - c.offsetLeft,
        y: click.clientY - c.offsetTop
    };
    field.add(pos);
    console.log(pos);
};
class Vector {
    constructor(x = 0, y = 0) {
        this.add = this.genOp((a, b) => a + b);
        this.sub = this.genOp((a, b) => a - b);
        this.mul = this.genOp((a, b) => a * b);
        this.div = this.genOp((a, b) => a / b);
        this.x = x;
        this.y = y;
    }
    getDistance(b) {
        return Math.sqrt((this.x - b.x) ** 2 + (this.y - b.y) ** 2);
    }
    genOp(op) {
        return function (another) {
            if (another instanceof Vector) {
                return new Vector(op(this.x, another.x), op(this.y, another.y));
            }
            else {
                return new Vector(op(this.x, another), op(this.y, another));
            }
        };
    }
}
let genDef = (f, dx = 0.1) => {
    return (x) => (f(x) - f(x + dx)) / dx;
};
class Atom {
    constructor(loc, a, speed) {
        this.loc = loc;
        this.a = a;
        this.speed = speed;
    }
    getEnergyBetween(another) {
        let distance = another.loc.getDistance(this.loc);
        return 1 / distance**2 - distance * (1 / 5000)
        return Math.abs(distance - 2) / distance - 1;
    }
    move(delta_t) {
        this.speed = this.speed.add(this.a.mul(delta_t));
        this.loc.x += this.speed.x * delta_t + (this.a.x * delta_t ** 2) / 2;
        this.loc.y += this.speed.y * delta_t + (this.a.y * delta_t ** 2) / 2;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.loc.x, this.loc.y, 4, 0, Math.PI * 2, true);
        ctx.stroke();
    }
    update() {
        this.move(0.3);
    }
}
class Field {
    constructor() {
        this.atoms = new Array();
    }
    update() {
        this.atoms.forEach(atom => {
            let force = new Vector();
            let allExceptThis = () => this.atoms.filter(a => a != atom);
            allExceptThis().forEach(one => {
                let energy = atom.getEnergyBetween(one);
                console.log(energy);
                let direction = atom.loc.sub(one.loc);
                force = force.add(direction.mul(energy));
            });
            atom.a = force.div(1);
            atom.update();
        });
    }
    add(pos) {
        pos = cast_to(pos, Vector);
        let atom = new Atom(pos, new Vector, new Vector);
        this.atoms.push(atom);
    }
    draw() {
        this.atoms.forEach((atom) => atom.draw());
    }
    clear() {
        let cany = c;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cany.width, cany.height);
    }
    start() {
        setInterval(() => {
            this.clear();
            this.update();
            this.draw();
            //  console.log('draw')
        }, 1);
    }
}
function cast_to(obj, type) {
    return Object.assign(new type, obj);
}
let field = new Field();
field.start();
