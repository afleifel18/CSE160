// Cube.js 
//afleifel@ucsc.edu
class Cube{
  constructor(){
    this.type = 'cube';

    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }
  
  render(){

    var rgba = this.color;
    
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    //front
    drawTriangle3D([0,0,0,  1,1,0,  1,0,0 ]);
    drawTriangle3D([0,0,0,  0,1,0,  1,1,0 ]);
    
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9,rgba[2]*.9,rgba[3]);
    
    //top
    drawTriangle3D([0,1,0,  0,1,1,  1,1,1 ]);
    drawTriangle3D([0,1,0,  1,1,1,  1,1,0 ]);
    
    //right
    drawTriangle3D([1,0,0,  1,1,1,  1,0,1 ]);
    drawTriangle3D([1,0,0,  1,1,0,  1,1,1 ]);
    
    //bottom
    drawTriangle3D([0,0,0,  1,0,1,  1,0,0 ]);
    drawTriangle3D([0,0,0,  0,0,1,  1,0,1 ]);
    
    // left
    drawTriangle3D([0,0,0,  0,1,1,  0,0,1 ]);
    drawTriangle3D([0,0,0,  0,1,0,  0,1,1 ]);
    
    // back
    drawTriangle3D([0,0,1,  1,1,1,  1,0,1 ]);
    drawTriangle3D([0,0,1,  0,1,1,  1,1,1 ]);
   
  }
}