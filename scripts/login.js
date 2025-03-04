import { validateEmail, validatePassword } from "../scripts/components/validator.js";

document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");

    // 이메일과 비밀번호의 helper text 가져오기
    const emailHelperText = document.createElement("div");
    emailHelperText.classList.add("helper-text");
    emailHelperText.style.display = "none";
    emailHelperText.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
    emailInput.parentNode.appendChild(emailHelperText);

    const passwordHelperText = document.createElement("div");
    passwordHelperText.classList.add("helper-text");
    passwordHelperText.style.display = "none";
    passwordHelperText.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
    passwordInput.parentNode.appendChild(passwordHelperText);

    // 초기에는 helper text가 보이지 않게 설정
    emailHelperText.style.display = "none";
    passwordHelperText.style.display = "none";

    function validateInput(input) {
        let isValid = false;
        let helperText;

        if (input === emailInput) {
            isValid = validateEmail(emailInput.value.trim(), emailHelperText);
            helperText = emailHelperText;
        } else if (input === passwordInput) {
            isValid = validatePassword(passwordInput.value.trim(), passwordHelperText);
            helperText = passwordHelperText;
        }

        if (helperText) {
            helperText.style.display = isValid ? "none" : "block";
        }
    }

    function validateForm() {
        const isEmailValid = validateEmail(emailInput.value.trim(), emailHelperText);
        const isPasswordValid = validatePassword(passwordInput.value.trim(), passwordHelperText);

        // 로그인 버튼 활성화 여부 결정
        const isFormValid = isEmailValid && isPasswordValid;
        loginButton.disabled = !isFormValid;
        loginButton.classList.toggle("active", isFormValid);
    }

    // 각 input 요소에 대한 이벤트 리스너 추가 (click 시 helper text 표시, input 시 유효성 검사, blur 시 유효성 검사)
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener("click", function () {
            const helperText = input === emailInput ? emailHelperText : passwordHelperText;
            if (!input.dataset.clicked) {
                helperText.style.display = "block";
                input.dataset.clicked = "true";
            }
        });

        input.addEventListener("input", function () {
            validateInput(this);
            validateForm();
        });

        input.addEventListener("blur", function () {
            validateInput(this);
        });
    });

    // 초기 상태에서 helper text가 보이지 않도록 강제 숨김 (중복 처리)
    setTimeout(() => {
        emailHelperText.style.display = "none";
        passwordHelperText.style.display = "none";
    }, 0);
    
    // 초기 버튼 상태 설정
    validateForm();

    loginButton.addEventListener("click", async function () {
        if (loginButton.disabled) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const requestData = { email, password };

        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("로그인 성공! 게시글 목록 페이지로 이동합니다.");
                window.location.href = "posts.html";
            } else if (response.status === 401) {
                alert("아이디 또는 비밀번호를 확인해주세요.");
            } else {
                alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("로그인 요청 중 오류 발생:", error);
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
});
