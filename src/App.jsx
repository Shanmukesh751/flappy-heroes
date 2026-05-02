import React, { useState, useEffect, useRef } from 'react';
import { 
    Orbit, Cpu, Skull, Shield, Hammer, Bug, Leaf, Zap, 
    Brush, Bird, MousePointer2, CircleDashed, Gamepad2, 
    Swords, Ghost, Flame, Trophy, Volume2, VolumeX, Share2, RotateCcw
} from 'lucide-react';

// ==========================================
// 🔥 DEVELOPER MODE FLAG 🔥
const DEV_MODE_ALL_UNLOCKED = true;
// ==========================================

const MAX_THEME_LEVEL = 11;
const GAME_SPEED = 0.2;
const OBSTACLE_SPAWN_RATE = 80; 

const DIFFICULTIES = {
    easy:   { grav: -0.010, jump: 0.20, gap: 7.0, label: 'Easy' },
    medium: { grav: -0.014, jump: 0.25, gap: 5.5, label: 'Med' },
    hard:   { grav: -0.018, jump: 0.30, gap: 4.0, label: 'Hard' }
};

const CHARACTERS = [
    { id: 0, name: 'Orb', req: 0, c1: '#ffffff', c2: '#888888', icon: Orbit, tag: 'Standard energy unit.' },
    { id: 1, name: 'Iron', req: 10, c1: '#c0392b', c2: '#f1c40f', icon: Cpu, tag: 'Tech genius.' },
    { id: 2, name: 'Hulk', req: 30, c1: '#2ecc71', c2: '#1e8449', icon: Skull, tag: 'Smash.' },
    { id: 3, name: 'Cap', req: 50, c1: '#2980b9', c2: '#e74c3c', icon: Shield, tag: 'Star-spangled.' },
    { id: 4, name: 'Thor', req: 70, c1: '#95a5a6', c2: '#8B4513', icon: Hammer, tag: 'God of thunder.' },
    { id: 5, name: 'Spider', req: 90, c1: '#c0392b', c2: '#111111', icon: Bug, tag: 'Web-slinger.' },
    { id: 6, name: 'Leaf', req: 110, c1: '#3498db', c2: '#bdc3c7', icon: Leaf, tag: 'Believe it!' },
    { id: 7, name: 'Ki', req: 130, c1: '#e67e22', c2: '#f1c40f', icon: Zap, tag: 'Power rising!' },
    { id: 8, name: 'Spray', req: 150, c1: '#8e44ad', c2: '#e74c3c', icon: Brush, tag: 'Keep running.' },
    { id: 9, name: 'Bird', req: 170, c1: '#e74c3c', c2: '#f1c40f', icon: Bird, tag: 'Slingshot ready.' },
    { id: 10, name: 'Mouse', req: 190, c1: '#111111', c2: '#ffffff', icon: MousePointer2, tag: 'Happiest icon.' },
    { id: 11, name: 'Tire', req: 210, c1: '#111111', c2: '#7f8c8d', icon: CircleDashed, tag: 'I am speed.' },
    { id: 12, name: 'Pixel', req: 230, c1: '#2ecc71', c2: '#111111', icon: Gamepad2, tag: 'Insert coin.' },
    { id: 13, name: 'Ninja', req: 250, c1: '#111111', c2: '#00ffff', icon: Swords, tag: 'Wake up, samurai.' },
    { id: 14, name: 'Alien', req: 270, c1: '#2ecc71', c2: '#000000', icon: Ghost, tag: 'Out there.' },
    { id: 15, name: 'Dragon', req: 300, c1: '#e67e22', c2: '#ffffff', icon: Flame, tag: 'Fire and blood.' }
];

