document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout-btn");

    if (!logoutBtn) {
        console.error("❌ 로그아웃 버튼을 찾을 수 없습니다.");
        return;
    }

    logoutBtn.addEventListener("click", async function () {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken || !refreshToken) {
            console.warn("⚠️ 이미 로그아웃된 상태입니다.");
            handleLogout();
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (response.ok) {
                console.log("✅ 로그아웃 성공!");
                handleLogout();
            } else {
                const data = await response.json();
                console.error("❌ 로그아웃 실패:", data.message || "서버 오류");
                alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("🚨 로그아웃 요청 중 오류 발생:", error);
            alert("네트워크 오류로 로그아웃에 실패했습니다.");
        }
    });

    // 로그아웃 처리 함수
    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("로그아웃이 완료되었습니다.");
        window.location.href = "login.html";  // 🔄 **올바른 경로로 이동**
    }
});
