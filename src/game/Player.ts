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
  private controlsEnabled = true;
  
  // Camera rotation
  private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private PI_2 = Math.PI / 2;
  
  // Third person mode
  private isThirdPerson = false;
  private cameraDistance = 5;
  private playerMesh: THREE.Group | null = null;
  
  private readonly moveSpeed = 15; // Increased for bigger world
  private readonly jumpSpeed = 10; // Increased jump height
  private readonly gravity = -25; // Increased gravity

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.set(0, 70, 0); // Higher spawn point
    this.setupControls();
    this.createPlayerMesh();
  }

  private createPlayerMesh() {
    // Create a simple player representation for third person
    this.playerMesh = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.8, 0.3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4A90E2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    this.playerMesh.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB3 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.05;
    this.playerMesh.add(head);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.25, 1.2, 0.25);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB3 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.425, 1.2, 0);
    this.playerMesh.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.425, 1.2, 0);
    this.playerMesh.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 1.2, 0.25);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2E5BBA });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, -0.6, 0);
    this.playerMesh.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, -0.6, 0);
    this.playerMesh.add(rightLeg);
    
    this.playerMesh.visible = false; // Hidden in first person by default
  }

  private setupControls() {
    document.addEventListener('keydown', (event) => {
      if (!this.controlsEnabled) return;
      
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
        case 'KeyF':
          this.togglePerspective();
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (!this.controlsEnabled) return;
      
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

  handleMouseMovement(movementX: number, movementY: number, sensitivity: number) {
    if (!this.controlsEnabled) return;
    
    const adjustedSensitivity = sensitivity * 0.002;
    
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * adjustedSensitivity;
    this.euler.x -= movementY * adjustedSensitivity;
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
    
    this.camera.quaternion.setFromEuler(this.euler);
  }

  togglePerspective() {
    this.isThirdPerson = !this.isThirdPerson;
    if (this.playerMesh) {
      this.playerMesh.visible = this.isThirdPerson;
    }
  }

  setControlsEnabled(enabled: boolean) {
    this.controlsEnabled = enabled;
    if (!enabled) {
      // Stop all movement when controls are disabled
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
    }
  }

  resetVelocity() {
    this.velocity.set(0, 0, 0);
  }

  getPlayerMesh(): THREE.Group | null {
    return this.playerMesh;
  }

  isInThirdPerson(): boolean {
    return this.isThirdPerson;
  }

  update(deltaTime: number, checkCollision: (x: number, y: number, z: number) => boolean) {
    if (!this.controlsEnabled) return;
    
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;
    
    // Get camera direction for movement
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
    
    // Store current position for player mesh
    const currentPosition = this.camera.position.clone();
    
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
    
    // Update player mesh position and third person camera
    if (this.playerMesh) {
      this.playerMesh.position.copy(this.camera.position);
      this.playerMesh.position.y -= 1.8; // Adjust for player height
      this.playerMesh.rotation.y = this.euler.y;
      
      if (this.isThirdPerson) {
        // Position camera behind player
        const offset = new THREE.Vector3(0, 2, this.cameraDistance);
        offset.applyQuaternion(this.camera.quaternion);
        this.camera.position.copy(this.playerMesh.position);
        this.camera.position.add(offset);
        this.camera.position.y += 1.8; // Adjust for eye level
      }
    }
  }
}
