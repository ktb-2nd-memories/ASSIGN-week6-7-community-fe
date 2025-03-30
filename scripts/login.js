document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");

    // 헬퍼 텍스트 요소 추가
    const emailHelperText = document.createElement("div");
    emailHelperText.classList.add("helper-text");
    emailHelperText.style.display = "none";
    emailInput.insertAdjacentElement("afterend", emailHelperText);

    const passwordHelperText = document.createElement("div");
    passwordHelperText.classList.add("helper-text");
    passwordHelperText.style.display = "none";
    passwordInput.insertAdjacentElement("afterend", passwordHelperText);

    // 이메일 유효성 검사 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 비밀번호 유효성 검사 정규식
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    // 입력값 검증 함수
    function validateInput() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 이메일 유효성 검사
        if (!email) {
            emailHelperText.textContent = "* 이메일을 입력해주세요.";
            emailHelperText.style.display = "block";
        } else if (!emailRegex.test(email)) {
            emailHelperText.textContent = "* 올바른 이메일 형식이 아닙니다.";
            emailHelperText.style.display = "block";
        } else {
            emailHelperText.style.display = "none";
        }

        // 비밀번호 유효성 검사
        if (!password) {
            passwordHelperText.textContent = "* 비밀번호를 입력해주세요.";
            passwordHelperText.style.display = "block";
        } else if (!passwordRegex.test(password)) {
            passwordHelperText.textContent =
                "* 비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            passwordHelperText.style.display = "block";
        } else {
            passwordHelperText.style.display = "none";
        }

        // 로그인 버튼 활성화 여부 결정
        loginButton.disabled = !(emailRegex.test(email) && passwordRegex.test(password));
    }

    // 입력 이벤트 추가 (실시간 검증)
    emailInput.addEventListener("input", validateInput);
    passwordInput.addEventListener("input", validateInput);

    // 로그인 버튼 클릭 이벤트
    loginButton.addEventListener("click", async function () {
        await login();
    });

    // Enter 키로 로그인 실행
    document.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            await login();
        }
    });

    async function login() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 입력값 재검증
        validateInput();
        if (loginButton.disabled) {
            return;
        }

        const loginData = {
            email: email,
            password: password,
        };

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
                credentials: "include"
            });

            const responseData = await response.json(); // JSON 파싱

            console.log("[서버 응답]:", responseData);

            if (response.ok) {
                const { accessToken, refreshToken, grantType } = responseData.data;

                // 토큰을 로컬 스토리지에 저장
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("grantType", grantType);

                const memberInfoRes = await fetch("http://localhost:8080/api/member/me", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (memberInfoRes.ok) {
                    const memberInfo = await memberInfoRes.json();
                    const { nickname, profileImageUrl } = memberInfo.data;

                    localStorage.setItem("memberNickname", nickname);
                    localStorage.setItem("memberProfileImageUrl", profileImageUrl);
                }

                alert("로그인 성공! 메인 페이지로 이동합니다.");
                window.location.href = "posts.html"; // 로그인 성공 후 메인 페이지로 이동
            } else {
                alert(responseData.message || "로그인에 실패했습니다.");
            }
        } catch (error) {
            console.error("[로그인 오류]:", error);
            alert("서버와의 연결이 원활하지 않습니다. 네트워크 상태를 확인해주세요.");
        }
    }
});
