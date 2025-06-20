import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.autoRotate = false;

// Create a wrapper that will hold both the iframe and the glow
const iframeWrapper = document.createElement('div');
iframeWrapper.style.position = 'absolute';
iframeWrapper.style.top = '0';
iframeWrapper.style.left = '0';
iframeWrapper.style.zIndex = '998';
iframeWrapper.style.pointerEvents = 'none';
iframeWrapper.style.transformOrigin = '50% 50%';
document.body.appendChild(iframeWrapper);

// Get existing iframe or create if it doesn't exist
let iframe = document.getElementById('iframe');
if (!iframe) {
  iframe = document.createElement('iframe');
  iframe.id = 'iframe';
  iframe.src = './ui/portfolio.html';
  iframe.style.position = 'absolute';
  iframe.style.transformOrigin = '50% 50%';
  iframe.style.perspective = '800px'; 
  iframe.style.width = '95px';
  iframe.style.height = '90px';
  iframe.style.border = 'none';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.backgroundColor = '#000000';
  iframe.style.display = 'block';
  iframe.style.overflow = 'hidden';
  iframe.style.zIndex = '999';
  iframe.style.pointerEvents = 'none';
  iframe.style.transform = 'translate(-50%, -50%)';
  iframe.style.willChange = 'transform';
  iframe.style.colorScheme = 'normal';  
  iframe.style.aspectRatio = '16 / 10';
  iframe.style.opacity = '0';
  iframe.style.display = 'none';

  iframeWrapper.appendChild(iframe);
}

// Make iframe visible on mobile after page loads
const glow = document.createElement('div');
glow.id = 'iframe-glow';
glow.style.position = 'absolute';
glow.style.width = '240px';
glow.style.height = '160px';
glow.style.background = 'radial-gradient(circle, #ff00ff55 10%, transparent 70%)';
glow.style.borderRadius = '12px';
glow.style.zIndex = '998';
glow.style.pointerEvents = 'none';
glow.style.filter = 'blur(30px)';
glow.style.transformOrigin = '50% 50%';
glow.style.willChange = 'transform';
iframeWrapper.appendChild(glow);
console.log('Glow created:', glow);

// Variables to store references
let screenMesh = null;
let model = null;
let screenObject3D = null;
const tempVector = new THREE.Vector3();

// Mobile detection
const isMobile = window.innerWidth <= 768 || window.innerHeight <= 768 || window.innerWidth <= 1024;

// Load GLB model
const loader = new GLTFLoader();
loader.load('/3dconsole.glb', (gltf) => {
  model = gltf.scene;
  model.rotation.y = Math.PI;
  scene.add(model);

  // Sound handling - play when interacting with iframe (resets on page load)
  let soundPlayed = false;

  // Simple function to play sound on iframe interaction
  const playStartupSound = () => {
    if (soundPlayed) return;
    
    try {
      const startupSound = new Audio('/sounds/startup.wav');
      startupSound.volume = 0.8;
      
      startupSound.play().then(() => {
        console.log("✅ Startup sound playing!");
        soundPlayed = true;
        
        // Remove event listeners after sound plays
        if (iframe) {
          iframe.removeEventListener('mouseenter', playStartupSound);
          iframe.removeEventListener('touchstart', playStartupSound);
        }
      }).catch((error) => {
        console.warn("❌ Sound failed:", error.message);
      });
    } catch (error) {
      console.warn("❌ Sound error:", error);
    }
  };

  // Function to add sound events to iframe
  const addSoundEventsToIframe = () => {
    if (iframe && !soundPlayed) {
      // Desktop: mouse enter iframe
      iframe.addEventListener('mouseenter', playStartupSound);
      
      // Mobile: touch on iframe
      iframe.addEventListener('touchstart', playStartupSound);
      
      console.log("🔊 Sound events added to iframe - ready to play on interaction");
    }
  };

  // Add sound events after iframe is created
  setTimeout(addSoundEventsToIframe, 100);

  console.log("🔊 Sound system initialized - will play when interacting with iframe...");

  // Load second model if needed
  const secondLoader = new GLTFLoader();
  secondLoader.load('/3d-console.glb', (gltf) => {
    const secondModel = gltf.scene;

    secondModel.traverse((child) => {
      if (child.isMesh && child.name === 'screenplane') {
        child.material = new THREE.MeshStandardMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
      }
    });

    scene.add(secondModel);
  });

  // Set camera position after model loads
  setTimeout(() => {
    camera.position.set(0, 5, 18);
    camera.lookAt(0.15, 2.4, 0.02);
    controls.target.set(0.15, 2.4, 0.02);
    controls.update();
    console.log("✅ Camera positioned");
  }, 100);

  // Enhanced screen mesh detection
  findScreenMesh();

}, undefined, (err) => {
  console.error("❌ Failed to load GLB:", err);
});

