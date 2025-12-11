using NUnit.Framework;
using System;
using System.Collections.Generic;
using UnityEngine;

public class Player : Entity
{
    [Header("Movement details")]
    [SerializeField] protected float speed;
    [SerializeField] private float normalSpeed;
    [SerializeField] protected float dashSpeed;
    [SerializeField] protected float stamina;
    [SerializeField] protected float maxStamina;
    [SerializeField] protected float staminaRegenPerSec;
    [SerializeField] protected float dashStaminaCost;
    private float xInput;
    [SerializeField] private float jumpForce;
    private bool canJump;
    private bool isDashing;
    [Header("Charge Attack: Right click")]
    [SerializeField] private float chargeAttackRadius;
    [SerializeField] public float chargeAttackDamage;
    [SerializeField] protected float chargeAttackStaminaCost;
    [SerializeField] private bool isUpdatedChargeAttack;
    [SerializeField] private GameObject chargeAttackBullet;
    [SerializeField] private float chargeAttackBulletSpeed;
    [SerializeField] private float chargeAttackBulletLifeTime;
    [SerializeField]private bool canTakeDamage;
    private bool isTitan;
    [Header("UI")]
    [SerializeField] private Canvas healthBarCanvas;
    [SerializeField] private Canvas staminaBarCanvas;
    [SerializeField] private ParticleSystem healingEffect;
    [SerializeField] private ParticleSystem reviveEffect;
    private bool canGetInput;
    [Header("Active Skills: R")]
    [SerializeField] public bool canHeal;
    [SerializeField] public float healAmount;
    [SerializeField] public float healCooldown;
    private float lastHealTime = -Mathf.Infinity;
    [Header("Passive Skills")]
    [SerializeField] private bool canRevive;
    [SerializeField] private bool canRestoreHpByAttack;
    [SerializeField] private float restoreHpPercentByAttack;
    [SerializeField] private bool canDashAndDropBomb;
    [SerializeField] private GameObject bombPrefab;
    [SerializeField] private bool canDealDamageWhileDashing;
    [SerializeField] private float dashDamage;
    protected override void Awake()
    {
        base.Awake();
        healthBarCanvas.GetComponentInChildren<HealthBar>().setMaxHealth(maxHealth);
        staminaBarCanvas.GetComponentInChildren<StaminaBar>().setMaxStamina(maxStamina);
        canGetInput = true;
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
            List<Action> actions = new List<Action>
            {
                () => AudioManager.Instance.Play("hit1"),
                () => AudioManager.Instance.Play("hit2"),
                () => AudioManager.Instance.Play("hit3")
            };
            int randomIndex = UnityEngine.Random.Range(0, actions.Count);
            actions[randomIndex]();
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
                if (xInput == 0)
                {
                    if (facingRight) xInput = 1;
                    else xInput = -1;
                }
                if (rb.linearVelocityX*xInput<0) xInput*=-1;
                if(canDealDamageWhileDashing)
                {
                    DealDamageWhileDashing();
                }
            }
            rb.linearVelocity = new Vector2(xInput * speed, rb.linearVelocityY);
        }
        else
        {
            rb.linearVelocity = new Vector2(0, rb.linearVelocityY);
        }
    }

    private void DealDamageWhileDashing()
    {
        Collider2D[] enemyColliders = Physics2D.OverlapCircleAll(attackPoint.position, attackRadius, whatIsTarget);
        foreach (Collider2D enemy in enemyColliders)
        {
            enemy.GetComponent<Entity>().TakeDamage(dashDamage);
        }
    }

    private void HandleInput()
    {
        if (!canGetInput) return;
        xInput = Input.GetAxisRaw("Horizontal");
        if (Input.GetButtonDown("Jump"))
        {
            TryToJump();
        }
        if (Input.GetButtonDown("Fire1"))
        {
            List<Action> actions = new List<Action>
            {
                () => AudioManager.Instance.Play("attack1"),
                () => AudioManager.Instance.Play("attack2"),
                () => AudioManager.Instance.Play("attack3")
            };
            int randomIndex = UnityEngine.Random.Range(0, actions.Count);
            actions[randomIndex]();
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
        if(Input.GetKeyDown(KeyCode.E))
        {
            tryToHeal();
        }
        //if(!isTitan&&Input.GetKeyDown(KeyCode.T))
        //{
        //    BecomeTitan();
        //}
    }

    private void tryToHeal()
    {
        if(canHeal && Time.time >= lastHealTime + healCooldown && currentHealth < maxHealth)
        {
            UI.Instance.ResetButtonCooldown("RestoreHpButton", healCooldown);
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
            AudioManager.Instance.Play("heavyAttack");
            stamina -= chargeAttackStaminaCost;
            anim.SetTrigger("chargeAttack");
            staminaBarCanvas.GetComponentInChildren<StaminaBar>().setStamina(stamina);
        }
    }
    public void ShootChargeAttackBullet()
    {
        GameObject bullet = Instantiate(chargeAttackBullet, attackPoint.position, Quaternion.identity);
        if (isTitan)
        {
            bullet.transform.localScale *= 2f;
        }
        bullet.GetComponent<SwordBullet>().setDamage(chargeAttackDamage);
        bullet.GetComponent<SwordBullet>().setSpeed(chargeAttackBulletSpeed * facingDir);
        Destroy(bullet, chargeAttackBulletLifeTime);
    }
    public override void DamageTargets(float damage)
    {
        Collider2D[] enemyColliders = Physics2D.OverlapCircleAll(attackPoint.position, attackRadius, whatIsTarget);
        foreach (Collider2D enemy in enemyColliders)
        {
            Entity entityScript = enemy.GetComponent<Entity>();
            if (entityScript != null)
            {
                entityScript.TakeDamage(chargeAttackDamage);
            }
            else
            {
                Boss bossScript = enemy.GetComponent<Boss>();
                if (bossScript != null)
                {
                    bossScript.TakeDamage(chargeAttackDamage);
                }
            }
            if (canRestoreHpByAttack)
            {
                Debug.Log("Restoring HP by attack");
                RestoreHpByAttack(damage);
            }
        }
    }
    
    public bool IsUpdatedChargeAttack()
    {
        return isUpdatedChargeAttack;
    }
    private void tryToDash()
    {
        if(!isDashing&&stamina>=dashStaminaCost)
        {
            stamina -= dashStaminaCost;
            anim.SetTrigger("dash");
            staminaBarCanvas.GetComponentInChildren<StaminaBar>().setStamina(stamina);
            if(canDashAndDropBomb)
            {
                GameObject temp=Instantiate(bombPrefab, transform.position, Quaternion.identity);
                temp.GetComponent<Bomb>().setDirection(!facingRight);
            }
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
            AudioManager.Instance.Play("warriorDie");
            base.Die();
            UI.Instance.EnableGameOverUI();
        }
    }
    public void DamegeTargetsByChargeAttack()
    {
        Collider2D[] enemyColliders = Physics2D.OverlapCircleAll(attackPoint.position, chargeAttackRadius, whatIsTarget);
        foreach (Collider2D enemy in enemyColliders)
        {
            Entity entityScript = enemy.GetComponent<Entity>();
            if (entityScript != null)
            {
                entityScript.TakeDamage(chargeAttackDamage);
            }
            else
            {
                Boss bossScript = enemy.GetComponent<Boss>();
                if (bossScript != null)
                {
                    bossScript.TakeDamage(chargeAttackDamage);
                }
            }
            if (canRestoreHpByAttack)
            {
                RestoreHpByAttack(chargeAttackDamage);
            }
        }
    }

    private void RestoreHpByAttack(float damage)
    {
        float restoreHp = (restoreHpPercentByAttack / 100f) * damage;
        currentHealth += restoreHp;
        if (currentHealth > maxHealth) currentHealth = maxHealth;
        healthBarCanvas.GetComponentInChildren<HealthBar>().setHealth(currentHealth);
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
    
    //turn on skill
    public void BecomeTitan()
    {
        isTitan = true;
        TryToJump();
        groundCheckDistance *= 2;
        this.maxHealth *= 2;
        this.currentHealth = this.maxHealth;
        healthBarCanvas.GetComponentInChildren<HealthBar>().setMaxHealth(maxHealth);
        this.transform.transform.localScale *= 2f;
        this.attackDamage *= 1.5f;
        chargeAttackDamage *= 1.5f;
        speed*=0.5f;
        normalSpeed*=0.5f;
        dashSpeed*=0.5f;
        jumpForce*=0.7f;
        chargeAttackStaminaCost += 15;
        dashStaminaCost+=15;
        attackRadius *= 2;
        chargeAttackRadius *= 2;
    }
    public void UpdateChargeAttacke(bool update)
    {
        isUpdatedChargeAttack = update;
        chargeAttackStaminaCost+=15;
    }
    public void setBloodthirsty(bool enable)
    {
        canRestoreHpByAttack = enable;
    }
    public void setCanHeal(bool enable)
    {
        canHeal = enable;
    }
    public void setCanDashAndDropBomb(bool enable)
    {
        canDashAndDropBomb = enable;
    }
    public void setCanDealDamageWhileDashing(bool enable)
    {
        canDealDamageWhileDashing = enable;
    }
    public void setCanRevive(bool enable)
    {
        canRevive = enable;
    }
    protected override void OnDrawGizmos()
    {
        base.OnDrawGizmos();
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(attackPoint.position, chargeAttackRadius);
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
