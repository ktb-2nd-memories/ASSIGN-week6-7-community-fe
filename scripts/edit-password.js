import { validatePassword, validateConfirmPassword } from "../scripts/components/validator.js";

document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const updateBtn = document.getElementById("update-password-btn");
    const toast = document.getElementById("toast");

    const passwordHelper = document.getElementById("password-helper");
    const confirmPasswordHelper = document.getElementById("confirm-password-helper");

    function validateForm() {
        const isPasswordValid = validatePassword(passwordInput.value.trim(), passwordHelper);
        const isConfirmPasswordValid = validateConfirmPassword(passwordInput.value.trim(), confirmPasswordInput.value.trim(), confirmPasswordHelper);

        // 버튼 활성화 여부 설정
        const isFormValid = isPasswordValid && isConfirmPasswordValid;
        updateBtn.disabled = !isFormValid;
        updateBtn.classList.toggle("enabled", isFormValid);
    }

    // 초기에는 헬퍼 텍스트 숨김
    passwordHelper.style.display = "none";
    confirmPasswordHelper.style.display = "none";

    // 클릭 시 헬퍼 텍스트 표시 (한 번만)
    [passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener("focus", function () {
            const helperText = input === passwordInput ? passwordHelper : confirmPasswordHelper;
            if (!input.dataset.clicked) {
                helperText.style.display = "block";
                input.dataset.clicked = "true";
            }
        });

        input.addEventListener("input", function () {
            validateForm();
        });

        input.addEventListener("blur", function () {
            const helperText = input === passwordInput ? passwordHelper : confirmPasswordHelper;
            const isValid = input === passwordInput
                ? validatePassword(passwordInput.value.trim(), passwordHelper)
                : validateConfirmPassword(passwordInput.value.trim(), confirmPasswordInput.value.trim(), confirmPasswordHelper);

            // 유효하면 숨기고, 유효하지 않으면 유지
            helperText.style.display = isValid ? "none" : "block";
        });
    });

    // 초기 렌더링 후 강제적으로 헬퍼 텍스트 숨기기
    setTimeout(() => {
        passwordHelper.style.display = "none";
        confirmPasswordHelper.style.display = "none";
    }, 0);

    updateBtn.addEventListener("click", async function () {
        if (updateBtn.disabled) return;

        const requestData = {
            password: passwordInput.value.trim(),
            confirmPassword: confirmPasswordInput.value.trim()
        };

        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/users/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                toast.style.display = "block";
                setTimeout(() => { toast.style.display = "none"; }, 2000);
            } else {
                alert("비밀번호 변경 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("비밀번호 변경 중 오류 발생:", error);
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
});
