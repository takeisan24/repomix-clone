using UnityEngine;

public class StaminaBar : MonoBehaviour
{
    [SerializeField] protected UnityEngine.UI.Slider Slider;
    public void setMaxStamina(float stamina)
    {
        Slider.maxValue = stamina;
        Slider.value = stamina;
    }
    public void setStamina(float stamina)
    {
        Slider.value = stamina;
    }
}
