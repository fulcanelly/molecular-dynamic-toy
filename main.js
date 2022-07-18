

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
   // console.log(pos);
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

    toS() {
        return this.x + ":" + this.y
    }
}
let genDef = (f, dx = 0.1) => {
    return (x) => (f(x) - f(x + dx)) / dx;
};
class Atom {
    constructor(loc, a, speed) {
        this.loc = loc;
        this.a = a;
        this.dist_draw_cnt = 0
        this.speed = new Vector
    }
    getEnergyBetween(another) {
        let distance = another.loc.getDistance(this.loc);
        if (distance > 450) {
            return 0
        } 
        return (Math.exp(1)/(distance/100)) - Math.exp(distance/100) - 6

        return Math.exp(100/x)+  Math.exp(x/100) - 6
        //return (distance -150) ** 2
    }

    getDirection(another) {
        return another.loc.sub(this.loc).div(
            another.loc.getDistance(this.loc)
        )
    }

    move(delta_t) {
        const speed = this.a.mul(delta_t)
        const loc = speed.add(this.loc)
        return new Atom(loc, new Vector, speed)
     //   this.loc.x += speed.x  
       // this.loc.y += speed.y 
      
    }


    drawLineTo(another) {
        const drawLine = false
        if (drawLine) {
            ctx.beginPath()
            ctx.moveTo(this.loc.x, this.loc.y);    // Move the pen to (30, 50)
            ctx.lineTo(another.loc.x, another.loc.y);  // Draw a line to (150, 100)
            ctx.stroke();  
        }

        this.loc.toS()
        const printlog = false
        if (printlog) {
            console.log( this.loc.y + (50 * this.dist_draw_cnt))
            const energy = this.getEnergyBetween(another)
            const direction = this.getDirection(another)
            console.log(energy)
            ctx.font = '20px serif';
            ctx.strokeText(JSON.stringify({
                energy, direction}),  
                this.loc.x, this.loc.y + (25 * this.dist_draw_cnt)
            );
        }
        this.dist_draw_cnt++

    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.loc.x, this.loc.y, 4, 0, Math.PI * 2, true);
        ctx.stroke();
    }
    calc() {
        return this.move(0.03);
    }
    update() {
        this.dist_draw_cnt = 0
  //      this.move(0.3);
    }
}
class Field {
    constructor() {
        this.atoms = new Array();
    }
    update() {
        console.log("{")
        const replace = []
        this.atoms.forEach(atom => {
            let force = new Vector();
            let allExceptThis = () => this.atoms.filter(a => a != atom);
            allExceptThis().forEach(one => {
                const energy = one.getEnergyBetween(atom)
                const force_ = atom.getDirection(one).mul(-energy)

                force = force.add(force_)
                atom.drawLineTo(one)
            });
            
            atom.a = force.div(
                (allExceptThis().length == 0) ? 1 : allExceptThis().length
            )
            
            replace.push(
                atom.calc()
            )
        });
        this.atoms = replace
        console.log({
            replace,
            current: this.atoms 
        })
        console.log("}\n")
        
        this.atoms.forEach(atom => {
            atom.update();
        })
        console.log(this.atoms )
     //   this.atoms = replace.map(it => cast_to(it, Atom))
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
