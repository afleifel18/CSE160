// asg1.js 
//afleifel@ucsc.edu
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix; \n' +
  'uniform mat4 u_GlobalRotateMatrix; \n'+
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveCrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

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
  
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType= POINT;
let g_selectedSegment = 10;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_topAngle = 0;
let g_runAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_topAnimation = false;
let g_runAnimation = false;

let g_mouseXAngle = 0; // Rotation around Y-axis
let g_mouseYAngle = 0; // Rotation around X-axis

let g_isDragging = false; // Tracks if mouse is held down
let g_prevMouseX = 0;
let g_prevMouseY = 0;

function addActionsForHtmlUI(){
  document.getElementById('animationON').onclick = function() {g_yellowAnimation = true;};
  document.getElementById('animationOFF').onclick = function() {g_yellowAnimation = false;};
  
  document.getElementById('magentaAnimationON').onclick = function() {g_magentaAnimation = true;};
  document.getElementById('magentaAnimationOFF').onclick = function() {g_magentaAnimation = false;};  
  
  document.getElementById('topAnimationON').onclick = function() {g_topAnimation = true;};
  document.getElementById('topAnimationOFF').onclick = function() {g_topAnimation = false;};
  
  document.getElementById('runAnimationON').onclick = function() {g_runAnimation = true;};
  document.getElementById('runAnimationOFF').onclick = function() {g_runAnimation = false;};
  
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes(); });
  
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes(); });
  
  document.getElementById('topSlide').addEventListener('mousemove', function() {g_topAngle = this.value; renderAllShapes(); });
  
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  addMouseControl();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)} };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
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

