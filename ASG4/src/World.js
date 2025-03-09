// asg4
// afleifel@ucsc.edu
// World.js
// Vertex shader program
var VSHADER_SOURCE =
  'precision mediump float;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_UV;\n' +
  'attribute vec3 a_Normal;\n' +
  'varying vec2 v_UV;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_VertPos;\n' +
  'uniform mat4 u_ModelMatrix; \n' +
  'uniform mat4 u_NormalMatrix; \n' +
  'uniform mat4 u_GlobalRotateMatrix; \n'+
  'uniform mat4 u_ViewMatrix; \n'+
  'uniform mat4 u_ProjectionMatrix; \n'+
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_UV = a_UV; \n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1))); \n' +
  '  v_VertPos = u_ModelMatrix * a_Position; \n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' + 
  'varying vec3 v_Normal;\n' +
  'uniform vec4 u_FragColor;\n' + 
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform int u_whichTexture;\n' +
  'uniform vec3 u_lightPos;\n' +
  'uniform vec3 u_cameraPos;\n' +
  'varying vec4 v_VertPos;\n' +
  'uniform int u_specularOn;\n' +
  'uniform bool u_lightOn;\n' +
  'uniform vec3 u_diffuseColor;\n' + 
  'uniform bool u_spotlightOn;\n' +
  'uniform vec3 u_spotDirection;\n' +
  'uniform float u_spotCutoff;\n' +
  'uniform vec3 u_spotlightPos;\n' +
  'void main() {\n' +
    'if (u_whichTexture == -4) { \n' +
      'gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); \n' +  // use normal
    '} else if (u_whichTexture == -2) { \n' +
      'gl_FragColor = u_FragColor; \n' +      // use color
    '} else if (u_whichTexture == -1) { \n' +
      'gl_FragColor = vec4(v_UV,1.0,1.0); \n' +    // use UV debug color
    '} else if (u_whichTexture == 0) { \n' +
      'gl_FragColor = texture2D(u_Sampler0, v_UV); \n' +   // use texture0
    '} else if (u_whichTexture == -3) { \n' +
      'gl_FragColor = texture2D(u_Sampler1, v_UV); \n' +   // use texture1
    '} else { \n' +
      'gl_FragColor = vec4(1, .2, .2,1); \n' +     // error use red
    '}\n' +
    
    'vec3 lightVector =  u_lightPos - vec3(v_VertPos); \n' +
    'float r = length(lightVector); \n' +
    
    'vec3 L = normalize(lightVector); \n' +
    'vec3 N = normalize(v_Normal); \n' +
    'float nDotL = max(dot(N,L), 0.0); \n' +
    
    'vec3 R = reflect(-L, N); \n' +  //reflection
    
    'vec3 E = normalize(u_cameraPos - vec3(v_VertPos)); \n' +  // eye
    
    'float specular = float(u_specularOn) * pow(max(dot(E,R), 0.0), 64.0) * 0.8; \n' +  //specular
    
    'float spotEffect = 1.0;\n' + // spotlight, CHATGPT helped me here
    'if (u_spotlightOn) {\n' +
    '  vec3 spotDir = normalize(u_spotDirection);\n' +
    '  vec3 spotlightVector = normalize(u_spotlightPos - vec3(v_VertPos)); \n' +
    '  float spotFactor = dot(normalize(-spotlightVector), normalize(u_spotDirection));\n' +
    '  if (spotFactor < u_spotCutoff) {\n' +
    '    spotEffect = 0.0; // Outside the spotlight cone\n' +
    '  }\n' +
    '}\n' +

    'vec3 diffuse = u_diffuseColor * vec3(gl_FragColor) * nDotL * 0.7 * spotEffect; \n' +
    'vec3 ambient = vec3(gl_FragColor) * 0.2; \n' +
    
    'if (u_lightOn) {\n' +
      'gl_FragColor = vec4(specular + diffuse + ambient, 1.0); \n' +
    '}\n' +
  '}\n';

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_lightPos;
let u_cameraPos;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_specularOn;
let u_lightOn;

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

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  
  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  
  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }
  
  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  
  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  
  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  
  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  
  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  
  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  
    // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  
  // Get the storage location of u_specularOn
  u_specularOn = gl.getUniformLocation(gl.program, 'u_specularOn');
  if (!u_specularOn) {
    console.log('Failed to get the storage location of u_specularOn');
    return;
  }
  
  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }
  
  // Get the storage location of u_diffuseColor
  u_diffuseColor = gl.getUniformLocation(gl.program, 'u_diffuseColor');
  if (!u_diffuseColor) {
    console.log('Failed to get the storage location of u_diffuseColor');
    return;
  }
  
  // Get the storage location of u_spotlightOn
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get u_spotlightOn');
    return;
  }
  
  // Get the storage location of u_spotDirection
  u_spotDirection = gl.getUniformLocation(gl.program, 'u_spotDirection');
  if (!u_spotDirection) {
    console.log('Failed to get u_spotDirection');
    return;
  }
  
  // Get the storage location of u_spotCutoff
  u_spotCutoff = gl.getUniformLocation(gl.program, 'u_spotCutoff');
  if (!u_spotCutoff) {
    console.log('Failed to get u_spotCutoff');
    return;
  }

  // Get the storage location of u_spotlightPos
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
    console.log('Failed to get u_spotlightPos');
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

