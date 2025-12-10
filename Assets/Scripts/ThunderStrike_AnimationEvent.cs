using UnityEngine;

public class ThunderStrike_AnimationEvent : MonoBehaviour
{
    ThunderStrike thunderStrike;
    private void Awake()
    {
        thunderStrike = GetComponentInParent<ThunderStrike>();
    }
    public void DealDamage()
    {
        thunderStrike.dealDamage();
    }
    public void DestroyObject()
    {
        this.thunderStrike.DestroyObject();
    }
}
