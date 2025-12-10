using NUnit.Framework;
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    [SerializeField] private Enemy_Respawner enemyRespawner;
    private Level currentLevel;
    public enum Level
    {
        NONE=-1,FIRST, SECOND, THIRD, FOURTH
    }
    public enum Skill
    {
        RESTORE_HEALTH,
        RESTORE_HEALTH_BY_ATTACK,
        DASH_AND_DROP_BOMB,
        DEAL_DAMAGE_WHILE_DASHING,
        BECOME_TITAN,
        ACTIVATE_SHIELD,
        CAST_LIGHTNING_STRIKE,
        UPGRADE_CHARGE_ATTACK,
        REVIVE_ONCE
    }
    UI_Fade fadeUI;
    private void Awake()
    {
        if(Instance == null)
        {
            Instance = this;
            //DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
        currentLevel = Level.NONE;
    }
    public void StartGame()
    {
        currentLevel = Level.FIRST;
        enemyRespawner.setCurrentLevel(Level.FIRST);
        enemyRespawner.SetCanSpawn(true);
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
    public void NextLevel()
    {
        switch (currentLevel)
        {
            case Level.NONE:
                currentLevel = Level.FIRST;
                enemyRespawner.setCurrentLevel(Level.FIRST);
                UI.Instance.ShowGuideText(8,null);
                UI.Instance.setCanPause(true);
                //enemyRespawner.SetCanSpawn(true);
                break;
            case Level.FIRST:
                currentLevel = Level.SECOND;
                enemyRespawner.setCurrentLevel(Level.SECOND);
                UI.Instance.ShowGuideText(8, "New enemys have arrived");
                UI.Instance.setCanPause(true);
                //enemyRespawner.SetCanSpawn(true);
                break;
            case Level.SECOND:
                currentLevel = Level.THIRD;
                enemyRespawner.setCurrentLevel(Level.THIRD);
                UI.Instance.ShowGuideText(8, "New enemys have arrived");
                UI.Instance.setCanPause(true);
                //enemyRespawner.SetCanSpawn(true);
                break;
            case Level.THIRD:
                currentLevel = Level.FOURTH;
                enemyRespawner.setCurrentLevel(Level.FOURTH);
                UI.Instance.ShowGuideText(8, null);
                //enemyRespawner.SetCanSpawn(true);
                break;
            case Level.FOURTH:
                // Final level reached, handle accordingly
                UI.Instance.ShowWinUI();
                break;
        }
    }
    public void OnLevelCleared()
    {
        UI.Instance.setCanPause(false);
        if (currentLevel != Level.FOURTH)
        {
            UI.Instance.ShowLevelCompleteUI();
        }
        else
        {
            // Final level cleared
            UI.Instance.ShowWinUI();
        }
    }
}
