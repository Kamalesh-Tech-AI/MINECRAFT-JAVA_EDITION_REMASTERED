import * as THREE from 'three';

export enum NPCType {
  VILLAGER = 'villager',
  ZOMBIE = 'zombie',
  SKELETON = 'skeleton',
  CREEPER = 'creeper',
  COW = 'cow',
  PIG = 'pig'
}

export interface NPC {
  id: string;
  type: NPCType;
  position: THREE.Vector3;
  rotation: number;
  health: number;
  maxHealth: number;
  isHostile: boolean;
  mesh?: THREE.Group;
  velocity: THREE.Vector3;
  target?: THREE.Vector3;
  lastUpdate: number;
}

export interface NPCBehavior {
  wander: boolean;
  attackPlayer: boolean;
  fleeFromPlayer: boolean;
  followPlayer: boolean;
  speed: number;
  attackDamage: number;
  detectionRange: number;
}