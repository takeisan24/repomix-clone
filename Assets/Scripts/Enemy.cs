using System;
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
        FindNearestTarget();
        HandleAttack();
    }

    protected override void HandleAttack()
    {
        if (playerDectected||playerShieldDetected)
        {
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
    public override void EnableMovementAndJump(bool enable)
    {
        base.EnableMovementAndJump(enable);
        if (!enable)
        {
            AudioManager.Instance.Play("sword");
        }
    }
    protected override void Die()
    {
        AudioManager.Instance.Play("enemyDie");
        base.Die();
        UI.Instance.UpdateKillCount();
    }
}
