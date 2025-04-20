Game Setup
    1. Hexagonal Grid: The board consists of three concentric hexagonal circuits:
        ◦ Outer Circuit (6 nodes)
        ◦ Middle Circuit (6 nodes)
        ◦ Inner Circuit (6 nodes)
        ◦ The edge weight increases as you reach the inner hexagons.
    2. Player Titans: Each player has four Titans (Red and Blue) to place and move on the grid.
    3. Timers:
        ◦ Overall Timer: Limits the total game duration.
        ◦ Turn Timer: Limits each player's time per turn.

     
Gameplay Phases
1. Placement Phase
    • Players take turns placing their pieces on available nodes in the outermost circuit when starting the game.
    • Players can either place their remaining titans on the unlocked circuit or move the existing titans.
    • When the unlocked circuit is fully filled, the inner circuit gets unlocked.
2. Movement Phase
    • Once all titans are placed, players take turns moving one titan at a time to an adjacent node along connected edges (Titans can only move along the edges).
    • A titan surrounded by opponent titans is permanently removed from play.


Scoring System
    • Points are earned by controlling edges:
        ◦ An edge is controlled when both its connected nodes are occupied by the same player.
        ◦ Points equal to the edge's weight are added to the player's score.
        ◦ If a piece moves away from a controlled edge, points equal to that edge's weight are deducted.


Winning Conditions
The game ends when:
    1. The overall timer expires.
    2. The innermost hexagon is fully occupied.
The player with the highest score at the end of the game wins.
