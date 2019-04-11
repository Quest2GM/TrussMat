let canvas = document.getElementById("newCanvas"), context = canvas.getContext("2d");

function Lol(x,y,a,b) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;
    this.colour = "#5477ea";

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(a,b);
    context.lineWidth = 5;
    context.strokeStyle = this.colour;
    context.stroke();
}

let q = new Lol(1,2,200,100);
q.colour = "#000000";