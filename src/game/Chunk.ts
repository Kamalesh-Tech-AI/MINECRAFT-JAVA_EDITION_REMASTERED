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
        
        // Enhanced terrain generation with multiple octaves
        const baseHeight = this.getTerrainHeight(worldX, worldZ);
        const mountainHeight = this.getMountainHeight(worldX, worldZ);
        const finalHeight = Math.floor(baseHeight + mountainHeight);
        
        // Generate different biomes
        const biome = this.getBiome(worldX, worldZ);
        
        for (let y = 0; y < this.height; y++) {
          if (y < finalHeight - 8) {
            this.blocks[x][y][z] = BlockType.STONE;
          } else if (y < finalHeight - 1) {
            this.blocks[x][y][z] = biome === 'desert' ? BlockType.SAND : BlockType.DIRT;
          } else if (y === finalHeight - 1) {
            if (biome === 'desert') {
              this.blocks[x][y][z] = BlockType.SAND;
            } else {
              this.blocks[x][y][z] = BlockType.GRASS;
            }
          }
          
          // Add ores
          if (y < finalHeight - 5 && Math.random() < 0.01) {
            if (y < 20 && Math.random() < 0.3) {
              this.blocks[x][y][z] = BlockType.DIAMOND_ORE;
            } else if (y < 40 && Math.random() < 0.5) {
              this.blocks[x][y][z] = BlockType.IRON_ORE;
            } else if (y < 60) {
              this.blocks[x][y][z] = BlockType.COAL_ORE;
            }
          }
        }

        // Generate structures
        if (biome !== 'desert' && Math.random() < 0.02 && finalHeight < 80) {
          this.generateTree(x, finalHeight, z);
        }
        
        // Generate villages occasionally
        if (Math.random() < 0.001 && finalHeight > 30 && finalHeight < 70) {
          this.generateVillageStructure(x, finalHeight, z);
        }
      }
    }
  }

  private getTerrainHeight(x: number, z: number): number {
    // Multiple octaves of noise for more realistic terrain
    const scale1 = 0.01;
    const scale2 = 0.05;
    const scale3 = 0.1;
    
    const noise1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 20;
    const noise2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 10;
    const noise3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 5;
    
    return 40 + noise1 + noise2 + noise3;
  }

  private getMountainHeight(x: number, z: number): number {
    const mountainScale = 0.003;
    const mountainNoise = Math.sin(x * mountainScale) * Math.cos(z * mountainScale);
    return mountainNoise > 0.3 ? mountainNoise * 40 : 0;
  }

  private getBiome(x: number, z: number): string {
    const biomeNoise = Math.sin(x * 0.001) * Math.cos(z * 0.001);
    if (biomeNoise > 0.3) return 'desert';
    if (biomeNoise < -0.3) return 'forest';
    return 'plains';
  }

  private generateTree(x: number, baseY: number, z: number) {
    const treeHeight = 5 + Math.floor(Math.random() * 4);
    
    // Trunk
    for (let y = 0; y < treeHeight; y++) {
      if (baseY + y < this.height) {
        this.blocks[x][baseY + y][z] = BlockType.WOOD;
      }
    }
    
    // Leaves - larger canopy
    const leafY = baseY + treeHeight - 1;
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = 0; dy <= 3; dy++) {
        for (let dz = -3; dz <= 3; dz++) {
          const leafX = x + dx;
          const leafZ = z + dz;
          const leafYPos = leafY + dy;
          
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (leafX >= 0 && leafX < this.size && 
              leafZ >= 0 && leafZ < this.size && 
              leafYPos < this.height &&
              distance < 3.5 && Math.random() < 0.8) {
            this.blocks[leafX][leafYPos][leafZ] = BlockType.LEAVES;
          }
        }
      }
    }
  }

  private generateVillageStructure(x: number, baseY: number, z: number) {
    // Simple house structure
    const houseSize = 5;
    for (let dx = 0; dx < houseSize; dx++) {
      for (let dz = 0; dz < houseSize; dz++) {
        for (let dy = 0; dy < 4; dy++) {
          const houseX = x + dx;
          const houseZ = z + dz;
          const houseY = baseY + dy;
          
          if (houseX >= 0 && houseX < this.size && 
              houseZ >= 0 && houseZ < this.size && 
              houseY < this.height) {
            
            // Walls
            if (dx === 0 || dx === houseSize - 1 || dz === 0 || dz === houseSize - 1) {
              if (dy < 3) {
                this.blocks[houseX][houseY][houseZ] = BlockType.WOOD;
              }
            }
            
            // Roof
            if (dy === 3) {
              this.blocks[houseX][houseY][houseZ] = BlockType.WOOD;
            }
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
    // Enhanced texture mapping with more block types
    const textureSize = 16;
    const tileSize = 1 / textureSize;
    
    let u = 0, v = 0;
    
    switch (blockType) {
      case BlockType.GRASS:
        if (faceIndex === 2) { u = 0; v = 0; } // top
        else if (faceIndex === 3) { u = 2; v = 0; } // bottom
        else { u = 1; v = 0; } // sides
        break;
      case BlockType.DIRT:
        u = 2; v = 0;
        break;
      case BlockType.STONE:
        u = 3; v = 0;
        break;
      case BlockType.WOOD:
        if (faceIndex === 2 || faceIndex === 3) { u = 5; v = 0; }
        else { u = 4; v = 0; }
        break;
      case BlockType.LEAVES:
        u = 6; v = 0;
        break;
      case BlockType.SAND:
        u = 7; v = 0;
        break;
      case BlockType.COAL_ORE:
        u = 8; v = 0;
        break;
      case BlockType.IRON_ORE:
        u = 9; v = 0;
        break;
      case BlockType.GOLD_ORE:
        u = 10; v = 0;
        break;
      case BlockType.DIAMOND_ORE:
        u = 11; v = 0;
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

  // Get block data for saving
  getBlockData(): BlockType[][][] {
    return this.blocks;
  }

  // Load block data from save
  loadBlockData(data: BlockType[][][]) {
    this.blocks = data;
  }

  // Clean up resources
  dispose(scene: THREE.Scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh = null;
    }
  }
}
