using System;
using System.Collections;
using UnityEngine;

public class Bomb : MonoBehaviour
{
    [SerializeField] private float speed;
    [SerializeField] private float lifetime;
    [SerializeField] private GameObject explosionEffectPrefab;
    private void Awake()
    {
        StartCoroutine(DestroyAfterTimeCo());
    }

    private IEnumerator DestroyAfterTimeCo()
    {
        WaitForSeconds wait = new WaitForSeconds(lifetime);
        yield return wait;
        Destroy(gameObject);
        GameObject explosion = Instantiate(explosionEffectPrefab, transform.position, Quaternion.identity);
        explosion.GetComponent<Explosion>().setX(transform.position.x);
    }

    private void Update()
    {
        transform.Translate(Vector2.right * speed * Time.deltaTime);
    }
    public void setDirection(bool right)
    {
        if (!right)
        {
            speed = -speed;
        }
    }
}
