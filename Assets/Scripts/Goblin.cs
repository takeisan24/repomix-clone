using UnityEngine;

public class Goblin : Entity
{
    private bool playerDectected;
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
        if (playerDectected)
        {
            anim.SetTrigger("attack");
        }
    }
    protected override void HandleCollision()
    {
        base.HandleCollision();
        playerDectected = Physics2D.OverlapCircle(transform.position, attackRadius, whatIsTarget);
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
        base.Die();
        UI.Instance.UpdateKillCount();
    }
}