let g_runAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_runAnimation = false;
let g_normalOn = false;
let g_lightPos = [0,3,-1]
let g_lightOn = true;
let g_diffuseColor = [1.0, 1.0, 1.0];

let g_spotlightOn = false;  // Default: spotlight is ON
let g_spotDirection = [0.0, -1.0, -1.0]; // Direction of spotlight
let g_spotCutoff = Math.cos(Math.PI / 6); // 30-degree spotlight cutoff
let g_spotlightPos = [0, 1, -2];

let g_mouseXAngle = 0; // Rotation around Y-axis
let g_mouseYAngle = 0; // Rotation around X-axis

let g_isDragging = false; // Tracks if mouse is held down
let g_prevMouseX = 0;
let g_prevMouseY = 0;

function addActionsForHtmlUI(){
  document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn = false;};
  
  document.getElementById('normalOn').onclick = function() {g_normalOn = true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false;};
  
  // CHAT GPT HELPED ME WITH THIS
  document.getElementById('diffuseColorPicker').addEventListener('input', function() {
    let hex = this.value;
    g_diffuseColor = [
        parseInt(hex.substr(1,2), 16) / 255,
        parseInt(hex.substr(3,2), 16) / 255,
        parseInt(hex.substr(5,2), 16) / 255
    ];
    renderAllShapes();
  });
  
  document.getElementById('spotlightOn').onclick = function() { g_spotlightOn = true; renderAllShapes(); };
  document.getElementById('spotlightOff').onclick = function() { g_spotlightOn = false; renderAllShapes(); };

  
  document.getElementById('animationON').onclick = function() {g_yellowAnimation = true;};
  document.getElementById('animationOFF').onclick = function() {g_yellowAnimation = false;};
  
  document.getElementById('magentaAnimationON').onclick = function() {g_magentaAnimation = true;};
  document.getElementById('magentaAnimationOFF').onclick = function() {g_magentaAnimation = false;};  
  
  document.getElementById('runAnimationON').onclick = function() {g_runAnimation = true;};
  document.getElementById('runAnimationOFF').onclick = function() {g_runAnimation = false;};
  
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
  
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes(); });
  
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes(); });
  
  
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function initTextures(n) {
  
  var image1 = new Image();  // Create the SKY object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendImageToTexture0(image1); };
  // Tell the browser to load an image
  image1.src = 'dirt.jpg';
  
  var image2 = new Image();  // Create the DIRT object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendImageToTexture1(image2); };
  // Tell the browser to load an image
  image2.src = 'floor.jpg';

  return true;
}

function sendImageToTexture0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function sendImageToTexture1(image) {
  var texture1 = gl.createTexture();   // Create a texture object
  if (!texture1) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  document.onkeydown = keydown;
  initTextures();
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
    g_yellowAngle = (30*Math.sin(g_seconds));
  }
  if (g_magentaAnimation){
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
  if (g_runAnimation){
    g_runAngle = (20*Math.sin(g_seconds));
  }
  g_lightPos[0] = cos(g_seconds);
}
  

let camera = new Camera();

function keydown(ev) {
    if (ev.keyCode == 87) {  // W - Move forward
        camera.forward();
    } else if (ev.keyCode == 83) { // S - Move backward
        camera.back();
    } else if (ev.keyCode == 65) { // A - Move left
        camera.left();
    } else if (ev.keyCode == 68) { // D - Move right
        camera.right();
    } else if (ev.keyCode == 81) { // Q - Pan left
        camera.panLeft();
    } else if (ev.keyCode == 69) { // E - Pan right
        camera.panRight();
    }
    renderAllShapes(); // Redraw the scene after movement
}

var g_map = [
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 2, 1, 2, 1, 0, 0, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 1, 2, 1, 2, 0, 0, 0, 2, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 2, 1, 2, 1, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
];


function drawMap() {
    var wall = new Cube();
    for (x = 0; x < 32; x++) {
        for (y = 0; y < 32; y++) {
            let wallHeight = g_map[x][y]; 
            
            for (h = 0; h < wallHeight; h++) { // Loop for height stacking
                wall.matrix.setIdentity();
                wall.color = [1.0, 1.0, 1.0, 1.0];
                wall.textureNum = 0;
                
                wall.matrix.translate(0, -.75, 0);
                wall.matrix.scale(.3, .3, .3);
                
                wall.matrix.translate(x - 16, h, y - 16);
                
                wall.renderfast();
            }
        }
    }
}




