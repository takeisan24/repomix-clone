using UnityEngine;

public class ThunderStrike : MonoBehaviour
{
    private Collider2D col;
    [SerializeField] private float damage;
    private void Awake()
    {
        col = GetComponent<Collider2D>();
    }
    public void setDamage(float damage)
    {
        this.damage = damage;
    }
    public void dealDamage()
    {
        AudioManager.Instance.Play("lightningStrike");
        Collider2D[] hitColliders = Physics2D.OverlapBoxAll(col.bounds.center, col.bounds.size, 0f, LayerMask.GetMask("Enemy"));
        foreach (Collider2D hitCollider in hitColliders)
        {
            Entity enemy = hitCollider.GetComponent<Entity>();
            if (enemy != null)
            {
                enemy.TakeDamage(damage);
            }
        }
    }
    public void DestroyObject()
    {
        Destroy(gameObject);
    }
}
