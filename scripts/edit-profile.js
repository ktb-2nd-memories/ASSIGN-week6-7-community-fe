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

    toast.style.display = "none";
    withdrawModal.style.display = "none";

    let usedNicknames = ["admin", "superuser", "testuser"]; // 예제용 중복 닉네임

    // 닉네임 검증
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

    // 프로필 사진 변경
    changePicture.addEventListener("click", function () {
        profileUpload.click();
    });

    profileUpload.addEventListener("change", function () {
        if (profileUpload.files && profileUpload.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImg.src = e.target.result;
            };
            reader.readAsDataURL(profileUpload.files[0]);
        }
    });

    // 회원정보 수정 API - PUT
    updateBtn.addEventListener("click", async function () {
        if (updateBtn.disabled) return;
        
        const newNickname = nicknameInput.value.trim();
        const profileImageUrl = profileImg.src;
        
        const requestData = {
            nickname: newNickname,
            profileImage: profileImageUrl
        };

        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                toast.style.display = "block";
                setTimeout(() => { toast.style.display = "none"; }, 2000);
            } else {
                alert("회원정보 수정 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원정보 수정 중 오류 발생:", error);
        }
    });

    // 회원 탈퇴 API - DELETE
    withdrawBtn.addEventListener("click", function () {
        withdrawModal.style.display = "block";
    });

    cancelBtn.addEventListener("click", function () {
        withdrawModal.style.display = "none";
    });

    confirmWithdrawBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/users", {
                method: "DELETE"
            });

            if (response.ok) {
                alert("회원 탈퇴가 완료되었습니다.");
                window.location.href = "login.html"; // 탈퇴 후 로그인 페이지로 이동
            } else {
                alert("회원 탈퇴 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원 탈퇴 중 오류 발생:", error);
            alert("네트워크 오류가 발생했습니다.");
        }
    });

    // 드롭다운 메뉴
    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (event) {
        if (!profileIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});