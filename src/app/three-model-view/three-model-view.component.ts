import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-three-model-view',
  standalone: true,
  imports: [],
  templateUrl: './three-model-view.component.html',
  styleUrl: './three-model-view.component.scss'
})
export class ThreeModelViewComponent implements OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  @Input() pathToModel = 'assets/3d-models/KHAI.glb'
  @Output() loaded = new EventEmitter<boolean>();
  scene = new THREE.Scene();
  camera!: THREE.PerspectiveCamera;
  renderer = new THREE.WebGLRenderer();
  loader = new GLTFLoader();
  controls!: OrbitControls;
  sunLight!: THREE.DirectionalLight
  sun!: THREE.Mesh
  angle = 0
  sunHelper!: THREE.DirectionalLightHelper
  rendering = true;
  isCameraPositionApplied = false;
  constructor(private detector: ChangeDetectorRef) { }

  ngOnDestroy(): void {
    this.dispose()
  }

  public dispose() {
    this.renderer.dispose()
  }

  ngAfterViewInit(): void {
    this.render();
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight);
      });
    });
    
    observer.observe(this.rendererContainer.nativeElement);
  }

  render() {
    this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight);
    this.camera = new THREE.PerspectiveCamera(75, this.rendererContainer.nativeElement.clientWidth / this.rendererContainer.nativeElement.clientHeight, 0.2, 2000);
    this.renderer.shadowMap.enabled = true;
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xffffff);
    const hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    hemiLight.castShadow = true;
    this.scene.add(hemiLight)

    this.sunLight = new THREE.DirectionalLight('#f6e12473', 10); // Color, Intensity
    this.sunLight.position.set(100, 120, 100); // Set position (represents sun direction)
    this.sunLight.castShadow = true; // Enable shadow casting by the sun
    this.sunLight.shadow.mapSize.width = 8096;
    this.sunLight.shadow.mapSize.height = 8096;
    // Enable soft shadows
    this.sunLight.shadow.radius = 10;
    this.sunLight.shadow.camera.top = 270;
    this.sunLight.shadow.camera.bottom = -170;
    this.sunLight.shadow.camera.left = -200;
    this.sunLight.shadow.camera.right = 200;
    this.sunLight.shadow.camera.near = 25;
    this.sunLight.shadow.camera.far = 350;
    this.sunLight.shadow.bias = -0.005;
    this.scene.add(this.sunLight)

    const sunGeometry = new THREE.SphereGeometry(10, 32, 32); // Adjust radius and segments as needed
    // Create a material for the sun (yellowish color)
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Adjust color as needed
    // Create a mesh using the geometry and material
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(100, 120, 100); // Adjust position as needed
    // Add the sun to the scene
    this.scene.add(this.sun);
    this.loader.load(this.pathToModel, (gltf) => {
      if (!this.isCameraPositionApplied) {
        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
        // Get the dimensions (width, height, depth) of the bounding box
        const width = (boundingBox.max.x - boundingBox.min.x)/3;
        const height = (boundingBox.max.y - boundingBox.min.y) + (boundingBox.max.y - boundingBox.min.y) * 0.2;
        const depth = (boundingBox.max.z - boundingBox.min.z)/1.5
        this.camera.position.set(width, height, depth)
        this.isCameraPositionApplied = true;
      }
      this.traverseModel(gltf.scene)
      this.scene.add(gltf.scene);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.animate();
    });

    this.scene.onAfterRender = () => {
      this.rendering = false;
      this.loaded.emit(true)
    };
  }

  traverseModel(node: THREE.Object3D): void {
    const visitedNodes = new Set<THREE.Object3D>();

    const traverse = (child: THREE.Object3D) => {
      if (visitedNodes.has(child)) {
        return;
      }

      visitedNodes.add(child);
      // Ensure the child is a Mesh to access Mesh-specific properties
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      child.children.forEach(traverse)
    };

    traverse(node);
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    const boundingSphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(this.scene).getBoundingSphere(boundingSphere);

    const radius = boundingSphere.radius; // Set the radius of the circular path
    // Calculate new position based on the circular path
    const x = Math.cos(this.angle) * radius;
    const y = Math.sin(this.angle) * radius;

    this.sunLight.position.set(x, y, 0);
    this.sun.position.set(x, y, 0);

    if (y < 0 && y > -180) {
      this.angle = 0;
    } else {
      this.angle += 0.001;
    }
    this.sunLight.lookAt(0, 0, 0)
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

}

