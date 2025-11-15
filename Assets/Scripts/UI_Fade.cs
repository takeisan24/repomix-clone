using System.Collections;
using UnityEngine;

public class UI_Fade : MonoBehaviour
{
    [SerializeField] private CanvasGroup canvasGroup;
    [SerializeField] private float fadeDuration = 1.5f;
    public Coroutine fadeEffectCo { get; private set; }
    public void Start()
    {
        FadeOut(); // Fade in at the start
    }
    private void FadeEffect(float targetAlpha)
    {
        if(fadeEffectCo != null)
            StopCoroutine(fadeEffectCo);
        fadeEffectCo = StartCoroutine(ChangeAlphaCo(targetAlpha));
    }
    public void FadeIn()
    {
        FadeEffect(1f);
    }
    public void FadeOut()
    {
        FadeEffect(0f);
    }
    private IEnumerator ChangeAlphaCo(float targetAlpha)
    {
        float timePassed = 0f;
        float startAlpha = canvasGroup.alpha;
        while (timePassed < fadeDuration)
        {
            timePassed += Time.deltaTime;
            canvasGroup.alpha = Mathf.Lerp(startAlpha, targetAlpha, timePassed / fadeDuration);
            yield return null;
        }
        canvasGroup.alpha = targetAlpha;
    }
}
