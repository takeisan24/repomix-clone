using System;
using System.Collections;
using UnityEngine;

public class Entity : MonoBehaviour
{
    protected Animator anim;
    protected Rigidbody2D rb;
    protected Collider2D col;
    protected SpriteRenderer sr;
    protected Material originalMaterial;

    [Header("Health")]
    [SerializeField] protected float maxHealth = 5;
    [SerializeField] protected float currentHealth;
    [SerializeField] private Material damageMaterial;
    [SerializeField] private float damageFeedbackDuration = 0.1f;

    private Coroutine damageFeedbackCoroutine;

    [Header("Attack details")]
    [SerializeField] protected float attackRadius;
    [SerializeField] protected Transform attackPoint;
    [SerializeField] protected LayerMask whatIsTarget;
    [SerializeField] public float attackDamage = 1f;

    protected bool facingRight = true;
    protected int facingDir=1;
    protected bool canMove = true;

    [Header("Collision details")]
    [SerializeField] protected float groundCheckDistance;
    protected bool isGrounded;
    [SerializeField] private LayerMask whatIsGround;
    protected virtual void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        anim = GetComponentInChildren<Animator>();
        col = GetComponent<Collider2D>();
        sr=GetComponentInChildren<SpriteRenderer>();
        originalMaterial = sr.material;
        currentHealth = maxHealth;
    }
    protected virtual void Update()
    {
        HandleCollision();  
        HandleMovement();
        HandleFlip();
        HandleAnimation();
    }

    public virtual void DamageTargets(float damage)
    {
        if (attackPoint == null)
        {
            Debug.LogError(gameObject.name + ": Chưa gán Attack Point! Hãy kiểm tra Inspector.");
            return; // Dừng hàm lại ngay lập tức, không chạy tiếp để tránh lỗi
        };

        Collider2D[] enemyColliders = Physics2D.OverlapCircleAll(attackPoint.position, attackRadius, whatIsTarget);
        foreach (Collider2D enemy in enemyColliders)
        {
            //enemy.GetComponent<Entity>().TakeDamage(damage);
            // 1. Thử tìm Entity (Cho Goblin, Mushroom...)
            Entity entityScript = enemy.GetComponent<Entity>();
            if (entityScript != null)
            {
                entityScript.TakeDamage(damage);
            }
            // 2. Thử tìm BOSS (Cho con Boss độc lập của bạn) <-- THÊM ĐOẠN NÀY
            else
            {
                Boss bossScript = enemy.GetComponent<Boss>();
                if (bossScript != null)
                {
                    bossScript.TakeDamage(damage);
                }
            }
        }
    }
    public virtual void TakeDamage(float damage)
    {
        currentHealth-=damage;
        PlayDamageFeedback();
        if (currentHealth <= 0)
        {
            Die();
        }
    }
    private void PlayDamageFeedback()
    {
        if (damageFeedbackCoroutine != null)
        {
            StopCoroutine(damageFeedbackCoroutine);
        }
        damageFeedbackCoroutine = StartCoroutine(DamageFeedbackCo());
    }
    private IEnumerator DamageFeedbackCo()
    {
        sr.material = damageMaterial;
        yield return new WaitForSeconds(damageFeedbackDuration);
        sr.material = originalMaterial;
    }
    protected virtual void Die()
    {
        anim.enabled = false;
        col.enabled = false;
        rb.gravityScale = 12;
        rb.linearVelocity = new Vector2(rb.linearVelocityY,15);
        Destroy(gameObject, 1f);
    }

    public virtual void EnableMovementAndJump(bool enable)
    {
        canMove = enable;
        if (!enable)
        {
            rb.linearVelocity = new Vector2(0, rb.linearVelocityY);
        }
    }
    protected void HandleAnimation()
    {
        anim.SetBool("isGrounded", isGrounded);
        anim.SetFloat("yVelocity", rb.linearVelocityY);
        anim.SetFloat("xVelocity", rb.linearVelocityX);
    }

    protected virtual void HandleMovement()
    {
        
    }
    protected virtual void HandleAttack()
    {
        if (isGrounded)
        {
            anim.SetTrigger("attack");
            rb.linearVelocity=new Vector2(0, rb.linearVelocityY);
        }
    }
    protected virtual void HandleFlip()
    {
        if(rb.linearVelocityX > 0 && !facingRight)
        {
            Flip();
        }
        else if(rb.linearVelocityX < 0 && facingRight)
        {
            Flip();
        }
    }
    public virtual void Flip()
    {
        facingRight = !facingRight;
        transform.Rotate(0f, 180f, 0f);
        facingDir *= -1;
    }
    protected virtual void HandleCollision()
    {
        isGrounded=Physics2D.Raycast(transform.position, Vector2.down, groundCheckDistance, whatIsGround);
    }
    protected virtual void FindNearestTarget()
    {
        // Use attackRadius as base detection radius (fallback to 5 if zero)
        float detectionRadius = 999;

        Collider2D[] hits = Physics2D.OverlapCircleAll(transform.position, detectionRadius, whatIsTarget);
        if (hits == null || hits.Length == 0) return;

        Transform nearest = null;
        float minDistSqr = float.MaxValue;
        Vector2 pos = transform.position;

        foreach (var c in hits)
        {
            if (c == null || c.gameObject == gameObject) continue;
            Vector2 otherPos = c.transform.position;
            float d2 = (otherPos - pos).sqrMagnitude;
            if (d2 < minDistSqr)
            {
                minDistSqr = d2;
                nearest = c.transform;
            }
        }

        if (nearest == null) return;

        // Face the nearest target
        if (nearest.position.x > transform.position.x && !facingRight)
        {
            Flip();
        }
        else if (nearest.position.x < transform.position.x && facingRight)
        {
            Flip();
        }
    }
    protected virtual void OnDrawGizmos()
    {
        Gizmos.color=Color.red;
        Gizmos.DrawLine(transform.position, transform.position + new Vector3(0, - groundCheckDistance));
        if(attackPoint!=null) Gizmos.DrawWireSphere(attackPoint.position, attackRadius);  
    }
}