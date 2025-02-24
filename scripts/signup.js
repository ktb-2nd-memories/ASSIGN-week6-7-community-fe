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

    profileHelper.style.display = "block"; // 프로필 사진 헬퍼 초기 표시

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    const nicknamePattern = /^[a-zA-Z0-9가-힣]{1,10}$/;

    // 이미 사용된 이메일 및 닉네임 목록 (예제용)
    const usedEmails = ["test@example.com", "user@domain.com"];
    const usedNicknames = ["admin", "superuser"];

    // 프로필 사진 클릭 시 파일 업로드 창 열기
    profileContainer.addEventListener("click", function () {
        profileUpload.click();
    });

    // 파일 선택 시 업로드된 이미지 즉시 반영
    profileUpload.addEventListener("change", function () {
        if (profileUpload.files && profileUpload.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImg.src = e.target.result;
                profileImg.style.display = "block"; // 이미지 표시
                profileImg.classList.remove("hidden"); // hidden 클래스 제거
                profilePlaceholder.style.display = "none"; // 기존 회색 배경 제거
                profileHelper.style.display = "none"; // 헬퍼 텍스트 숨기기
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

    function validateEmail() {
        const emailValue = emailInput.value.trim();

        if (emailValue === "") {
            emailHelper.textContent = "*이메일을 입력해주세요.";
            emailHelper.style.display = "block";
            return false;
        } else if (!emailPattern.test(emailValue)) {
            emailHelper.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
            emailHelper.style.display = "block";
            return false;
        } else if (usedEmails.includes(emailValue)) {
            emailHelper.textContent = "*중복된 이메일입니다.";
            emailHelper.style.display = "block";
            return false;
        } else {
            emailHelper.style.display = "none";
            return true;
        }
    }

    function validatePassword() {
        const passwordValue = passwordInput.value.trim();

        if (passwordValue === "") {
            passwordHelper.textContent = "*비밀번호를 입력해주세요.";
            passwordHelper.style.display = "block";
            return false;
        } else if (!passwordPattern.test(passwordValue)) {
            passwordHelper.textContent = "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            passwordHelper.style.display = "block";
            return false;
        } else {
            passwordHelper.style.display = "none";
            return true;
        }
    }

    function validateConfirmPassword() {
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        if (confirmPasswordValue === "") {
            confirmPasswordHelper.textContent = "*비밀번호를 한 번 더 입력해주세요.";
            confirmPasswordHelper.style.display = "block";
            return false;
        } else if (confirmPasswordValue !== passwordInput.value) {
            confirmPasswordHelper.textContent = "*비밀번호가 다릅니다.";
            confirmPasswordHelper.style.display = "block";
            return false;
        } else {
            confirmPasswordHelper.style.display = "none";
            return true;
        }
    }

    function validateNickname() {
        const nicknameValue = nicknameInput.value.trim();

        if (nicknameValue === "") {
            nicknameHelper.textContent = "*닉네임을 입력해주세요.";
            nicknameHelper.style.display = "block";
            return false;
        } else if (/\s/.test(nicknameValue)) {
            nicknameHelper.textContent = "*띄어쓰기를 없애주세요.";
            nicknameHelper.style.display = "block";
            return false;
        } else if (nicknameValue.length > 10) {
            nicknameHelper.textContent = "*닉네임은 최대 10자까지 작성 가능합니다.";
            nicknameHelper.style.display = "block";
            return false;
        } else if (usedNicknames.includes(nicknameValue)) {
            nicknameHelper.textContent = "*중복된 닉네임입니다.";
            nicknameHelper.style.display = "block";
            return false;
        } else {
            nicknameHelper.style.display = "none";
            return true;
        }
    }

    function validateForm() {
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isPasswordConfirmed = validateConfirmPassword();
        const isNicknameValid = validateNickname();
        const isProfileUploaded = profileImg.src && profileImg.src !== "";

        // 프로필 사진 helper text 관리
        profileHelper.style.display = isProfileUploaded ? "none" : "block";

        // 회원가입 버튼 활성화 여부 결정
        const isFormValid = isEmailValid && isPasswordValid && isPasswordConfirmed && isNicknameValid && isProfileUploaded;
        signupButton.disabled = !isFormValid;
        signupButton.classList.toggle("active", isFormValid);
    }

    // 각 input 요소에 대한 이벤트 리스너 추가
    [emailInput, passwordInput, confirmPasswordInput, nicknameInput].forEach(input => {
        input.addEventListener("focus", function () {
            this.nextElementSibling.style.display = "block"; // 포커스 시 헬퍼 텍스트 보이기
        });

        input.addEventListener("input", function () {
            if (input === passwordInput) {
                validatePassword();
            } else if (input === confirmPasswordInput) {
                validateConfirmPassword();
            } else if (input === nicknameInput) {
                validateNickname();
            } else {
                validateEmail();
            }
            validateForm();
        });

        input.addEventListener("blur", function () {
            if (input === passwordInput) {
                validatePassword();
            } else if (input === confirmPasswordInput) {
                validateConfirmPassword();
            } else if (input === nicknameInput) {
                validateNickname();
            } else {
                validateEmail();
            }
        });
    });

    // 초기 화면에서 필드들이 비어있을 경우 헬퍼 텍스트를 표시하도록 설정
    validateEmail();
    validatePassword();
    validateConfirmPassword();
    validateNickname();

    signupButton.addEventListener("click", async function () {
        if (signupButton.disabled) return; // 버튼이 활성화된 경우만 실행

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const nickname = document.getElementById("nickname").value.trim();
        const profileFile = document.getElementById("profile-upload").files[0];

        let profileImageUrl = "";
        if (profileFile) {
            // 실제 서버 업로드가 없으므로, 임시 URL 처리
            profileImageUrl = URL.createObjectURL(profileFile);
        }

        const requestData = {
            email,
            password,
            nickname,
            profileImage: profileImageUrl || "" // 프로필 이미지가 없으면 빈 문자열
        };

        try {
            // 실제 서버가 없으므로, 임의의 서버 주소로 요청
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
                window.location.href = "login.html"; // 성공 시 로그인 페이지 이동
            } else {
                alert("입력값을 확인해주세요. (잘못된 요청)");
            }
        } catch (error) {
            console.error("회원가입 요청 중 오류 발생:", error);
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
});