const THEMES = [
    { id: 0, name: 'Day City', fog: 0x87CEEB, pipe: 0xbdc3c7, neon: 0xf1c40f, grid: 0x3498db },
    { id: 1, name: 'Night City', fog: 0x0B0B2A, pipe: 0x222233, neon: 0xe74c3c, grid: 0x8e44ad },
    { id: 2, name: 'Jungle', fog: 0x1b4d3e, pipe: 0x5c2a08, neon: 0x2ecc71, grid: 0x27ae60 },
    { id: 3, name: 'Icy Tundra', fog: 0xa0c4ff, pipe: 0x88ccff, neon: 0xffffff, grid: 0xffffff },
    { id: 4, name: 'Desert', fog: 0xe76f51, pipe: 0xd4a373, neon: 0xfaedcd, grid: 0xe67e22 },
    { id: 5, name: 'Volcano', fog: 0x370617, pipe: 0x1a0505, neon: 0xff0000, grid: 0xdc2f02 },
    { id: 6, name: 'Underwater', fog: 0x03045e, pipe: 0x023e8a, neon: 0x00ffff, grid: 0x0077b6 },
    { id: 7, name: 'Sky Realm', fog: 0xc8b6ff, pipe: 0xffffff, neon: 0xf1c40f, grid: 0xffc8dd },
    { id: 8, name: 'Cyberpunk', fog: 0x10002b, pipe: 0x110022, neon: 0x00ffff, grid: 0xff00ff },
    { id: 9, name: 'Space', fog: 0x000000, pipe: 0x333344, neon: 0x00ffff, grid: 0x555555 },
    { id: 10, name: 'Dino World', fog: 0x2d3436, pipe: 0xecf0f1, neon: 0xbdc3c7, grid: 0x873600 },
    { id: 11, name: 'Infinity', fog: 0x000000, pipe: 0x000000, neon: 0xff00ff, grid: 0x00ffff }
];

