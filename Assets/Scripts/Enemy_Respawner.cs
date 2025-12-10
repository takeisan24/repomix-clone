using System;
using UnityEngine;

public class Enemy_Respawner : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;
    [SerializeField] private Transform[] spawnPoint;
    [SerializeField] private float initialCooldown;
    private float cooldown;
    [SerializeField] private float cooldownDecreaseRate;
    [SerializeField] private float minCooldown;
    [SerializeField] private bool canSpawn;
    private float timer;
    [SerializeField] private Transform player;
    [SerializeField] private GameManager.Level currentLevel;
    private bool levelCleared = false;

    // max enemies per level (set in inspector)
    [Header("Per-level spawn limits")]
    [SerializeField] private int maxEnemiesFirst;
    [SerializeField] private int maxEnemiesSecond;
    [SerializeField] private int maxEnemiesThird;
    [SerializeField] private int maxEnemiesFourth;

    // internal counters
    private int spawnedFirst = 0;
    private int spawnedSecond = 0;
    private int spawnedThird = 0;
    private int spawnedFourth = 0;

    private void Awake()
    {
        cooldown = initialCooldown;
    }

    private void Update()
    {
        // determine how many have been spawned for this level and max allowed
        int spawned = GetSpawnedForCurrentLevel();
        int maxForLevel = GetMaxForCurrentLevel();

        // if we still need to spawn more this level, proceed with cooldown-based spawning
        if (spawned < maxForLevel && canSpawn)
        {
            timer += Time.deltaTime;
            if (timer >= cooldown)
            {
                timer = 0f;
                CreateNewEnemy();
                cooldown = Mathf.Max(minCooldown, cooldown - cooldownDecreaseRate);
            }
        }
        else if (spawned >= maxForLevel)
        {
            // we've already spawned the required number — wait until all active enemies are killed
            int active = CountActiveEnemiesInScene();
            if (active <= 0)
            {
                // all spawned enemies have been killed — stop spawning for this level
                canSpawn = false;
                if(!levelCleared)
                {
                    levelCleared = true;
                    // notify GameManager that level is cleared
                    GameManager.Instance.OnLevelCleared();
                }
            }
        }
    }

    private int GetMaxForCurrentLevel()
    {
        switch (currentLevel)
        {
            case GameManager.Level.FIRST: return Mathf.Max(0, maxEnemiesFirst);
            case GameManager.Level.SECOND: return Mathf.Max(0, maxEnemiesSecond);
            case GameManager.Level.THIRD: return Mathf.Max(0, maxEnemiesThird);
            case GameManager.Level.FOURTH: return Mathf.Max(0, maxEnemiesFourth);
            default: return 0;
        }
    }

    private int GetSpawnedForCurrentLevel()
    {
        switch (currentLevel)
        {
            case GameManager.Level.FIRST: return spawnedFirst;
            case GameManager.Level.SECOND: return spawnedSecond;
            case GameManager.Level.THIRD: return spawnedThird;
            case GameManager.Level.FOURTH: return spawnedFourth;
            default: return 0;
        }
    }

    private int CountActiveEnemiesInScene()
    {
        int enemyLayer = LayerMask.NameToLayer("Enemy");
        if (enemyLayer < 0) return 0;

        int count = 0;
        var allEntities = GameObject.FindObjectsOfType<Entity>();
        for (int i = 0; i < allEntities.Length; i++)
        {
            var e = allEntities[i];
            if (e != null && e.gameObject != null && e.gameObject.layer == enemyLayer)
                count++;
        }
        return count;
    }

    private void CreateNewEnemy()
    {
        // check per-level limit before spawning (defensive)
        int spawned = GetSpawnedForCurrentLevel();
        int maxForLevel = GetMaxForCurrentLevel();
        if (spawned >= maxForLevel) return;

        int respawnIndex = UnityEngine.Random.Range(0, spawnPoint.Length);
        Vector3 spawnPos = spawnPoint[respawnIndex].position;
        GameObject newEnemy = Instantiate(enemyPrefab, spawnPos, Quaternion.identity);
        if (player != null && newEnemy.transform.position.x > player.transform.position.x)
            newEnemy.GetComponent<Entity>()?.Flip();

        // increment counters for current level
        switch (currentLevel)
        {
            case GameManager.Level.FIRST:
                spawnedFirst++;
                break;
            case GameManager.Level.SECOND:
                spawnedSecond++;
                break;
            case GameManager.Level.THIRD:
                spawnedThird++;
                break;
            case GameManager.Level.FOURTH:
                spawnedFourth++;
                break;
            default:
                break;
        }
    }

    public void SetCanSpawn(bool canSpawn)
    {
        this.canSpawn = canSpawn;
    }

    public void setCurrentLevel(GameManager.Level level)
    {
        currentLevel = level;
        levelCleared = false;
        // when changing level, reset timer and allow spawning for that level
        timer = 0f;
        canSpawn = true;

        // reset cooldown to initial value
        cooldown = initialCooldown;

        // optionally reset per-level counters when entering new level
        switch (currentLevel)
        {
            case GameManager.Level.FIRST: spawnedFirst = 0; break;
            case GameManager.Level.SECOND: spawnedSecond = 0; break;
            case GameManager.Level.THIRD: spawnedThird = 0; break;
            case GameManager.Level.FOURTH: spawnedFourth = 0; break;
            default: break;
        }
    }

    // optional: reset all counters (call when restarting game)
    public void ResetSpawnCounters()
    {
        spawnedFirst = spawnedSecond = spawnedThird = spawnedFourth = 0;
        timer = 0f;
        canSpawn = true;
        cooldown = initialCooldown;
    }
}
