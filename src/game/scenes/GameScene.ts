import { Scene } from "phaser"
import { BACKGROUND_CONFIG, GAME_CONFIG, GAME_STATE_CONFIG } from "../config/GameConfig"
import { Player } from "../entities/Player"
import { PowerUp, PowerUpType } from "../entities/powerups"
import { InputManager } from "../input/InputManager"
import { EnemySpawnerSystem } from "../systems/EnemySpawnerSystem"
import { EnemyWeaponsSystem } from "../systems/EnemyWeaponsSystem"
import { GameStateSystem } from "../systems/GameStateSystem"
import { ISystem } from "../systems/ISystem"
import { PlayerPowerUpState } from "../systems/PlayerPowerUpState"
import { PlayerWeaponsSystem } from "../systems/PlayerWeaponsSystem"
import { PowerUpSystem } from "../systems/PowerUpSystem"
import { TouchControlsSystem } from "../systems/TouchControlsSystem"
import { WaveSystem } from "../systems/WaveSystem"

export class GameScene extends Scene {
  private player: Player
  private playerProjectilesGroup: Phaser.Physics.Arcade.Group
  private enemyProjectilesGroup: Phaser.Physics.Arcade.Group
  private enemiesGroup: Phaser.Physics.Arcade.Group
  private background: Phaser.GameObjects.TileSprite
  private powerUpsGroup: Phaser.Physics.Arcade.Group
  private _playerWeaponSystem: PlayerWeaponsSystem & ISystem
  private _enemyWeaponsSystem: EnemyWeaponsSystem & ISystem
  private _enemySpawnerSystem: EnemySpawnerSystem & ISystem
  private _gameStateSystem: GameStateSystem & ISystem
  private _waveSystem: WaveSystem & ISystem
  private _playerPowerUpState: PlayerPowerUpState
  private _powerUpSystem: PowerUpSystem & ISystem
  private _inputManager: InputManager
  private _touchControlsSystem: TouchControlsSystem | null = null
  private playerEnemyOverlap: Phaser.Physics.Arcade.Collider
  private projectileEnemyOverlap: Phaser.Physics.Arcade.Collider
  private enemyProjectilePlayerOverlap: Phaser.Physics.Arcade.Collider
  private playerPowerUpOverlap: Phaser.Physics.Arcade.Collider
  private isGameOver: boolean = false
  private isPaused: boolean = false
  public currentScrollSpeed: number = BACKGROUND_CONFIG.baseScrollSpeed
  private pauseKey: Phaser.Input.Keyboard.Key | null = null
  private escKey: Phaser.Input.Keyboard.Key | null = null
  private bombKey: Phaser.Input.Keyboard.Key | null = null
  private debugKeys: Phaser.Input.Keyboard.Key[] = []

  constructor() {
    super("GameScene");
  }