function updateAnimationAngles(){
  if (g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation){
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
  if (g_topAnimation){
    g_topAngle = (30*Math.sin(g_seconds));
  }
  if (g_runAnimation){
    g_runAngle = (20*Math.sin(g_seconds));
  }
}

function renderAllShapes(){
  
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_mouseXAngle, 0, 1, 0); // Rotate around Y-axis (left/right)
  globalRotMat.rotate(g_mouseYAngle, 1, 0, 0); // Rotate around X-axis (up/down)

  
  //var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var startTime = performance.now();
  
  //body
  var body = new Cube();
  body.color = [1,1,1,1];
  body.matrix.translate(-0.25, -0.6, -0.50);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5,.3,1);
  body.render();
  
  //neck
  var neck = new Cube();
  neck.color = [1,1,1,1];
  neck.matrix.setTranslate(0, -.5, -0.48);
  neck.matrix.rotate(-5, 1, 0,0);
  neck.matrix.rotate(-g_yellowAngle, 0, 0,1);
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(.2, .5, .3);
  neck.matrix.translate(-0.5, 0, 0);
  neck.render();
  
  //head
  var head = new Cube();
  head.color = [1,1,1,1];
  head.matrix = neckCoordinatesMat;
  head.matrix.translate(0,.45,0);
  head.matrix.rotate(-g_magentaAngle,0,0,1);
  
  var headCoordinatesMat = new Matrix4(head.matrix);
  var head1CoordinatesMat = new Matrix4(head.matrix);
  var head2CoordinatesMat = new Matrix4(head.matrix);
  var head3CoordinatesMat = new Matrix4(head.matrix);
  head.matrix.scale(.3,.3,.3);
  head.matrix.translate(-.5,0, -0.01);
  head.render();
  
  // nose
  var nose = new Cube();
  nose.color = [1,.6,0,1];
  nose.matrix = headCoordinatesMat;
  nose.matrix.translate(0,0,-0.1);
  nose.matrix.scale(0.15,0.15,0.15);
  nose.matrix.translate(-0.5,0,0);
  nose.render();
  
  // eye1
  var eye1 = new Cube();
  eye1.color = [0,0,0,1];
  eye1.matrix = head1CoordinatesMat;
  eye1.matrix.translate(0,.2,-0.05);
  eye1.matrix.scale(0.05,0.05,0.05);
  eye1.matrix.translate(1,0,0);
  eye1.render();
  
  // eye2
  var eye2 = new Cube();
  eye2.color = [0,0,0,1];
  eye2.matrix = head2CoordinatesMat;
  eye2.matrix.translate(0,.2,-0.05);
  eye2.matrix.scale(0.05,0.05,0.05);
  eye2.matrix.translate(-2,0,0);
  eye2.render();
  
  // leg1
  var leg1 = new Cube();
  leg1.color = [1,1,0,1];
  leg1.matrix.translate(-0.24, -0.8, -0.4);
  leg1.matrix.rotate(180,0,1,0);
  leg1.matrix.rotate(-5,1,0,0);
  leg1.matrix.scale(0.15,.4,.15);
  leg1.matrix.translate(-1, 0, -.5);
  leg1.matrix.rotate(g_runAngle,1,0,0);
  leg1.render();
  
  // leg2
  var leg2 = new Cube();
  leg2.color = [1,1,0,1];
  leg2.matrix.translate(0.099, -0.8, -0.4);
  leg2.matrix.rotate(180,0,1,0);
  leg2.matrix.rotate(-5,1,0,0);
  leg2.matrix.scale(0.15,.4,.15);
  leg2.matrix.translate(-1, 0, -.5);
  leg2.matrix.rotate(g_runAngle,1,0,0);
  leg2.render();
  
  // leg3
  var leg3 = new Cube();
  leg3.color = [1,1,0,1];
  leg3.matrix.translate(0.099, -0.75, 0.35);
  leg3.matrix.rotate(180,0,1,0);
  leg3.matrix.rotate(-5,1,0,0);
  leg3.matrix.scale(0.15,.4,.15);
  leg3.matrix.translate(-1, 0, -.4);
  leg3.matrix.rotate(g_runAngle,1,0,0);
  leg3.render();
  
  // leg4
  var leg4 = new Cube();
  leg4.color = [1,1,0,1];
  leg4.matrix.translate(-0.24, -0.75, 0.35);
  leg4.matrix.rotate(180,0,1,0);
  leg4.matrix.rotate(-5,1,0,0);
  leg4.matrix.scale(0.15,.4,.15);
  leg4.matrix.translate(-1, 0, -.4);
  leg4.matrix.rotate(g_runAngle,1,0,0);
  leg4.render();
  
  var duration = performance.now() - startTime;
  sendTextToHTML("fps:" + Math.floor(10000/duration)/10, "numdot");
  
  // unicorn
  var top = new Cube();
  top.color = [1,.6,0,1];
  top.matrix = head3CoordinatesMat;
  top.matrix.translate(0,0,-0.1);
  top.matrix.rotate(-g_topAngle,0,0,1);
  top.matrix.scale(0.1,.3,.15);
  top.matrix.translate(-0.5,.7,1.5);
  top.render();
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById("fps");
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
  return;
  }
  htmlElm.innerHTML = text;
}


// chat gpt helped a little
function addMouseControl() {
    canvas.addEventListener("mousedown", (event) => {
        g_isDragging = true;
        g_prevMouseX = event.clientX;
        g_prevMouseY = event.clientY;
    });

    canvas.addEventListener("mousemove", (event) => {
        if (g_isDragging) {
            let deltaX = event.clientX - g_prevMouseX;
            let deltaY = event.clientY - g_prevMouseY;
            
            g_mouseXAngle += deltaX * 0.5; // Adjust sensitivity for left/right rotation
            g_mouseYAngle -= deltaY * 0.5; // Invert for natural up/down movement

            g_prevMouseX = event.clientX;
            g_prevMouseY = event.clientY;

            renderAllShapes(); // Re-render with new angles
        }
    });

    canvas.addEventListener("mouseup", () => {
        g_isDragging = false;
    });

    canvas.addEventListener("mouseleave", () => {
        g_isDragging = false;
    });
}