function renderAllShapes(){
  // pass projection matrix
  var proJMat = new Matrix4();
  proJMat.setPerspective(75, 1* canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, proJMat.elements);
  
  // pass view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],  
                    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],  
                    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]); 
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_mouseXAngle, 0, 1, 0); // Rotate around Y-axis (left/right)
  globalRotMat.rotate(g_mouseYAngle, 1, 0, 0); // Rotate around X-axis (up/down)

  
  var normalMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  
  //var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var startTime = performance.now();
  
  //drawMap();
  
  // pass light to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  
  // pass camera pos to GLSL
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2] );
  
  // pass light status
  gl.uniform1i(u_lightOn, g_lightOn);
  
  // pass diffuse color to GLSL
  gl.uniform3f(u_diffuseColor, g_diffuseColor[0], g_diffuseColor[1], g_diffuseColor[2]);
  
  // pass SPOTLIGHT
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform3f(u_spotDirection, g_spotDirection[0], g_spotDirection[1], g_spotDirection[2]);
  gl.uniform1f(u_spotCutoff, g_spotCutoff);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  
  // light
  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();
  
  //sphere
  var sphere = new Sphere();
  sphere.specularOn = 1;
  if (g_normalOn) sphere.textureNum = -4;
  sphere.matrix.scale(.5,.5,.5);
  sphere.matrix.translate(-2, .5, -.5);
  sphere.render();
  
  //SUN
  var sun = new Cube();
  sun.specularOn = 0;
  sun.color = [1.0, 1.0, 0.0, 1.0]; 
  if (g_normalOn) sun.textureNum = -4;
  sun.textureNum = -2;
  sun.matrix.translate(2, 2, -5);
  sun.matrix.scale(3, 3, 3);
  sun.render();

  //sky
  var sky = new Cube();
  sky.specularOn = 0;
  sky.color = [0.5, 0.8, 0.9, 1];
  if (g_normalOn) sky.textureNum = -4;
  
  sky.matrix.scale(-7.5,-7.5,-7.5);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.render();
  
  //floor
  var floor = new Cube();
  floor.specularOn = 1;
  floor.color = [.5,.5,.5,1];
  if (g_normalOn) {
    floor.textureNum = -4;
  } else {
    floor.textureNum = -3;
  }
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(10,0,10);
  floor.matrix.translate(-.5, 0, -.5);
  floor.render();
  
  //body
  var body = new Cube();
  body.specularOn = 1;
  body.color = [1,1,1,1];
  if (g_normalOn) body.textureNum = -4;
  body.matrix.translate(-0.25, -0.6, -0.50);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5,.3,1);
  body.render();
  
  //neck
  var neck = new Cube();
  neck.specularOn = 1;
  neck.color = [1,1,1,1];
  if (g_normalOn) neck.textureNum = -4;
  neck.matrix.setTranslate(0, -.5, -0.48);
  neck.matrix.rotate(-5, 1, 0,0);
  neck.matrix.rotate(-g_yellowAngle, 0, 0,1);
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(.2, .5, .3);
  neck.matrix.translate(-0.5, 0, 0);
  neck.normalMatrix.setInverseOf(neck.matrix).transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, neck.normalMatrix.elements);
  neck.render();
  
  //head
  var head = new Cube();
  head.specularOn = 1;
  head.color = [1,1,1,1];
  if (g_normalOn) head.textureNum = -4;
  head.matrix = neckCoordinatesMat;
  head.matrix.translate(0,.45,0);
  head.matrix.rotate(-g_magentaAngle,0,0,1);
  
  var headCoordinatesMat = new Matrix4(head.matrix);
  var head1CoordinatesMat = new Matrix4(head.matrix);
  var head2CoordinatesMat = new Matrix4(head.matrix);
  head.matrix.scale(.3,.3,.3);
  head.matrix.translate(-.5,0, -0.01);
  head.normalMatrix.setInverseOf(head.matrix).transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, head.normalMatrix.elements);
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
  leg1.specularOn = 1;
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
  leg2.specularOn = 1;
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
  leg3.specularOn = 1;
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
  leg4.specularOn = 1;
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
  
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById("fps");
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
  return;
  }
  htmlElm.innerHTML = text;
}

//chatgpt helped me with the concept of this
function addMouseControl() {
  // When the mouse is pressed, start tracking movement
  canvas.addEventListener("mousedown", (event) => {
    g_isDragging = true;
    g_prevMouseX = event.clientX;
  });

  // On mouse move, calculate horizontal delta and pan the camera accordingly
  canvas.addEventListener("mousemove", (event) => {
    if (g_isDragging) {
      let deltaX = event.clientX - g_prevMouseX;
      g_prevMouseX = event.clientX;
      
      // Adjust sensitivity: change 0.2 to your desired rotation factor (in degrees per pixel)
      let rotationAngle = deltaX * 0.2;
      
      // Rotate the camera around its up vector (like Q/E keys do)
      camera.pan(rotationAngle);
      
      renderAllShapes();
    }
  });

  canvas.addEventListener("mouseup", () => {
    g_isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    g_isDragging = false;
  });
}