function findScreenMesh() {
  if (!model) return;

  // Try multiple screen detection strategies
  const screenNames = [
    "screenplane", "screen", "Screen", "display", "Display", 
    "monitor", "lcd", "Plane", "console_screen", "gamescreen",
    "switch_screen", "nintendo_screen", "handheld_screen"
  ];
  
  // Strategy 1: Find by name
  for (const name of screenNames) {
    screenMesh = model.getObjectByName(name);
    if (screenMesh) {
      console.log(`✅ Found screen mesh by name: ${name}`);
      logScreenInfo();
      return;
    }
  }

  // Strategy 2: Find by material properties (look for emissive or specific colors)
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      // Check for dark/black materials that might be screens
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      if (material.color && (
        material.color.r < 0.1 && material.color.g < 0.1 && material.color.b < 0.1 ||
        material.emissive && material.emissive.r + material.emissive.g + material.emissive.b > 0
      )) {
        const worldPos = child.getWorldPosition(new THREE.Vector3());
        // Look for flat surfaces in the right position range
        if (worldPos.y > 1 && worldPos.y < 4 && Math.abs(worldPos.x) < 3) {
          screenMesh = child;
          console.log(`✅ Found screen by material: ${child.name}`, worldPos);
          logScreenInfo();
          return;
        }
      }
    }
  });

  // Create an anchor that follows the screen
  if (screenMesh) {
    const iframeAnchor = new THREE.Object3D();
    iframeAnchor.position.set(0, 0, 0.01);
    screenMesh.add(iframeAnchor);
    screenObject3D = iframeAnchor;
  }

  // Strategy 3: Find by geometry (look for flat planes)
  if (!screenMesh) {
    model.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const bbox = new THREE.Box3().setFromObject(child);
        const size = bbox.getSize(new THREE.Vector3());
        
        // Look for relatively flat objects (one dimension much smaller than others)
        const isFlat = size.z < 0.1 || size.x < 0.1 || size.y < 0.1;
        const worldPos = child.getWorldPosition(new THREE.Vector3());
        
        if (isFlat && worldPos.y > 1 && worldPos.y < 4) {
          screenMesh = child;
          console.log(`✅ Found screen by geometry: ${child.name}`, worldPos, size);
          logScreenInfo();
          return;
        }
      }
    });
  }

  // Strategy 4: Manual selection - list all possible candidates
  if (!screenMesh) {
    console.log("=== All mesh candidates ===");
    model.traverse((child) => {
      if (child.isMesh) {
        const worldPos = child.getWorldPosition(new THREE.Vector3());
        const bbox = new THREE.Box3().setFromObject(child);
        const size = bbox.getSize(new THREE.Vector3());
        
        console.log(`Mesh: "${child.name}" 
          World pos: ${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)}
          Size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
      }
    });
    
    // Fallback: pick the first mesh in a reasonable screen position
    model.traverse((child) => {
      if (child.isMesh && !screenMesh) {
        const worldPos = child.getWorldPosition(new THREE.Vector3());
        if (worldPos.y > 1.5 && worldPos.y < 3.5) {
          screenMesh = child;
          console.log(`✅ Using fallback screen: ${child.name}`);
          logScreenInfo();
        }
      }
    });
  }

  if (!screenMesh) {
    console.warn("⚠️ No screen mesh found. Positioning iframe at center of scene.");
    // Create a dummy object at a reasonable position
    screenMesh = new THREE.Object3D();
    screenMesh.position.set(0.15, 2.4, 0.02);
    scene.add(screenMesh);
    attachIframeToScreen();
  }
}

function logScreenInfo() {
  if (screenMesh) {
    const worldPos = screenMesh.getWorldPosition(new THREE.Vector3());
    const localPos = screenMesh.position;
    console.log(`Screen local pos: ${localPos.x.toFixed(2)}, ${localPos.y.toFixed(2)}, ${localPos.z.toFixed(2)}`);
    console.log(`Screen world pos: ${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)}`);

    // ✅ Hide the screen mesh completely (most reliable way)
    screenMesh.visible = false;

    attachIframeToScreen();
  }
}

function attachIframeToScreen() {
  // Create an Object3D that will be positioned exactly at the screen surface
  screenObject3D = new THREE.Object3D();
  
  // Match the screen's position and rotation
  screenObject3D.position.copy(screenMesh.position);
  screenObject3D.rotation.copy(screenMesh.rotation);
  screenObject3D.scale.copy(screenMesh.scale);
  
  // CRITICAL: Offset the tracking object to sit ON TOP of the screen surface
  // This moves it slightly forward (positive Z) to make it appear flat on the screen
  const surfaceOffset = 0.01;
  
  // Apply offset in the screen's local coordinate system
  const offsetVector = new THREE.Vector3(0, 0, surfaceOffset);
  
  // If the screen is rotated, we need to apply the offset in the correct direction
  offsetVector.applyQuaternion(screenMesh.getWorldQuaternion(new THREE.Quaternion()));
  screenObject3D.position.add(offsetVector);
  
  // Add to the SAME parent as the screen mesh so they move together
  if (screenMesh.parent) {
    screenMesh.parent.add(screenObject3D);
  } else {
    scene.add(screenObject3D);
  }
  
  console.log("✅ Iframe tracking object positioned ON screen surface");
}

glow.style.position = 'absolute';
glow.style.transformOrigin = '50% 50%';
glow.style.top = '0';
glow.style.left = '0';

// Function to update iframe position
function updateIframePosition() {
  if (!screenObject3D) return;

  // Update world matrix
  screenObject3D.updateWorldMatrix(true, false);

  // Get world position
  screenObject3D.getWorldPosition(tempVector);
  tempVector.project(camera);

  const x = (tempVector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-tempVector.y * 0.5 + 0.5) * window.innerHeight;

  const isVisible = tempVector.z < 1 && tempVector.z > -1;
  if (!isVisible) {
    iframe.style.display = 'none';
    return;
  }

  // Get world rotation (cleanly)
  const worldMatrix = new THREE.Matrix4();
  worldMatrix.copy(screenObject3D.matrixWorld);
  const euler = new THREE.Euler().setFromRotationMatrix(worldMatrix, 'YXZ');

  const rotX = THREE.MathUtils.radToDeg(euler.x);
  const rotY = THREE.MathUtils.radToDeg(euler.y);
  const rotZ = THREE.MathUtils.radToDeg(euler.z);

  iframe.style.transform = `
    translate(-50%, -50%)
    translate(${x + (window.innerWidth * 0.05)}px, ${y}px)
    rotateX(${-rotX}deg)
    rotateY(${0}deg)
    rotateZ(${-rotZ + 180}deg)
  `;
  
  // Step 1: Measure distance between camera and iframeAnchor
  const distance = camera.position.distanceTo(screenObject3D.getWorldPosition(new THREE.Vector3()));

  // Step 2: Choose a base scale (tweak to taste)
  const baseScale = 2.4;
  const referenceDistance = 4;

  // Step 3: Calculate new scale
  const scaleFactor = baseScale * (referenceDistance / distance);

  // Step 4: Apply scale to iframe
  iframe.style.transform += ` scale(${scaleFactor})`;
  
  glow.style.transform = iframe.style.transform;
  glow.style.display = iframe.style.display;

  glow.style.display = 'block';
  glow.style.display = iframe.style.display;

  // Update iframeWrapper (this moves both iframe and glow)
  iframeWrapper.style.left = `${x}px`;
  iframeWrapper.style.top = `${y}px`;
  iframeWrapper.style.transform = `
    translate(-50%, -50%)
    rotateX(${rotX}deg)
    rotateY(${rotY}deg)
    rotateZ(${rotZ}deg)
    scale(${scaleFactor})
  `;
  
  // Let glow follow the iframe (via wrapper)
  glow.style.transform = 'translate(-50%, -50%)';
  glow.style.left = '50%';
  glow.style.top = '50%';
  glow.style.display = iframe.style.display;

  iframeWrapper.style.display = 'block';
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  updateIframePosition();
  const isVisible = tempVector.z < 1 && tempVector.z > -1;
  if (!isVisible) {
    iframe.style.display = 'none';
    return;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Toggle iframe interaction with spacebar
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    const isInteractive = iframe.style.pointerEvents !== 'none';
    iframe.style.pointerEvents = isInteractive ? 'none' : 'auto';
    controls.enabled = isInteractive;
    console.log(`Iframe interaction: ${isInteractive ? 'disabled' : 'enabled'}`);
  }
});

// Click detection for zoom out and zoom in functionality
window.addEventListener('click', (event) => {
  if (event.ctrlKey && screenObject3D) {
    // Debug mode - Ctrl+Click to move screen position
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      screenObject3D.position.copy(point);
      console.log(`Screen tracking object moved to: ${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}`);
    }
  } else if (iframe.style.display !== 'none' && iframe.style.opacity === '1') {
    // Check if click is outside the iframe area when iframe is visible
    const iframeRect = iframe.getBoundingClientRect();
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    const isOutsideIframe = clickX < iframeRect.left || 
                           clickX > iframeRect.right || 
                           clickY < iframeRect.top || 
                           clickY > iframeRect.bottom;
    
    if (isOutsideIframe) {
      console.log("🔙 Clicking away - hiding iframe and zooming out");
      
      // Hide iframe immediately
      iframe.style.display = 'none';
      
      // Zoom camera back out
      moveCameraBack();
    }
  } else if (iframe.style.display === 'none') {
    // If iframe is hidden, check if clicking on console to bring it back
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // If we clicked on something in the scene (console area), bring back the iframe
    if (intersects.length > 0) {
      console.log("📱 Clicking on console - bringing back iframe");
      moveCameraToScreen();
    }
  }
});

// Add touch support for mobile devices
window.addEventListener('touchend', (event) => {
  // Only handle single touches to avoid conflicts
  if (event.changedTouches && event.changedTouches.length === 1) {
    const touch = event.changedTouches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Check if mobile device
    const isMobileDevice = window.innerWidth <= 768 || window.innerHeight <= 768 || window.innerWidth <= 1024;
    
    if (isMobileDevice) {
      // Mobile behavior: allow hiding and showing iframe, but no camera zoom
      if (iframe.style.display !== 'none' && iframe.style.opacity === '1') {
        // Check if touch is outside the iframe area when iframe is visible
        const iframeRect = iframe.getBoundingClientRect();
        
        const isOutsideIframe = touchX < iframeRect.left || 
                               touchX > iframeRect.right || 
                               touchY < iframeRect.top || 
                               touchY > iframeRect.bottom;
        
        if (isOutsideIframe) {
          console.log("🔙 Touching away on mobile - hiding iframe");
          
          // Hide iframe immediately (no camera movement on mobile)
          iframe.style.display = 'none';
        }
      } else if (iframe.style.display === 'none') {
        // If iframe is hidden, check if touching on console to bring it back
        const mouse = new THREE.Vector2();
        mouse.x = (touchX / window.innerWidth) * 2 - 1;
        mouse.y = -(touchY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        // If we touched something in the scene (console area), bring back the iframe
        if (intersects.length > 0) {
          console.log("📱 Touching console on mobile - showing iframe");
          
          // Show iframe using mobile styling (no camera movement)
          iframe.style.display = 'block';
          iframe.style.opacity = '1';
        }
      }
    } else {
      // Desktop touch behavior - full functionality with camera movement
      if (iframe.style.display !== 'none' && iframe.style.opacity === '1') {
        // Check if touch is outside the iframe area when iframe is visible
        const iframeRect = iframe.getBoundingClientRect();
        
        const isOutsideIframe = touchX < iframeRect.left || 
                               touchX > iframeRect.right || 
                               touchY < iframeRect.top || 
                               touchY > iframeRect.bottom;
        
        if (isOutsideIframe) {
          console.log("🔙 Touching away - hiding iframe and zooming out");
          
          // Hide iframe immediately
          iframe.style.display = 'none';
          
          // Zoom camera back out
          moveCameraBack();
        }
      } else if (iframe.style.display === 'none') {
        // If iframe is hidden, check if touching on console to bring it back
        const mouse = new THREE.Vector2();
        mouse.x = (touchX / window.innerWidth) * 2 - 1;
        mouse.y = -(touchY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        // If we touched something in the scene (console area), bring back the iframe
        if (intersects.length > 0) {
          console.log("📱 Touching console - bringing back iframe");
          moveCameraToScreen();
        }
      }
    }
  }
});

// Additional debug controls
document.addEventListener('keydown', (event) => {
  if (event.key === 'r' && screenObject3D) {
    screenObject3D.rotation.z += Math.PI / 6;
    console.log(`Screen rotated: ${screenObject3D.rotation.z * (180/Math.PI)}°`);
  }
  
  // Adjust surface offset for fine-tuning
  if (event.key === 'ArrowUp' && screenObject3D) {
    screenObject3D.position.z += 0.005;
    console.log(`Screen Z position: ${screenObject3D.position.z.toFixed(3)}`);
  }
  
  if (event.key === 'ArrowDown' && screenObject3D) {
    screenObject3D.position.z -= 0.005;
    console.log(`Screen Z position: ${screenObject3D.position.z.toFixed(3)}`);
  }
});

camera.position.set(-2, 2.5, 4);

function moveCameraToScreen() {
  const screenPosition = new THREE.Vector3();
  screenObject3D.getWorldPosition(screenPosition);

  const targetCamPos = screenPosition.clone().add(new THREE.Vector3(0, 0, 3));
  const targetLookAt = screenPosition.clone();

  gsap.to(camera.position, {
    duration: 2,
    x: targetCamPos.x,
    y: targetCamPos.y,
    z: targetCamPos.z,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.lookAt(targetLookAt);
    },
    onComplete: () => {
      console.log("🎯 Camera move complete!");
      
      // Immediately start loading the iframe content
      iframe.style.display = 'block';
      
      // Start with the iframe very small and contained within the console frame
      gsap.set(iframe, { 
        scale: 0.1,  // Start very small
        opacity: 0,
        width: '20px',  // Start tiny within console
        height: '15px'
      });
      
      // Animate it expanding out to a nice medium size
      gsap.to(iframe, {
        duration: 2.5,
        scale: 1,
        opacity: 1, // Fully opaque
        width: `${window.innerWidth * 0.3}px`,   // 30% of screen width
        height: `${window.innerHeight * 0.3}px`, // 30% of screen height
        ease: 'elastic.out(1, 0.5)', // Elastic bounce effect
        transformOrigin: 'center center'
      });
    }
  });
}

function moveCameraBack() {
  gsap.to(camera.position, {
    duration: 2,
    x: 0,
    y: 5,
    z: 18,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.lookAt(new THREE.Vector3(0.15, 2.4, 0.02));
    }
  });
}

// Start the experience automatically after a short delay
setTimeout(() => {
  moveCameraToScreen();
}, 500);

// Mobile responsive code
function fixIframeForMobile() {
  const iframe = document.getElementById('iframe');
  if (!iframe) return;
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isMobile = screenWidth <= 768 || screenHeight <= 768 || screenWidth <= 1024;
  
  if (isMobile) {
    iframe.style.display = 'none';
    iframe.style.opacity = '0';
    
    setTimeout(function() {
      iframe.style.position = 'fixed';
      iframe.style.zIndex = '9999';
      iframe.style.display = 'block';
      iframe.style.opacity = '1';
      iframe.style.background = '#000000';
      iframe.style.border = '2px solid #ec4899';
      iframe.style.transform = 'none';
      
      if (screenHeight > screenWidth) {
        // Portrait - perfect as is
        iframe.style.width = '90vw';
        iframe.style.height = '50vh';
        iframe.style.left = '0vw';
        iframe.style.top = '7vh';
      } else {
        // Landscape - just slightly smaller width to be contained
        iframe.style.width = '70vw';   // Reduced from 80vw to 70vw
        iframe.style.height = '60vh';
        iframe.style.left = '5vw';     // Adjusted left to center it
        iframe.style.top = '5vh';
      }
    }, 3000);
  }
}

fixIframeForMobile();

window.addEventListener('orientationchange', function() {
  setTimeout(fixIframeForMobile, 300);
});
window.addEventListener('resize', fixIframeForMobile);