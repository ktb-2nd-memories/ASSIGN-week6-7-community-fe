document.addEventListener("DOMContentLoaded", async function () {
    const BACKEND_URL = "http://localhost:8080/api/member";
    const nicknameInput = document.getElementById("nickname");
    const updateBtn = document.getElementById("update-btn");
    const withdrawBtn = document.getElementById("withdraw-btn");
    const helperText = document.getElementById("helper-text");
    const profileUpload = document.getElementById("profile-upload");
    const changePicture = document.getElementById("change-picture");
    const profileImg = document.getElementById("profile-img");
    const toast = document.getElementById("toast");
    const withdrawModal = document.getElementById("withdraw-modal");
    const cancelBtn = document.getElementById("cancel-btn");
    const confirmWithdrawBtn = document.getElementById("confirm-withdraw-btn");
    const emailText = document.getElementById("email");

    let profileImageFile = null; // 업로드한 이미지 저장

    toast.style.display = "none";
    withdrawModal.style.display = "none";

    // 🔄 **1. Refresh Token을 사용하여 Access Token 갱신**
    async function refreshAccessToken() {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                console.warn("❌ Refresh Token이 없습니다.");
                return null;
            }

            const response = await fetch("http://localhost:8080/auth/reissue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                console.warn("❌ Refresh Token이 유효하지 않습니다.");
                return null;
            }

            const data = await response.json();
            const newAccessToken = data.data.accessToken;

            // 새로운 Access Token 저장
            localStorage.setItem("accessToken", newAccessToken);
            console.log("✅ 새로운 Access Token 발급 완료!");

            return newAccessToken;
        } catch (error) {
            console.error("토큰 갱신 중 오류 발생:", error);
            return null;
        }
    }

    // 📌 **2. 회원 정보 불러오기**
    async function fetchUserProfile() {
        try {
            let accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                alert("로그인이 필요합니다.");
                window.location.href = "login.html"; // 로그인 페이지로 이동
                return;
            }

            let response = await fetch(`${BACKEND_URL}/me`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${accessToken}` },
            });

            // 401 에러 발생 시 Refresh Token으로 새로운 Access Token 요청
            if (response.status === 401) {
                console.warn("⚠️ 토큰이 만료되었습니다. 새 토큰을 요청합니다.");

                const newAccessToken = await refreshAccessToken();

                if (!newAccessToken) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "login.html";
                    return;
                }

                accessToken = newAccessToken;

                // 다시 회원 정보 요청
                response = await fetch(`${BACKEND_URL}/me`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${accessToken}` },
                });

                if (!response.ok) throw new Error("회원 정보를 불러오는 데 실패했습니다.");
            }

            const data = await response.json();
            const userData = data.data;

            emailText.textContent = userData.email;
            nicknameInput.value = userData.nickname;
            profileImg.src = userData.profileImageUrl || "../assets/images/profile-icon.png";

            validateNickname();
        } catch (error) {
            console.error("회원 정보 조회 오류:", error);
            emailText.textContent = "회원 정보를 가져올 수 없습니다.";
        }
    }

    // 📌 **3. 닉네임 유효성 검사**
    function validateNickname() {
        const value = nicknameInput.value.trim();

        if (value === "") {
            helperText.textContent = "* 닉네임을 입력해주세요.";
            helperText.style.display = "block";
            updateBtn.disabled = true;
        } else if (value.length > 10) {
            helperText.textContent = "* 닉네임은 최대 10자까지 가능합니다.";
            helperText.style.display = "block";
            updateBtn.disabled = true;
        } else {
            helperText.style.display = "none";
            updateBtn.disabled = false;
        }
    }

    nicknameInput.addEventListener("input", validateNickname);

    // 📌 **4. 프로필 사진 업로드 및 미리보기**
    changePicture.addEventListener("click", function () {
        profileUpload.click();
    });

    profileUpload.addEventListener("change", function () {
        if (profileUpload.files && profileUpload.files[0]) {
            const reader = new FileReader();
            profileImageFile = profileUpload.files[0];

            reader.onload = function (e) {
                profileImg.src = e.target.result;
            };
            reader.readAsDataURL(profileImageFile);
        }
    });

    // 📌 **5. 회원정보 수정 API 요청**
    updateBtn.addEventListener("click", async function () {
        if (updateBtn.disabled) return;

        const accessToken = localStorage.getItem("accessToken");
        const formData = new FormData();
        formData.append("nickname", nicknameInput.value.trim());

        if (profileImageFile) {
            formData.append("profileImage", profileImageFile);
        }

        try {
            const response = await fetch(`${BACKEND_URL}/me`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${accessToken}` },
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.style.display = "block";
                setTimeout(() => { toast.style.display = "none"; }, 2000);
            } else {
                alert(responseData.message || "회원정보 수정 실패.");
            }
        } catch (error) {
            console.error("회원정보 수정 오류:", error);
            alert("회원정보 수정 중 오류가 발생했습니다.");
        }
    });

    // 📌 **6. 회원 탈퇴 기능**
    withdrawBtn.addEventListener("click", function () {
        withdrawModal.style.display = "block";
    });

    cancelBtn.addEventListener("click", function () {
        withdrawModal.style.display = "none";
    });

    confirmWithdrawBtn.addEventListener("click", async function () {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const response = await fetch(`${BACKEND_URL}/me`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${accessToken}` },
            });

            if (response.ok) {
                alert("회원 탈퇴가 완료되었습니다.");
                localStorage.removeItem("accessToken");
                window.location.href = "login.html"; // 로그인 페이지로 이동
            } else {
                alert("회원 탈퇴 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원 탈퇴 오류:", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    });

    // 📌 **7. 회원 정보 불러오기 실행**
    fetchUserProfile();
});
