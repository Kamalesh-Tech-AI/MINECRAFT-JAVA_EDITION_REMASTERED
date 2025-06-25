import * as THREE from 'three';
import { BlockType, Block } from '../types/Block';
import { Chunk } from './Chunk';

export class World {
  private chunks: Map<string, Chunk> = new Map();
  private scene: THREE.Scene;
  private chunkSize = 16;
  private worldHeight = 64;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.generateInitialChunks();
  }

  private generateInitialChunks() {
    const chunkRadius = 4;
    for (let x = -chunkRadius; x <= chunkRadius; x++) {
      for (let z = -chunkRadius; z <= chunkRadius; z++) {
        this.generateChunk(x, z);
      }
    }
  }

  private generateChunk(chunkX: number, chunkZ: number) {
    const chunkKey = `${chunkX},${chunkZ}`;
    if (this.chunks.has(chunkKey)) return;

    const chunk = new Chunk(chunkX, chunkZ, this.chunkSize, this.worldHeight);
    chunk.generate();
    chunk.createMesh(this.scene);
    this.chunks.set(chunkKey, chunk);
  }

  getBlock(x: number, y: number, z: number): BlockType {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    const chunkKey = `${chunkX},${chunkZ}`;
    const chunk = this.chunks.get(chunkKey);
    
    if (!chunk) return BlockType.AIR;
    
    const localX = x - chunkX * this.chunkSize;
    const localZ = z - chunkZ * this.chunkSize;
    return chunk.getBlock(localX, y, localZ);
  }

  setBlock(x: number, y: number, z: number, blockType: BlockType) {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    const chunkKey = `${chunkX},${chunkZ}`;
    const chunk = this.chunks.get(chunkKey);
    
    if (!chunk) return;
    
    const localX = x - chunkX * this.chunkSize;
    const localZ = z - chunkZ * this.chunkSize;
    chunk.setBlock(localX, y, localZ, blockType);
    chunk.updateMesh(this.scene);
    
    // Update neighboring chunks if block is on edge
    this.updateNeighboringChunks(chunkX, chunkZ, localX, localZ);
  }

  private updateNeighboringChunks(chunkX: number, chunkZ: number, localX: number, localZ: number) {
    const neighbors = [];
    
    if (localX === 0) neighbors.push([chunkX - 1, chunkZ]);
    if (localX === this.chunkSize - 1) neighbors.push([chunkX + 1, chunkZ]);
    if (localZ === 0) neighbors.push([chunkX, chunkZ - 1]);
    if (localZ === this.chunkSize - 1) neighbors.push([chunkX, chunkZ + 1]);
    
    neighbors.forEach(([nx, nz]) => {
      const neighborChunk = this.chunks.get(`${nx},${nz}`);
      if (neighborChunk) {
        neighborChunk.updateMesh(this.scene);
      }
    });
  }

  raycast(raycaster: THREE.Raycaster): { block: Block; face: THREE.Vector3 } | null {
    const maxDistance = 10;
    const step = 0.1;
    const direction = raycaster.ray.direction.clone();
    const origin = raycaster.ray.origin.clone();

    for (let distance = 0; distance < maxDistance; distance += step) {
      const currentPos = origin.clone().add(direction.clone().multiplyScalar(distance));
      const blockX = Math.floor(currentPos.x);
      const blockY = Math.floor(currentPos.y);
      const blockZ = Math.floor(currentPos.z);

      const blockType = this.getBlock(blockX, blockY, blockZ);
      if (blockType !== BlockType.AIR) {
        const prevPos = origin.clone().add(direction.clone().multiplyScalar(distance - step));
        const prevX = Math.floor(prevPos.x);
        const prevY = Math.floor(prevPos.y);
        const prevZ = Math.floor(prevPos.z);

        return {
          block: { type: blockType, x: blockX, y: blockY, z: blockZ },
          face: new THREE.Vector3(prevX, prevY, prevZ)
        };
      }
    }

    return null;
  }
}