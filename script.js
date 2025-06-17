document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTES ---
    const GRAVITY = 0.7;
    const JUMP_FORCE = -18;
    const ANIMATION_SPEED = 150;
    const SHARKS_WALK_SPEED = 160; // Velocidade um pouco mais lenta para reduzir o "sumiço"

    // --- ELEMENTOS DO DOM ---
    const dom = {
        charSelectScreen: document.getElementById('character-select-screen'),
        gameScreen: document.getElementById('game-screen'),
        selectionTitle: document.getElementById('selection-title'),
        characterGrid: document.getElementById('character-grid'),
        messageBox: document.getElementById('message-box'),
        messageText: document.getElementById('message-text'),
        playAgainBtn: document.getElementById('play-again-btn'),
    };

    // --- DADOS E IMAGENS ---
    // ATUALIZADO: Usando caminhos de arquivos locais.
    // Garanta que você tenha uma pasta chamada 'img' no mesmo nível do seu 'index.html'
    // e que os nomes dos arquivos dentro dela estejam corretos.
    const characters = {
        shark: { 
            name: 'Sharks', 
            portrait: 'img/sharks.png', 
            spriteSheet: 'img/sharks.png',
            walkSprites: ['img/sharks1.png', 'img/sharks2.png', 'img/sharks3.png', 'img/sharks4.png', 'img/sharks5.png'],
            idleSprite: 'img/sharks1.png'
        },
        alligator: { name: 'Alligators', portrait: 'img/alli.png', spriteSheet: 'img/alli.png' },
        eagle: { name: 'Eagles', portrait: 'img/wagles.png', spriteSheet: 'img/wagles.png' },
        wolf: { name: 'Wolves', portrait: 'img/wolfs.png', spriteSheet: 'img/wolfs.png' }
    };

    // --- ESTADO DO JOGO ---
    let state = { selectingFor: 'p1', p1_character: null, p2_character: null, gameActive: false, keys: {} };
    let player1, player2, lastTime = 0;
    let preloadedImages = {}; // Cache para imagens pré-carregadas

    // --- PRELOAD DE IMAGENS ---
    function preloadSharksSprites() {
        const sharksSprites = [
            'img/sharks1.png', 'img/sharks2.png', 'img/sharks3.png', 
            'img/sharks4.png', 'img/sharks5.png'
        ];
        
        sharksSprites.forEach(src => {
            const img = new Image();
            img.src = src;
            preloadedImages[src] = img;
        });
    }

    // --- INICIALIZAÇÃO ---
    function initCharSelect() {
        dom.characterGrid.innerHTML = '';
        Object.keys(characters).forEach(key => {
            const char = characters[key];
            const card = document.createElement('div');
            card.className = 'character-card border-gray-600 rounded-lg p-2 cursor-pointer';
            card.dataset.charKey = key;
            card.innerHTML = `<img src="${char.portrait}" alt="${char.name}" class="portrait" onerror="this.src='https://placehold.co/300x256/2d3748/ffffff?text=Erro+no+Caminho'"><h3 class="text-xl mt-2">${char.name}</h3>`;
            card.addEventListener('click', () => selectCharacter(key, card));
            dom.characterGrid.appendChild(card);
        });
    }

    function selectCharacter(charKey, card) {
        if (state.selectingFor === 'p1' && state.p2_character !== charKey) {
            document.querySelector('.selected-p1')?.classList.remove('selected-p1');
            state.p1_character = charKey;
            card.classList.add('selected-p1');
            dom.selectionTitle.textContent = 'Jogador 2: Escolha seu Lutador';
            dom.selectionTitle.style.color = '#3b82f6';
            state.selectingFor = 'p2';
        } else if (state.selectingFor === 'p2' && state.p1_character !== charKey) {
            document.querySelector('.selected-p2')?.classList.remove('selected-p2');
            state.p2_character = charKey;
            card.classList.add('selected-p2');
            setTimeout(startGame, 1000);
        }
    }

    function startGame() {
        dom.charSelectScreen.classList.add('hidden');
        dom.gameScreen.classList.remove('hidden');
        player1 = createPlayer('p1', state.p1_character);
        player2 = createPlayer('p2', state.p2_character);
        resetGame();
        state.gameActive = true;
        requestAnimationFrame(gameLoop);
    }
    
    function createPlayer(id, charKey) {
        const player = {
            id, charKey,
            element: document.getElementById(id === 'p1' ? 'player1' : 'player2'),
            healthElement: document.getElementById(`${id}-health`),
            specialElement: document.getElementById(`${id}-special`),
            nameElement: document.getElementById(`${id}-name`),
            x: 0, y: 0, velocityY: 0, direction: 1,
            isAttacking: false, attackCooldown: false,
            animation: { state: 'idle', frame: 0, timer: 0 },
            walkSpriteIndex: 0
        };
        player.spriteElement = player.element.querySelector('.sprite');
        
        // Inicializar sprite baseado no personagem
        if (charKey === 'shark') {
            player.spriteElement.classList.add('individual-sprite');
            player.spriteElement.style.backgroundImage = `url(${characters[charKey].idleSprite})`;
        } else {
            player.spriteElement.classList.add('sprite-sheet');
            player.spriteElement.style.backgroundImage = `url(${characters[charKey].spriteSheet})`;
        }
        
        player.nameElement.textContent = characters[charKey].name;
        return player;
    }
    
    function resetGame() {
        Object.assign(player1, { health: 100, special: 0, x: 100, y: 0, velocityY: 0, direction: 1 });
        Object.assign(player2, { health: 100, special: 0, x: dom.gameScreen.offsetWidth - 250, y: 0, velocityY: 0, direction: -1 });
        [player1, player2].forEach(p => {
            p.healthElement.style.width = '100%';
            p.specialElement.style.width = '0%';
            p.element.style.transform = `scaleX(${p.direction})`;
        });
    }

    // --- GAME LOOP ---
    function gameLoop(timestamp) {
        if (!state.gameActive) return;
        const deltaTime = timestamp - (lastTime || timestamp);
        lastTime = timestamp;

        updatePlayer(player1, player2, { moveLeft: 'a', moveRight: 'd', jump: 'w', attack: 's', special: 'e' }, deltaTime);
        updatePlayer(player2, player1, { moveLeft: 'arrowleft', moveRight: 'arrowright', jump: 'arrowup', attack: 'arrowdown', special: '.' }, deltaTime);
        
        requestAnimationFrame(gameLoop);
    }

    function updatePlayer(player, opponent, controls, deltaTime) {
        let moving = false;
        if (state.keys[controls.moveLeft]) { player.x -= 5; player.direction = -1; moving = true; }
        if (state.keys[controls.moveRight]) { player.x += 5; player.direction = 1; moving = true; }
        
        // Atualizar estado da animação
        const previousState = player.animation.state;
        
        if (player.isAttacking) {
            // Manter estado de ataque enquanto está atacando
            player.animation.state = 'attack';
        } else if (player.y < 0) {
            player.animation.state = 'jump';
        } else if (moving) {
            player.animation.state = 'walk';
        } else {
            player.animation.state = 'idle';
        }
        
        // Reset da animação quando muda de estado - apenas para Sharks
        if (previousState !== player.animation.state && player.charKey === 'shark') {
            if (player.animation.state === 'idle' || player.animation.state === 'walk') {
                player.walkSpriteIndex = 0;
                // Aplicar imediatamente a sprite correta para evitar "piscadas"
                if (player.animation.state === 'idle') {
                    player.spriteElement.style.backgroundImage = `url(${characters.shark.idleSprite})`;
                } else if (player.animation.state === 'walk') {
                    player.spriteElement.style.backgroundImage = `url(${characters.shark.walkSprites[0]})`;
                }
            }
        }
        
        if (state.keys[controls.jump] && player.y === 0) player.velocityY = JUMP_FORCE;
        player.y += player.velocityY;
        player.velocityY += GRAVITY;
        if (player.y > 0) { player.y = 0; player.velocityY = 0; }

        handleAttack(player, opponent, controls.attack);
        handleSpecialAttack(player, opponent, controls.special);
        
        player.x = Math.max(0, Math.min(player.x, dom.gameScreen.offsetWidth - player.element.offsetWidth));
        player.element.style.left = `${player.x}px`;
        player.element.style.bottom = `${-player.y}px`;
        player.element.style.transform = `scaleX(${player.direction})`;
        
        animatePlayer(player, deltaTime);
    }

    function animatePlayer(player, deltaTime) {
        player.animation.timer += deltaTime;
        
        // Usar velocidade específica para Sharks na animação de caminhada
        const animSpeed = (player.charKey === 'shark' && player.animation.state === 'walk') 
            ? SHARKS_WALK_SPEED 
            : ANIMATION_SPEED;
            
        if (player.animation.timer < animSpeed) return;

        player.animation.timer = 0;
        
        // Animação específica para o personagem Sharks
        if (player.charKey === 'shark') {
            if (player.animation.state === 'walk') {
                player.walkSpriteIndex = (player.walkSpriteIndex + 1) % characters.shark.walkSprites.length;
                const newSprite = characters.shark.walkSprites[player.walkSpriteIndex];
                // Aplicar a mudança de sprite de forma mais direta
                player.spriteElement.style.backgroundImage = `url(${newSprite})`;
            } else if (player.animation.state === 'idle') {
                player.spriteElement.style.backgroundImage = `url(${characters.shark.idleSprite})`;
                player.walkSpriteIndex = 0; // Reset walking animation
            } else if (player.animation.state === 'jump') {
                // Usar a primeira sprite de caminhada para o pulo
                player.spriteElement.style.backgroundImage = `url(${characters.shark.walkSprites[0]})`;
            } else if (player.animation.state === 'attack') {
                // Usar a última sprite de caminhada para o ataque
                player.spriteElement.style.backgroundImage = `url(${characters.shark.walkSprites[characters.shark.walkSprites.length - 1]})`;
                // O estado de ataque será resetado automaticamente pela função handleAttack após 300ms
            }
        } else {
            // Animação original para outros personagens
            player.animation.frame++;
            
            let row = 0, frames = 1, loops = true;
            if (player.animation.state === 'walk') { row = 1; frames = 4; }
            if (player.animation.state === 'attack') { row = 1; frames = 2; loops = false; }
            if (player.animation.state === 'jump') { row = 1; frames = 1; }

            if (player.animation.frame >= frames) {
                if (loops) {
                    player.animation.frame = 0;
                } else {
                    player.animation.frame = frames - 1;
                    if (player.animation.state === 'attack') {
                        player.animation.state = 'idle';
                    }
                }
            }
            
            player.spriteElement.style.left = `${player.animation.frame * -100}%`;
            player.spriteElement.style.top = `${row * -100}%`;
        }
    }

    const isColliding = (a, d) => a.x < d.x + d.element.offsetWidth && a.x + a.element.offsetWidth > d.x && Math.abs(a.y - d.y) < 100;

    function handleAttack(attacker, defender, attackKey) {
        if (state.keys[attackKey] && !attacker.isAttacking && !attacker.attackCooldown) {
            attacker.isAttacking = true;
            attacker.attackCooldown = true;
            attacker.animation.state = 'attack';
            attacker.animation.frame = 0;
            
            if (isColliding(attacker, defender)) {
                takeDamage(defender, 10);
                chargeSpecial(attacker, 15);
            }
            setTimeout(() => attacker.isAttacking = false, 300);
            setTimeout(() => attacker.attackCooldown = false, 500);
        }
    }

    function handleSpecialAttack(attacker, defender, specialKey) {
        if (state.keys[specialKey] && attacker.special >= 100 && !attacker.isAttacking) {
            attacker.special = 0;
            attacker.specialElement.style.width = '0%';
            attacker.element.classList.add('special-attack-effect');
            
            if (isColliding(attacker, defender)) takeDamage(defender, 30);
            
            setTimeout(() => attacker.element.classList.remove('special-attack-effect'), 600);
        }
    }
        
    function takeDamage(player, amount) {
        player.health = Math.max(0, player.health - amount);
        player.healthElement.style.width = `${player.health}%`;
        player.element.classList.add('damage-flash');
        setTimeout(() => player.element.classList.remove('damage-flash'), 300);
        if (player.health <= 0) endGame(player === player1 ? player2 : player1);
    }
    
    function chargeSpecial(player, amount) {
        player.special = Math.min(100, player.special + amount);
        player.specialElement.style.width = `${player.special}%`;
    }

    function endGame(winner) {
        state.gameActive = false;
        dom.messageText.textContent = `${characters[winner.charKey].name} VENCEU!`;
        dom.messageBox.style.display = 'flex';
        setTimeout(() => dom.messageBox.style.opacity = 1, 10);
    }
    
    dom.playAgainBtn.addEventListener('click', () => {
        dom.messageBox.style.opacity = 0;
        setTimeout(() => {
             dom.messageBox.style.display = 'none';
             dom.gameScreen.classList.add('hidden');
             dom.charSelectScreen.classList.remove('hidden');
             state.selectingFor = 'p1';
             state.p1_character = null;
             state.p2_character = null;
             dom.selectionTitle.textContent = 'Jogador 1: Escolha seu Lutador';
             dom.selectionTitle.style.color = '#facc15';
             document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected-p1', 'selected-p2'));
        }, 500);
    });

    window.addEventListener('keydown', (e) => { state.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { state.keys[e.key.toLowerCase()] = false; });
    
    // Inicializar preload das sprites e seleção de personagens
    preloadSharksSprites();
    initCharSelect();
});