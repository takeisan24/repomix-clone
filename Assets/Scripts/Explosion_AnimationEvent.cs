using UnityEngine;

public class Explosion_AnimationEvent : MonoBehaviour
{
    private Explosion explosion;
    private void Awake()
    {
        explosion = GetComponentInParent<Explosion>();
    }
    public void DamageTarget()
    {
        explosion.DamageTarget();
    }
    public void DestroyExplosion()
    {
        Destroy(explosion.gameObject);
    }
}
