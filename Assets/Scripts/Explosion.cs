using UnityEngine;

public class Explosion : MonoBehaviour
{
    [SerializeField] private float explosionDamage;
    [SerializeField] private LayerMask whatIsTarget;
    private Collider2D col;
    private void Awake()
    {
        col = GetComponent<Collider2D>();
    }
    public void DamageTarget()
    {
        AudioManager.Instance.Play("explosion");
        Collider2D[] targets = Physics2D.OverlapCircleAll(transform.position, col.bounds.extents.x, whatIsTarget);
        foreach (Collider2D target in targets)
        {
            Entity entityScript = target.GetComponent<Entity>();
            if (entityScript != null)
            {
                entityScript.TakeDamage(explosionDamage);
            }
            else
            {
                Boss bossScript = target.GetComponent<Boss>();
                if (bossScript != null)
                {
                    bossScript.TakeDamage(explosionDamage);
                }
            }
        }
    }
    public void setX(float x)
    {
        gameObject.transform.position.Set(x, gameObject.transform.position.y, gameObject.transform.position.z);
    }
}
