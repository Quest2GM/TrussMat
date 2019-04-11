let canvas = document.getElementById("newCanvas");
let mouseActivated = false;
canvas.addEventListener("mousedown", () => {
  mouseActivated = true;
});
canvas.addEventListener("mouseup", () => {
  mouseActivated = false;
});
canvas.addEventListener("mousemove", (event) => {
  let mousePos = getMousePos(canvas, event);
  let posx = mousePos.x;
  let posy = mousePos.y;
  draw(canvas, posx, posy);
});

function draw(canvas, posx, posy) {
  let context = canvas.getContext("2d");
  if (mouseActivated) {
    context.fillRect(posx, posy, 20, 20);
  }
}
function getMousePos(canvas, event) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: event.pageX - rect.left,
    y: event.pageY - rect.top
  };
}

canvas.addEventListener("mousemove", event => {
  mousePos = getMousePos(event);
  coordText.textContent = "X: " + mousePos.x + ", Y: " + mousePos.y;
});