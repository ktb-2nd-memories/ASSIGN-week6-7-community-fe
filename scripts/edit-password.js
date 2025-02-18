document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const updateBtn = document.getElementById("update-password-btn");
    const toast = document.getElementById("toast");

    const passwordHelper = document.getElementById("password-helper");
    const confirmPasswordHelper = document.getElementById("confirm-password-helper");

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    let isPasswordValid = false; 
    let isConfirmPasswordValid = false;

    function validatePassword() {
        const password = passwordInput.value.trim();
        if (!passwordPattern.test(password)) {
            passwordHelper.style.display = "block";
            isPasswordValid = false;
        } else {
            passwordHelper.style.display = "none";
            isPasswordValid = true;
        }
        validateForm();
    }

    function validateConfirmPassword() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!isPasswordValid) {
            confirmPasswordHelper.style.display = "none"; 
            isConfirmPasswordValid = false;
            return;
        }

        if (confirmPassword === "") {
            confirmPasswordHelper.textContent = "* 비밀번호를 한 번 더 입력해주세요.";
            confirmPasswordHelper.style.display = "block";
            isConfirmPasswordValid = false;
        } else if (password !== confirmPassword) {
            confirmPasswordHelper.textContent = "* 비밀번호 확인이 비밀번호와 다릅니다.";
            confirmPasswordHelper.style.display = "block";
            isConfirmPasswordValid = false;
        } else {
            confirmPasswordHelper.style.display = "none";
            isConfirmPasswordValid = true;
        }
        validateForm();
    }

    function validateForm() {
        if (isPasswordValid && isConfirmPasswordValid) {
            updateBtn.disabled = false;
            updateBtn.classList.add("enabled");
        } else {
            updateBtn.disabled = true;
            updateBtn.classList.remove("enabled");
        }
    }

    passwordInput.addEventListener("input", validatePassword);
    confirmPasswordInput.addEventListener("focus", validateConfirmPassword);
    confirmPasswordInput.addEventListener("input", validateConfirmPassword);

    updateBtn.addEventListener("click", function () {
        if (!updateBtn.disabled) {
            toast.style.display = "block"; 

            setTimeout(() => {
                toast.style.display = "none"; 
            }, 2000);
        }
    });
});
