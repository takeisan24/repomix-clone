using System.Collections;
using UnityEngine;

public class ObjectToProtect : Entity
{
    private Transform player;
    [Header("Shield Skill")]
    [SerializeField] private bool canActivateShield;
    [SerializeField] private float shieldCooldown;
    private float shieldActiveLastTime=-Mathf.Infinity;
    [SerializeField] private float shieldDuration;
    [SerializeField] private bool hasShield;
    [SerializeField] private Shield shield;
    [Header("Lightning Strike")]
    [SerializeField] private bool canCastLightning;
    [SerializeField] private GameObject lightningPrefab;
    [SerializeField] private Transform[] spawnPoint;
    [SerializeField] private float cooldownSpawntime;
    [SerializeField] private float castLightningChance;
    private bool canGetInput;

    // internal control
    private bool isSpawningLightning = false;

    protected override void Awake()
    {
        base.Awake();
        player = FindFirstObjectByType<Player>().transform;
        shield=GetComponentInChildren<Shield>();
        shield.gameObject.SetActive(false);
        canGetInput = true;
    }
    private void HandleInput()
    {
        if(!canGetInput) return;
        if (canActivateShield && Input.GetKeyDown(KeyCode.Q) && !hasShield&&canActivateShield&&Time.time-shieldActiveLastTime>=shieldCooldown)
        {
            UI.Instance.ResetButtonCooldown("ShieldButton", shieldCooldown);
            ActivateShield();
        }
    }

    private void ActivateShield()
    {
        if (shield != null)
        {
            shieldActiveLastTime= Time.time;
            shield.gameObject.SetActive(true);
            hasShield = true;
            // Start coroutine to deactivate shield after cooldown
            StartCoroutine(DeactivateShieldAfterCooldown());
        }
    }

    private IEnumerator DeactivateShieldAfterCooldown()
    {
        WaitForSeconds wait = new WaitForSeconds(shieldDuration);
        yield return wait;
        if (shield != null)
        {
            shield.gameObject.SetActive(false);
            hasShield = false;
        }
    }

    protected override void Update()
    {
        HandleInput();
        HandleFlip();
    }
    protected override void HandleFlip()
    {
        if(player == null) return;
        if (player.transform.position.x > transform.position.x && !facingRight)
        {
            Flip();
        }
        else if(player.transform.position.x < transform.position.x && facingRight)
        {
            Flip();
        }
    }
    protected override void Die()
    {
        AudioManager.Instance.Play("princessDie");
        base.Die();
        UI.Instance.EnableGameOverUI();
    }
    public override void TakeDamage(float damage)
    {
        base.TakeDamage(damage);
        if (canCastLightning&& Random.Range(0f, 1f) + Mathf.Min(castLightningChance * damage,0.4f) >=1)
        {
            TriggerLightningStrike();
        }
    }

    // Start a coroutine to spawn lightning with cooldown between each spawn.
    // On the first call it will spawn in order; on the next call it will spawn in a random order; then alternate.
    private void SpawnLightningStrike()
    {
        if (isSpawningLightning) return; // prevent overlapping
        if (lightningPrefab == null || spawnPoint == null || spawnPoint.Length == 0) return;
        StartCoroutine(SpawnLightningStrikeCo());
    }

    private IEnumerator SpawnLightningStrikeCo()
    {
        isSpawningLightning = true;

        int count = spawnPoint.Length;
        int[] indices = new int[count];
        for (int i = 0; i < count; i++) indices[i] = i;

        // Fisher-Yates shuffle
        for (int i = count - 1; i > 0; i--)
        {
            int j = Random.Range(0, i + 1);
            int tmp = indices[i];
            indices[i] = indices[j];
            indices[j] = tmp;
        }

        for (int k = 0; k < count; k++)
        {
            int idx = indices[k];
            Transform spawnPos = spawnPoint[idx];
            if (spawnPos != null)
            {
                Instantiate(lightningPrefab, spawnPos.position, Quaternion.identity);
            }
            // wait cooldown between each spawn
            yield return new WaitForSeconds(cooldownSpawntime);
        }
        isSpawningLightning = false;
    }

    // public helper to trigger from animation event or other scripts
    public void TriggerLightningStrike()
    {
        SpawnLightningStrike();
    }

    // old method left commented if needed
    //private void SpawnLightningStrike()
    //{
    //    foreach (Transform spawnPos in spawnPoint)
    //    {
    //        Instantiate(lightningPrefab, spawnPos.position, Quaternion.identity);
    //    }
    //}

    //turn on skill
    public void EnableShieldSkill()
    {
        canActivateShield = true;
    }
    public void EnableLightningStrikeSkill()
    {
        canCastLightning = true;
    }
    public bool CanGetInput()
    {
        return canGetInput;
    }
    public void SetCanGetInput(bool canGet)
    {
        canGetInput = canGet;
    }
}
