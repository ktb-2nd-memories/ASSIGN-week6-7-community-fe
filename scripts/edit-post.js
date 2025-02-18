document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const editBtn = document.getElementById("edit-btn");
    const helperText = document.getElementById("helper-text");
    const imageInput = document.getElementById("post-image");

    // 기존 게시글 데이터 불러오기
    let editPost = JSON.parse(localStorage.getItem("editPost"));

    if (editPost) {
        titleInput.value = editPost.title || ""; // 제목 적용
        contentInput.value = editPost.content || ""; // 본문 적용
    }

    // 제목 26자 제한 (27자 이상 입력 방지)
    titleInput.addEventListener("input", function () {
        if (titleInput.value.length > 26) {
            titleInput.value = titleInput.value.substring(0, 26);
        }
        validateForm();
    });

    // 입력 확인 후 버튼 색상 및 활성화
    function validateForm() {
        const isTitleValid = titleInput.value.trim().length > 0;
        const isContentValid = contentInput.value.trim().length > 0;

        if (isTitleValid && isContentValid) {
            editBtn.classList.add("active");
            editBtn.classList.remove("disabled");
            editBtn.disabled = false;
            editBtn.style.backgroundColor = "#7F6AEE";
            helperText.style.display = "none"; 
        } else {
            editBtn.classList.remove("active");
            editBtn.classList.add("disabled");
            editBtn.disabled = true;
            editBtn.style.backgroundColor = "#ACA0EB";
            helperText.style.display = "block";
        }
    }

    // 제목 & 본문 입력 이벤트 리스너 추가
    titleInput.addEventListener("input", validateForm);
    contentInput.addEventListener("input", validateForm);

    // 이미지 변경 시 새 파일명 표시 (선택적으로 추가 가능)
    imageInput.addEventListener("change", function () {});

    // 수정 버튼 클릭 시 동작
    editBtn.addEventListener("click", function () {
        if (!editBtn.disabled) {
            alert("게시글이 수정되었습니다.");
            window.location.href = "post-detail.html";
        } else {
            alert("제목과 내용을 모두 작성해주세요."); // 경고 메시지
        }
    });

    // ** 페이지 로드 시 초기 폼 상태 확인 **
    validateForm();
});
