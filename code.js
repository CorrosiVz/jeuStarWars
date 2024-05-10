// Notion de Position par rapport à un point fixe
// C'est une valeur, donc non modifiable
class Position {
    #x; // Coordonne x de la position
    #y; // Coordonne y de la position

    // Construit une position à partir de 2 nombres
    constructor(x = 0, y = 0) {
        this.#x = x;
        this.#y = y;
    }

    // Acces en lecture aux attributs
    get x() { return this.#x; }
    get y() { return this.#y; }

    // Création d'une nouvelle position par translation
    shift(x, y) {
        return new Position(this.#x + x, this.#y + y);
    }

    // Création d'une nouvelle position à partir d'une vitesse et un temps
    move(speed, duration) {
        // Calcule le déplacement de la vitesse en fonction du temps
        let delta = speed.delta(duration);
        // calcule la nouvelle position
        return this.shift(delta.x, delta.y);
    }
};


// Notion de vitesse : nombre de pixels à bouger par secondes
class Speed {
    #x;     // distance à parcourir sur l'axe des X en 1 seconde
    #y;     // distance à parcourir sur l'axe des Y en 1 seconde
    #max;   // Vitesse maximum, doit être positive

    // Indique la vitesse maximum
    constructor(max) {
        if (max <= 0) {
            throw new Error("Vitesse maximum doit être positif");
        }
        this.#x = 1;
        this.#y = 0;
        this.#max = max;
    }

    // Stoppe sur les deux axes
    stop() {
        this.#x = 0;
        this.#y = 0;
    }

    // Vrai si la vitesse est nulle. 
    isStopped() {
        return this.#x == 0 && this.#y == 0;   
    }

    // Accelère si dx ou dy est positif ou freine si negatif
    change(dx, dy) {
        this.#x += dx;
        this.#y += dy;
        console.log(dx, dy, this.#x, this.#y, this);

        // Limite les vitesses
        if (this.#x > this.#max) {
            this.#x = this.#max;
        } else if (this.#x < - this.#max) {
            this.#x = - this.#max;
        }
        if (this.#y > this.#max) {
            this.#y = this.#max;
        } else if (this.#y < - this.#max) {
            this.#y = - this.#max;
        }
    }

    // Retourne une nouvelle instance de Speed avec les mêmes valeurs (pour la pause)
    cloneSpeed() {
        let cloneSp = new Speed(this.#max);
        cloneSp.#x = this.#x;
        cloneSp.#y = this.#y;
        return cloneSp;
    }

    // Calcule un déplacement en x et y à cette vitesse pour un temps donné
    // duration: Number, temps considéré en millisecondes
    // @return: un déplacement {x,y}
    delta(duration) {
        return { x: this.#x * duration / 1000, y: this.#y * duration / 1000 };
    }
}

// Fonction qui indique si on est en dehors des limites
const outOfLimit = (min, val, max) => val <= min ? true : (val >= max ? true : false);

// Fonction qui retourne une valeur entre deux bornes
const limit = (min, val, max) => val < min ? min : (val > max ? max : val);

///////////////////////////////////////////////////////////////
// Objet qui représente l'aire du jeu
///////////////////////////////////////////////////////////////

const playground = {
    // Objet DOM de l'aire de jeu
    DOM: window.document.getElementById("playground"),
}

// Initialiste la dimension de l'aire de jeu
playground.size = playground.DOM.getBoundingClientRect();


///////////////////////////////////////////////////////////////
// Notion de sprite
///////////////////////////////////////////////////////////////

class Sprite {
    id;             // l'Id du sprite, pour info
    #DOM;           // Objet DOM qui représente le sprite
    #pos;           // Position actuelle du sprite
    #speed;         // La vitesse de déplacement actuelle en pixels par seconde
    #size;          // Taille de l'objet { height, width }
    #isColliding;   // Vrai si le sprite est entré en collision avec un autre sprite
    #previousSpeed; // Vitesse du sprite laissé en mémoire avant stop
    constructor(id) {
        this.id = id;
        // Recherche l'élément DOM
        const DOM = document.getElementById(id);
        // Vérifie qu'il existe
        if (DOM == null) {
            throw new Error('HTML object '+id+' not found');
        }
        // Crée un objet DOM pour l'afficher
        this.#DOM = DOM.cloneNode();
        // Supprime l'attribut id
        this.#DOM.setAttribute("id", "");
        // Place l'objet dans la DOM
        playground.DOM.appendChild(this.#DOM);
        // Initialise sa position relative
        this.#pos = new Position(0, 0);
        // Vitesse en pixels par secondes : objet initialement immobile
        this.#speed = new Speed(502);
        // Calcule sa taille
        this.#size = this.#DOM.getBoundingClientRect();
        // Indique si le sprite est déjà entré en collision
        this.#isColliding = false;
    };

    // Place le sprite à une position p donnée
    set pos(p) {
        // Empeche de sortir de l'aire de jeux
        let minX = - this.#size.width;
        let minY = - this.#size.height;
        let maxX = playground.size.width;
        let maxY = playground.size.height;
        let pos = new Position(limit(minX, p.x, maxX), limit(minY, p.y, maxY));
        this.#DOM.style.left = pos.x + "px";
        this.#DOM.style.top = pos.y + "px";
        this.#pos = pos;
    };

    get pos() {
        return this.#pos;
    }

    get size() {
        return this.#size;
    }

    stop() {
        this.#speed.stop();
    }

    setPauseSprite() {
        // On stocke la vitesse actuelle avant la pause
        this.#previousSpeed = this.#speed.cloneSpeed();
        console.log("Vitesse sauvegardée", this.#previousSpeed);
        this.#speed.stop();
    }

    resumeSprite() {
        // Rétablit la vitesse à la valeur stockée avant la pause
        if (this.#previousSpeed) {
            this.#speed = this.#previousSpeed;
            console.log("Vitesse rétablie", this.#speed);
            this.#previousSpeed = null;
        }
    }

    isStopped() {
        return this.#speed.isStopped();
    }

    get speed() {
        return this.#speed;
    }

    // Change la vitesse du sprite par des incréments
    changeSpeed(dx, dy) {
        this.#speed.change(dx, dy);
    }

    // Change sa position pour la nouvelle frame en fonction de sa vitesse
    update(duration) {
        // Deplace la position en fonction de la vitesse et du temps
        this.pos = this.#pos.move(this.#speed, duration);

        if (this.id === "R2D2") {
            // R2D2 ne doit pas (visuellement) sortir de l'écran
            let minX = 0;
            let minY = 0;
            let maxX = playground.size.width - this.#size.width;
            let maxY = playground.size.height - this.#size.height;
            this.pos = new Position(limit(minX, this.#pos.x, maxX), limit(minY, this.#pos.y, maxY));
        }
    };

    // Getter de la hitbox du sprite
    getHitbox(pos) {
        // pos n'est pas fourni, on utilise la pos actuelle du sprite
        if (pos === undefined) {
            pos = this.#pos;
        }

        return new Rectangle(pos, this.#size);
    }

    hide() {
        this.#DOM.style.display = "none";
    }

    show() {
        this.#DOM.style.display = "block";
    }

    // Remet le sprite à sa position initiale
    reset() {
        this.stop();
        let x = playground.size.width * Math.random();
        this.pos = new Position(x, -this.size.height);
        this.changeSpeed(3, 203);
        this.isColliding = false;
    }

    // Remet le Joueur à sa position initiale
    resetPlayer() {
        this.stop();
        let x = playground.size.width / 2;
        let y = playground.size.height - this.size.height;
        this.pos = new Position(x, y);
        this.changeSpeed(0, 0);
    }
}

class Plane extends Sprite {
    // Temps avant un démmarage
    waitingTime;
    constructor(id) {
        super(id);
        this.waitingTime=0;
    }

    // Démarre l'avion du haut de l'écran 
    start() {
        // Choisit une position x random
        let x = playground.size.width * Math.random();
        this.pos = new Position(x, -this.size.height);
        this.changeSpeed(3, 203);
        console.log(this.id, 'start')
    }

    // Vrai si le sprite a atteint de bas de l'aire de jeux
    isAtBottom() {
        return this.pos.y >= playground.size.height;
    }

    update(duration) {
        super.update(duration);
        // Regarde si le sprite a disparu au bas de l'écran
        if (this.isAtBottom() && ! this.isStopped()) {
            // Arrete le sprite
            this.stop();
            // Place un temps d'attende avant de redémmarer
            this.waitingTime = 60;
        }
        // Si le sprite est arrété, attend puis redémmare
        if (this.isStopped() && game.pause === false) {
            this.waitingTime -= duration;
            if (this.waitingTime <= 0) {
                this.waitingTime = 0;
                this.show(); // Affiche le sprite si il avait été touché auparavant
                this.start();
            }
        }
    }
}

///////////////////////////////////////////////////////////////
// Hitbox
///////////////////////////////////////////////////////////////

class Rectangle {
    #position; // Position de la hitbox
    #size;    // Taille de la hitbox
    constructor(position, size) {
        this.#position = position;
        this.#size = size;
    }

    // Vérifie si deux rectangles(hitbox) entre en collision
    areIntersecting(rectangle) {
        return this.#position.x < rectangle.#position.x + rectangle.#size.width &&
               this.#position.x + this.#size.width > rectangle.#position.x &&
               this.#position.y < rectangle.#position.y + rectangle.#size.height &&
               this.#position.y + this.#size.height > rectangle.#position.y;
    }

    // Vérifie si un sprite est contenu dans un autre sprite
    isInside(r) {
        return this.#position.x >= r.#position.x &&
               this.#position.y >= r.#position.y &&
               this.#position.x + this.#size.width <= r.#position.x + r.#size.width &&
               this.#position.y + this.#size.height <= r.#position.y + r.#size.height;
    }
}

///////////////////////////////////////////////////////////////
// Score
///////////////////////////////////////////////////////////////

class Score {
    id;
    #DOM;
    #value;
    constructor(id) {
        this.#value = 0;
        this.#DOM = document.getElementById(id);
    }

    // Getter de la valeur du score
    get value() {
        return this.#value;
    }

    setValue(value) {
        this.#value = value;
        this.updateDisplay();
    }

    // Ajoute un nombre de points au score
    increaseScore(value) {
        this.#value += value;
        this.updateDisplay();
    }

    // Retire un nombre de points au score
    decreaseScore(value) {
        this.#value -= value;
        if (this.#value < 0) this.#value = 0; // Pas de score négatif
        this.updateDisplay();
    }

    // Met à jour l'affichage du score
    updateDisplay() {
        this.#DOM.innerHTML = 'Score: ' + this.#value;
    }

    // Remet le score à zéro
    reset() {
        this.#value = 0;
        this.updateDisplay();
    }
}

///////////////////////////////////////////////////////////////
// Timer
///////////////////////////////////////////////////////////////

// Ajout d'un Timer de 3min pour la partie
class Timer {
    id;
    #minutes; //mémo : suppr?
    #secondes;//mémo : suppr?

    constructor(id, minutes, secondes) {
        this.id = id;
        this.minutes = minutes;
        this.secondes = secondes;
    }

    getTimer() {
        console.log(this.minutes + ":" + this.secondes);
        return this.minutes + ":" + this.secondes;
    }

    timer () { 
        let self = this; // stocker une référence à this
        let timerDisplay = document.getElementById("timer");
        timerDisplay.textContent = this.minutes + ":" + (this.secondes<10 ? "0":"") + this.secondes;
    
        if (this.minutes == 0 && this.secondes == 0) { // si le temps est écoulé : arrêt du jeu
            game.stop();
            clearTimeout(this.timeoutID);
        } else if (this.secondes == 0) { 
            this.minutes -= 1;
            this.secondes = 59;
        } else {
            this.secondes -= 1;
            // console.log("je décrémente", this.minutes, this.secondes);
        }

        if (game.run === true && game.pause === false) {
            // console.log("setTimeout a été appelé !");
            this.timeoutID = setTimeout(()=>self.timer(), 1000);
        }
    }

    // Incrémenter le timer d'1 seconde
    incrementTimer1s() {
        if (this.secondes < 59) {
            this.secondes += 1;
        } else {
            this.secondes = 0;
            this.minutes += 1;
        }
        document.getElementById("timer").textContent = this.minutes + ":" + this.secondes;
    }

    // Arrête le timer
    stop() {
        clearTimeout(this.timeoutID);
    }

    // Remet le timer à zéro
    reset() {
        this.stop();
        this.minutes = 0;
        this.secondes = 40;
    }
}

///////////////////////////////////////////////////////////////
// Barre de vie
///////////////////////////////////////////////////////////////

class LifeBar {
    constructor(life) {
        this.life = life;
    }
    
    lifeSet () {
        let lifeDisplay = document.getElementById("life");
        lifeDisplay.textContent = this.life;
        
        //Si R2D2 touche DarthVador on perds une vie
        //refaire méthode areIntersecting pour DarthVador ? comment l'identifier parmi tous les sprites ?
    
        //si on touche une croix ou coeur on gagne une vie
        // 🔋 ❤️
    }

    loseLife () {
        let lifeArray = Array.from(this.life);
        if (lifeArray.length > 1){
            lifeArray.pop();
            lifeArray.pop(); // Pour enlever le 2ème coeur de la séquence de caractère unicode de l'émoji coeur
            this.life = lifeArray.join("");
        } else {
            this.life = "";
            game.stop();
        }
        this.lifeSet();
    }

    resetLife() {
        this.life = "❤️❤️❤️";
        this.lifeSet();
    }
}

///////////////////////////////////////////////////////////////
// Codage du Jeux
///////////////////////////////////////////////////////////////

let game = {
    run: false,
    pause: false,
    tFrameLast: 0,
    pauseTime: null,
    r2d2: new Sprite("R2D2"),
    sprites: [],
};



// Mise à jour du jeux à la date indiquée
game.update = function (tFrame) {
    if (this.pause === false) {
        // Calcule la durée qui s'est passé apres la frame précédente
        let duration = tFrame - this.tFrameLast;
        // Met à jour le temps précédent
        this.tFrameLast = tFrame;
        // Déplace le robot
        game.r2d2.update(duration);
        // Déplace les autres objets
        for (let sprite of this.sprites) {
            sprite.update(duration);
        }

        // Vérifie les collisions entre R2D2 et tous les autres sprites
        let r2d2Hitbox = game.r2d2.getHitbox();
        for (let sprite of this.sprites) {
            let spriteHitbox = sprite.getHitbox();
            if (r2d2Hitbox.areIntersecting(spriteHitbox)) {
                if (!sprite.isColliding) {
                    console.log("Collision detected between R2D2 and a sprite!");
                    sprite.isColliding = true;
                    // Ajout ou diminution du score en fonction du vaisseau touché
                    switch (sprite.id) {
                        case "x_wing":
                            game.score.increaseScore(10);
                            break;
                        case "naboo_starfighter":
                            game.score.increaseScore(20);
                            break;
                        case "obi_wan_starfighter":
                            game.score.increaseScore(30);
                            break;
                        case "anakin_starfighter":
                            game.score.increaseScore(50);
                            break;
                        case "darthvader":
                            game.score.decreaseScore(75);
                            game.startLifeBar.loseLife();
                            break;
                        }
                    // Disparition de l'avion
                    sprite.hide(); // Cache le sprite jusqu'à la prochaine vague
                }
            } else {
                sprite.isColliding = false;
            }
        }
    }
}

// Reaction du jeux à l'enfoncement d'une touche
game.onkeydown = function (key) {
    const delta = 10;
    // On ne peut pas changer la vitesse de r2d2 si la partie n'est pas en cours
    if (game.run) {
        if (key === "s") {
            game.stop();
        }
        if (!game.pause) {
            switch (key) {
                case "ArrowLeft":
                    game.r2d2.changeSpeed(-delta, 0);
                    break;
                case "ArrowUp":
                    game.r2d2.changeSpeed(0, -delta);
                    break;
                case "ArrowRight":
                    game.r2d2.changeSpeed(delta, 0);
                    break;
                case "ArrowDown":
                    game.r2d2.changeSpeed(0, delta);
                    break;
                case " ":
                    console.log("Game paused");
                    game.setPause();
                    break;
                default:
                    if (key !== "Shift" && key !== "s" && key !== " ") {
                        console.log(key);
                    }
            }
        } else if (game.pause) {
            if (key === " ") {
                console.log("Game resumed");
                game.resume();
            }
        }
    } else {
        console.log("La partie n'est pas en cours !");
        return;
    }
}

// Installe la lecture des caractères
window.onkeydown = function (e) {
    game.onkeydown(e.key);
}

// tFrame est le temps d'appel de l'animation passé à main en ms
function main(tFrame) {
    game.stopMain = window.requestAnimationFrame(main);
    if (!game.run) {
        window.cancelAnimationFrame(game.stopMain);
        console.log("Game over");
    } else {
        game.update(tFrame);
    }
}

// Démmare le jeu
game.start = function () {
    document.getElementById("start-menu").style.display = "none";
    this.run = true;
    this.startTimer.timer();
    this.startLifeBar.lifeSet();
    this.tFrameLast = 0;
    // lance tous les sprites
    for(sprite of this.sprites) {
        sprite.start();
    }
    main(0); // Début du cycle
}

// Gestion de la pause du jeu
game.setPause = function () {
    this.r2d2.setPauseSprite();
    for (let sprite of this.sprites) {
        sprite.setPauseSprite();
    }
    this.pause = true;
    this.startTimer.incrementTimer1s();
    this.pauseTime = new Date();
    
    document.getElementById("actual-score").textContent = "Score: " + this.score.value;
    document.getElementById("pause-menu").style.display = "flex";
}
game.resume = function () {
    // On remet les vitesses des sprites à leur valeur avant la pause
    this.r2d2.resumeSprite();
    for (let sprite of this.sprites) {
        sprite.resumeSprite();
    }
    this.pause = false;
    if (this.pauseTime) {
        let pauseDuration = new Date() - this.pauseTime;
        this.tFrameLast += pauseDuration;
        this.pauseTime = null;
    }
    // On ne veut pas perdre une seconde quand on sort de la pause
    this.startTimer.incrementTimer1s();
    // this.startTimer.getTimer();
    this.startTimer.timer();
    document.getElementById("pause-menu").style.display = "none";
}

game.reset = function () {
    // Remet à zéro le score
    this.score.reset();
    // Remet à zéro le timer
    this.startTimer.reset();
    // Remet la barre de vie à 3 coeurs
    this.startLifeBar.resetLife();
    // Remet en place le robot R2D2 (Joueur)
    this.r2d2.resetPlayer();
    // Remet le compteur de pause à null (si le jeu s'arrête alors que pause est toujours true)
    this.pauseTime = null;
}

game.stop = function () {
    console.log("game.stop() a été appelé !");
    this.run = false;
    this.pause = false;
    this.startTimer.stop();
    // Affiche le score avant de le réinitialiser pour la prochaine partie
    document.getElementById("final-score").textContent = "Score: " + this.score.value;
    this.checkBestScore();
    document.getElementById("game-over-menu").style.display = "flex"; // Affiche la fenêtre Game Over
    document.getElementById("pause-menu").style.display = "none"; // Cache la fenêtre Pause
    this.reset();
}
game.goToMenu = function () {
    document.getElementById("game-over-menu").style.display = "none"; // Cache la fenêtre Game Over
    document.getElementById("start-menu").style.display = "flex"; // Affiche le menu principal
}
game.returnToMenu = function () {
    document.getElementById("pause-menu").style.display = "none"; // Cache la fenêtre Pause
    document.getElementById("start-menu").style.display = "flex"; // Affiche le menu principal
    this.run = false;
    this.pause = false;
    this.startTimer.stop();
    this.reset();
}
game.restart = function () {
    document.getElementById("game-over-menu").style.display = "none";
    game.start();
}
game.checkBestScore = function () {
    if (this.score.value > this.bestScore.value) {
        this.bestScore.setValue(this.score.value);
        // console.log("Nouveau meilleur score : " + this.bestScore.value);
    }
    document.getElementById("best-score").textContent = "Meilleur Score obtenu durant cette session : " + this.bestScore.value;
}
game.init =  function () {
    // Attend l'initialisation des autres sprites
    this.r2d2.resetPlayer();

    this.bestScore = new Score("best-score");
    this.bestScore.value = 0;
    this.score = new Score("score");
    
    this.startTimer = new Timer("startTimer",3,0);

    this.startLifeBar = new LifeBar("❤️❤️❤️");

    let sprite = new Plane("x_wing");
    game.sprites.push(sprite);

    sprite = new Plane("anakin_starfighter");
    game.sprites.push(sprite);

    sprite = new Plane("naboo_starfighter");
    game.sprites.push(sprite);

    sprite = new Plane("obi_wan_starfighter");
    game.sprites.push(sprite);

    sprite = new Plane("darthvader");
    game.sprites.push(sprite);

}

// L'initialisation est asynchrone donc il faut attendre
// que toutes les images soient chargées donc on
// s'acroche à l'événement load de window
window.addEventListener("load", () => {game.init();})
window.addEventListener("load", () => {document.getElementById("start-button").addEventListener("click", () => game.start());})
window.addEventListener("load", () => {document.getElementById("replay-button").addEventListener("click", () => game.restart());})
// Retour au menu principal
window.addEventListener("load", () => {document.getElementById("menu-button").addEventListener("click", () => game.goToMenu());})
// Pause du jeu
window.addEventListener("load", () => {document.getElementById("resume-button").addEventListener("click", () => game.resume());})
window.addEventListener("load", () => {document.getElementById("return-menu-button").addEventListener("click", () => game.returnToMenu());})
