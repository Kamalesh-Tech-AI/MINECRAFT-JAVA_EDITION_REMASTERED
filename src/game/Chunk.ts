import * as THREE from 'three';
import { BlockType } from '../types/Block';
import { TextureManager } from './TextureManager';

export class Chunk {
  private blocks: BlockType[][][];
  private mesh: THREE.Mesh | null = null;
  private chunkX: number;
  private chunkZ: number;
  private size: number;
  private height: number;

  constructor(chunkX: number, chunkZ: number, size: number, height: number) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.size = size;
    this.height = height;
    this.blocks = this.initializeBlocks();
  }

  private initializeBlocks(): BlockType[][][] {
    const blocks: BlockType[][][] = [];
    for (let x = 0; x < this.size; x++) {
      blocks[x] = [];
      for (let y = 0; y < this.height; y++) {
        blocks[x][y] = [];
        for (let z = 0; z < this.size; z++) {
          blocks[x][y][z] = BlockType.AIR;
        }
      }
    }
    return blocks;
  }

  generate() {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const worldX = this.chunkX * this.size + x;
        const worldZ = this.chunkZ * this.size + z;
        
        // Simple height map based on noise
        const height = Math.floor(20 + 10 * Math.sin(worldX * 0.05) * Math.cos(worldZ * 0.05));
        
        for (let y = 0; y < this.height; y++) {
          if (y < height - 5) {
            this.blocks[x][y][z] = BlockType.STONE;
          } else if (y < height - 1) {
            this.blocks[x][y][z] = BlockType.DIRT;
          } else if (y === height - 1) {
            this.blocks[x][y][z] = BlockType.GRASS;
          }
        }

        // Add some trees
        if (Math.random() < 0.05 && height < 35) {
          this.generateTree(x, height, z);
        }
      }
    }
  }

  private generateTree(x: number, baseY: number, z: number) {
    const treeHeight = 4 + Math.floor(Math.random() * 3);
    
    // Trunk
    for (let y = 0; y < treeHeight; y++) {
      if (baseY + y < this.height) {
        this.blocks[x][baseY + y][z] = BlockType.WOOD;
      }
    }
    
    // Leaves
    const leafY = baseY + treeHeight - 1;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = 0; dy <= 2; dy++) {
        for (let dz = -2; dz <= 2; dz++) {
          const leafX = x + dx;
          const leafZ = z + dz;
          const leafYPos = leafY + dy;
          
          if (leafX >= 0 && leafX < this.size && 
              leafZ >= 0 && leafZ < this.size && 
              leafYPos < this.height &&
              Math.random() < 0.7) {
            this.blocks[leafX][leafYPos][leafZ] = BlockType.LEAVES;
          }
        }
      }
    }
  }

  createMesh(scene: THREE.Scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }

    const geometry = this.generateGeometry();
    const material = TextureManager.getBlockMaterial();
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(
      this.chunkX * this.size,
      0,
      this.chunkZ * this.size
    );
    
    scene.add(this.mesh);
  }

  private generateGeometry(): THREE.BufferGeometry {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    let vertexIndex = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.size; z++) {
          const blockType = this.blocks[x][y][z];
          if (blockType === BlockType.AIR) continue;

          // Check each face
          const faces = [
            { dir: [0, 0, 1], corners: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]] }, // front
            { dir: [0, 0, -1], corners: [[1,0,0], [0,0,0], [0,1,0], [1,1,0]] }, // back
            { dir: [0, 1, 0], corners: [[0,1,0], [0,1,1], [1,1,1], [1,1,0]] }, // top
            { dir: [0, -1, 0], corners: [[0,0,1], [0,0,0], [1,0,0], [1,0,1]] }, // bottom
            { dir: [1, 0, 0], corners: [[1,0,1], [1,0,0], [1,1,0], [1,1,1]] }, // right
            { dir: [-1, 0, 0], corners: [[0,0,0], [0,0,1], [0,1,1], [0,1,0]] }  // left
          ];

          faces.forEach((face, faceIndex) => {
            const [dx, dy, dz] = face.dir;
            const neighborX = x + dx;
            const neighborY = y + dy;
            const neighborZ = z + dz;

            let shouldRenderFace = false;
            if (neighborX < 0 || neighborX >= this.size ||
                neighborY < 0 || neighborY >= this.height ||
                neighborZ < 0 || neighborZ >= this.size) {
              shouldRenderFace = true;
            } else if (this.blocks[neighborX][neighborY][neighborZ] === BlockType.AIR) {
              shouldRenderFace = true;
            }

            if (shouldRenderFace) {
              const startVertex = vertexIndex;
              
              face.corners.forEach(([cx, cy, cz]) => {
                vertices.push(x + cx, y + cy, z + cz);
                normals.push(dx, dy, dz);
              });

              // UV coordinates based on block type and face
              const uvCoords = this.getUVCoordinates(blockType, faceIndex);
              uvs.push(...uvCoords);

              // Indices for two triangles
              indices.push(
                startVertex, startVertex + 1, startVertex + 2,
                startVertex, startVertex + 2, startVertex + 3
              );
              
              vertexIndex += 4;
            }
          });
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    return geometry;
  }

  private getUVCoordinates(blockType: BlockType, faceIndex: number): number[] {
    // Simple UV mapping - each block type gets different texture coordinates
    const textureSize = 16; // 16x16 texture atlas
    const tileSize = 1 / textureSize;
    
    let u = 0, v = 0;
    
    switch (blockType) {
      case BlockType.GRASS:
        if (faceIndex === 2) { // top face
          u = 0; v = 0;
        } else if (faceIndex === 3) { // bottom face
          u = 2; v = 0;
        } else { // sides
          u = 1; v = 0;
        }
        break;
      case BlockType.DIRT:
        u = 2; v = 0;
        break;
      case BlockType.STONE:
        u = 3; v = 0;
        break;
      case BlockType.WOOD:
        if (faceIndex === 2 || faceIndex === 3) { // top/bottom
          u = 5; v = 0;
        } else { // sides
          u = 4; v = 0;
        }
        break;
      case BlockType.LEAVES:
        u = 6; v = 0;
        break;
    }
    
    const uMin = u * tileSize;
    const vMin = v * tileSize;
    const uMax = (u + 1) * tileSize;
    const vMax = (v + 1) * tileSize;
    
    return [
      uMin, vMax,
      uMax, vMax,
      uMax, vMin,
      uMin, vMin
    ];
  }

  getBlock(x: number, y: number, z: number): BlockType {
    if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
      return BlockType.AIR;
    }
    return this.blocks[x][y][z];
  }

  setBlock(x: number, y: number, z: number, blockType: BlockType) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
      return;
    }
    this.blocks[x][y][z] = blockType;
  }

  updateMesh(scene: THREE.Scene) {
    this.createMesh(scene);
  }
}