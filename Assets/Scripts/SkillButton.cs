using TMPro;
using UnityEngine;

public class SkillButton : MonoBehaviour
{
    private TextMeshProUGUI cooldownText;
    private float timer;
    [SerializeField] private string textAfterCooldown;
    private void Awake()
    {
        timer = 0f;
        cooldownText = GetComponentInChildren<TextMeshProUGUI>();
    }
    private void Update()
    {
        if (gameObject.activeSelf)
        {
            if (timer > 0f)
            {
                timer -= Time.deltaTime;
                cooldownText.text = Mathf.Ceil(timer).ToString();
            }
            else
            {
                cooldownText.text = textAfterCooldown;
            }
        }
    }
    public void SetCooldown(float cooldown)
    {
        timer = cooldown;
    }
}
