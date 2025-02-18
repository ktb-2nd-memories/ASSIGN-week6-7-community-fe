document.addEventListener("DOMContentLoaded", function () {
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
    const dropdownMenu = document.getElementById("dropdown-menu");
    const profileIcon = document.getElementById("profile-icon");

    // 수정 완료 토스트 메시지를 처음에는 숨김 상태로 설정
    toast.style.display = "none";

    // 회원 탈퇴 모달 초기 상태: 숨김
    withdrawModal.style.display = "none";

    // 닉네임 검증 함수
    function validateNickname() {
        const value = nicknameInput.value.trim();

        if (value === "") {
            helperText.textContent = "* 닉네임을 입력해주세요.";
            helperText.style.display = "block";
            updateBtn.disabled = true;
            updateBtn.classList.add("disabled");
        } else if (value.length > 10) {
            helperText.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
            helperText.style.display = "block";
            updateBtn.disabled = true;
            updateBtn.classList.add("disabled");
        } else {
            helperText.style.display = "none";
            updateBtn.disabled = false;
            updateBtn.classList.remove("disabled");
        }
    }

    // 닉네임 입력 시 유효성 검사
    nicknameInput.addEventListener("input", validateNickname);

    // 변경 버튼 클릭 시 파일 업로드 창 열기
    changePicture.addEventListener("click", function () {
        profileUpload.click();
    });

    // 파일 선택 시 업로드된 이미지 즉시 반영
    profileUpload.addEventListener("change", function () {
        if (profileUpload.files && profileUpload.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImg.src = e.target.result;
            };
            reader.readAsDataURL(profileUpload.files[0]);
        }
    });

    // 수정하기 버튼 클릭 시 닉네임 검증 후 처리
    updateBtn.addEventListener("click", function () {
        if (!updateBtn.disabled) {
            // 수정 완료 메시지를 표시
            toast.style.display = "block";

            // 입력한 닉네임 값으로 업데이트
            const newNickname = nicknameInput.value.trim();
            nicknameInput.value = newNickname;

            setTimeout(() => {
                toast.style.display = "none";
            }, 2000);
        }
    });

    // 회원 탈퇴 버튼 클릭 시 확인 모달 열기
    withdrawBtn.addEventListener("click", function () {
        withdrawModal.style.display = "block";
    });

    // 취소 버튼 클릭 시 모달 닫기
    cancelBtn.addEventListener("click", function () {
        withdrawModal.style.display = "none";
    });

    // 확인 버튼 클릭 시 탈퇴 로직 실행 (현재는 로그 출력)
    confirmWithdrawBtn.addEventListener("click", function () {
        console.log("회원 탈퇴 완료");
        alert("회원 탈퇴가 완료되었습니다.");
        window.location.href = "login.html"; // 탈퇴 후 로그인 페이지로 이동
    });

    // 프로필 아이콘 클릭 시 드롭다운 메뉴 토글
    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // 다른 곳 클릭 시 드롭다운 메뉴 닫기
    document.addEventListener("click", function (event) {
        if (!profileIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});
