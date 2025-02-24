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

    const passwordHelperText = passwordInput.nextElementSibling;

    // 이메일 및 비밀번호 정규식 패턴
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    function validateInput(input) {
        let isValid = false;
        let helperText;

        if (input === emailInput) {
            isValid = emailPattern.test(input.value);
            helperText = emailHelperText;
        } else if (input === passwordInput) {
            isValid = passwordPattern.test(input.value);
            helperText = passwordHelperText;
        }

        if (helperText) {
            helperText.style.display = isValid ? "none" : "block";
        }
    }

    function validateForm() {
        const isEmailValid = emailPattern.test(emailInput.value);
        const isPasswordValid = passwordPattern.test(passwordInput.value);

        // 로그인 버튼 활성화 여부 결정
        const isFormValid = isEmailValid && isPasswordValid;
        loginButton.disabled = !isFormValid;
        loginButton.classList.toggle("active", isFormValid);
    }

    // 각 input 요소에 대한 이벤트 리스너 추가 (focus 시 helper text 표시, blur 시 유효성 검사)
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener("focus", function () {
            const helperText = input === emailInput ? emailHelperText : passwordHelperText;
            helperText.style.display = "block"; // 해당 input의 helper text만 표시
        });

        input.addEventListener("input", function () {
            validateInput(this); // 실시간 유효성 검사
            validateForm();
        });

        input.addEventListener("blur", function () {
            validateInput(this); // 포커스 해제 시 유효성 검사
        });
    });

    // 초기 버튼 상태 설정
    validateForm();

    loginButton.addEventListener("click", async function () {
        if (loginButton.disabled) return; // 버튼이 비활성화된 경우 실행 안 함

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const requestData = { email, password };

        try {
            // 실제 서버가 없으므로 임의의 서버 주소 사용
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
                window.location.href = "posts.html"; // 게시글 목록 페이지로 이동
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
