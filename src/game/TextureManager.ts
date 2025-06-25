import * as THREE from 'three';

export class TextureManager {
  private static material: THREE.MeshLambertMaterial | null = null;

  static getBlockMaterial(): THREE.MeshLambertMaterial {
    if (!this.material) {
      // Create a simple colored material for now
      // In a real implementation, you'd load texture atlases
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      
      // Draw different colored squares for different block types
      const colors = [
        '#8BC34A', // grass top
        '#7CB342', // grass side
        '#8D6E63', // dirt
        '#757575', // stone
        '#6D4C41', // wood side
        '#5D4037', // wood top
        '#4CAF50', // leaves
      ];
      
      colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(index * 16, 0, 16, 16);
      });
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      
      this.material = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: false
      });
    }
    
    return this.material;
  }
}