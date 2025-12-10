using UnityEngine;

public class SwordBullet : MonoBehaviour
{
    //private float cooldownTime = 0.5f;
    //private float lastDealDamageTime = -Mathf.Infinity;
    [SerializeField] private float speed = 20f;
    [SerializeField] private float damage = 2f;
    private void Start()
    {
        AudioManager.Instance.Play("boomerang");
    }
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.gameObject.layer == LayerMask.NameToLayer("Enemy"))
        {
            Entity enemy = collision.GetComponent<Entity>();
            if (enemy != null)
            {
                enemy.TakeDamage(damage);
            }
        }
    }

    public void setDamage(float damage)
    {
        this.damage = damage;
    }
    public void setSpeed(float speed)
    {
        this.speed = speed;
    }
    private void Update()
    {
        transform.Translate(Vector2.right * speed * Time.deltaTime);
    }
}
