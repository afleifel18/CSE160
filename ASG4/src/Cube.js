// Cube.js 
//afleifel@ucsc.edu
class Cube{
  constructor(){
    this.type = 'cube';

    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2;
    this.specularOn = 1;
  }
  
  render(){

    var rgba = this.color;
    
    gl.uniform1i(u_specularOn, this.specularOn);
    
    // pass texture Number
    gl.uniform1i(u_whichTexture, this.textureNum);
    
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    //front
    drawTriangle3DUVNormal([0,0,0,  1,1,0,  1,0,0 ], [0,0, 1,1, 1,0], [0,0,-1,  0,0,-1,  0,0,-1]);
    drawTriangle3DUVNormal([0,0,0,  0,1,0,  1,1,0 ], [0,0, 0,1, 1,1], [0,0,-1,  0,0,-1,  0,0,-1]);
    
    //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9,rgba[2]*.9,rgba[3]);
    
    //top
    drawTriangle3DUVNormal([0,1,0,  0,1,1,  1,1,1 ], [0,0, 0,1, 1,1], [0,1,0,  0,1,0,  0,1,0]);
    drawTriangle3DUVNormal([0,1,0,  1,1,1,  1,1,0 ], [0,0, 1,1, 1,0], [0,1,0,  0,1,0,  0,1,0]);

    
    //right
    drawTriangle3DUVNormal([1,0,0,  1,1,1,  1,0,1 ], [0,0, 1,1, 1,0], [1,0,0,  1,0,0,  1,0,0]);
    drawTriangle3DUVNormal([1,0,0,  1,1,0,  1,1,1 ], [0,0, 0,1, 1,1], [1,0,0,  1,0,0,  1,0,0]);
    
    //bottom
    drawTriangle3DUVNormal([0,0,0,  1,0,1,  1,0,0 ], [0,0, 1,1, 1,0], [0,-1,0,  0,-1,0,  0,-1,0]);
    drawTriangle3DUVNormal([0,0,0,  0,0,1,  1,0,1 ], [0,0, 0,1, 1,1], [0,-1,0,  0,-1,0,  0,-1,0]);
    
    // left
    drawTriangle3DUVNormal([0,0,0,  0,1,1,  0,0,1 ], [0,0, 1,1, 1,0], [-1,0,0,  -1,0,0,  -1,0,0]);
    drawTriangle3DUVNormal([0,0,0,  0,1,0,  0,1,1 ], [0,0, 0,1, 1,1], [-1,0,0,  -1,0,0,  -1,0,0]);
    
    // back
    drawTriangle3DUVNormal([0,0,1,  1,1,1,  1,0,1 ], [0,0, 1,1, 1,0], [0,0,1,  0,0,1,  0,0,1]);
    drawTriangle3DUVNormal([0,0,1,  0,1,1,  1,1,1 ], [0,0, 0,1, 1,1], [0,0,1,  0,0,1,  0,0,1]);
   
  }
  
  renderfast(){

    var rgba = this.color;
    
    // pass texture Number
    gl.uniform1i(u_whichTexture, this.textureNum);
    
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    var allVerts = [];
  var allUVs = [];
  
  // Front face
  allVerts = allVerts.concat([0,0,0,  1,1,0,  1,0,0]);
  allUVs  = allUVs.concat([0,0, 1,1, 1,0]);
  
  allVerts = allVerts.concat([0,0,0,  0,1,0,  1,1,0]);
  allUVs  = allUVs.concat([0,0, 0,1, 1,1]);
  
  // Top face
  allVerts = allVerts.concat([0,1,0,  0,1,1,  1,1,1]);
  allUVs  = allUVs.concat([0,0, 0,1, 1,1]);
  
  allVerts = allVerts.concat([0,1,0,  1,1,1,  1,1,0]);
  allUVs  = allUVs.concat([0,0, 1,1, 1,0]);
  
  // Right face
  allVerts = allVerts.concat([1,0,0,  1,1,1,  1,0,1]);
  allUVs  = allUVs.concat([0,0, 1,1, 1,0]);
  
  allVerts = allVerts.concat([1,0,0,  1,1,0,  1,1,1]);
  allUVs  = allUVs.concat([0,0, 0,1, 1,1]);
  
  // Bottom face
  allVerts = allVerts.concat([0,0,0,  1,0,1,  1,0,0]);
  allUVs  = allUVs.concat([0,0, 1,1, 1,0]);
  
  allVerts = allVerts.concat([0,0,0,  0,0,1,  1,0,1]);
  allUVs  = allUVs.concat([0,0, 0,1, 1,1]);
  
  // Left face
  allVerts = allVerts.concat([0,0,0,  0,1,1,  0,0,1]);
  allUVs  = allUVs.concat([0,0, 1,1, 1,0]);
  
  allVerts = allVerts.concat([0,0,0,  0,1,0,  0,1,1]);
  allUVs  = allUVs.concat([0,0, 0,1, 1,1]);
  
  // Back face
  allVerts = allVerts.concat([0,0,1,  1,1,1,  1,0,1]);
  allUVs  = allUVs.concat([0,0, 1,1, 1,0]);
  
  allVerts = allVerts.concat([0,0,1,  0,1,1,  1,1,1]);
  allUVs  = allUVs.concat([0,0, 0,1, 1,1]);
  
  // Now call drawTriangle3DUV with both arrays
  drawTriangle3DUV(allVerts, allUVs);

  }
}