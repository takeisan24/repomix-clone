using UnityEngine;
using UnityEngine.UI;

public class HealthBar : MonoBehaviour
{
    [SerializeField] protected Slider Slider;
    public void setMaxHealth(float health)
    {
        Slider.maxValue = health;
        Slider.value = health;
    }
    public void setHealth(float health)
    {
        Slider.value = health;
    }
}
