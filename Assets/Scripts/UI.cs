using System;
using System.Collections;
using System.ComponentModel;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.InputSystem;

public class UI : MonoBehaviour
{
    public static UI Instance { get; private set; }
    [SerializeField] private GameObject gameOverUI;
    [Space]
    [SerializeField] private GameObject inGameUi;
    [SerializeField] private GameObject startGameUI;
    [SerializeField] private TextMeshProUGUI timerText;
    [SerializeField] private TextMeshProUGUI killcountText;
    [SerializeField] private TextMeshProUGUI guideText;
    [SerializeField] private string initialGuideText;
    [SerializeField] private GameObject chooseSkillUI;
    [SerializeField] private GameObject levelCompleteUI;
    [SerializeField] private GameObject pauseUI;
    [SerializeField] private GameObject winUI;
    [Description("Sắp xếp các prefab đúng thứ tự của chooseSkillButtonIndex")]
    [SerializeField] private GameObject[] chooseSkillUIPrefab;
    private chooseSkillButtonIndex[] skillPool;
    private bool canPause;
    [Description("Player")]
    [SerializeField] private Player player;
    [SerializeField] private ObjectToProtect objectToProtect ;
    public enum chooseSkillButtonIndex
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
    private float senceTimer;
    private int killCount;
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            //DontDestroyOnLoad(gameObject);
        }
        //else
        //{
        //    Destroy(gameObject);
        //}
        Time.timeScale = 1f;
        senceTimer = 0f;
        skillPool = Enum.GetValues(typeof(chooseSkillButtonIndex))
            .Cast<chooseSkillButtonIndex>()
            .ToArray();
        guideText.SetText(initialGuideText);
        canPause = false;
    }
    private void Update()
    {
        senceTimer += Time.deltaTime;
        if (inGameUi.activeSelf) timerText.text = senceTimer.ToString("F2") + "s";
        HandleInput();
    }

    private void HandleInput()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            if (!canPause) return;
            if (inGameUi.activeSelf)
            {
                PauseGame();
            }
            else
            {
                ResumeGame();
            }
        }
    }

    public void StartGame()
    {
        inGameUi.SetActive(true);
        GameManager.Instance.StartGame();
    }
    public void NextLevel()
    {
        inGameUi.SetActive(true);
        senceTimer = 0f;
        GameManager.Instance.NextLevel();
    }
    public void ResumeGame()
    {
        pauseUI.SetActive(false);
        inGameUi.SetActive(true);
        player.SetCanGetInput(true);
        objectToProtect.SetCanGetInput(true);
        Time.timeScale = 1f;
    }
    public void QuitGame()
    {
        Application.Quit();
    }
    public void PauseGame()
    {
        inGameUi.SetActive(false);
        pauseUI.SetActive(true);
        player.SetCanGetInput(false);
        objectToProtect.SetCanGetInput(false);
        Time.timeScale = 0f;
    }
    public void UpdateKillCount()
    {
        killCount++;
        killcountText.text = killCount.ToString();
    }
    public void RestartLevel()
    {
        foreach (var obj in FindObjectsOfType<GameObject>())
        {
            if (obj.scene.name == null) // object floating hoặc DontDestroyOnLoad
                Destroy(obj);
        }

        PlayerPrefs.DeleteAll();
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
    public void EnableGameOverUI()
    {
        Time.timeScale = 0.5f;
        StartCoroutine(CoShowGameOverUiAfterDelay(3f));
    }

    private IEnumerator CoShowGameOverUiAfterDelay(float v)
    {
        yield return new WaitForSeconds(v);
        gameOverUI.SetActive(true);
    }
    public void ResetButtonCooldown(string tag,float cooldown)
    {
        inGameUi.GetComponentsInChildren<SkillButton>()
            .Where(button => button.CompareTag(tag))
            .ToList()
            .ForEach(button => button.SetCooldown(cooldown));
    }
    public void ShowChooseSkillUI()
    {
        // Randomly choose 2 different skills
        int skill1Index = UnityEngine.Random.Range(0, skillPool.Length);
        int skill1 = (int)skillPool[skill1Index];
        int skill2Index = UnityEngine.Random.Range(0, skillPool.Length);
        int skill2 = (int)skillPool[skill2Index];
        while (skill2Index == skill1Index)
        {
            skill2Index = UnityEngine.Random.Range(0, skillPool.Length);
            skill2 = (int)skillPool[skill2Index];
        }
        //
        startGameUI.SetActive(false);
        levelCompleteUI.SetActive(false);
        chooseSkillUI.SetActive(true);
        var temp = chooseSkillUI.GetComponentsInChildren<RectTransform>()
            .Where(rt => rt.CompareTag("Point"))
            .ToList();
        var ui1 = Instantiate(chooseSkillUIPrefab[skill1], chooseSkillUI.transform);
        var ui2 = Instantiate(chooseSkillUIPrefab[skill2], chooseSkillUI.transform);
        ui1.GetComponent<Button>().onClick.AddListener(() =>
        {
            ActivateSkill((chooseSkillButtonIndex)skill1);
            skillPool = skillPool.Where((skill, index) => index != skill1Index).ToArray();
            chooseSkillUI.SetActive(false);
            Destroy(ui1);
            Destroy(ui2);
            NextLevel();
        });
        ui2.GetComponent<Button>().onClick.AddListener(() =>
        {
            ActivateSkill((chooseSkillButtonIndex)skill2);
            skillPool = skillPool.Where((skill, index) => index != skill2Index).ToArray();
            chooseSkillUI.SetActive(false);
            Destroy(ui1);
            Destroy(ui2);
            NextLevel();
        });
        ui1.GetComponent<RectTransform>().anchoredPosition = temp[0].anchoredPosition;
        ui2.GetComponent<RectTransform>().anchoredPosition = temp[1].anchoredPosition;
    }
    // helper: find child GameObject by tag (searches inactive children too)
    private GameObject FindChildWithTag(Transform parent, string tag)
    {
        if (parent == null) return null;
        foreach (Transform t in parent.GetComponentsInChildren<Transform>(true))
        {
            if (t.CompareTag(tag)) return t.gameObject;
        }
        return null;
    }
    //turn on skill
    public void ActivateSkill(chooseSkillButtonIndex skill)
    {
        switch (skill)
        {
            case chooseSkillButtonIndex.RESTORE_HEALTH:
                player.setCanHeal(true);
                {
                    var go = FindChildWithTag(inGameUi.transform, "RestoreHpButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("RestoreHpButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.RESTORE_HEALTH_BY_ATTACK:
                player.setBloodthirsty(true);
                {
                    var go = FindChildWithTag(inGameUi.transform, "RestoreHpByAttackButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("RestoreHpByAttackButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.DASH_AND_DROP_BOMB:
                player.setCanDashAndDropBomb(true);
                {
                    var go = FindChildWithTag(inGameUi.transform, "BombButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("BombButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.DEAL_DAMAGE_WHILE_DASHING:
                player.setCanDealDamageWhileDashing(true);
                {
                    var go = FindChildWithTag(inGameUi.transform, "DeadDashButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("DeadDashButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.BECOME_TITAN:
                player.BecomeTitan();
                {
                    var go = FindChildWithTag(inGameUi.transform, "TitanButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("TitanButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.ACTIVATE_SHIELD:
                objectToProtect.EnableShieldSkill();
                {
                    var go = FindChildWithTag(inGameUi.transform, "ShieldButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("ShieldButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.CAST_LIGHTNING_STRIKE:
                objectToProtect.EnableLightningStrikeSkill();
                {
                    var go = FindChildWithTag(inGameUi.transform, "LightningButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("LightningButton not found under inGameUi", this);
                }
                break;
            case chooseSkillButtonIndex.UPGRADE_CHARGE_ATTACK:
                {
                    var go = FindChildWithTag(inGameUi.transform, "UpgradedChargeAttackButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("UpgradedChargeAttackButton not found under inGameUi", this);
                }
                player.UpdateChargeAttacke(true);
                break;
            case chooseSkillButtonIndex.REVIVE_ONCE:
                {
                    var go = FindChildWithTag(inGameUi.transform, "ReviveButton");
                    if (go != null) go.SetActive(true);
                    else Debug.LogWarning("ReviveButton not found under inGameUi", this);
                }
                player.setCanRevive(true);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(skill), skill, null);
        }
    }
    public void ShowLevelCompleteUI()
    {
        inGameUi.SetActive(false);
        levelCompleteUI.SetActive(true);
    }
    public void ShowWinUI()
    {
        Time.timeScale = 0.5f;
        winUI.SetActive(true);
    }
    public void ShowGuideText(float seconds,string additionText)
    {
        if (seconds > 0)
        {
            guideText.SetText(initialGuideText + (additionText != null ? additionText : ""));
            guideText.gameObject.SetActive(true);
            StartCoroutine(CoShowGuideText(seconds));
        }
    }
    private IEnumerator CoShowGuideText(float seconds)
    {
        yield return new WaitForSeconds(seconds);
        guideText.gameObject.SetActive(false);
    }
    public void setCanPause(bool canPause)
    {
        this.canPause = canPause;
    }
    public bool getCanPause()
    {
        return canPause;
    }
}
