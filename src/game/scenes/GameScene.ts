import { Scene } from "phaser";
import { BACKGROUND_CONFIG, GAME_STATE_CONFIG } from "../config/GameConfig";
import { Player } from "../entities/Player";
import { EnemySpawnerSystem } from "../systems/EnemySpawnerSystem";
import { GameStateSystem } from "../systems/GameStateSystem";
import { ISystem } from "../systems/ISystem";
import { PlayerWeaponsSystem } from "../systems/PlayerWeaponsSystem";
import { WaveSystem } from "../systems/WaveSystem";

export class GameScene extends Scene {
  private player: Player;
  private playerProjectilesGroup: Phaser.Physics.Arcade.Group;
  private enemiesGroup: Phaser.Physics.Arcade.Group;
  private background: Phaser.GameObjects.TileSprite;
  private _playerWeaponSystem: PlayerWeaponsSystem & ISystem;
  private _enemySpawnerSystem: EnemySpawnerSystem & ISystem;
  private _gameStateSystem: GameStateSystem & ISystem;
  private _waveSystem: WaveSystem & ISystem;
  private playerEnemyOverlap: Phaser.Physics.Arcade.Collider;
  private projectileEnemyOverlap: Phaser.Physics.Arcade.Collider;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private pauseKey: Phaser.Input.Keyboard.Key | null = null;
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super("GameScene");
  }

  create() {
    this.isGameOver = false;
    this.isPaused = false;
    this.physics.resume();

    this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P) ?? null;
    this.escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) ?? null;
    this.pauseKey?.on('down', this.togglePause, this);
    this.escKey?.on('down', this.togglePause, this);

    this.scene.launch("UIScene");

    this.background = this.add.tileSprite(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      "background"
    );

    this.playerProjectilesGroup = this.physics.add.group({
      name: "PlayerProjectiles",
    });
    this.enemiesGroup = this.physics.add.group({ name: "Enemies" });

    this.player = new Player(this);

    this._playerWeaponSystem = new PlayerWeaponsSystem(
      this,
      this.player,
      this.playerProjectilesGroup
    );
    this._gameStateSystem = new GameStateSystem(this);
    this._waveSystem = new WaveSystem(this);
    this._enemySpawnerSystem = new EnemySpawnerSystem(this, this.enemiesGroup);

    this.events.on('game-over', this.handleGameOver, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.playerEnemyOverlap = this.physics.add.overlap(
      this.player,
      this.enemiesGroup,
      (_player, enemy) => {
        try {
          if (this.player.getIsInvincible()) return;
          enemy.destroy();
          this.events.emit('player-hit');
          this.player.triggerInvincibility(GAME_STATE_CONFIG.playerInvincibilityDuration);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in player-enemy collision:", error);
        }
      }
    );

    this.projectileEnemyOverlap = this.physics.add.overlap(
      this.playerProjectilesGroup,
      this.enemiesGroup,
      (obj1, obj2) => {
        try {
          obj1.destroy();
          obj2.destroy();
          this.events.emit('enemy-destroyed', { points: GAME_STATE_CONFIG.scorePerEnemy });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in projectile-enemy collision:", error);
        }
      }
    );
  }

  private handleGameOver() {
    this.isGameOver = true;

    if (this._enemySpawnerSystem) {
      this._enemySpawnerSystem.destroy();
    }
    if (this._playerWeaponSystem) {
      this._playerWeaponSystem.destroy();
    }
    if (this._waveSystem) {
      this._waveSystem.destroy();
    }
    if (this.player) {
      this.player.setActive(false);
      this.player.stopAnimations();
      this.player.disableInput();
    }

    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (enemy instanceof Phaser.GameObjects.Container) {
        enemy.each((child: Phaser.GameObjects.GameObject) => {
          if (child instanceof Phaser.GameObjects.Sprite && child.anims) {
            child.anims.stop();
          }
        });
      }
    });

    this.physics.pause();
  }

  update() {
    if (this.isGameOver || this.isPaused) return;
    this.background.tilePositionY -= BACKGROUND_CONFIG.scrollSpeed;
  }

  private togglePause() {
    if (this.isGameOver) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.tweens.pauseAll();
      this.anims.pauseAll();
      this.events.emit('game-paused');
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this.anims.resumeAll();
      this.events.emit('game-resumed');
    }
  }

  shutdown() {
    this.events.off('game-over', this.handleGameOver, this);
    this.pauseKey?.off('down', this.togglePause, this);
    this.escKey?.off('down', this.togglePause, this);

    // Clean up physics colliders
    if (this.playerEnemyOverlap) {
      try {
        this.playerEnemyOverlap.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying player-enemy overlap:", error);
      }
    }
    if (this.projectileEnemyOverlap) {
      try {
        this.projectileEnemyOverlap.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying projectile-enemy overlap:", error);
      }
    }

    // Destroy systems
    if (this._playerWeaponSystem && this._playerWeaponSystem.destroy) {
      try {
        this._playerWeaponSystem.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying player weapon system:", error);
      }
    }
    if (this._enemySpawnerSystem && this._enemySpawnerSystem.destroy) {
      try {
        this._enemySpawnerSystem.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemy spawner system:", error);
      }
    }
    if (this._gameStateSystem && this._gameStateSystem.destroy) {
      try {
        this._gameStateSystem.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying game state system:", error);
      }
    }
    if (this._waveSystem && this._waveSystem.destroy) {
      try {
        this._waveSystem.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying wave system:", error);
      }
    }

    // Destroy player
    if (this.player?.destroy) {
      try {
        this.player.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying player:", error);
      }
    }

    // Clear physics groups
    if (this.playerProjectilesGroup) {
      try {
        this.playerProjectilesGroup.clear(true, true);
        this.playerProjectilesGroup.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying player projectiles group:", error);
      }
    }
    if (this.enemiesGroup) {
      try {
        this.enemiesGroup.clear(true, true);
        this.enemiesGroup.destroy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemies group:", error);
      }
    }
  }
}
