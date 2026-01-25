import { WAVE_CONFIG } from "../config/GameConfig";
import { KlaedScout } from "../entities/KlaedScout";
import { ISystem } from "./ISystem";

export class EnemySpawnerSystem implements ISystem {
  private scene: Phaser.Scene | null;
  private enemiesGroup: Phaser.Physics.Arcade.Group | null;
  private lastSpawnTime = 0;
  private spawnRate = WAVE_CONFIG.spawner.baseRate;
  private enemyVelocity = WAVE_CONFIG.enemy.baseVelocityY;

  constructor(scene: Phaser.Scene, enemiesGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.enemiesGroup = enemiesGroup;

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.scene.events.on('wave-difficulty-changed', this.handleDifficultyChanged, this);

    this.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        if (this.scene) {
          this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
          this.scene.events.off('wave-difficulty-changed', this.handleDifficultyChanged, this);
        }
      },
      this
    );
  }

  private handleDifficultyChanged(data: { spawnRate: number; enemyVelocity: number }) {
    this.spawnRate = data.spawnRate;
    this.enemyVelocity = data.enemyVelocity;
  }

  private update() {
    if (!this.scene || this.scene.physics.world.isPaused) return;
    const currentTime = this.scene.time.now;

    // Check if it's time to spawn a new enemy
    if (currentTime - this.lastSpawnTime > this.spawnRate) {
      this.spawnEnemy();
      this.lastSpawnTime = currentTime;
    }

    // Clean up enemies that have moved off screen
    this.cleanupOffScreenEnemies();
  }

  private spawnEnemy() {
    if (!this.scene || !this.enemiesGroup) return;
    const padding = WAVE_CONFIG.spawner.spawnPaddingX;
    const randomX = Phaser.Math.Between(padding, this.scene.scale.width - padding);

    const enemy = new KlaedScout(this.scene);
    enemy.setPosition(randomX, WAVE_CONFIG.spawner.spawnY);

    this.enemiesGroup.add(enemy);

    if (enemy.body && enemy.body instanceof Phaser.Physics.Arcade.Body) {
      enemy.body.setVelocityY(this.enemyVelocity);
    }
  }

  private cleanupOffScreenEnemies() {
    if (!this.scene || !this.enemiesGroup) return;
    const cleanupThreshold = this.scene.scale.height + WAVE_CONFIG.spawner.cleanupOffsetY;
    this.enemiesGroup.children.entries.forEach(
      (enemy: Phaser.GameObjects.GameObject) => {
        if (
          "y" in enemy &&
          typeof enemy.y === "number" &&
          enemy.y > cleanupThreshold
        ) {
          this.enemiesGroup!.remove(enemy);
          enemy.destroy();
        }
      }
    );
  }

  destroy() {
    if (this.scene) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      this.scene.events.off('wave-difficulty-changed', this.handleDifficultyChanged, this);
    }

    this.lastSpawnTime = 0;
    this.enemiesGroup = null;
    this.scene = null;
  }
}
