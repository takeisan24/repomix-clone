using UnityEngine;
using System.Collections;

// Kế thừa MonoBehaviour: Độc lập hoàn toàn, không dính dáng gì đến Entity/Enemy
public class Boss : MonoBehaviour
{
    private Animator anim;
    private Rigidbody2D rb;
    private SpriteRenderer sr;
    private Material originalMaterial;

    // --- 1. CÁC CHỈ SỐ CƠ BẢN (Tự khai báo lại) ---
    [Header("Health Settings")]
    [SerializeField] protected float maxHealth = 5;
    [SerializeField] protected float currentHealth;
    [SerializeField] private Material damageMaterial;
    [SerializeField] private float damageFeedbackDuration = 0.1f; // Kéo Material nháy trắng vào đây

    [Header("Movement & Physics")]
    [SerializeField] private float moveSpeed = 2f;
    [SerializeField] private Transform playerTransform; // Kéo Player vào đây
    protected bool facingRight = true;
    protected bool canMove = true;
    private int facingDir = 1;
    private bool isDead = false;

    [Header("Collision details")]
    [SerializeField] private float groundCheckDistance;
    protected bool isGrounded;
    [SerializeField] private LayerMask whatIsGround;

    // --- 2. AI & COMBAT ---
    public enum BossState { WakingUp, Chasing, Attacking }
    private BossState currentState;

    [Header("Combat")]
    [SerializeField] protected float attackRadius;
    [SerializeField] protected float attackCooldown = 2f;
    [SerializeField] protected Transform attackPoint;
    [SerializeField] protected LayerMask whatIsTarget;
    [SerializeField] public float attackDamage = 1f;

    private float lastAttackTime;
    private bool isBusy = false; 

    [Header("Summon")]
    [SerializeField] private GameObject[] minions;
    [SerializeField] private Transform[] summonPoints;

    // --- 3. UNITY LIFECYCLE ---
    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        anim = GetComponentInChildren<Animator>();
        sr = GetComponentInChildren<SpriteRenderer>();
        if (sr) originalMaterial = sr.material;

        currentHealth = maxHealth;
        currentState = BossState.WakingUp;

        // find nearest target matching whatIsTarget if not assigned
        if (playerTransform == null)
        {
            float minDistSqr = float.MaxValue;
            Transform nearest = null;

            // Prefer Entity components when available
            var entities = GameObject.FindObjectsOfType<Entity>();
            for (int i = 0; i < entities.Length; i++)
            {
                var e = entities[i];
                if (e == null || e.gameObject == null || e.gameObject == this.gameObject) continue;
                int layer = e.gameObject.layer;
                if ((whatIsTarget.value & (1 << layer)) == 0) continue;

                float d2 = (e.transform.position - transform.position).sqrMagnitude;
                if (d2 < minDistSqr)
                {
                    minDistSqr = d2;
                    nearest = e.transform;
                }
            }

            // fallback: search all transforms
            if (nearest == null)
            {
                var all = GameObject.FindObjectsOfType<Transform>();
                for (int i = 0; i < all.Length; i++)
                {
                    var t = all[i];
                    if (t == null || t.gameObject == this.gameObject) continue;
                    int layer = t.gameObject.layer;
                    if ((whatIsTarget.value & (1 << layer)) == 0) continue;

                    float d2 = (t.position - transform.position).sqrMagnitude;
                    if (d2 < minDistSqr)
                    {
                        minDistSqr = d2;
                        nearest = t;
                    }
                }
            }

            if (nearest != null)
            {
                playerTransform = nearest;
            }
            else
            {
                Debug.LogWarning("Boss: no target found matching whatIsTarget LayerMask.", this);
            }
        }

