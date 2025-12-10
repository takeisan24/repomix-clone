using UnityEngine;

public class Player_AnimationEvent : Entity_AnimationEvents
{
    Player player;
    protected override void Awake()
    {
        base.Awake();
        player = GetComponentInParent<Player>();
    }
    public void EnableDash() => player.EnableDash(true);
    public void DisableDash() => player.EnableDash(false);
    public void DamageTargetsByChargeAttack()
    {
        player.DamegeTargetsByChargeAttack();
        if (player.IsUpdatedChargeAttack())
        {
            Debug.Log("Shoot Charge Attack Bullet");
            player.ShootChargeAttackBullet();
        }
    }
}
