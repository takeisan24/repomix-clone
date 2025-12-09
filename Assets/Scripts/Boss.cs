// File: Assets/Scripts/Boss.cs
using UnityEngine;
using System.Collections;

public class Boss : Enemy
{
    // Boss state management
    public enum BossState { WakingUp, Chasing, Attacking, Idle, Dead }

    [Header("Boss Settings")]
    [SerializeField] private float attackRange = 3f;
    [SerializeField] private float attackCooldown = 2.5f;
    [SerializeField] private float wakeUpDuration = 1.5f;
    [SerializeField] private Transform playerTransform;

    private BossState currentState;
    private float lastAttackTime;
    private bool isPerformingAction;

    #region Unity Lifecycle

    protected override void Awake()
    {
        base.Awake();
        currentState = BossState.WakingUp;
        StartCoroutine(WakeUpSequence());
    }

    protected override void Update()
    {
        if (currentState == BossState.Dead || currentState == BossState.WakingUp)
            return;

        base.HandleCollision();
        base.HandleAnimation();

        UpdateBossAI();
    }

    #endregion

    #region AI Logic

    private void UpdateBossAI()
    {
        switch (currentState)
        {
            case BossState.Chasing:
                HandleChasing();
                break;

            case BossState.Attacking:
                HandleAttackingState();
                break;

            case BossState.Idle:
                HandleIdleState();
                break;
        }
    }

    private void HandleChasing()
    {
        if (playerTransform == null)
        {
            currentState = BossState.Idle;
            return;
        }

        HandleMovement();
          
        // Check if player is in attack range
        float distanceToPlayer = Vector2.Distance(transform.position, playerTransform.position);
        if (distanceToPlayer < attackRange && CanAttack())
        {
            TransitionToAttack();
        }
    }

    private void HandleAttackingState()
    {
        // Keep boss stationary during attack animation
        rb.linearVelocity = new Vector2(0, rb.linearVelocity.y);
    }

    private void HandleIdleState()
    {
        rb.linearVelocity = new Vector2(0, rb.linearVelocity.y);

        // Return to chasing if player is found
        if (playerTransform != null)
        {
            currentState = BossState.Chasing;
        }
    }

    #endregion

    #region Movement

    protected override void HandleMovement()
    {
        if (playerTransform == null || !canMove)
        {
            rb.linearVelocity = new Vector2(0, rb.linearVelocity.y);
            return;
        }

        // Face towards player
        UpdateFacingDirection();

        // Move towards player
        rb.linearVelocity = new Vector2(speed * facingDir, rb.linearVelocity.y);
    }

    private void UpdateFacingDirection()
    {
        if (playerTransform.position.x > transform.position.x && facingDir == -1)
        {
            Flip();
        }
        else if (playerTransform.position.x < transform.position.x && facingDir == 1)
        {
            Flip();
        }
    }

    #endregion

    #region Combat

    protected override void HandleAttack()
    {
        // This method is called when we want to initiate an attack
        // But we use TransitionToAttack() instead for better control
    }

    private bool CanAttack()
    {
        return Time.time >= lastAttackTime + attackCooldown && !isPerformingAction;
    }

    private void TransitionToAttack()
    {
        currentState = BossState.Attacking;
        isPerformingAction = true;
        lastAttackTime = Time.time;

        rb.linearVelocity = new Vector2(0, rb.linearVelocity.y);

        // Choose random attack
        PerformRandomAttack();
    }

    private void PerformRandomAttack()
    {
        int attackIndex = Random.Range(0, 2);
        
        if (attackIndex == 0)
        {
            anim.SetTrigger("attackSlash");
        }
        else
        {
            anim.SetTrigger("attackSummon");
        }
    }

    #endregion

    #region Animation Events

    // Called by Animation Event at the end of attack animations
    public void FinishAttack()
    {
        isPerformingAction = false;
        currentState = BossState.Chasing;
    }

    // Called by Animation Event during slash attack
    public void PerformSlashDamage()
    {
        // Deal damage in front of boss
        DamageTargets(attackDamage);
        Debug.Log("Boss performs SLASH attack!");
    }

    // Called by Animation Event during summon attack
    public void PerformSummon()
    {
        // Spawn minions or projectiles
        Debug.Log("Boss performs SUMMON attack!");
        // TODO: Implement summoning logic
    }

    #endregion

    #region State Transitions

    private IEnumerator WakeUpSequence()
    {
        isPerformingAction = true;
        
        // Play wake up animation if you have one
        // anim.SetTrigger("wakeUp");
        
        yield return new WaitForSeconds(wakeUpDuration);
        
        currentState = BossState.Chasing;
        isPerformingAction = false;
    }

    #endregion

    #region Death

    protected override void Die()
    {
        if (currentState == BossState.Dead)
            return;

        currentState = BossState.Dead;
        base.Die();

        // Boss-specific death logic
        Debug.Log("BOSS DEFEATED!");
        
        // Disable boss functionality
        this.enabled = false;
        rb.bodyType = RigidbodyType2D.Static;

        // TODO: Trigger victory sequence, spawn rewards, etc.
    }

    #endregion

    #region Debug

    protected override void OnDrawGizmos()
    {
        base.OnDrawGizmos();

        // Draw attack range
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
    }

    #endregion
}