export default function App() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    
    // React State
    const [engineLoaded, setEngineLoaded] = useState(false);
    const [gameState, setGameState] = useState('NAME'); // NAME, START, PLAYING, GAMEOVER, UNLOCK
    
    const [soundEnabled, setSoundEnabled] = useState(true);
    const soundEnabledRef = useRef(true);

    const [playerName, setPlayerName] = useState("");
    
    const [currentDiff, setCurrentDiff] = useState('medium');
    const [selectedHeroId, setSelectedHeroId] = useState(0);
    const [recentlyUnlocked, setRecentlyUnlocked] = useState([]);
    
    const [profile, setProfile] = useState({
        name: "", highScores: { easy: 0, medium: 0, hard: 0 },
        levelHighScores: { easy: {}, medium: {}, hard: {} },
        unlockedLevels: { easy: [0], medium: [0], hard: [0] },
        totalRuns: 0, totalScore: 0
    });

    // Refs for DOM nodes to bypass React renders for 60fps performance
    const scoreRef = useRef(null);
    const comboRef = useRef(null);
    const levelRef = useRef(null);
    const msgRef = useRef(null);

    // Initialize Three.js Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.onload = () => {
            loadProfile();
            initEngine();
            setEngineLoaded(true);
        };
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

    const loadProfile = () => {
        const stored = localStorage.getItem('fh3d_react_profile');
        if (stored) {
            try { 
                const p = {...profile, ...JSON.parse(stored)};
                setProfile(p);
                setPlayerName(p.name);
                if (p.name) setGameState('START');
            } catch(e){}
        }
    };

    const saveProfile = (newProfile) => {
        setProfile(newProfile);
        localStorage.setItem('fh3d_react_profile', JSON.stringify(newProfile));
    };

    const handleSoundToggle = () => {
        const newVal = !soundEnabled;
        setSoundEnabled(newVal);
        soundEnabledRef.current = newVal;
    };

    const initEngine = () => {
        const THREE = window.THREE;
        
        // --- Setup Scene ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(THEMES[0].fog, 0.02);
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 25);
        
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Anti-Jitter Shadows
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // --- Lights ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); 
        dirLight.position.set(15, 30, 15);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        const gridHelper = new THREE.GridHelper(200, 50, THEMES[0].grid, 0x111111); 
        gridHelper.position.y = -8; 
        gridHelper.receiveShadow = true;
        scene.add(gridHelper);

        const playerMesh = new THREE.Group(); 
        playerMesh.castShadow = true;
        scene.add(playerMesh);
        
        const playerLight = new THREE.PointLight(0x00ffff, 1.5, 15); 
        scene.add(playerLight);

        // Background Particles
        const pGeo = new THREE.BufferGeometry(); const pCount = 300; const pPos = new Float32Array(pCount * 3);
        for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random()-0.5)*100;
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff, transparent: true, opacity: 0.5 });
        const pMesh = new THREE.Points(pGeo, pMat); scene.add(pMesh);

        // --- Internal Engine State ---
        let obstacles = [];
        let particles = [];
        let frames = 0, currentLevel = 0, runScore = 0, globalScore = 0, combo = 0;
        let playerVelocityY = 0;
        let hitPauseTimer = 0, deathTimer = 0, screenShake = 0;
        let internalState = 'MENU';
        let activeDiff = 'medium';
        let activeHero = 0;

        // FIXED TIMESTEP ACCUMULATOR (Anti-Jitter)
        let lastTime = performance.now();
        let accumulator = 0;
        const FIXED_DT = 1000 / 60; // 60hz physics locked

        // Cache Geometries
        const GEOS = {
            box: new THREE.BoxGeometry(1, 1, 1),
            sphere: new THREE.SphereGeometry(1, 16, 16),
            cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
            torus: new THREE.TorusGeometry(0.8, 0.3, 16, 32),
            coin: new THREE.TorusGeometry(0.5, 0.15, 8, 16)
        };
        const MATS = { coin: new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, roughness: 0.2, metalness: 0.8 }) };

        function getMat(colorHex, emissiveHex = 0x000000, wireframe = false) {
            const key = `${colorHex}_${emissiveHex}_${wireframe}`;
            if(!MATS[key]) {
                if(wireframe) MATS[key] = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.5 });
                else MATS[key] = new THREE.MeshStandardMaterial({ color: colorHex, emissive: emissiveHex, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.6 });
            }
            return MATS[key];
        }

        const buildPlayerMesh = (charId) => {
            const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
            while(playerMesh.children.length > 0) playerMesh.remove(playerMesh.children[0]);

            const c1 = parseInt(char.c1.replace('#','0x'));
            const c2 = parseInt(char.c2.replace('#','0x'));
            const m = new THREE.Mesh(GEOS.box, getMat(c1, c2));
            m.castShadow = true;
            
            // Apply shapes based on hero
            if(char.id === 0 || char.id === 5 || char.id >= 9) m.geometry = GEOS.sphere;
            if(char.id === 3 || char.id === 8) m.geometry = GEOS.cyl;
            if(char.id === 6 || char.id === 11) m.geometry = GEOS.torus;

            playerMesh.add(m);
            playerLight.color.setHex(c1);
        };

        const update3DTheme = (lvl) => {
            const theme = THEMES[Math.min(lvl, MAX_THEME_LEVEL)] || THEMES[0];
            scene.fog.color.setHex(theme.fog); scene.background = new THREE.Color(theme.fog);
            gridHelper.material.color.setHex(theme.grid);
            dirLight.color.setHex(0xffffff);
        };

        const spawnObstacle = () => {
            const gapSize = DIFFICULTIES[activeDiff].gap;
            const gapY = Math.random() * 13 - 1;
            const theme = THEMES[Math.min(currentLevel, MAX_THEME_LEVEL)] || THEMES[0];

            const pipeW = 3, pipeH = 40;
            const group = new THREE.Group();
            group.position.set(30, 0, 0); group.passed = false; group.gapY = gapY;

            const mat = getMat(theme.pipe);
            const neonMat = getMat(theme.neon, theme.neon);

            // Top Pipe
            const topMesh = new THREE.Mesh(GEOS.box, mat);
            topMesh.scale.set(pipeW, pipeH, 4);
            topMesh.position.y = gapY + (gapSize/2) + (pipeH/2);
            topMesh.castShadow = true; topMesh.receiveShadow = true;
            
            const topLip = new THREE.Mesh(GEOS.box, neonMat);
            topLip.scale.set(pipeW+0.5, 1, 4.5);
            topLip.position.y = gapY + (gapSize/2) + 0.5;

            // Bot Pipe
            const botMesh = new THREE.Mesh(GEOS.box, mat);
            botMesh.scale.set(pipeW, pipeH, 4);
            botMesh.position.y = gapY - (gapSize/2) - (pipeH/2);
            botMesh.castShadow = true; botMesh.receiveShadow = true;

            const botLip = new THREE.Mesh(GEOS.box, neonMat);
            botLip.scale.set(pipeW+0.5, 1, 4.5);
            botLip.position.y = gapY - (gapSize/2) - 0.5;

            const coin = new THREE.Mesh(GEOS.coin, MATS.coin);
            coin.position.set(0, gapY, 0);

            group.add(topMesh, topLip, botMesh, botLip, coin);
            scene.add(group);
            
            const boxTop = new THREE.Box3(); const boxBot = new THREE.Box3();
            obstacles.push({ group, boxTop, boxBot, topMesh, botMesh, coin, coinCollected: false });
        };

        const triggerDeath = () => {
            if (internalState === 'DYING') return; 
            internalState = 'DYING'; hitPauseTimer = 15; deathTimer = 80; screenShake = 30;
            playAudio('crash');
            
            playerMesh.visible = false; playerLight.intensity = 0;
            const char = CHARACTERS.find(c=>c.id === activeHero) || CHARACTERS[0];
            const fragMat = getMat(parseInt(char.c1.replace('#','0x')), parseInt(char.c2.replace('#','0x')));
            
            for(let i=0; i<15; i++) {
                const m = new THREE.Mesh(GEOS.box, fragMat); m.scale.set(0.6, 0.6, 0.6);
                m.position.copy(playerMesh.position);
                m.vx = (Math.random()-0.5)*0.8; m.vy = (Math.random()-0.5)*0.8 + 0.2; m.vz = (Math.random()-0.5)*0.8;
                scene.add(m); particles.push(m);
            }
        };

        const showDOMMsg = (text, color='#fff') => {
            if(msgRef.current) {
                msgRef.current.innerText = text;
                msgRef.current.style.color = color;
                msgRef.current.style.opacity = 1;
                setTimeout(() => { if(msgRef.current) msgRef.current.style.opacity = 0; }, 1500);
            }
        };

        const levelUp = () => {
            currentLevel++; hitPauseTimer = 10;
            playAudio('milestone'); screenShake = 20; update3DTheme(currentLevel);
            
            if(levelRef.current) levelRef.current.innerText = currentLevel;
            showDOMMsg(currentLevel > MAX_THEME_LEVEL ? `CHECKPOINT REACHED!` : `LEVEL UP!`, '#f1c40f');
        };

        // --- Core Physics Tick (Runs at exact 60fps pacing) ---
        const updatePhysics = () => {
            if (internalState === 'MENU') {
                playerMesh.rotation.x += 0.01; playerMesh.rotation.y += 0.01;
                playerMesh.position.y = 5 + Math.sin(Date.now()*0.003)*0.5;
                gridHelper.position.x -= GAME_SPEED;
                if(gridHelper.position.x <= -10) gridHelper.position.x = 0;
                return;
            }

            if (internalState === 'DYING') {
                deathTimer--;
                particles.forEach(p => { 
                    p.vy += DIFFICULTIES[activeDiff].grav; 
                    p.position.x += p.vx; p.position.y += p.vy; p.position.z += p.vz; 
                    p.rotation.x += 0.1; p.rotation.y += 0.1; 
                });
                obstacles.forEach(o => o.group.position.x -= GAME_SPEED * 0.5); 
                if (deathTimer <= 0) {
                    internalState = 'GAMEOVER';
                    engineRef.current.onGameOver(globalScore, runScore);
                }
                return;
            }

            if (internalState === 'PLAYING') {
                frames++; 
                playerVelocityY += DIFFICULTIES[activeDiff].grav; 
                playerMesh.position.y += playerVelocityY;
                playerLight.position.copy(playerMesh.position); 
                playerMesh.rotation.x += 0.02; playerMesh.rotation.y += 0.03;
                playerMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1); 

                if (playerMesh.position.y < -3 || playerMesh.position.y > 15) triggerDeath();
                if (frames % OBSTACLE_SPAWN_RATE === 0) spawnObstacle();

                const pSphere = new THREE.Sphere(playerMesh.position, 1.0);

                for (let i = obstacles.length - 1; i >= 0; i--) {
                    let obs = obstacles[i]; obs.group.position.x -= GAME_SPEED;
                    if(obs.coin) obs.coin.rotation.y += 0.05;

                    obs.boxTop.setFromObject(obs.topMesh); obs.boxBot.setFromObject(obs.botMesh);
                    obs.boxTop.expandByScalar(-0.2); obs.boxBot.expandByScalar(-0.2);

                    if (obs.boxTop.intersectsSphere(pSphere) || obs.boxBot.intersectsSphere(pSphere)) triggerDeath();

                    if (!obs.coinCollected && Math.abs(playerMesh.position.x - obs.group.position.x) < 2) {
                        if (Math.abs(playerMesh.position.y - obs.group.gapY) < 1.2) {
                            obs.coinCollected = true; obs.group.remove(obs.coin);
                            combo++; runScore += 2; globalScore += 2;
                            playAudio('coin', Math.min(combo * 100, 1000));
                            
                            if(scoreRef.current) scoreRef.current.innerText = globalScore;
                            if(comboRef.current) comboRef.current.innerText = combo + "x";
                            
                            showDOMMsg('PERFECT!', '#f1c40f');
                            playerLight.intensity = 4; setTimeout(() => { playerLight.intensity = 1.5; }, 100);
                        }
                    }

                    if (obs.group.position.x < playerMesh.position.x && !obs.passed) {
                        obs.passed = true;
                        if (!obs.coinCollected) {
                            combo = 0; runScore++; globalScore++; 
                            playAudio('score');
                            if(scoreRef.current) scoreRef.current.innerText = globalScore;
                            if(comboRef.current) comboRef.current.innerText = combo + "x";
                        }
                        let thresh = (currentLevel >= MAX_THEME_LEVEL) ? 20 : 10;
                        if (runScore > 0 && runScore % thresh === 0) levelUp();
                    }

                    if (obs.group.position.x < -20) { scene.remove(obs.group); obstacles.splice(i, 1); }
                }
                gridHelper.position.x -= GAME_SPEED; if(gridHelper.position.x <= -10) gridHelper.position.x = 0;
            }
        };

        const renderLoop = (time) => {
            requestAnimationFrame(renderLoop);

            // Jitter-free fixed timestep
            let dt = time - lastTime;
            lastTime = time;
            if (dt > 250) dt = 250; 
            accumulator += dt;

            while (accumulator >= FIXED_DT) {
                if (hitPauseTimer > 0) { hitPauseTimer--; }
                else { updatePhysics(); }
                accumulator -= FIXED_DT;
            }

            // Camera Parallax & Shake
            let targetFov = 60 + Math.min(combo * 2, 30);
            camera.fov += (targetFov - camera.fov) * 0.1;
            camera.updateProjectionMatrix();

            let targetX = 0; let targetY = 5;
            if(screenShake > 0) { targetX += (Math.random()-0.5) * screenShake * 0.1; targetY += (Math.random()-0.5) * screenShake * 0.1; screenShake--; }
            camera.position.x += (targetX - camera.position.x) * 0.1; 
            camera.position.y += (targetY - camera.position.y) * 0.1; 
            camera.lookAt(0, 5, 0);

            renderer.render(scene, camera);
        };

        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start Loop
        requestAnimationFrame(renderLoop);

        // Expose controls to React
        engineRef.current = {
            setTheme: update3DTheme,
            setHero: (id) => { activeHero = id; buildPlayerMesh(id); },
            jump: () => {
                if (internalState === 'PLAYING' && hitPauseTimer <= 0) {
                    playerVelocityY = DIFFICULTIES[activeDiff].jump;
                    playAudio('jump', Math.random()*100);
                    playerMesh.scale.set(0.6, 1.6, 0.6); 
                }
            },
            start: (lvl, diff, heroId) => {
                internalState = 'PLAYING'; activeDiff = diff; activeHero = heroId;
                currentLevel = lvl; runScore = 0; combo = 0;
                globalScore = (lvl <= MAX_THEME_LEVEL) ? lvl * 10 : 110 + (lvl - 11) * 20;
                frames = 0; hitPauseTimer = 0; playerVelocityY = 0; screenShake = 0;
                camera.fov = 60; camera.updateProjectionMatrix();

                obstacles.forEach(obs => scene.remove(obs.group)); obstacles = [];
                particles.forEach(p => scene.remove(p)); particles = [];
                
                update3DTheme(currentLevel); buildPlayerMesh(heroId);
                playerMesh.position.set(-5, 5, 0); playerMesh.scale.set(1,1,1); playerMesh.visible = true;

                if(scoreRef.current) scoreRef.current.innerText = globalScore;
                if(levelRef.current) levelRef.current.innerText = currentLevel;
                if(comboRef.current) comboRef.current.innerText = "0x";
                
                showDOMMsg(currentLevel > MAX_THEME_LEVEL ? `CHECKPOINT ${currentLevel}` : THEMES[Math.min(currentLevel, MAX_THEME_LEVEL)].name, THEMES[Math.min(currentLevel, MAX_THEME_LEVEL)].neon);
            },
            onGameOver: (finalGlobal, finalRun) => {
                setGameState('GAMEOVER');
                // The React component will handle score saving to avoid closure stale state
                engineRef.current.lastScores = { finalGlobal, finalRun, lvl: currentLevel };
            }
        };
    };

    // --- Audio Bridge ---
    const playAudio = (type, pitchOffset = 0) => {
        if (!soundEnabledRef.current || (!window.AudioContext && !window.webkitAudioContext)) return;
        if (!window.audioCtxInstance) window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = window.audioCtxInstance;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);

        if(type === 'jump') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(300 + pitchOffset, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if(type === 'score') {
            osc.type = 'square'; osc.frequency.setValueAtTime(800 + pitchOffset, now); osc.frequency.setValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if(type === 'coin') { 
            osc.type = 'sine'; osc.frequency.setValueAtTime(1200 + pitchOffset, now); osc.frequency.exponentialRampToValueAtTime(2400 + pitchOffset, now + 0.15);
            gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if(type === 'crash') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
        } else if(type === 'milestone') {
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const o = ctx.createOscillator(); const g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.type = 'sine'; o.frequency.value = freq;
                g.gain.setValueAtTime(0.15, now + i*0.08); g.gain.linearRampToValueAtTime(0, now + i*0.08 + 0.15);
                o.start(now + i*0.08); o.stop(now + i*0.08 + 0.15);
            });
        }
    };

    // --- Input Handling ---
    useEffect(() => {
        const handleInteraction = (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button')) return;
            if(e.type === 'keydown' && e.code !== 'Space') return;
            if(e.type !== 'mousedown') e.preventDefault(); // Stop zoom
            
            if(window.audioCtxInstance && window.audioCtxInstance.state === 'suspended') window.audioCtxInstance.resume();
            if (engineRef.current && gameState === 'PLAYING') engineRef.current.jump();
        };

        window.addEventListener('keydown', handleInteraction);
        document.addEventListener('mousedown', handleInteraction);
        document.addEventListener('touchstart', handleInteraction, {passive: false});

        return () => {
            window.removeEventListener('keydown', handleInteraction);
            document.removeEventListener('mousedown', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, [gameState]);

    // Handle Game Over Logic from Engine
    useEffect(() => {
        if(gameState === 'GAMEOVER' && engineRef.current && engineRef.current.lastScores) {
            const { finalGlobal, finalRun, lvl } = engineRef.current.lastScores;
            
            let newProfile = {...profile};
            newProfile.totalRuns += 1;
            newProfile.totalScore += finalRun;
            
            if(finalGlobal > newProfile.highScores[currentDiff]) {
                newProfile.highScores[currentDiff] = finalGlobal;
            }
            if(finalRun > (newProfile.levelHighScores[currentDiff][lvl] || 0)) {
                newProfile.levelHighScores[currentDiff][lvl] = finalRun;
            }
            
            saveProfile(newProfile);
            
            const gBest = Math.max(newProfile.highScores.easy, newProfile.highScores.medium, newProfile.highScores.hard);
            const unlocked = CHARACTERS.filter(c => c.req > (gBest - finalRun) && c.req <= gBest && c.req > 0);
            
            if(unlocked.length > 0) {
                setRecentlyUnlocked(unlocked);
                setTimeout(() => setGameState('UNLOCK'), 500);
            }
        }
    }, [gameState]);

    // --- UI Render ---
    const startGame = () => {
        const startLvl = Math.max(...(profile.unlockedLevels[currentDiff] || [0]));
        setGameState('PLAYING');
        engineRef.current.start(startLvl, currentDiff, selectedHeroId);
    };

    const confirmName = () => {
        if(!playerName) return;
        saveProfile({...profile, name: playerName});
        setGameState('START');
        if(engineRef.current) {
            engineRef.current.setHero(selectedHeroId);
            engineRef.current.setTheme(Math.max(...(profile.unlockedLevels[currentDiff] || [0])));
        }
    };

    const globalBest = Math.max(profile.highScores.easy, profile.highScores.medium, profile.highScores.hard);
    const startLvl = Math.max(...(profile.unlockedLevels[currentDiff] || [0]));
    const themeName = THEMES[Math.min(startLvl, MAX_THEME_LEVEL)]?.name || 'City';

    return (
        <div className="fixed inset-0 overflow-hidden bg-[#050510] font-sans text-white select-none">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 outline-none" />
            
            {!engineLoaded && (
                <div className="absolute inset-0 bg-gray-950 text-cyan-400 flex items-center justify-center text-2xl font-bold z-[100]">
                    Initializing Matrix...
                </div>
            )}
            
            {engineLoaded && (
                <>
                    {/* Top Controls */}
                    <div className="absolute top-4 right-4 z-50">
                        <button onClick={handleSoundToggle} className="w-12 h-12 rounded-full bg-black/50 border border-cyan-500/30 flex items-center justify-center backdrop-blur text-white hover:scale-110 transition-transform">
                            {soundEnabled ? <Volume2 /> : <VolumeX className="text-red-400"/>}
                        </button>
                    </div>

                    {/* HUD */}
                    <div className={`absolute top-4 left-4 right-20 flex justify-between z-40 transition-opacity duration-300 pointer-events-none ${gameState === 'PLAYING' ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-black/60 border border-cyan-500/30 px-4 py-2 rounded-xl backdrop-blur-md flex flex-col items-center shadow-lg">
                            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Score</span>
                            <span ref={scoreRef} className="text-xl font-black">0</span>
                        </div>
                        <div className="bg-black/60 border border-cyan-500/30 px-4 py-2 rounded-xl backdrop-blur-md flex flex-col items-center shadow-lg">
                            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Level</span>
                            <span ref={levelRef} className="text-xl font-black">0</span>
                        </div>
                        <div className="bg-black/60 border border-yellow-500/30 px-4 py-2 rounded-xl backdrop-blur-md flex flex-col items-center shadow-lg">
                            <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">Combo</span>
                            <span ref={comboRef} className="text-xl font-black text-yellow-400">0x</span>
                        </div>
                    </div>

                    {/* Floating DOM Message */}
                    <div ref={msgRef} className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black uppercase tracking-widest text-center pointer-events-none opacity-0 transition-opacity duration-200 z-50 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" />

                    {/* Screens Overlay */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
                        
                        {/* NAME SCREEN */}
                        {gameState === 'NAME' && (
                            <div className="bg-slate-900/90 border border-cyan-500/30 p-8 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col items-center text-center animate-in zoom-in duration-300 w-full max-w-sm">
                                <Orbit className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
                                <h1 className="text-3xl font-black text-cyan-400 uppercase tracking-widest mb-2">Initialize</h1>
                                <p className="text-gray-400 mb-6">Enter designation for telemetry.</p>
                                <input 
                                    type="text" 
                                    value={playerName}
                                    onChange={(e)=>setPlayerName(e.target.value)}
                                    placeholder="Agent Name" 
                                    className="w-full bg-black/50 border border-cyan-500/50 rounded-xl px-4 py-3 text-center text-xl text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30 mb-6 transition-all"
                                    maxLength={12}
                                />
                                <button onClick={confirmName} className="w-full bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold text-lg py-3 rounded-xl hover:bg-cyan-400 hover:text-black transition-all">Confirm</button>
                            </div>
                        )}

                        {/* START SCREEN */}
                        {gameState === 'START' && (
                            <div className="bg-slate-900/90 border border-cyan-500/30 p-6 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col items-center w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
                                <h1 className="text-3xl sm:text-4xl font-black text-cyan-400 uppercase tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">Flappy 3D</h1>
                                
                                <div className="flex gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10 mb-4">
                                    {['easy', 'medium', 'hard'].map(diff => (
                                        <button 
                                            key={diff}
                                            onClick={() => { setCurrentDiff(diff); engineRef.current.setTheme(Math.max(...(profile.unlockedLevels[diff]||[0]))); }}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${currentDiff === diff ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-gray-500 border border-transparent hover:text-gray-300'}`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>

                                <div className="w-full bg-black/40 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between mb-6 shadow-inner">
                                    <div className="text-left">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Current Sector</div>
                                        <div className="text-xl font-black text-cyan-300 drop-shadow-md">{startLvl > MAX_THEME_LEVEL ? 'CHK' : 'LVL'} {startLvl}: {themeName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Sector Best</div>
                                        <div className="text-xl font-black text-yellow-400">{profile.levelHighScores[currentDiff][startLvl] || 0}</div>
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
                                    {CHARACTERS.map(char => {
                                        const isLocked = !DEV_MODE_ALL_UNLOCKED && (globalBest < char.req);
                                        const isSelected = selectedHeroId === char.id;
                                        const IconTag = char.icon;
                                        return (
                                            <button 
                                                key={char.id}
                                                disabled={isLocked}
                                                onClick={() => { setSelectedHeroId(char.id); engineRef.current.setHero(char.id); }}
                                                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2
                                                    ${isLocked ? 'bg-black/60 border-gray-800 opacity-50 cursor-not-allowed' : 
                                                    isSelected ? 'bg-yellow-500/10 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] scale-105 z-10' : 
                                                    'bg-slate-800/60 border-slate-600 hover:border-cyan-400 hover:bg-cyan-500/10'}`}
                                            >
                                                <div className="w-10 h-10 mb-1 rounded-lg flex items-center justify-center" style={{ background: `radial-gradient(circle, ${char.c1}, ${char.c2})`, border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    <IconTag className="w-6 h-6 text-white drop-shadow-md" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-200">{char.name}</span>
                                                {isLocked && <span className="absolute bottom-1 text-[8px] font-black text-red-400 bg-black/80 px-1 rounded">{char.req}</span>}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button onClick={startGame} className="w-full py-4 text-xl font-black uppercase tracking-widest text-black bg-cyan-400 rounded-xl hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-105 transition-all mb-4">
                                    Launch Mission
                                </button>
                            </div>
                        )}

                        {/* GAME OVER SCREEN */}
                        {gameState === 'GAMEOVER' && (
                            <div className="bg-slate-900/90 border border-red-500/30 p-8 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col items-center w-full max-w-sm animate-in zoom-in duration-300">
                                <Skull className="w-16 h-16 text-red-500 mb-2 animate-pulse" />
                                <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">System Failure</h1>
                                
                                <div className="bg-black/50 border border-white/10 w-full rounded-xl py-6 mb-6">
                                    <div className="text-gray-400 text-sm font-bold uppercase mb-1">Data Recovered</div>
                                    <div className="text-5xl font-black text-white">{engineRef.current?.lastScores?.finalGlobal || 0}</div>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <button onClick={startGame} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 border border-red-500 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-black transition-all">
                                        <RotateCcw className="w-5 h-5" /> Reboot
                                    </button>
                                    <button onClick={()=>setGameState('START')} className="flex-1 py-3 bg-slate-800 border border-slate-600 text-gray-300 font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-all">
                                        Menu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* UNLOCK SCREEN */}
                        {gameState === 'UNLOCK' && recentlyUnlocked.length > 0 && (
                            <div className="bg-slate-900/95 border border-yellow-500/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.2)] backdrop-blur-md pointer-events-auto flex flex-col items-center w-full max-w-sm animate-in zoom-in duration-500">
                                <Trophy className="w-12 h-12 text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                <h1 className="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-6">Asset Acquired!</h1>
                                
                                {(() => {
                                    const char = recentlyUnlocked[0];
                                    const IconTag = char.icon;
                                    return (
                                        <>
                                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-white/20 mb-4 animate-bounce" style={{ background: `radial-gradient(circle, ${char.c1}, ${char.c2})`}}>
                                                <IconTag className="w-12 h-12 text-white drop-shadow-lg" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-1">{char.name}</h2>
                                            <p className="text-cyan-400 font-bold italic mb-8">"{char.tag}"</p>
                                            
                                            <button onClick={() => { setSelectedHeroId(char.id); engineRef.current.setHero(char.id); setRecentlyUnlocked(recentlyUnlocked.slice(1)); if(recentlyUnlocked.length<=1) setGameState('START'); }} className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all mb-3">
                                                Equip Asset
                                            </button>
                                            <button onClick={() => { setRecentlyUnlocked(recentlyUnlocked.slice(1)); if(recentlyUnlocked.length<=1) setGameState('START'); }} className="w-full py-3 bg-transparent border border-gray-600 text-gray-400 font-bold uppercase rounded-xl hover:text-white hover:border-gray-400 transition-all">
                                                Acknowledge
                                            </button>
                                        </>
                                    )
                                })()}
                            </div>
                        )}
                    </div>
                </>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.3); border-radius: 10px; }
            `}} />
        </div>
    );
}
