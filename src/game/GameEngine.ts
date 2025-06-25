import * as THREE from 'three';
import { World } from './World';
import { Player } from './Player';
import { BlockType, InventorySlot } from '../types/Block';
import { Inventory } from './Inventory';
import { ItemManager } from './ItemManager';
import { NPCManager } from './NPCManager';
import { NPCType } from '../types/NPC';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private world: World;
  private player: Player;
  private inventory: Inventory;
  private npcManager: NPCManager;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private selectedBlockType: BlockType = BlockType.GRASS;
  private selectedHotbarSlot: number = 0;
  private highlightMesh: THREE.Mesh;
  private clock: THREE.Clock;
  private isPointerLocked = false;
  private sensitivity = 1.0;
  private health = 20;
  private maxHealth = 20;
  private hunger = 20;
  private maxHunger = 20;

  // UI callbacks
  private onInventoryUpdate?: (hotbar: InventorySlot[]) => void;
  private onHealthUpdate?: (health: number, maxHealth: number) => void;
  private onHungerUpdate?: (hunger: number, maxHunger: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    
    // Initialize item system
    ItemManager.initialize();
    this.inventory = new Inventory();
    this.initializeStartingItems();
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    this.setupLighting();
    
    // World, player, and NPCs
    this.world = new World(this.scene);
    this.player = new Player(this.camera);
    this.npcManager = new NPCManager(this.scene);
    
    // Spawn some NPCs
    this.spawnInitialNPCs();
    
    // Block highlight
    this.highlightMesh = this.createHighlightMesh();
    this.scene.add(this.highlightMesh);
    
    this.setupEventListeners();
    this.animate();
  }

  private initializeStartingItems() {
    // Add some starting items to inventory
    const grassItem = ItemManager.getItem('grass');
    const dirtItem = ItemManager.getItem('dirt');
    const stoneItem = ItemManager.getItem('stone');
    const woodItem = ItemManager.getItem('wood');
    const leavesItem = ItemManager.getItem('leaves');
    const pickaxe = ItemManager.getItem('wooden_pickaxe');
    const sword = ItemManager.getItem('iron_sword');
    const bread = ItemManager.getItem('bread');

    if (grassItem) this.inventory.addItem(grassItem, 64);
    if (dirtItem) this.inventory.addItem(dirtItem, 64);
    if (stoneItem) this.inventory.addItem(stoneItem, 64);
    if (woodItem) this.inventory.addItem(woodItem, 64);
    if (leavesItem) this.inventory.addItem(leavesItem, 64);
    if (pickaxe) this.inventory.addItem(pickaxe, 1);
    if (sword) this.inventory.addItem(sword, 1);
    if (bread) this.inventory.addItem(bread, 10);
  }

  private spawnInitialNPCs() {
    // Spawn some NPCs around the player
    const playerPos = this.camera.position;
    this.npcManager.spawnRandomNPCs(playerPos, 50, 8);
    
    // Spawn a few specific NPCs
    this.npcManager.spawnNPC(NPCType.VILLAGER, new THREE.Vector3(10, 35, 10));
    this.npcManager.spawnNPC(NPCType.ZOMBIE, new THREE.Vector3(-15, 35, -15));
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);
  }

  private createHighlightMesh(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    return mesh;
  }

  private setupEventListeners() {
    // Mouse controls
    document.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (event) => {
      if (!this.isPointerLocked) return;
      
      const adjustedSensitivity = this.sensitivity * 0.002;
      this.camera.rotation.y -= event.movementX * adjustedSensitivity;
      this.camera.rotation.x -= event.movementY * adjustedSensitivity;
      this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    });

    // Block placement/destruction
    document.addEventListener('mousedown', (event) => {
      if (!this.isPointerLocked) return;
      
      const hit = this.world.raycast(this.raycaster);
      if (hit) {
        if (event.button === 0) { // Left click - destroy
          this.world.setBlock(hit.block.x, hit.block.y, hit.block.z, BlockType.AIR);
          // Add block to inventory
          const blockItem = ItemManager.getBlockItem(hit.block.type);
          if (blockItem) {
            this.inventory.addItem(blockItem, 1);
            this.updateInventoryUI();
          }
        } else if (event.button === 2) { // Right click - place
          const selectedSlot = this.inventory.getSlot(this.selectedHotbarSlot);
          if (selectedSlot?.item?.blockType) {
            this.world.setBlock(hit.face.x, hit.face.y, hit.face.z, selectedSlot.item.blockType);
            this.inventory.removeItem(this.selectedHotbarSlot, 1);
            this.updateInventoryUI();
          }
        }
      }
    });

    // Hotbar selection
    document.addEventListener('keydown', (event) => {
      const keyIndex = parseInt(event.key) - 1;
      if (keyIndex >= 0 && keyIndex < 9) {
        this.selectedHotbarSlot = keyIndex;
        this.updateSelectedBlock();
      }
    });

    // Prevent context menu
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private updateSelectedBlock() {
    const selectedSlot = this.inventory.getSlot(this.selectedHotbarSlot);
    if (selectedSlot?.item?.blockType) {
      this.selectedBlockType = selectedSlot.item.blockType;
    }
  }

  private updateInventoryUI() {
    if (this.onInventoryUpdate) {
      this.onInventoryUpdate(this.inventory.getHotbarSlots());
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // Update player
    this.player.update(deltaTime, (x, y, z) => {
      const blockX = Math.floor(x);
      const blockY = Math.floor(y);
      const blockZ = Math.floor(z);
      return this.world.getBlock(blockX, blockY, blockZ) !== BlockType.AIR;
    });
    
    // Update NPCs
    this.npcManager.update(deltaTime, this.camera.position);
    
    // Update raycaster
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // Update block highlight
    const hit = this.world.raycast(this.raycaster);
    if (hit) {
      this.highlightMesh.position.set(hit.block.x, hit.block.y, hit.block.z);
      this.highlightMesh.visible = true;
    } else {
      this.highlightMesh.visible = false;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  // Public methods for UI interaction
  setSelectedBlock(blockType: BlockType) {
    this.selectedBlockType = blockType;
  }

  getSelectedBlock(): BlockType {
    return this.selectedBlockType;
  }

  setSensitivity(sensitivity: number) {
    this.sensitivity = sensitivity;
  }

  getSensitivity(): number {
    return this.sensitivity;
  }

  getInventory(): Inventory {
    return this.inventory;
  }

  getSelectedHotbarSlot(): number {
    return this.selectedHotbarSlot;
  }

  setSelectedHotbarSlot(slot: number) {
    if (slot >= 0 && slot < 9) {
      this.selectedHotbarSlot = slot;
      this.updateSelectedBlock();
    }
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getHunger(): number {
    return this.hunger;
  }

  getMaxHunger(): number {
    return this.maxHunger;
  }

  // UI callback setters
  setInventoryUpdateCallback(callback: (hotbar: InventorySlot[]) => void) {
    this.onInventoryUpdate = callback;
    this.updateInventoryUI(); // Initial update
  }

  setHealthUpdateCallback(callback: (health: number, maxHealth: number) => void) {
    this.onHealthUpdate = callback;
  }

  setHungerUpdateCallback(callback: (hunger: number, maxHunger: number) => void) {
    this.onHungerUpdate = callback;
  }
}