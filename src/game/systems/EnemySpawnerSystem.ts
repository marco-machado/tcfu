import { KlaedScout } from "../entities/KlaedScout";
import { ISystem } from "./ISystem";

export class EnemySpawnerSystem implements ISystem {
  private scene: Phaser.Scene | null;
  private enemiesGroup: Phaser.Physics.Arcade.Group | null;
  private lastSpawnTime = 0;
  private spawnRate = 2000;

  constructor(scene: Phaser.Scene, enemiesGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.enemiesGroup = enemiesGroup;

    // Register for scene update events
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

    // Clean up when scene shuts down
    this.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        if (this.scene) {
          this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        }
      },
      this
    );
  }

  private update() {
    if (!this.scene) return;
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
    const randomX = Phaser.Math.Between(20, this.scene.scale.width - 20);

    const enemy = new KlaedScout(this.scene);
    enemy.setPosition(randomX, -50);

    this.enemiesGroup.add(enemy);

    if (enemy.body && enemy.body instanceof Phaser.Physics.Arcade.Body) {
      enemy.body.setVelocityY(100);
    }
  }

  private cleanupOffScreenEnemies() {
    if (!this.scene || !this.enemiesGroup) return;
    this.enemiesGroup.children.entries.forEach(
      (enemy: Phaser.GameObjects.GameObject) => {
        if (
          "y" in enemy &&
          typeof enemy.y === "number" &&
          enemy.y > this.scene!.scale.height + 100
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
    }

    this.lastSpawnTime = 0;

    this.enemiesGroup = null;
    this.scene = null;
  }
}
