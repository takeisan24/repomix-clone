using UnityEngine;

public class LevelEntrance : MonoBehaviour
{
    [SerializeField] private string levelName;
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.GetComponent<Player>()!=null)
        {
            GameManager.Instance.ChangeLevelTo(levelName);
        }
    }
}