  create() {
    this.isGameOver = false;
    this.isPaused = false;
    this.currentScrollSpeed = BACKGROUND_CONFIG.baseScrollSpeed;
    this.physics.resume();

    this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P) ?? null;
    this.escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) ?? null;
    this.bombKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.B) ?? null;
    this.pauseKey?.on('down', this.togglePause, this);
    this.escKey?.on('down', this.togglePause, this);
    this.bombKey?.on('down', this.activateBomb, this);

    if (GAME_CONFIG.debug) {
      const debugKeyTypes = [
        PowerUpType.EXTRA_LIFE,
        PowerUpType.FIRE_RATE_UP,
        PowerUpType.DAMAGE_UP,
        PowerUpType.SPREAD_SHOT,
        PowerUpType.SPEED_UP,
        PowerUpType.INVINCIBILITY,
        PowerUpType.SHIELD,
        PowerUpType.MAGNET,
        PowerUpType.SCORE_MULTIPLIER,
        PowerUpType.BOMB,
      ]
      const keyCodes = [
        Phaser.Input.Keyboard.KeyCodes.ONE,
        Phaser.Input.Keyboard.KeyCodes.TWO,
        Phaser.Input.Keyboard.KeyCodes.THREE,
        Phaser.Input.Keyboard.KeyCodes.FOUR,
        Phaser.Input.Keyboard.KeyCodes.FIVE,
        Phaser.Input.Keyboard.KeyCodes.SIX,
        Phaser.Input.Keyboard.KeyCodes.SEVEN,
        Phaser.Input.Keyboard.KeyCodes.EIGHT,
        Phaser.Input.Keyboard.KeyCodes.NINE,
        Phaser.Input.Keyboard.KeyCodes.ZERO,
      ]
      keyCodes.forEach((code, index) => {
        const key = this.input.keyboard?.addKey(code)
        if (key) {
          key.on('down', () => {
            this.events.emit('debug-spawn-powerup', { type: debugKeyTypes[index] })
          })
          this.debugKeys.push(key)
        }
      })
    }

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
    })
    this.enemyProjectilesGroup = this.physics.add.group({
      name: "EnemyProjectiles",
    })
    this.enemiesGroup = this.physics.add.group({ name: "Enemies" })
    this.powerUpsGroup = this.physics.add.group({ name: "PowerUps" })

    this._inputManager = new InputManager(this)

    this.player = new Player(this, this._inputManager)

    if (this._inputManager.isTouchDevice()) {
      this._touchControlsSystem = new TouchControlsSystem(this, this.player, this._inputManager)
    }

    this.events.on('pause-button-pressed', this.togglePause, this)

    this._playerPowerUpState = new PlayerPowerUpState(this)
    this.events.on('ui-ready', () => {
      this._playerPowerUpState.emitInitialState()
    }, this)
    this._gameStateSystem = new GameStateSystem(this, this._playerPowerUpState)
    this._playerWeaponSystem = new PlayerWeaponsSystem(
      this,
      this.player,
      this.playerProjectilesGroup,
      this._playerPowerUpState
    )
    this._powerUpSystem = new PowerUpSystem(
      this,
      this.player,
      this._playerPowerUpState,
      this._gameStateSystem,
      this.powerUpsGroup
    )
    this._waveSystem = new WaveSystem(this)
    this._enemySpawnerSystem = new EnemySpawnerSystem(this, this.enemiesGroup)
    this._enemyWeaponsSystem = new EnemyWeaponsSystem(
      this,
      this.enemiesGroup,
      this.enemyProjectilesGroup
    )

    this.events.on('game-over', this.handleGameOver, this);
    this.events.on('wave-started', this.handleWaveStarted, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.playerEnemyOverlap = this.physics.add.overlap(
      this.player,
      this.enemiesGroup,
      (_player, enemy) => {
        try {
          if (this.player.getIsInvincible() || this._playerPowerUpState.isInvincible()) return
          if (this._playerPowerUpState.consumeShield()) {
            enemy.destroy()
            return
          }
          enemy.destroy()
          this.events.emit('player-hit')
          this.player.triggerInvincibility(GAME_STATE_CONFIG.playerInvincibilityDuration)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in player-enemy collision:", error)
        }
      }
    )

    this.projectileEnemyOverlap = this.physics.add.overlap(
      this.playerProjectilesGroup,
      this.enemiesGroup,
      (obj1, obj2) => {
        try {
          const enemyX = 'x' in obj2 ? obj2.x : 0
          const enemyY = 'y' in obj2 ? obj2.y : 0
          obj1.destroy()
          obj2.destroy()
          this.events.emit('enemy-destroyed', {
            points: GAME_STATE_CONFIG.scorePerEnemy,
            x: enemyX,
            y: enemyY,
          })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in projectile-enemy collision:", error)
        }
      }
    )

    this.enemyProjectilePlayerOverlap = this.physics.add.overlap(
      this.player,
      this.enemyProjectilesGroup,
      (_player, projectile) => {
        try {
          if (this.player.getIsInvincible() || this._playerPowerUpState.isInvincible()) return
          if (this._playerPowerUpState.consumeShield()) {
            projectile.destroy()
            return
          }
          projectile.destroy()
          this.events.emit('player-hit')
          this.player.triggerInvincibility(GAME_STATE_CONFIG.playerInvincibilityDuration)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in enemy-projectile-player collision:", error)
        }
      }
    )

    this.playerPowerUpOverlap = this.physics.add.overlap(
      this.player,
      this.powerUpsGroup,
      (_player, powerUp) => {
        try {
          if (powerUp instanceof PowerUp) {
            powerUp.onCollect(this)
            this.events.emit('powerup-collected', { type: powerUp.type })
            powerUp.destroy()
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in player-powerup collision:", error)
        }
      }
    )

    this.events.on('screen-clear-activated', () => {
      const enemies = [...this.enemiesGroup.getChildren()]
      enemies.forEach((enemy) => {
        const enemyX = 'x' in enemy ? enemy.x : 0
        const enemyY = 'y' in enemy ? enemy.y : 0
        enemy.destroy()
        this.events.emit('enemy-destroyed', {
          points: GAME_STATE_CONFIG.scorePerEnemy,
          x: enemyX,
          y: enemyY,
        })
      })

      const projectiles = [...this.enemyProjectilesGroup.getChildren()]
      projectiles.forEach((projectile) => {
        projectile.destroy()
      })
    })
  }

  private handleGameOver() {
    this.isGameOver = true

    if (this._enemySpawnerSystem) {
      this._enemySpawnerSystem.destroy()
    }
    if (this._playerWeaponSystem) {
      this._playerWeaponSystem.destroy()
    }
    if (this._enemyWeaponsSystem) {
      this._enemyWeaponsSystem.destroy()
    }
    if (this._waveSystem) {
      this._waveSystem.destroy()
    }
    if (this._powerUpSystem) {
      this._powerUpSystem.destroy()
    }
    if (this._touchControlsSystem) {
      this._touchControlsSystem.destroy()
      this._touchControlsSystem = null
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
    this.background.tilePositionY -= this.currentScrollSpeed;
  }

  private handleWaveStarted(data: { currentWave: number }) {
    const { baseScrollSpeed, maxScrollSpeed, scrollSpeedIncreasePerWave } = BACKGROUND_CONFIG
    this.currentScrollSpeed = Math.min(
      maxScrollSpeed,
      baseScrollSpeed + (data.currentWave - 1) * scrollSpeedIncreasePerWave
    )
  }

  public togglePause() {
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

  private activateBomb() {
    if (this.isGameOver || this.isPaused) return;
    this.events.emit('bomb-activated');
  }

  shutdown() {
    this.events.off('game-over', this.handleGameOver, this)
    this.events.off('wave-started', this.handleWaveStarted, this)
    this.events.off('pause-button-pressed', this.togglePause, this)
    this.pauseKey?.off('down', this.togglePause, this)
    this.escKey?.off('down', this.togglePause, this)
    this.bombKey?.off('down', this.activateBomb, this)
    this.debugKeys.forEach(key => key.removeAllListeners())
    this.debugKeys = []

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
        this.projectileEnemyOverlap.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying projectile-enemy overlap:", error)
      }
    }
    if (this.enemyProjectilePlayerOverlap) {
      try {
        this.enemyProjectilePlayerOverlap.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemy-projectile-player overlap:", error)
      }
    }
    if (this.playerPowerUpOverlap) {
      try {
        this.playerPowerUpOverlap.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying player-powerup overlap:", error)
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
        this._enemySpawnerSystem.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemy spawner system:", error)
      }
    }
    if (this._enemyWeaponsSystem && this._enemyWeaponsSystem.destroy) {
      try {
        this._enemyWeaponsSystem.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemy weapons system:", error)
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
    if (this._powerUpSystem && this._powerUpSystem.destroy) {
      try {
        this._powerUpSystem.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying power-up system:", error)
      }
    }
    if (this._playerPowerUpState && this._playerPowerUpState.destroy) {
      try {
        this._playerPowerUpState.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying player power-up state:", error)
      }
    }
    if (this._touchControlsSystem) {
      try {
        this._touchControlsSystem.destroy()
        this._touchControlsSystem = null
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying touch controls system:", error)
      }
    }
    if (this._inputManager) {
      try {
        this._inputManager.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying input manager:", error)
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
        this.enemiesGroup.clear(true, true)
        this.enemiesGroup.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemies group:", error)
      }
    }
    if (this.enemyProjectilesGroup) {
      try {
        this.enemyProjectilesGroup.clear(true, true)
        this.enemyProjectilesGroup.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying enemy projectiles group:", error)
      }
    }
    if (this.powerUpsGroup) {
      try {
        this.powerUpsGroup.clear(true, true)
        this.powerUpsGroup.destroy()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error destroying power-ups group:", error)
      }
    }
  }
}
