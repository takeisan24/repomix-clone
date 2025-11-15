using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;
    UI_Fade fadeUI;
    private void Awake()
    {
        if(Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    public void ChangeLevelTo(string levelName)
    {
        StartCoroutine(ChangeLevelCo(levelName));
    }
    private IEnumerator ChangeLevelCo(string levelName)
    {
        GetFadeUI().FadeIn();
        yield return GetFadeUI().fadeEffectCo;
        SceneManager.LoadScene(levelName);
    }
    private UI_Fade GetFadeUI()
    {
        if (fadeUI == null)
        {
            fadeUI = FindFirstObjectByType<UI_Fade>();
        }
        return fadeUI;
    }
}
