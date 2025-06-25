import * as THREE from 'three';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private canJump = false;
  private isGrounded = false;
  
  private readonly moveSpeed = 10;
  private readonly jumpSpeed = 8;
  private readonly gravity = -20;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.set(0, 35, 0);
    this.setupControls();
  }

  private setupControls() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'Space':
          if (this.canJump) {
            this.velocity.y = this.jumpSpeed;
            this.canJump = false;
          }
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    });
  }

  update(deltaTime: number, checkCollision: (x: number, y: number, z: number) => boolean) {
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;
    
    // Get camera direction
    this.camera.getWorldDirection(this.direction);
    this.direction.y = 0;
    this.direction.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(this.direction, this.camera.up);
    
    // Movement
    const moveVector = new THREE.Vector3();
    
    if (this.moveForward) moveVector.add(this.direction);
    if (this.moveBackward) moveVector.sub(this.direction);
    if (this.moveRight) moveVector.add(right);
    if (this.moveLeft) moveVector.sub(right);
    
    moveVector.normalize();
    moveVector.multiplyScalar(this.moveSpeed * deltaTime);
    
    // Apply horizontal movement
    const newPosition = this.camera.position.clone();
    newPosition.x += moveVector.x;
    newPosition.z += moveVector.z;
    
    // Simple collision detection
    if (!checkCollision(newPosition.x, newPosition.y, newPosition.z)) {
      this.camera.position.x = newPosition.x;
      this.camera.position.z = newPosition.z;
    }
    
    // Apply vertical movement
    const verticalMovement = this.velocity.y * deltaTime;
    const testY = this.camera.position.y + verticalMovement;
    
    if (!checkCollision(this.camera.position.x, testY - 1.8, this.camera.position.z)) {
      this.camera.position.y = testY;
      this.isGrounded = false;
    } else {
      if (this.velocity.y < 0) {
        this.isGrounded = true;
        this.canJump = true;
      }
      this.velocity.y = 0;
    }
  }
}