        StartCoroutine(WakeUpSequence());
    }

    private void Update()
    {
        Debug.Log("Boss State: " + currentState);

        if (isDead || currentState == BossState.WakingUp) return;

        anim.SetFloat("xVelocity", Mathf.Abs(rb.linearVelocity.x));

        // Máy trạng thái (State Machine)
        switch (currentState)
        {
            case BossState.Chasing:
                LogicChasing();
                break;
            case BossState.Attacking:
                // Đang tấn công thì đứng yên
                rb.linearVelocity = Vector2.zero;
                break;
        }
    }

    // --- 4. AI LOGIC ---
    private void LogicChasing()
    {
        if (playerTransform == null) return;

        float dist = Vector2.Distance(transform.position, playerTransform.position);

        if (!isBusy)
        {
            if (playerTransform.position.x > transform.position.x && facingDir == -1) Flip();
            else if (playerTransform.position.x < transform.position.x && facingDir == 1) Flip();
        }

        if (dist < attackRadius)
        {
            rb.linearVelocity = Vector2.zero;
            if (Time.time > lastAttackTime + attackCooldown)
            {
                StartCoroutine(AttackRoutine());
            }
        }
        else
        {
            if (!isBusy)
                rb.linearVelocity = new Vector2(facingDir * moveSpeed, rb.linearVelocity.y);
        }
    }

    private IEnumerator AttackRoutine()
    {
        isBusy = true;
        currentState = BossState.Attacking;
        lastAttackTime = Time.time;

        // Random chiêu thức
        if (Random.value > 0.5f) anim.SetTrigger("attackSlash");
        else anim.SetTrigger("attackSummon");

        yield return new WaitForSeconds(1.0f);
    }

    // Hàm này ĐỂ ANIMATION EVENT GỌI (nếu bạn dùng Event)
    public void FinishAttack()
    {
        isBusy = false;
        currentState = BossState.Chasing;
    }

    // --- 5. HỆ THỐNG MÁU & CHẾT (QUAN TRỌNG) ---
    public void TakeDamage(float damage)
    {
        if (isDead) return;

        currentHealth -= damage;
        StartCoroutine(FlashDamage());

        // Cập nhật UI máu Boss ở đây nếu cần

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    private void Die()
    {
        isDead = true;
        anim.SetTrigger("die");
        rb.linearVelocity = Vector2.zero;
        GetComponent<Collider2D>().enabled = false;

        Debug.Log("YOU WIN!");
        // Gọi UI chiến thắng
        //UI.Instance.EnableVictoryUI();

        this.enabled = false;
        Destroy(gameObject, 1f);
    }

    // --- 6. CÁC HÀM PHỤ TRỢ ---
    private void Flip()
    {
        facingRight = !facingRight;
        transform.Rotate(0f, 180f, 0f);
        facingDir *= -1;
    }

    private IEnumerator WakeUpSequence()
    {
        yield return new WaitForSeconds(1.5f);
        currentState = BossState.Chasing;
    }

    private IEnumerator FlashDamage()
    {
        if (sr && damageMaterial)
        {
            sr.material = damageMaterial;
            yield return new WaitForSeconds(0.1f);
            sr.material = originalMaterial;
        }
    }

    // Animation Event gọi cái này để gây damage
    public void PerformSlashDamage()
    {
        Vector2 slashPos = (Vector2)transform.position + new Vector2(attackRadius * facingDir * 0.5f, 0);
        // Code gây damage độc lập
        Collider2D[] hits = Physics2D.OverlapCircleAll(slashPos, attackRadius);

        System.Collections.Generic.List<GameObject> damagedObjects = new System.Collections.Generic.List<GameObject>();

        foreach (var hit in hits)
        {
            // Nếu đánh trúng chính mình hoặc Minion của mình thì bỏ qua
            if (hit.transform == transform || hit.CompareTag("Enemy")) continue;

            // Nếu đối tượng này ĐÃ BỊ đánh trong đợt này rồi -> Bỏ qua (Fix lỗi đánh 2 lần)
            if (damagedObjects.Contains(hit.gameObject)) continue;

            // Kiểm tra xem có phải Player không (Theo Tag hoặc Component Entity)
            Entity target = hit.GetComponent<Entity>();

            // Nếu tìm thấy Entity trên đối tượng (hoặc cha của nó)
            if (target != null)
            {
                target.TakeDamage(1); // Gây sát thương
                damagedObjects.Add(hit.gameObject);
                Debug.Log($"Boss chém trúng: {hit.name}");
            }
        }
    }

    public void PerformSummon()
    {
        if (minions.Length > 0 && summonPoints.Length > 0)
        {
            GameObject minionToSpawn = minions[Random.Range(0, minions.Length)];

            Instantiate(minionToSpawn, summonPoints[0].position, Quaternion.identity);
        }
    }

    protected virtual void OnDrawGizmos()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawLine(transform.position, transform.position + new Vector3(0, -groundCheckDistance));
        if (attackPoint != null) Gizmos.DrawWireSphere(attackPoint.position, attackRadius);
    }
}