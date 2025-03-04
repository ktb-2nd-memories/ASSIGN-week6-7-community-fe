import { validateEmail, validatePassword, validateConfirmPassword, validateNickname } from "./components/validator.js";

document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const emailHelper = emailInput.nextElementSibling;
    const passwordInput = document.getElementById("password");
    const passwordHelper = passwordInput.nextElementSibling;
    const confirmPasswordInput = document.getElementById("password-confirm");
    const confirmPasswordHelper = confirmPasswordInput.nextElementSibling;
    const nicknameInput = document.getElementById("nickname");
    const nicknameHelper = nicknameInput.nextElementSibling;
    const signupButton = document.querySelector(".signup-button");
    const profileUpload = document.getElementById("profile-upload");
    const profileImg = document.getElementById("profile-img");
    const profilePlaceholder = document.querySelector(".profile-placeholder");
    const profileContainer = document.getElementById("profile-container");
    const profileHelper = document.querySelector(".profile-helper");

    profileHelper.style.display = "block";

    // 초기 화면에서 프로필 사진이 없으면 헬퍼 텍스트 표시
    function validateProfile() {
        // 실제 src 값이 존재하는지 확인
        const imgSrc = profileImg.getAttribute("src"); 
        const isProfileUploaded = imgSrc && imgSrc !== "" && imgSrc !== "about:blank"; 

        profileHelper.style.display = isProfileUploaded ? "none" : "block";
        return isProfileUploaded;
    }

    const usedEmails = ["test@example.com", "user@domain.com"];
    const usedNicknames = ["admin", "superuser"];

    profileContainer.addEventListener("click", function () {
        profileUpload.click();
    });

    profileUpload.addEventListener("change", function () {
        if (profileUpload.files && profileUpload.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImg.src = e.target.result;
                profileImg.style.display = "block";
                profileImg.classList.remove("hidden");
                profilePlaceholder.style.display = "none";
                profileHelper.style.display = "none";
            };
            reader.readAsDataURL(profileUpload.files[0]);
        } else {
            profileImg.src = "";
            profileImg.style.display = "none";
            profilePlaceholder.style.display = "block";
            profileHelper.style.display = "block";
        }
        validateForm();
    });

    profileImg.addEventListener("load", validateForm);

    function validateForm() {
        const isEmailValid = validateEmail(emailInput.value.trim(), emailHelper, usedEmails);
        const isPasswordValid = validatePassword(passwordInput.value.trim(), passwordHelper);
        const isPasswordConfirmed = validateConfirmPassword(passwordInput.value.trim(), confirmPasswordInput.value.trim(), confirmPasswordHelper);
        const isNicknameValid = validateNickname(nicknameInput.value.trim(), nicknameHelper, usedNicknames);
        const isProfileValid = validateProfile();

        const isFormValid = isEmailValid && isPasswordValid && isPasswordConfirmed && isNicknameValid && isProfileValid;
        signupButton.disabled = !isFormValid;
        signupButton.classList.toggle("active", isFormValid);
    }

    [emailInput, passwordInput, confirmPasswordInput, nicknameInput].forEach(input => {
        input.addEventListener("focus", function () {
            this.nextElementSibling.style.display = "block";
        });

        input.addEventListener("input", function () {
            validateForm();
        });

        input.addEventListener("blur", function () {
            validateForm();
        });
    });

    validateProfile();
    validateForm();

    signupButton.addEventListener("click", async function () {
        if (signupButton.disabled) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const nickname = nicknameInput.value.trim();
        const profileFile = profileUpload.files[0];

        let profileImageUrl = "";
        if (profileFile) {
            profileImageUrl = URL.createObjectURL(profileFile);
        }

        const requestData = {
            email,
            password,
            nickname,
            profileImage: profileImageUrl || ""
        };

        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/users/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("회원가입 성공! 로그인 페이지로 이동합니다.");
                window.location.href = "login.html";
            } else {
                alert("입력값을 확인해주세요. (잘못된 요청)");
            }
        } catch (error) {
            console.error("회원가입 요청 중 오류 발생:", error);
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
});
