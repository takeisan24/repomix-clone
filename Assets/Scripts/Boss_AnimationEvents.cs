using UnityEngine;

public class Boss_AnimationEvents : MonoBehaviour
{
    private Boss bossScript;

    private void Awake()
    {
        // 1. Thử tìm Boss script ngay trên object này
        bossScript = GetComponent<Boss>();

        // 2. Nếu không thấy, tìm ở object cha (Đây là trường hợp phổ biến)
        if (bossScript == null)
        {
            bossScript = GetComponentInParent<Boss>();
        }
    }

    // --- CÁC HÀM NHẬN SỰ KIỆN TỪ ANIMATION ---

    public void PerformSummon()
    {
        if (bossScript != null) bossScript.PerformSummon();
    }

    public void PerformSlashDamage()
    {
        if (bossScript != null) bossScript.PerformSlashDamage();
    }

    public void FinishAttack()
    {
        if (bossScript != null) bossScript.FinishAttack();
    }
}