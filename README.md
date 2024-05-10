# jeuStarWars
Projet en groupe d'un jeu basé sur l'univers de Star Wars codé essentiellement en JavaScript</br>
Le but du jeu est de rentrer en collision avec les vaisseaux alliés pour gagner des points tout en évitant Dark Vador </br>
Vous avez 3 vies, à chaque fois que vous touchez Dark Vador vous perdez une vie ❤️</br>
Si le compteur tombe à zéro ou que votre nombre de vies est épuisé, la partie est terminée !

## Auteurs
#### Auteur code source : Jean-Pierre Chevallet
#### Membres du groupe :
- Anthony Lainé </br>
- Montana Katz

## Source des images supplémentaires :
https://alphacoders.com/death-star-wallpapers
https://wallpapercave.com/w/wp8835690

## Police-Fonts utilisés
- Orbitron </br>
- Starjedi

## Contrôles
Vous contrôllez le robot R2D2 avec les touches directionnelles du clavier (← ; → ; ↑ ; ↓) </br>
Cela à pour effet d'augmenter la vitesse de déplacement de R2D2, donc si vous touchez le mur droit par exemple, il va falloir attendre de décrémenter le côté droit en appuyant sur la flèche gauche (←) avant de pouvoir repartir vers la gauche ! </br>
<strong>S</strong> : met fin à la partie, c'est un Game Over ! </br>
<strong>Espace</strong> : met le jeu en pause et résume la partie

## Fonctionnalités ajoutées
- Ajout d'un Timer de 3 min
- Ajout d'une Barre de vie
- Ajout d'un Score et d'un Meilleur Score (obtenu lors de la session de jeu actuelle)
- Ajout d'un menu principal
- Ajout d'une fenêtre Game Over
- Ajout d'une fenêtre Pause
- R2D2 (le Joueur) ne peut pas sortir (visuellement) de l'écran
- Boutons permettant de naviguer entre les menus et fenêtres

## Glossaire du fichier code.js
nombre = numéro de ligne dans le fichier code.js :
- 3 : classe Position
- 33 : classe Speed
- 104 : Playground (Zone du jeu)
- 117 : classe Sprite
- 255 : classe Plane (hérite de Sprite)
- 302 : classe Rectangle (Hitbox)
- 331 : classe Score
- 380 : classe Timer
- 446 : classe LifeBar (Barre de vie)
- 485 : DEBUT CODE DU JEU : GAME
- 497 : game.update() // Rafraîchissement, et mise à jour de la partie
- 548 : game.onkeydown(key) // Gère la pression des touches du clavier
- 596 : game.main(tFrame) // Mets à jour la prochaine Frame (image)
- 607 : game.start() // Lance la partie
- 621 : game.setPause() // Mets en pause la partie
- 633 : game.resume() // Résume la partie (retour au jeu, on sort de la pause)
- 652 : game.reset() // Réinitialise les éléments pour la prochaine partie
- 665 : game.stop() // Arrête la partie, c'est le Game Over
- 677 : game.goToMenu() // Retourne au menu principal depuis l'écran Game Over
- 681 : game.returnToMenu() // Retourne au menu principal depuis l'écran Pause, et arrête la partie
- 689 : game.restart() // Relance une nouvelle partie
- 693 : game.checkBestScore() // Met à jour le meilleur score
- 700 : game.init() // Initialise les éléments, mais ne lance PAS la partie
- 732 : Gestion des boutons (addEventListener)