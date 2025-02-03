// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size; \n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveCrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
  
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType= POINT;
let g_selectedSegment = 10;

function addActionsForHtmlUI(){
  document.getElementById('green').onclick = function () {g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function () {g_selectedColor = [ 1.0,0.0,0.0,1.0]; };
  
  document.getElementById('clearButton').onclick = function () {g_shapesList = []; renderAllShapes(); };
  
  document.getElementById('pointButton').onclick = function () {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function () {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function () {g_selectedType=CIRCLE};
  document.getElementById('drawButton').onclick = drawPicture;
  
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});
  
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value;});
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegment = this.value;});
  document.getElementById('alphaSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value / 100; });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)} };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];

function click(ev) {

  let [x, y] = convertCoordinatesEventToGL(ev);
  
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else{
    point = new Circle(g_selectedSegment);
  }
  
  point.position = [x,y]; 
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return([x,y]);
}

function renderAllShapes(){
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
     g_shapesList[i].render();
  }  
}

function drawPicture() {
  gl.clear(gl.COLOR_BUFFER_BIT); // Clear canvas before drawing

  // House(Beige)
  gl.uniform4f(u_FragColor, 0.9, 0.7, 0.5, 1.0); // Light brown
  drawTriangle([-0.3, -0.3, 0.3, -0.3, -0.3, 0.2]); // Left half
  drawTriangle([0.3, -0.3, 0.3, 0.2, -0.3, 0.2]); // Right half

  // Roof (Red)
  gl.uniform4f(u_FragColor, 0.8, 0.0, 0.0, 1.0); // Red
  drawTriangle([-0.4, 0.2, 0.4, 0.2, 0.0, 0.5]); // Roof

  // Door (Brown)
  gl.uniform4f(u_FragColor, 0.6, 0.3, 0.1, 1.0); // Brown
  drawTriangle([-0.1, -0.3, 0.1, -0.3, -0.1, -0.05]); // Left door
  drawTriangle([0.1, -0.3, 0.1, -0.05, -0.1, -0.05]); // Right door

  // Tree Trunk (Brown)
  gl.uniform4f(u_FragColor, 0.5, 0.3, 0.1, 1.0);
  drawTriangle([0.5, -0.3, 0.6, -0.3, 0.5, -0.1]); // Left trunk
  drawTriangle([0.6, -0.3, 0.6, -0.1, 0.5, -0.1]); // Right trunk

  //Tree Leaves (Green)
  gl.uniform4f(u_FragColor, 0.0, 0.7, 0.0, 1.0);
  drawTriangle([0.4, -0.1, 0.7, -0.1, 0.55, 0.15]); // Bottom leaves
  drawTriangle([0.42, 0.05, 0.68, 0.05, 0.55, 0.2]); // Middle leaves
  drawTriangle([0.44, 0.1, 0.66, 0.1, 0.55, 0.25]); // Top leaves
  drawTriangle([0.38, -0.05, 0.72, -0.05, 0.55, 0.18]); // Extra bushy leaves
  drawTriangle([0.36, 0.02, 0.74, 0.02, 0.55, 0.23]); // Extra leaves
  drawTriangle([0.34, 0.07, 0.76, 0.07, 0.55, 0.28]); // Extra top leaves

  // Sun (Yellow)
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
  drawTriangle([-0.75, 0.75, -0.65, 0.85, -0.65, 0.65]); // Main part
  drawTriangle([-0.75, 0.75, -0.85, 0.85, -0.85, 0.65]); // Left
  drawTriangle([-0.75, 0.75, -0.65, 0.65, -0.75, 0.55]); // Bottom left
  drawTriangle([-0.75, 0.75, -0.85, 0.65, -0.75, 0.55]); // Bottom right
  drawTriangle([-0.75, 0.75, -0.85, 0.85, -0.65, 0.85]); // Top

}



