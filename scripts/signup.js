document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("password-confirm");
    const nicknameInput = document.getElementById("nickname");
    const profileUpload = document.getElementById("profile-upload");
    const profileImg = document.getElementById("profile-img");
    const profilePlaceholder = document.querySelector(".profile-placeholder");
    const signupButton = document.querySelector(".signup-button");

    let profileFile = null; // 프로필 이미지 파일 저장 변수

    const profileContainer = document.getElementById("profile-container");

    // 📌 프로필 영역 클릭 시 파일 업로드 창 열기
    profileContainer.addEventListener("click", () => {
        profileUpload.click(); // 파일 업로드 input 실행
    });

    // 📌 파일 업로드 이벤트 처리
    profileUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImg.src = e.target.result; // 업로드한 이미지 미리보기
                profileImg.classList.remove("hidden");
                profilePlaceholder.style.display = "none"; // + 아이콘 숨김
            };
            reader.readAsDataURL(file);
        }
    });

    // 📌 입력값 유효성 검사를 위한 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    const nicknameRegex = /^[a-zA-Z0-9가-힣]{1,10}$/; // 한글, 영문, 숫자 허용, 1~10자

    // 📌 입력값 검증 함수
    function validateInput() {
        const emailValid = emailRegex.test(emailInput.value);
        const passwordValid = passwordRegex.test(passwordInput.value);
        const confirmPasswordValid = passwordInput.value === confirmPasswordInput.value;
        const nicknameValid = nicknameRegex.test(nicknameInput.value);
        const profileValid = profileFile !== null;

        // 헬퍼 텍스트 표시
        emailInput.nextElementSibling.style.display = emailValid ? "none" : "block";
        passwordInput.nextElementSibling.style.display = passwordValid ? "none" : "block";
        confirmPasswordInput.nextElementSibling.style.display = confirmPasswordValid ? "none" : "block";
        nicknameInput.nextElementSibling.style.display = nicknameValid ? "none" : "block";
        document.querySelector(".profile-helper").style.display = profileValid ? "none" : "block";

        // 모든 조건 충족 시 회원가입 버튼 활성화
        signupButton.disabled = !(emailValid && passwordValid && confirmPasswordValid && nicknameValid && profileValid);
    }

    // 📌 프로필 이미지 선택
    profileUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            profileFile = file;
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImg.src = e.target.result;
                profileImg.classList.remove("hidden");
                profilePlaceholder.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
        validateInput();
    });

    // 📌 모든 입력값 실시간 검증
    emailInput.addEventListener("input", validateInput);
    passwordInput.addEventListener("input", validateInput);
    confirmPasswordInput.addEventListener("input", validateInput);
    nicknameInput.addEventListener("input", validateInput);

    // 📌 회원가입 요청
    async function signup() {
        if (signupButton.disabled) return; // 버튼 비활성화 상태에서는 실행하지 않음

        const formData = new FormData();
        formData.append("email", emailInput.value);
        formData.append("password", passwordInput.value);
        formData.append("confirmPassword", confirmPasswordInput.value);
        formData.append("nickname", nicknameInput.value);
        formData.append("profileImage", profileFile);

        // ✅ 📌 요청 데이터 확인 (FormData 내부 데이터 확인)
        console.log("📌 [회원가입 요청 데이터]");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const response = await fetch("http://localhost:8080/auth/signup", {
                method: "POST",
                body: formData,
            });

            // ✅ 응답 상태 코드 및 헤더 확인
            console.log("📌 [서버 응답 상태 코드]:", response.status);
            console.log("📌 [서버 응답 헤더]:", response.headers);

            const contentType = response.headers.get("content-type");
            let result;

            if (contentType && contentType.includes("application/json")) {
                result = await response.json(); // JSON 응답
            } else {
                result = await response.text(); // JSON이 아닐 경우 원본 출력
                console.warn("⚠️ [JSON 응답 아님]:", result);
            }

            console.log("📌 [서버 응답 데이터]:", result);

            // const text = await response.text();  // 원본 응답을 받아서 확인
            // console.log("Raw Response:", text);  // 콘솔에 원본 응답 출력

            // const result = JSON.parse(text); // JSON으로 변환 시도

            if (response.ok) {
                alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
                window.location.href = "login.html";
            } else {
                alert(result.message || "회원가입에 실패했습니다.");
            }
        } catch (error) {
            console.error("❌ [회원가입 오류]:", error);

            if (error instanceof TypeError) {
                console.error("⚠️ [TypeError]: 네트워크 오류 가능성이 높음");
                alert("서버와의 연결이 원활하지 않습니다. 네트워크 상태를 확인해주세요.");
            } else if (error instanceof SyntaxError) {
                console.error("⚠️ [SyntaxError]: JSON 파싱 오류");
                alert("서버 응답을 처리하는 중 오류가 발생했습니다.");
            } else {
                console.error("⚠️ [알 수 없는 오류]:", error);
                alert("예상치 못한 오류가 발생했습니다. 개발자 도구에서 콘솔을 확인해주세요.");
            }
        }
    }

    // 📌 회원가입 버튼 클릭 이벤트
    signupButton.addEventListener("click", signup);
});
