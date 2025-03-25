import { fetchWithAuthRetry } from "./components/authUtil.js";

document.addEventListener("DOMContentLoaded", function () {
    const BACKEND_URL = "http://localhost:8080/api/member";
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const updatePasswordBtn = document.getElementById("update-password-btn");
    const toast = document.getElementById("toast");
    const passwordHelper = document.getElementById("password-helper");
    const confirmPasswordHelper = document.getElementById("confirm-password-helper");

    toast.style.display = "none";

    // Refresh Token을 사용하여 Access Token 갱신
    async function refreshAccessToken() {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const accessToken = localStorage.getItem("accessToken");

            if (!refreshToken || !accessToken) return null;

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
            console.error("토큰 갱신 중 오류 발생:", error);
            return null;
        }
    }

    // 비밀번호 유효성 검사 함수
    function validatePassword() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

        let isValid = true;

        // 비밀번호 형식 검사
        if (!passwordRegex.test(password)) {
            passwordHelper.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
            passwordHelper.style.display = "block";
            isValid = false;
        } else {
            passwordHelper.style.display = "none";
        }

        // 비밀번호 확인 검사
        if (confirmPassword === "") {
            confirmPasswordHelper.textContent = "* 비밀번호 확인이 필요합니다.";
            confirmPasswordHelper.style.display = "block";
            isValid = false;
        } else if (password !== confirmPassword) {
            confirmPasswordHelper.textContent = "* 비밀번호가 일치하지 않습니다.";
            confirmPasswordHelper.style.display = "block";
            isValid = false;
        } else {
            confirmPasswordHelper.style.display = "none";
        }

        // 버튼 활성화/비활성화
        if (isValid) {
            updatePasswordBtn.classList.add("enabled");
            updatePasswordBtn.disabled = false;
        } else {
            updatePasswordBtn.classList.remove("enabled");
            updatePasswordBtn.disabled = true;
        }
    }

    passwordInput.addEventListener("input", validatePassword);
    confirmPasswordInput.addEventListener("input", validatePassword);

    // 비밀번호 변경 API 요청
    updatePasswordBtn.addEventListener("click", async function () {
        if (updatePasswordBtn.disabled) return;

        let accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            alert("로그인이 필요합니다.");
            window.location.href = "login.html";
            return;
        }

        const requestBody = {
            newPassword: passwordInput.value.trim(),
            confirmPassword: confirmPasswordInput.value.trim(),
        };

        try {
            let response = await fetch(`${BACKEND_URL}/me/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();

                if (!newAccessToken) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "login.html";
                    return;
                }

                accessToken = newAccessToken;

                response = await fetch(`${BACKEND_URL}/me/password`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) throw new Error("비밀번호 변경에 실패했습니다.");
            }

            const responseData = await response.json();

            if (response.ok) {
                toast.style.display = "block";
                setTimeout(() => { toast.style.display = "none"; }, 2000);
                passwordInput.value = "";
                confirmPasswordInput.value = "";
                updatePasswordBtn.classList.remove("enabled");
                updatePasswordBtn.disabled = true;
            } else {
                alert(responseData.message || "비밀번호 변경 실패.");
            }
        } catch (error) {
            console.error("비밀번호 변경 오류:", error);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        }
    });
});
