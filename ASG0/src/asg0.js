// asg0.js
var canvas;
var ctx;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2D graphics
    ctx = canvas.getContext('2d');

    // make the canvas
    ctx.fillStyle = "black"; // black for the color
    ctx.fillRect(10, 10, 400, 400); // fill canvas with the color
}

function areaTriangle(v1, v2) {
    let cross = Vector3.cross(v1, v2);
    let area = 0.5 * cross.magnitude();
    console.log("Area of the triangle: ", area);
}

function angleBetween(v1, v2) {
    let dot = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    let cosTheta = dot / (mag1 * mag2);
    let angleDegrees = Math.acos(cosTheta) * (180 / Math.PI); // Chat GPT helped me
    console.log("Angle: ", angleDegrees);
}

function handleDrawEvent() {
    // clear the canvas (redraws black background)
    ctx.fillStyle = "black";
    ctx.fillRect(10, 10, 400, 400);

    // read input for x1 and y1
    var x1 = parseFloat(document.getElementById("x1").value);
    var y1 = parseFloat(document.getElementById("y1").value);
    
    // read input for x1 and y1
    var x2 = parseFloat(document.getElementById("x2").value);
    var y2 = parseFloat(document.getElementById("y2").value);
    
    // Create vector v1 & 2
    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    // Draw the vector in red
    drawVector(v1, "red");
    
    drawVector(v2, "blue")
}

function handleDrawOperationEvent() {
    // clear the canvas (redraws black background)
    ctx.fillStyle = "black";
    ctx.fillRect(10, 10, 400, 400);

    // read input for x and y
    var x1 = parseFloat(document.getElementById("x1").value);
    var y1 = parseFloat(document.getElementById("y1").value);
    
    // read input for x and y
    var x2 = parseFloat(document.getElementById("x2").value);
    var y2 = parseFloat(document.getElementById("y2").value);
    
    

    // create vector v1 & 2
    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    // draw the v1 in red
    drawVector(v1, "red");
    // draw the v2 in blue
    drawVector(v2, "blue")
   
    // read input for operation select and scalar
    var operation = document.getElementById("operation").value;
    var scalar = parseFloat(document.getElementById("scalar").value);
    
    if (operation === "mag") {
        console.log("Magnitude v1:", v1.magnitude());
        console.log("Magnitude v2:", v2.magnitude());
    } else if (operation === "nor") {
        v1.normalize();
        v2.normalize();
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (operation === "ang") {
        angleBetween(v1, v2);
    } else if (operation === "area") {
        areaTriangle(v1, v2);
    } else {
        // create new vector using v1 info
        var v3 = new Vector3([x1, y1, 0]);
        // create new vector using v2 info
        var v4 = new Vector3([x2, y2, 0]);
        if (operation === "add") {
          v3.add(v4); //add v1 and v2
        } else if (operation === "sub") {
          v3.sub(v4); // subtract v1 and v2 (v1 - v2)
        } else if (operation === "div") {
            v3.div(scalar); // divide v1 by scalar
            v4.div(scalar); // divide v2 by scalar
            drawVector(v4, "green");  // draw scaled v2
       } else if (operation === "mul") {
            v3.mul(scalar); // multiply v1 by scalar
            v4.mul(scalar); // mulitply v2 by scalar
            drawVector(v4, "green");  // draw scaled v2
       }
    }
    drawVector(v3, "green");  // draw modified vector
}

function drawVector(v, color) {
    ctx.strokeStyle = color; // color for stroke line
    
    // get center of canvas
    var centerX = ctx.canvas.width / 2;
    var centerY = ctx.canvas.height / 2;

    // scale vector for visualization using the array
    var scaledX = v.elements[0] * 20;
    var scaledY = v.elements[1] * 20;

    // draw vector from center to endpoint
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + scaledX, centerY - scaledY); // Inverting Y-axis for correct positioning
    ctx.stroke(); // renders line
}