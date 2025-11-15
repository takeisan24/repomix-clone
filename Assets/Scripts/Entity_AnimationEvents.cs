using UnityEngine;

public class Entity_AnimationEvents : MonoBehaviour
{
    private Entity entity;
    protected virtual void Awake()
    {
        entity = GetComponentInParent<Entity>();
    }
    protected void DamageTargets() {
        entity.DamageTargets(entity.attackDamage);
    }
    protected void DisableMovementAndJump()=> entity.EnableMovementAndJump(false);
    protected void EnableMovementAndJump()=> entity.EnableMovementAndJump(true);
}
