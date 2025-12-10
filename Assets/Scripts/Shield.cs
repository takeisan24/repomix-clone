using UnityEngine;

public class Shield : MonoBehaviour
{
    [SerializeField] private float damage;
    [Tooltip("If true, will also deal damage repeatedly while the enemy stays inside the trigger (uses damageInterval).")]
    [SerializeField] private bool damageOverTime;
    [SerializeField] private float damageInterval;

    private Collider2D col;

    // track last damage time per target when using DOT (keyed by GameObject)
    private System.Collections.Generic.Dictionary<GameObject, float> lastDamageTime = new System.Collections.Generic.Dictionary<GameObject, float>();

    private void Awake()
    {
        col = GetComponent<Collider2D>();
        if (col == null)
        {
            Debug.LogError("Shield requires a Collider2D on the same GameObject.", this);
            enabled = false;
            return;
        }
        // ensure collider is NOT a trigger
        col.isTrigger = false;
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision == null) return;
        GameObject otherObj = collision.gameObject;
        if (otherObj == null || otherObj == gameObject) return;

        int enemyLayer = LayerMask.NameToLayer("Enemy");
        if (enemyLayer >= 0 && otherObj.layer == enemyLayer)
        {
            DealDamageToGameObject(otherObj);
            if (damageOverTime)
            {
                lastDamageTime[otherObj] = Time.time;
            }
        }
    }

    private void OnCollisionStay2D(Collision2D collision)
    {
        if (!damageOverTime) return;
        if (collision == null) return;
        GameObject otherObj = collision.gameObject;
        if (otherObj == null) return;

        int enemyLayer = LayerMask.NameToLayer("Enemy");
        if (enemyLayer >= 0 && otherObj.layer == enemyLayer)
        {
            float lastTime;
            lastDamageTime.TryGetValue(otherObj, out lastTime);
            if (Time.time - lastTime >= damageInterval)
            {
                DealDamageToGameObject(otherObj);
                lastDamageTime[otherObj] = Time.time;
            }
        }
    }

    private void OnCollisionExit2D(Collision2D collision)
    {
        if (collision == null) return;
        GameObject otherObj = collision.gameObject;
        if (otherObj == null) return;
        if (lastDamageTime.ContainsKey(otherObj)) lastDamageTime.Remove(otherObj);
    }

    private void DealDamageToGameObject(GameObject otherObj)
    {
        if (otherObj == null) return;
        // prefer Entity on the object or its parents
        Entity ent = otherObj.GetComponent<Entity>();
        if (ent == null) ent = otherObj.GetComponentInParent<Entity>();
        if (ent != null)
        {
            ent.TakeDamage(damage);
            return;
        }

        // fallback: try to find Entity on any attached rigidbody
        Rigidbody2D rb = otherObj.GetComponent<Rigidbody2D>();
        if (rb != null)
        {
            ent = rb.GetComponent<Entity>();
            if (ent != null) ent.TakeDamage(damage);
        }
    }
}
