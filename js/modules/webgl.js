/* ══════════════════════════════════════════════════════════
   js/modules/webgl.js
   Three.js WebGL Liquid Glass Background & 3D Interactive Object
   Dynamically imports Three.js to keep initial bundle light.

   PERFORMANCE FIXES:
   - Only runs render loop when hero section is visible
   - FPS capped at 30 (glass object doesn't need 60fps)
   - Pauses completely when tab is not visible
   - Skips entirely on mobile devices
   ══════════════════════════════════════════════════════════ */
'use strict';

(async function initWebGL() {
    // Skip WebGL entirely on mobile — saves massive GPU/battery
    if (window._isMobile) return;

    try {
        // Dynamically import Three.js as an ES Module
        const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js');

        // Target the hero backdrop container
        const container = document.getElementById('hero-backdrop-inner');
        if (!container) return;

        // If container is an <img>, we need its parent
        const mountTarget = container.tagName === 'IMG' ? container.parentElement : container;

        // ─── Setup Scene, Camera, Renderer ───
        const scene = new THREE.Scene();
        
        // Camera for both background plane and 3D object
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,  // Disable AA for performance (subtle on dark backgrounds)
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5x for perf
        
        // Add canvas to DOM
        const canvas = renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'none'; 
        mountTarget.appendChild(canvas);

        // ─── Liquid Glass Background Shader ───
        const uniforms = {
            u_time: { value: 0.0 },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color1: { value: new THREE.Color('#0a0a0c') },
            u_color2: { value: new THREE.Color('#0f172a') },
            u_glow: { value: new THREE.Color('#22d3ee') }
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

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
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
                vec2 mouseDist = st - u_mouse;
                float influence = exp(-dot(mouseDist, mouseDist) * 3.0);
                
                vec2 pos = st * 3.0;
                float noise = snoise(pos + u_time * 0.15 + influence * 0.5);
                float noise2 = snoise(pos - u_time * 0.1);
                
                float f = smoothstep(-1.0, 1.0, noise * noise2);
                vec3 color = mix(u_color1, u_color2, f);
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

        const bgGeometry = new THREE.PlaneGeometry(20, 20);
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        bgMesh.position.z = -5;
        scene.add(bgMesh);

        // ─── 3D Liquid Glass Object (Torus Knot) ───
        // Use lower-poly geometry for performance
        const objectGeometry = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32);
        
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 1.0,
            opacity: 1,
            metalness: 0.1,
            roughness: 0.05,
            ior: 1.5,
            thickness: 2.0,
            specularIntensity: 2.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            iridescence: 0.6,
            iridescenceIOR: 1.3,
            side: THREE.DoubleSide
        });

        const glassObject = new THREE.Mesh(objectGeometry, glassMaterial);
        glassObject.position.set(0, 0, 1.5);
        glassObject.renderOrder = 1; 
        scene.add(glassObject);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x22d3ee, 5, 20);
        pointLight1.position.set(5, 5, 2);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xa855f7, 3, 20);
        pointLight2.position.set(-5, -5, 2);
        scene.add(pointLight2);

        // ─── Mouse Tracking ───
        let targetX = 0;
        let targetY = 0;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX / window.innerWidth;
            targetY = 1.0 - (e.clientY / window.innerHeight);
        }, { passive: true });

        // Handle Window Resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);

                if (window.innerWidth < 768) {
                    glassObject.position.set(0, -0.8, 1);
                    glassObject.scale.set(0.7, 0.7, 0.7);
                } else {
                    glassObject.position.set(1.5, 0, 1.5);
                    glassObject.scale.set(1, 1, 1);
                }
            }, 200);
        }, { passive: true });

        // Trigger initial layout
        window.dispatchEvent(new Event('resize'));

        // ─── Visibility-Aware Render Loop ───
        // Only render when hero is visible AND tab is active
        let isVisible = true;
        let loopId = null;
        const FPS_CAP = 30;
        const FRAME_INTERVAL = 1000 / FPS_CAP;
        let lastFrameTime = 0;
        const clock = new THREE.Clock();

        // Pause when hero scrolls out of view
        const heroEl = document.getElementById('hero');
        if (heroEl && window.IntersectionObserver) {
            new IntersectionObserver((entries) => {
                const wasVisible = isVisible;
                isVisible = entries[0].isIntersecting;
                if (isVisible && !wasVisible && !loopId) {
                    clock.start();
                    loopId = requestAnimationFrame(animate);
                }
            }, { threshold: 0, rootMargin: '100px 0px 100px 0px' }).observe(heroEl);
        }

        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (loopId) {
                    cancelAnimationFrame(loopId);
                    loopId = null;
                }
                clock.stop();
            } else if (isVisible) {
                clock.start();
                loopId = requestAnimationFrame(animate);
            }
        });

        function animate(timestamp) {
            if (!isVisible || document.hidden) {
                loopId = null;
                return;
            }

            loopId = requestAnimationFrame(animate);

            // FPS cap
            if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
            lastFrameTime = timestamp;

            const elapsedTime = clock.getElapsedTime();
            
            // Simple rotation instead of full physics engine
            glassObject.rotation.x += 0.003;
            glassObject.rotation.y += 0.005;
            
            // Floating effect
            glassObject.position.y = Math.sin(elapsedTime * 1.5) * 0.3 + 0.5;
            if (window.innerWidth >= 768) {
                glassObject.position.x = 1.5 + (targetX - 0.5) * 2;
            }

            // Update shader uniforms
            uniforms.u_time.value = elapsedTime;
            uniforms.u_mouse.value.x += (targetX - uniforms.u_mouse.value.x) * 0.05;
            uniforms.u_mouse.value.y += (targetY - uniforms.u_mouse.value.y) * 0.05;

            renderer.render(scene, camera);
        }

        // Start
        loopId = requestAnimationFrame(animate);

        // Listen for Theme Changes
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
                uniforms.u_color1.value.set('#0a0a0c');
                uniforms.u_color2.value.set('#0f172a');
                uniforms.u_glow.value.set('#22d3ee');
                pointLight1.color.setHex(0x22d3ee);
                pointLight2.color.setHex(0xa855f7);
            }
        });
        
        const curTheme = localStorage.getItem('asad_portfolio_theme') || 'professional';
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: curTheme } }));

    } catch (error) {
        console.error('Failed to load WebGL Background:', error);
    }
})();
