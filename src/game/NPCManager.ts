import * as THREE from 'three';
import { NPC, NPCType, NPCBehavior } from '../types/NPC';

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private scene: THREE.Scene;
  private behaviors: Map<NPCType, NPCBehavior> = new Map();
  private playerPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeBehaviors();
  }

  private initializeBehaviors() {
    this.behaviors.set(NPCType.VILLAGER, {
      wander: true,
      attackPlayer: false,
      fleeFromPlayer: false,
      followPlayer: false,
      speed: 2,
      attackDamage: 0,
      detectionRange: 10
    });

    this.behaviors.set(NPCType.ZOMBIE, {
      wander: true,
      attackPlayer: true,
      fleeFromPlayer: false,
      followPlayer: false,
      speed: 3,
      attackDamage: 4,
      detectionRange: 16
    });

    this.behaviors.set(NPCType.COW, {
      wander: true,
      attackPlayer: false,
      fleeFromPlayer: true,
      followPlayer: false,
      speed: 4,
      attackDamage: 0,
      detectionRange: 8
    });

    this.behaviors.set(NPCType.PIG, {
      wander: true,
      attackPlayer: false,
      fleeFromPlayer: true,
      followPlayer: false,
      speed: 3,
      attackDamage: 0,
      detectionRange: 6
    });
  }

  spawnNPC(type: NPCType, position: THREE.Vector3): string {
    const id = `${type}_${Date.now()}_${Math.random()}`;
    const npc: NPC = {
      id,
      type,
      position: position.clone(),
      rotation: Math.random() * Math.PI * 2,
      health: this.getMaxHealth(type),
      maxHealth: this.getMaxHealth(type),
      isHostile: this.isHostileType(type),
      velocity: new THREE.Vector3(),
      lastUpdate: Date.now()
    };

    npc.mesh = this.createNPCMesh(type);
    npc.mesh.position.copy(position);
    this.scene.add(npc.mesh);

    this.npcs.set(id, npc);
    return id;
  }

  private createNPCMesh(type: NPCType): THREE.Group {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    let bodyMaterial: THREE.MeshLambertMaterial;
    
    switch (type) {
      case NPCType.VILLAGER:
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        break;
      case NPCType.ZOMBIE:
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        break;
      case NPCType.COW:
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        break;
      case NPCType.PIG:
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFC0CB });
        break;
      default:
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    }
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 1.45;
    group.add(head);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.5, 0.6, 0);
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.5, 0.6, 0);
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.2, -0.4, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.2, -0.4, 0);
    group.add(rightLeg);
    
    return group;
  }

  private getMaxHealth(type: NPCType): number {
    switch (type) {
      case NPCType.VILLAGER: return 20;
      case NPCType.ZOMBIE: return 20;
      case NPCType.COW: return 10;
      case NPCType.PIG: return 10;
      default: return 10;
    }
  }

  private isHostileType(type: NPCType): boolean {
    return type === NPCType.ZOMBIE || type === NPCType.SKELETON || type === NPCType.CREEPER;
  }

  update(deltaTime: number, playerPosition: THREE.Vector3) {
    this.playerPosition.copy(playerPosition);
    
    this.npcs.forEach(npc => {
      this.updateNPC(npc, deltaTime);
    });
  }

  private updateNPC(npc: NPC, deltaTime: number) {
    const behavior = this.behaviors.get(npc.type);
    if (!behavior) return;

    const distanceToPlayer = npc.position.distanceTo(this.playerPosition);
    
    // AI Behavior
    if (behavior.attackPlayer && distanceToPlayer < behavior.detectionRange) {
      // Move towards player
      const direction = new THREE.Vector3()
        .subVectors(this.playerPosition, npc.position)
        .normalize();
      npc.velocity.copy(direction.multiplyScalar(behavior.speed));
    } else if (behavior.fleeFromPlayer && distanceToPlayer < behavior.detectionRange) {
      // Move away from player
      const direction = new THREE.Vector3()
        .subVectors(npc.position, this.playerPosition)
        .normalize();
      npc.velocity.copy(direction.multiplyScalar(behavior.speed));
    } else if (behavior.wander) {
      // Random wandering
      if (Math.random() < 0.01) { // Change direction occasionally
        npc.velocity.set(
          (Math.random() - 0.5) * behavior.speed,
          0,
          (Math.random() - 0.5) * behavior.speed
        );
      }
    }

    // Apply movement
    npc.position.add(npc.velocity.clone().multiplyScalar(deltaTime));
    
    // Update mesh position
    if (npc.mesh) {
      npc.mesh.position.copy(npc.position);
      
      // Face movement direction
      if (npc.velocity.length() > 0.1) {
        npc.rotation = Math.atan2(npc.velocity.x, npc.velocity.z);
        npc.mesh.rotation.y = npc.rotation;
      }
    }

    // Decay velocity
    npc.velocity.multiplyScalar(0.9);
  }

  removeNPC(id: string) {
    const npc = this.npcs.get(id);
    if (npc && npc.mesh) {
      this.scene.remove(npc.mesh);
    }
    this.npcs.delete(id);
  }

  getNPC(id: string): NPC | null {
    return this.npcs.get(id) || null;
  }

  getAllNPCs(): NPC[] {
    return Array.from(this.npcs.values());
  }

  spawnRandomNPCs(centerPosition: THREE.Vector3, radius: number, count: number) {
    const npcTypes = [NPCType.VILLAGER, NPCType.COW, NPCType.PIG];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const position = new THREE.Vector3(
        centerPosition.x + Math.cos(angle) * distance,
        centerPosition.y + 2,
        centerPosition.z + Math.sin(angle) * distance
      );
      
      const randomType = npcTypes[Math.floor(Math.random() * npcTypes.length)];
      this.spawnNPC(randomType, position);
    }
  }
}