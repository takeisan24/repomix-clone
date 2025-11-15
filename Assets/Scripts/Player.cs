using System;
using UnityEngine;

public class Player : Entity
{
    [Header("Movement details")]
    [SerializeField] protected float speed = 5f;
    [SerializeField] private float normalSpeed=5f;
    [SerializeField] protected float dashSpeed = 0f;
    [SerializeField] protected float stamina=100f;
    [SerializeField] protected float maxStamina=100f;
    [SerializeField] protected float staminaRegenPerSec=33f;
    [SerializeField] protected float dashStaminaCost=40f;
    private float xInput;
    [SerializeField] private float jumpForce = 10f;
    private bool canJump = true;
    private bool isDashing = false;
    [Header("Special attacke")]
    [SerializeField] private float chargeAttackRadius= 1.5f;
    [SerializeField] public float chargeAttackDamage = 2f;
    [SerializeField] protected float chargeAttackStaminaCost;
    private bool canTakeDamage = true;
    [Header("UI")]
    [SerializeField] private Canvas healthBarCanvas;
    [SerializeField] private Canvas staminaBarCanvas;
    [SerializeField] private ParticleSystem healingEffect;
    [SerializeField] private ParticleSystem reviveEffect;
    [Header("Active Skills")]
    [SerializeField] public bool canHeal;
    [SerializeField] public float healAmount;
    [SerializeField] public float healCooldown;
    private float lastHealTime = -Mathf.Infinity;
    [Header("Passive Skills")]
    [SerializeField] private bool canRevive;
    protected override void Awake()
    {
        base.Awake();
        healthBarCanvas.GetComponentInChildren<HealthBar>().setMaxHealth(maxHealth);
        staminaBarCanvas.GetComponentInChildren<StaminaBar>().setMaxStamina(maxStamina);
    }
    protected override void Update()
    {
        base.Update();
        HandleInput();
        RegenerateStamina();
    }
    public override void TakeDamage(float damage)
    {
        if (canTakeDamage)
        {
            base.TakeDamage(damage);
            healthBarCanvas.GetComponentInChildren<HealthBar>().setHealth(currentHealth);
        }
    }
    protected override void HandleMovement()
    {
        if (canMove)
        {
            if (isDashing)
            {
                if (xInput == 0) xInput = 1;
                if (rb.linearVelocityX*xInput<0) xInput*=-1;
            }
            rb.linearVelocity = new Vector2(xInput * speed, rb.linearVelocityY);
        }
        else
        {
            rb.linearVelocity = new Vector2(0, rb.linearVelocityY);
        }
    }
    private void HandleInput()
    {
        xInput = Input.GetAxisRaw("Horizontal");
        if (Input.GetButtonDown("Jump"))
        {
            TryToJump();
        }
        if (Input.GetButtonDown("Fire1"))
        {
            anim.SetTrigger("attack");
        }
        if(Input.GetKeyDown(KeyCode.LeftShift))
        {
            tryToDash();
            
        }
        if (Input.GetButtonDown("Fire2"))
        {
            tryToChargeAttack();
        }
        if(Input.GetKeyDown(KeyCode.R))
        {
            tryToHeal();
        }
    }

    private void tryToHeal()
    {
        if(canHeal && Time.time >= lastHealTime + healCooldown && currentHealth < maxHealth)
        {
            lastHealTime = Time.time;
            currentHealth += healAmount;
            if (currentHealth > maxHealth) currentHealth = maxHealth;
            healthBarCanvas.GetComponentInChildren<HealthBar>().setHealth(currentHealth);
            healingEffect.Play();
        }
    }

    private void tryToChargeAttack()
    {
        if(stamina>=chargeAttackStaminaCost)
        {
            stamina -= chargeAttackStaminaCost;
            anim.SetTrigger("chargeAttack");
            staminaBarCanvas.GetComponentInChildren<StaminaBar>().setStamina(stamina);
        }
    }

    private void tryToDash()
    {
        if(!isDashing&&stamina>=dashStaminaCost)
        {
            stamina -= dashStaminaCost;
            anim.SetTrigger("dash");
            staminaBarCanvas.GetComponentInChildren<StaminaBar>().setStamina(stamina);
        }
    }

    public void EnableDash(bool enable)
    {
        isDashing = enable;
        if (isDashing)
        {
            canTakeDamage = false;
            speed =dashSpeed;
        }
        else
        {
            canTakeDamage = true;
            speed =normalSpeed;
        }
    }
    public override void EnableMovementAndJump(bool enable)
    {
        base.EnableMovementAndJump(enable);
        canJump = enable;
    }
    private void TryToJump()
    {
        if (isGrounded && canJump) rb.AddForce(Vector2.up * jumpForce, ForceMode2D.Impulse);
        //rb.linearVelocity=new Vector2(rb.linearVelocityX, jumpForce);
    }
    protected override void Die()
    {
        if (canRevive)
        {
            currentHealth = maxHealth;
            healthBarCanvas.GetComponentInChildren<HealthBar>().setHealth(currentHealth);
            canRevive = false;
            reviveEffect.Play();
        }
        else
        {
            base.Die();
            UI.Instance.EnableGameOverUI();
        }
    }
    public void DamegeTargetsByChargeAttack()
    {
        Collider2D[] enemyColliders = Physics2D.OverlapCircleAll(attackPoint.position, chargeAttackRadius, whatIsTarget);
        foreach (Collider2D enemy in enemyColliders)
        {
            enemy.GetComponent<Entity>().TakeDamage(chargeAttackDamage);
        }
    }
    public override void Flip()
    {
        base.Flip();
        healthBarCanvas.transform.Rotate(0f, 180f, 0f);
        staminaBarCanvas.transform.Rotate(0f, 180f, 0f);
    }
    protected void RegenerateStamina()
    {
        if (!isDashing && stamina < maxStamina)
        {
            stamina += staminaRegenPerSec * Time.deltaTime;
            if (stamina > maxStamina) stamina = maxStamina;
        }
        staminaBarCanvas.GetComponentInChildren<StaminaBar>().setStamina(stamina);
    }
    protected override void OnDrawGizmos()
    {
        base.OnDrawGizmos();
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(attackPoint.position, chargeAttackRadius);
    }
}
