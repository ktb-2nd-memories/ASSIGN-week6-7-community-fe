document.addEventListener("DOMContentLoaded", async function () {
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const editBtn = document.getElementById("edit-btn");
    const helperText = document.getElementById("helper-text");
    const imageInput = document.getElementById("post-image");

    let editPost = null;

    // JSON 파일에서 게시글 데이터 불러오기
    async function loadPost() {
        try {
            const response = await fetch("data/edit-post.json"); // JSON 파일에서 데이터 가져오기
            const data = await response.json();
            
            editPost = data.data;

            // UI에 데이터 적용
            titleInput.value = editPost.title || "";
            contentInput.value = editPost.content || "";
        } catch (error) {
            console.error("게시글 데이터를 불러오는 중 오류 발생:", error);
            alert("게시글 데이터를 불러오는 데 실패했습니다.");
        }
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
            helperText.style.display = "none"; 
        } else {
            editBtn.classList.remove("active");
            editBtn.classList.add("disabled");
            editBtn.disabled = true;
            helperText.style.display = "block";
        }
    }

    // 제목 & 본문 입력 이벤트 리스너 추가
    titleInput.addEventListener("input", validateForm);
    contentInput.addEventListener("input", validateForm);

    // 이미지 선택 시 파일명 표시
    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];
        if (file) {
            console.log("선택한 이미지 파일:", file.name);
        }
    });

    // 수정 버튼 클릭 시 동작
    editBtn.addEventListener("click", function () {
        if (editBtn.disabled) {
            alert("제목과 내용을 모두 작성해주세요.");
            return;
        }

        const updatedPost = {
            postId: editPost.postId,
            title: titleInput.value.trim(),
            content: contentInput.value.trim(),
            image: editPost.image, // 기존 이미지 유지
        };

        // 이미지가 새로 선택된 경우 (실제 서버라면 업로드 후 URL을 받아야 함)
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            updatedPost.image = URL.createObjectURL(file);
        }

        console.log("수정된 게시글 데이터:", updatedPost);

        // 가상의 서버 응답 처리 (로컬에서는 JSON 파일을 직접 수정할 수 없으므로)
        setTimeout(() => {
            localStorage.setItem("editPost", JSON.stringify(updatedPost));
            window.location.href = "post.html"; // 상세보기 페이지로 이동
        }, 1000);
    });

    // 게시글 불러오기 실행
    await loadPost();
    validateForm();
});
