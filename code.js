///////////////////////////////////////////////////////////////
// Consignes
///////////////////////////////////////////////////////////////
/* 1. Le but de ce TP est de réaliser un jeux d'arcade à l'aide de la notion de sprite étudiée dans les TP
précédents. L'analyse et le codage seront démarré lors de ce TP et devront etre poursuivit jusqu'au rendu
prévu le vendredi 10 mai au plus tard.
- Le thème est imposé : l'univers de StarWar avec au moins un niveau avec le robot R2D2 qui se bat contre des vaisseaux.
- La technologie est imposée : manipuler les attributs d'objets DOM pour l'animation. La base fournie par ce TP
  est aussi imposée.
2. L'objectif est de réaliser un jeux complet avec la notion de Sprite. Une proposition de jeux est de faire "voler"
des avions disponibles ici :

x_wing.png
anakin_starfighter.png
naboo_starfighter.png
obi_wan_starfighter.png

Un objectif possible du jeux est de faire bouger le robot pour qu'il "attrape" les avions. Il doit cependant
eviter darthvader.png. Chaque avion vaut un certain nombre de points, "darthvader" fait diminuer ce nombre de
points. Le jeux se termine apres en temps donné, par exemple 3 minutes.
Attention : la création d'un objet DOM avec une nouvelle image demande un temps de chargement pour avoir accès
à l'image. Le chargement se fait de manière asynchrone.

3. Gestion des collisions
Le jeux doit principalement faire "voler" des avions dans l'aire de jeux, et les faire attraper par le robot.
La manière simple ne gérer ces collissions c'est de définir un masque de collision appelé aussi hit box.
Pour simplifier, nous faisont l'hypothèse que la hitbox est de forme rectangulaire. La collision devient alors
un calcul plus simple d'intersection de rectangles.
Pour trouver la formule du calcul de l'intersection, il faut considérer que les rectangles sont parallèles aux
axes X et Y. Cela revient alors à calculer l'intersection de segments sur chaque axe.
Il peut être plus facile de calculer la formule lorsqu'il n'y a pas d'intersection

Il n'y a pas d'intersection entre deux rectangle R1 et R2 de point haut gauche égal à (x1,y1) et (x2,y2) et de
taille (w1,h1) et (w2,h2) si au moins l'une des conditions suivante est vraie pour l'axe des X :

R2 est à droite de R1, donc x2 > x1+w1
R2 est à gauche de R1 donc x2+w2 < x1
On fait de même sur l'axe des Y pour trouver la formule finale de collision.

Définir la notion de rectangle, par exemple à l'aide d'une position et d'une taille en 2 dimensions.
Rectangle(position,size)
La position est un objet avec les coordonnées x et y. La taille en 2D est un objet avec une longeur et une hauteur :
Coder la méthode areIntersecting qui retourne vrai s'il y a une intersection entre deux rectangles.
Il s'agit d'une méthode de la classe Rectangle

Ajouter aux objets Sprite, la méthode qui retourne le Rectangle de la hitbox de l'objet.
Nous allons nous servir de cette méthode pour savoir si un mouvement du sprite peut provoquer une collision.
Cette méthode doit donc fonctionner en simulant un mouvement, donc en lui fournissant une position potentielle
pos en paramètre. Si cette valeur n'est pas fournie, alors c'est la position actuelle de l'objet qui est utilisée.
Cette méthode peut donc s'utiliser de deux manières : avec ou sans paramètre. Pour détecter cela,
il suffit de tester si le paramètre est égal à la valeur undefined.
De cette manière sous avons simulé la notion de surchage.

Selon votre analyse, vous pouvez être amené à savoir si un sprite est contenu dans un autre.
Dans ce cas, vous pouvez coder la méthode isInside qui retourne vrai si l'objet auquel on applique la méthode,
est à l'interieur du rectangle r. Il s'agit d'une méthode d'une instance de Rectangle.

4. Codage du jeux

Le jeux fonctionne avec le principe du rafraichissement synchonisé. Par exemple si le taux de rafraichissement est
de 60Hz, alors il faut faire évoluer le jeux 60 fois par secondes. Pour cela vous devez utiliser la fonction
window.requestAnimationFrame qui prend en paramètre une fonction auquel est passé un temps en milliseconde.
Ce temps est absolu et est donné depuis le début de l'animation c'est à dire le premier appel à
requestAnimationFrame. C'est cette fonction qui doit réaliser la mise à jour du jeu à interval controlé.
Le système ne garantit pas la régularité des appels à votre fonction. C'est pour cette raison que le temps
vous est fournit pour réaliser des calculs de déplacements sans saccades.

Beaucoup de jeux vidéo sont réalisés avec la technologie du redessin complêt pour chaque image de l'animation.
Avec la possibilité de changement les valeurs des attributs CSS‡ des objets DOM, cette technique n'est pas à
mettre en oeuvre dans ce TP. En effet, il suffit simplement de changer les attributs CSS des objets DOM comme
la position, la taille, etc, à chaque appel de requestAnimationFrame pour réaliser l'animation du jeux.

Le codage du jeux se réalise dans la methode game.update. Vous pouvez créer des sous type de Sprite pour
modéliser le comportement des avions.
*/

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
        if (this.isStopped()) {
            this.waitingTime -= duration;
            if (this.waitingTime <= 0) {
                this.waitingTime = 0;
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
}




///////////////////////////////////////////////////////////////
// Codage du Jeux
///////////////////////////////////////////////////////////////

let game = {
    run: false,
    tFrameLast: 0,
    r2d2: new Sprite("R2D2"),
    sprites: []
};



// Mise à jour du jeux à la date indiquée
game.update = function (tFrame) {
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
                // Ajout de points
                game.score.increaseScore(40);
            }
        } else {
            sprite.isColliding = false;
        }
    }
}

// Reaction du jeux à l'enfoncement d'une touche
game.onkeydown = function (key) {
    const delta = 10;
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
        case "s":
            game.run = false;
            break;
        default:
            console.log(key)
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
    // lance tous les sprites
    for(sprite of this.sprites) {
        sprite.start();
    }
}

game.stop = function () {
    game.run = false;
}
game.init =  function () {
    // Attend l'initialisation des autres sprites
    this.score = new Score("score");

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

    this.run = true;
    this.tFrameLast = 0;

    game.start();
    main(0); // Début du cycle
}

// L'initialisation est asynchrone donc il faut attendre
// Il faut que toutes les images soient chargées donc on
// s'acroche à l'évelment load de window
window.addEventListener("load", () => {game.init();})





