using Unity.VisualScripting;
using UnityEngine;

public class Enemy : Entity
{
    private bool playerDectected;
    private bool playerShieldDetected;
    [Header("Movement details")]
    [SerializeField] protected float speed = 5f;
    protected override void Update()
    {
        base.Update();
        HandleAttack();
    }
    protected override void HandleAttack()
    {
        if (playerDectected||playerShieldDetected)
        {
            AudioManager.Instance.Play("sword");
            anim.SetTrigger("attack");
        }
    }
    protected override void HandleCollision()
    {
        base.HandleCollision();
        playerDectected = Physics2D.OverlapCircle(transform.position, attackRadius, whatIsTarget);
        playerShieldDetected = Physics2D.OverlapCircle(transform.position, attackRadius, LayerMask.GetMask("PlayerShield"));

    }
    protected override void HandleMovement()
    {
        if (canMove)
        {
            rb.linearVelocity = new Vector2(facingDir * speed, rb.linearVelocityY);
        }
        else
        {
            rb.linearVelocity = new Vector2(0, rb.linearVelocityY);
        }
    }
    protected override void Die()
    {
        AudioManager.Instance.Play("enemyDie");
        base.Die();
        UI.Instance.UpdateKillCount();
    }
}
