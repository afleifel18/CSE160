class Camera {
  constructor() {
    this.eye = new Vector3([0, 0, 3]);   // Camera position
    this.at = new Vector3([0, 0, -100]); // Look-at point
    this.up = new Vector3([0, 1, 0]);    // Up vector

    // Optional parameters for speed and pan angle
    this.moveSpeed = 0.2;
    this.panAngle = 2; // in degrees
  }

  forward() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.moveSpeed);
    this.eye.add(f);
    this.at.add(f);
  }

  back() {
    let f = new Vector3(this.eye.elements);
    f.sub(this.at);
    f.normalize();
    f.mul(this.moveSpeed);
    this.eye.add(f);
    this.at.add(f);
  }

  right() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    let s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.moveSpeed);
    this.eye.add(s);
    this.at.add(s);
  }

  left() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    let s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.moveSpeed);
    this.eye.add(s);
    this.at.add(s);
  }

  panLeft() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    let rotationMatrix = new Matrix4().setRotate(this.panAngle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let newF = rotationMatrix.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(newF);
  }

  panRight() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    let rotationMatrix = new Matrix4().setRotate(-this.panAngle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let newF = rotationMatrix.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(newF);
  }
  
  pan(angle) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye).normalize();
    let rotationMatrix = new Matrix4().setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let newF = rotationMatrix.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(newF);
  }
}



