// File: Assets/Scripts/Boss.cs
using UnityEngine;
using System.Collections; // Cần thêm dòng này để dùng Coroutine

public class Boss : Enemy // Kế thừa từ Enemy để có sẵn các thuộc tính cơ bản
{
    // Sử dụng enum để quản lý các trạng thái của Boss một cách rõ ràng
    public enum BossState { WakingUp, Chasing, Attacking, Idle }

    [Header("Boss Specifics")]
    [SerializeField] private float attackRange = 3f;      // Tầm tấn công
    [SerializeField] private float attackCooldown = 2.5f;   // Thời gian nghỉ giữa các đòn tấn công
    [SerializeField] private Transform playerTransform; // Tham chiếu đến người chơi để boss biết đuổi theo ai
    private float lastAttackTime;

    private BossState currentState;

    // Ghi đè (override) lại hàm Awake của lớp cha để thiết lập ban đầu
    protected override void Awake()
    {
        base.Awake(); // Gọi hàm Awake của lớp Entity để lấy các component
        currentState = BossState.WakingUp; // Trạng thái ban đầu khi boss xuất hiện
        StartCoroutine(WakeUpSequence());
    }

    // Ghi đè lại hàm Update của lớp cha để có hành vi riêng
    protected override void Update()
    {
        // Không gọi base.Update() vì chúng ta muốn một logic hoàn toàn mới

        // Chỉ chạy AI chính nếu boss đã "thức dậy"
        if (currentState != BossState.WakingUp)
        {
            base.HandleCollision(); // Vẫn dùng HandleCollision của lớp cha để check ground
            base.HandleAnimation(); // Vẫn dùng HandleAnimation của lớp cha để cập nhật yVelocity...

            // AI đơn giản dựa trên trạng thái
            switch (currentState)
            {
                case BossState.Chasing:
                    HandleMovement(); // Di chuyển về phía người chơi
                    // Nếu người chơi trong tầm tấn công, và đã hết cooldown
                    if (Vector2.Distance(transform.position, playerTransform.position) < attackRange && Time.time > lastAttackTime + attackCooldown)
                    {
                        currentState = BossState.Attacking;
                        HandleAttack();
                    }
                    break;

                // Các trạng thái khác được xử lý bởi Coroutine hoặc Animation Event
                case BossState.Attacking:
                case BossState.Idle:
                    rb.linearVelocity = new Vector2(0, rb.linearVelocityY); // Đứng yên
                    break;
            }
        }
    }

    // Coroutine cho hiệu ứng "thức giấc" ban đầu
    private IEnumerator WakeUpSequence()
    {
        // Giả sử có animation thức dậy, hoặc chỉ đơn giản là đợi một chút
        yield return new WaitForSeconds(1.5f);
        currentState = BossState.Chasing; // Bắt đầu đuổi theo người chơi
    }

    protected override void HandleMovement()
    {
        if (playerTransform == null) return; // Nếu không có người chơi thì không làm gì

        // Logic di chuyển đơn giản: luôn hướng về người chơi
        if (playerTransform.position.x > transform.position.x && facingDir == -1)
            Flip();
        else if (playerTransform.position.x < transform.position.x && facingDir == 1)
            Flip();

        rb.linearVelocity = new Vector2(speed * facingDir, rb.linearVelocityY);
    }

    protected override void HandleAttack()
    {
        rb.linearVelocity = new Vector2(0, rb.linearVelocityY); // Đứng yên khi tấn công
        lastAttackTime = Time.time;

        // Chọn ngẫu nhiên 1 trong 2 đòn tấn công
        int attackIndex = Random.Range(0, 2);
        if (attackIndex == 0)
        {
            anim.SetTrigger("attackSlash");
        }
        else
        {
            anim.SetTrigger("attackSummon");
        }
    }

    // Hàm này sẽ được gọi ở cuối animation tấn công bằng Animation Event
    public void FinishAttack()
    {
        currentState = BossState.Chasing; // Quay lại trạng thái đuổi theo
    }

    // Hàm này sẽ được gọi ở giữa animation tấn công Chém bằng Animation Event
    public void PerformSlashDamage()
    {
        // TODO: Tạo một vùng sát thương phía trước boss
        Debug.Log("Boss tung chiêu CHÉM!");
    }

    // Hàm này sẽ được gọi ở giữa animation tấn công Triệu hồi bằng Animation Event
    public void PerformSummon()
    {
        // TODO: Triệu hồi đệ hoặc bắn ra viên đạn
        Debug.Log("Boss tung chiêu TRIỆU HỒI!");
    }

    // Ghi đè hàm Die để thêm hiệu ứng đặc biệt nếu cần
    protected override void Die()
    {
        base.Die();
        // Thêm logic khi boss chết, ví dụ: thắng game, rơi đồ xịn...
        Debug.Log("BOSS ĐÃ BỊ TIÊU DIỆT!");
        // Ngăn không cho boss hoạt động nữa
        this.enabled = false;
        rb.bodyType = RigidbodyType2D.Static; // Đóng băng vật lý
    }
}