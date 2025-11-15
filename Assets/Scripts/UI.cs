using System;
using System.Collections;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;

public class UI : MonoBehaviour
{
    public static UI Instance { get; private set; }
    [SerializeField] private GameObject gameOverUI;
    [Space]
    [SerializeField] private TextMeshProUGUI timerText;
    [SerializeField] private TextMeshProUGUI killcountText;
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
    }
    private void Update()
    {
        timerText.text = Time.timeSinceLevelLoad.ToString("F2") + "s";
    }
    public void UpdateKillCount()
    {
        killCount++;
        killcountText.text = killCount.ToString();
    }
    public void RestartLevel()
    {
        int sceneIndex = SceneManager.GetActiveScene().buildIndex;
        SceneManager.LoadScene(sceneIndex);
    }
    public void EnableGameOverUI()
    {
        Time.timeScale = 0.5f;
        StartCoroutine(CoShowUiAfterDelay(3f));
    }

    private IEnumerator CoShowUiAfterDelay(float v)
    {
        yield return new WaitForSeconds(v);
        gameOverUI.SetActive(true);
    }
}
