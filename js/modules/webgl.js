/* ══════════════════════════════════════════════════════════
   js/modules/webgl.js
   Three.js WebGL Liquid Glass Background & 3D Interactive Object
   Dynamically imports Three.js to keep initial bundle light.
   ══════════════════════════════════════════════════════════ */
'use strict';

(async function initWebGL() {
    try {
        // Dynamically import Three.js as an ES Module
        const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js');

        // Target the hero backdrop container
        const container = document.getElementById('hero-backdrop-inner');
        if (!container) return;

        // Clear existing background styling to let WebGL shine
        container.style.background = 'transparent';

        // ─── Setup Scene, Camera, Renderer ───
        const scene = new THREE.Scene();
        
        // Camera for both background plane and 3D object
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Add canvas to DOM
        const canvas = renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        // Allow pointer events to pass through background, but if we want interactivity on 3D object we might need mouse tracking via raycaster.
        // For performance, we track mouse document-wide instead.
        canvas.style.pointerEvents = 'none'; 
        container.appendChild(canvas);

        // ─── Liquid Glass Background Shader ───
        // A shader that creates a dark, slow-moving fluid effect.
        const uniforms = {
            u_time: { value: 0.0 },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color1: { value: new THREE.Color('#0a0a0c') }, // Deep dark base
            u_color2: { value: new THREE.Color('#0f172a') }, // Subtle blue/slate
            u_glow: { value: new THREE.Color('#22d3ee') }    // Cyan accent
        };

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec2 u_resolution;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform vec3 u_glow;
            varying vec2 vUv;

            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                    -0.577350269189626,  // -1.0 + 2.0 * C.x
                                    0.024390243902439); // 1.0 / 41.0
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                // Add mouse influence
                vec2 mouseDist = st - u_mouse;
                float influence = exp(-dot(mouseDist, mouseDist) * 3.0);
                
                // Animate noise over time and space
                vec2 pos = st * 3.0;
                float noise = snoise(pos + u_time * 0.15 + influence * 0.5);
                float noise2 = snoise(pos - u_time * 0.1);
                
                float f = smoothstep(-1.0, 1.0, noise * noise2);
                
                // Mix colors based on noise
                vec3 color = mix(u_color1, u_color2, f);
                
                // Add subtle glow near the mouse
                color += u_glow * influence * 0.15;

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const bgMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            depthWrite: false
        });

        // Large plane that covers the camera view
        const bgGeometry = new THREE.PlaneGeometry(20, 20);
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        // Push it far back
        bgMesh.position.z = -5;
        scene.add(bgMesh);

        // ─── 3D Liquid Glass Object (Torus Knot) ───
        // We create an actual 3D object that refracts light
        const objectGeometry = new THREE.TorusKnotGeometry(1.2, 0.4, 256, 64);
        
        // Premium physical glass material (Liquid Glass look)
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 1.0,  // Glass-like transparency
            opacity: 1,
            metalness: 0.1,
            roughness: 0.05,
            ior: 1.5,           // Index of refraction for glass
            thickness: 2.0,     // Volume thickness for deeper refraction
            specularIntensity: 2.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            iridescence: 0.6,   // Liquid glass sheen
            iridescenceIOR: 1.3,
            side: THREE.DoubleSide
        });

        const glassObject = new THREE.Mesh(objectGeometry, glassMaterial);
        
        // Position it closer and more centrally so it is clearly visible
        glassObject.position.set(0, 0, 1.5);
        // Make sure it renders in front of the background plane
        glassObject.renderOrder = 1; 
        scene.add(glassObject);

        // Add lighting for the glass to catch reflections
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x22d3ee, 5, 20); // Cyan light
        pointLight1.position.set(5, 5, 2);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xa855f7, 3, 20); // Purple light
        pointLight2.position.set(-5, -5, 2);
        scene.add(pointLight2);

        // ─── Mouse Tracking for Interactivity ───
        let targetX = 0;
        let targetY = 0;
        let mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        let isHovering3D = false;
        let hoverScale = 1.0;

        document.addEventListener('mousemove', (e) => {
            // Normalize mouse coords 0 to 1 for shader
            const x = e.clientX / window.innerWidth;
            const y = 1.0 - (e.clientY / window.innerHeight);
            
            targetX = x;
            targetY = y;

            // Normalized device coordinates (-1 to +1) for raycaster
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // Check intersection
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(glassObject);
            if (intersects.length > 0) {
                isHovering3D = true;
                document.body.style.cursor = 'pointer';
            } else {
                if (isHovering3D) {
                    document.body.style.cursor = '';
                }
                isHovering3D = false;
            }
        });

        // Handle clicks on the 3D object to change its geometry randomly!
        document.addEventListener('click', () => {
            if (isHovering3D) {
                const geometries = [
                    new THREE.IcosahedronGeometry(1.2, 0),
                    new THREE.TorusGeometry(1, 0.4, 32, 100),
                    new THREE.OctahedronGeometry(1.2, 0),
                    new THREE.TorusKnotGeometry(1.2, 0.4, 128, 64)
                ];
                const randGeo = geometries[Math.floor(Math.random() * geometries.length)];
                glassObject.geometry.dispose(); // clean memory
                glassObject.geometry = randGeo;
            }
        });

        // Handle Window Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);

            // Adjust position of 3D object on smaller screens
            if (window.innerWidth < 768) {
                glassObject.position.set(0, -0.8, 1); // Move lower on mobile
                glassObject.scale.set(0.7, 0.7, 0.7);
            } else {
                glassObject.position.set(1.5, 0, 1.5); // Right side on desktop
                glassObject.scale.set(1, 1, 1);
            }
            
            // Sync physics body position
            if (glassBody) {
                glassBody.position.copy(glassObject.position);
            }
        });

        // Trigger initial resize to set proper scale
        window.dispatchEvent(new Event('resize'));

        // ─── Cannon.js Physics ───
        const CANNON = await import('cannon-es');
        
        const world = new CANNON.World({
            gravity: new CANNON.Vec3(0, 0, 0), // No gravity initially so it floats
        });

        // Add a sphere body for the glass object
        const glassShape = new CANNON.Sphere(1.2);
        const glassBody = new CANNON.Body({
            mass: 1, // kg
            position: new CANNON.Vec3(glassObject.position.x, glassObject.position.y, glassObject.position.z),
            shape: glassShape,
            angularDamping: 0.5, // Slow down spin over time
            linearDamping: 0.1
        });
        world.addBody(glassBody);

        // Add an invisible constraint/spring to keep it tethered to its origin point
        const originBody = new CANNON.Body({
            mass: 0, // Static
            position: new CANNON.Vec3(glassObject.position.x, glassObject.position.y, glassObject.position.z)
        });
        world.addBody(originBody);

        const spring = new CANNON.Spring(glassBody, originBody, {
            localAnchorA: new CANNON.Vec3(0, 0, 0),
            localAnchorB: new CANNON.Vec3(0, 0, 0),
            restLength: 0,
            stiffness: 50,
            damping: 5,
        });

        world.addEventListener('postStep', () => {
            spring.applyForce();
        });

        // Apply impulse on hover
        document.addEventListener('mousemove', (e) => {
            if (isHovering3D && glassBody) {
                // Apply a small rotational impulse when hovering
                glassBody.applyTorque(new CANNON.Vec3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                ));
            }
        });

        // Apply huge impulse on click
        document.addEventListener('click', () => {
            if (isHovering3D && glassBody) {
                glassBody.applyImpulse(new CANNON.Vec3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    -5
                ), new CANNON.Vec3(0, 0, 0));
                
                glassBody.applyTorque(new CANNON.Vec3(
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 50,
                    0
                ));
            }
        });

        // ─── Render Loop ───
        const clock = new THREE.Clock();
        let targetRotationSpeed = 0.01;
        let currentRotationSpeed = 0.01;

        function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();
            const deltaTime = clock.getDelta();
            
            // Step physics world
            world.step(1 / 60, deltaTime, 3);
            
            // Sync Three.js mesh with Cannon.js body
            glassObject.position.copy(glassBody.position);
            glassObject.quaternion.copy(glassBody.quaternion);
            
            // Add subtle floating effect to origin instead of the object directly
            originBody.position.y = Math.sin(elapsedTime * 1.5) * 0.3 + 0.5;
            originBody.position.x = window.innerWidth < 768 ? 0 : 1.5 + (targetX - 0.5) * 2;

            // Update Background Shader Uniforms
            uniforms.u_time.value = elapsedTime;
            
            // Smoothly move mouse uniform toward target
            uniforms.u_mouse.value.x += (targetX - uniforms.u_mouse.value.x) * 0.05;
            uniforms.u_mouse.value.y += (targetY - uniforms.u_mouse.value.y) * 0.05;

            // Handle 3D object hover scale states
            if (isHovering3D) {
                hoverScale += (1.2 - hoverScale) * 0.1;
            } else {
                hoverScale += (1.0 - hoverScale) * 0.1;
            }
            
            // Apply scale (accounting for base responsive scaling)
            const baseScale = window.innerWidth < 768 ? 0.6 : 1.0;
            glassObject.scale.set(baseScale * hoverScale, baseScale * hoverScale, baseScale * hoverScale);

            renderer.render(scene, camera);
        }

        animate();

        // Listen for Theme Changes to update WebGL Colors
        window.addEventListener('themechanged', (e) => {
            const theme = e.detail.theme;
            if (theme === 'cyberpunk') {
                uniforms.u_color1.value.set('#0b021a');
                uniforms.u_color2.value.set('#1a082b');
                uniforms.u_glow.value.set('#ff0055');
                pointLight1.color.setHex(0xff0055);
                pointLight2.color.setHex(0x00ffcc);
            } else if (theme === 'sunset') {
                uniforms.u_color1.value.set('#1a0a0f');
                uniforms.u_color2.value.set('#2a1219');
                uniforms.u_glow.value.set('#ff5e00');
                pointLight1.color.setHex(0xff5e00);
                pointLight2.color.setHex(0xff0055);
            } else {
                // Professional (default)
                uniforms.u_color1.value.set('#0a0a0c');
                uniforms.u_color2.value.set('#0f172a');
                uniforms.u_glow.value.set('#22d3ee');
                pointLight1.color.setHex(0x22d3ee);
                pointLight2.color.setHex(0xa855f7);
            }
        });
        
        // Initial theme trigger
        const curTheme = localStorage.getItem('asad_portfolio_theme') || 'professional';
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: curTheme } }));

    } catch (error) {
        console.error('Failed to load WebGL Background:', error);
    }
})();
