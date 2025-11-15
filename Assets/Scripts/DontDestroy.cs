using UnityEngine;

public class DontDestroy : MonoBehaviour
{
    private void Awake()
    {
        // Kiểm tra xem đã có một đối tượng nào khác của script này tồn tại chưa.
        // Điều này giúp tránh việc tạo ra nhiều bản sao khi quay lại Scene ban đầu.

        // Cần tạo một mảng chứa tất cả các object có script này.
        GameObject[] objs = GameObject.FindGameObjectsWithTag(gameObject.tag);

        if (objs.Length > 1)
        {
            // Nếu có nhiều hơn 1, hủy đối tượng mới được tạo ra.
            Destroy(this.gameObject);
            
        }
        else
        {
            // Nếu chỉ có 1 (hoặc không có), giữ lại đối tượng này.
            DontDestroyOnLoad(this.gameObject);
        }
    }
}
