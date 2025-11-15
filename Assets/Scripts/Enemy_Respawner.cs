using UnityEngine;

public class Enemy_Respawner : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;
    [SerializeField] private Transform[] spawnPoint;
    [SerializeField] private float cooldown = 2f;
    [SerializeField] private float cooldownDecreaseRate = 0.05f;
    [SerializeField] private float minCooldown = .7f;
    private float timer;
    [SerializeField] private Transform player;
    private void Update()
    {
        timer += Time.deltaTime;
        if (timer >= cooldown)
        {
            timer = 0f;
            CreateNewEnemy();
            cooldown = Mathf.Max(minCooldown, cooldown - cooldownDecreaseRate);
        }
    }

    private void CreateNewEnemy()
    {
        int respawnIndex = Random.Range(0, spawnPoint.Length);
        Vector3 spawnPos = spawnPoint[respawnIndex].position;
        GameObject newEnemy = Instantiate(enemyPrefab, spawnPos, Quaternion.identity);
        if (player != null && newEnemy.transform.position.x > player.transform.position.x)
            newEnemy.GetComponent<Entity>().Flip();
    }
}
