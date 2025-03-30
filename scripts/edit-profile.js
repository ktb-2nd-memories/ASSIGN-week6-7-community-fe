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

    let profileImageFile = null;

    toast.style.display = "none";
    withdrawModal.style.display = "none";

    async function refreshAccessToken() {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const accessToken = localStorage.getItem("accessToken");

            if (!refreshToken || !accessToken) {
                console.warn("토큰 없음");
                return null;
            }

            const response = await fetch("http://localhost:8080/auth/reissue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!response.ok) return null;

            const data = await response.json();
            const newAccessToken = data.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            return newAccessToken;
        } catch (error) {
            console.error("토큰 갱신 오류:", error);
            return null;
        }
    }

    async function fetchUserProfile() {
        try {
            let accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                alert("로그인이 필요합니다.");
                window.location.href = "login.html";
                return;
            }

            let response = await fetch(`${BACKEND_URL}/me`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${accessToken}` },
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "login.html";
                    return;
                }

                accessToken = newAccessToken;
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
            nicknameInput.setAttribute("data-original", userData.nickname);

            const BACKEND_ORIGIN = "http://localhost:8080";
            profileImg.src = userData.profileImageUrl
                ? `${BACKEND_ORIGIN}${userData.profileImageUrl}`
                : "../assets/images/profile-icon.png";

            validateNickname();
        } catch (error) {
            console.error("회원 정보 조회 오류:", error);
            emailText.textContent = "회원 정보를 가져올 수 없습니다.";
        }
    }

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

    updateBtn.addEventListener("click", async function () {
        if (updateBtn.disabled) return;

        let accessToken = localStorage.getItem("accessToken");

        const currentNickname = nicknameInput.value.trim();
        const originalNickname = nicknameInput.getAttribute("data-original");
        const formData = new FormData();

        const nicknameChanged = currentNickname !== originalNickname;
        const imageChanged = profileImageFile !== null;

        // 변경 없으면 알림만 띄우고 return
        if (!nicknameChanged && !imageChanged) {
            alert("변경된 내용이 없습니다.");
            return;
        }

        if (nicknameChanged) {
            formData.append("nickname", currentNickname);
        }

        if (imageChanged) {
            formData.append("profileImage", profileImageFile);
        }

        try {
            let response = await fetch(`${BACKEND_URL}/me`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${accessToken}` },
                body: formData,
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "login.html";
                    return;
                }

                accessToken = newAccessToken;
                response = await fetch(`${BACKEND_URL}/me`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${accessToken}` },
                    body: formData,
                });
            }

            const responseData = await response.json();

            if (response.ok) {
                const updatedData = responseData.data;

                if (updatedData.profileImageUrl) {
                    localStorage.setItem("memberProfileImageUrl", updatedData.profileImageUrl);

                    const headerProfileImg = document.getElementById("profile-icon");
                    if (headerProfileImg) {
                        const BACKEND_ORIGIN = "http://localhost:8080";
                        headerProfileImg.src = `${BACKEND_ORIGIN}${updatedData.profileImageUrl}?v=${Date.now()}`; // 캐시 방지
                    }
                }
                if (updatedData.nickname) {
                    localStorage.setItem("memberNickname", updatedData.nickname);
                }

                toast.style.display = "block";
                setTimeout(() => { toast.style.display = "none"; }, 2000);

                if (nicknameChanged) {
                    nicknameInput.setAttribute("data-original", currentNickname);
                }

                if (imageChanged) {
                    profileImageFile = null;
                }
            } else {
                alert(responseData.message || "회원정보 수정 실패.");
            }
        } catch (error) {
            console.error("회원정보 수정 오류:", error);
            alert("회원정보 수정 중 오류가 발생했습니다.");
        }
    });

    withdrawBtn.addEventListener("click", function () {
        withdrawModal.style.display = "block";
    });

    cancelBtn.addEventListener("click", function () {
        withdrawModal.style.display = "none";
    });

    confirmWithdrawBtn.addEventListener("click", async function () {
        try {
            let accessToken = localStorage.getItem("accessToken");

            let response = await fetch(`${BACKEND_URL}/me`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${accessToken}` },
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "login.html";
                    return;
                }

                accessToken = newAccessToken;

                response = await fetch(`${BACKEND_URL}/me`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${accessToken}` },
                });
            }

            if (response.ok) {
                alert("회원 탈퇴가 완료되었습니다.");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "login.html";
            } else {
                alert("회원 탈퇴 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원 탈퇴 오류:", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    });

    fetchUserProfile();
});
