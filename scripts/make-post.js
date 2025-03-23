document.addEventListener("DOMContentLoaded", function () {
    const BACKEND_URL = "http://localhost:8080"; // 백엔드 주소
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const imageInput = document.getElementById("post-image");
    const submitBtn = document.getElementById("submit-btn");
    const helperText = document.getElementById("helper-text");
    const imagePreview = document.getElementById("image-preview");

    let selectedImages = []; // 선택한 이미지 파일 저장

    // 로그인 체크 (토큰이 없으면 로그인 페이지로 이동)
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        window.location.href = "login.html"; // 로그인 페이지로 리디렉트
        return;
    }

    // 입력값 유효성 검사 (제목 + 내용)
    function validateInputs() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title.length > 0 && content.length > 0) {
            submitBtn.classList.remove("disabled");
            submitBtn.classList.add("active");
            submitBtn.disabled = false;
            helperText.style.display = "none";
        } else {
            submitBtn.classList.add("disabled");
            submitBtn.classList.remove("active");
            submitBtn.disabled = true;
            helperText.style.display = "block";
        }
    }

    titleInput.addEventListener("input", validateInputs);
    contentInput.addEventListener("input", validateInputs);

    // 이미지 선택 시 저장 및 미리보기 추가
    imageInput.addEventListener("change", function (event) {
        selectedImages = Array.from(event.target.files); // 선택된 파일 저장
        displayImagePreviews();
    });

    function displayImagePreviews() {
        imagePreview.innerHTML = ""; // 기존 이미지 초기화

        selectedImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgContainer = document.createElement("div");
                imgContainer.classList.add("image-container");

                const imgElement = document.createElement("img");
                imgElement.src = e.target.result;
                imgElement.classList.add("preview-image");

                const removeBtn = document.createElement("button");
                removeBtn.innerText = "X";
                removeBtn.classList.add("remove-image-btn");
                removeBtn.addEventListener("click", function () {
                    selectedImages.splice(index, 1);
                    displayImagePreviews();
                });

                imgContainer.appendChild(imgElement);
                imgContainer.appendChild(removeBtn);
                imagePreview.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        });
    }

    // 게시글 제출
    submitBtn.addEventListener("click", async function () {
        if (submitBtn.disabled) return;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const memberId = 1; // 임시 사용자 ID (로그인 기능 추가 시 변경)

        const formData = new FormData();
        formData.append("data", JSON.stringify({ title, content }));

        // 이미지가 있을 경우 추가
        selectedImages.forEach((file, index) => {
            formData.append("images", file);
        });

        // 이미지 순서 추가 (순서 유지)
        if (selectedImages.length > 0) {
            const orderIndexes = Array.from({ length: selectedImages.length }, (_, i) => i + 1);
            formData.append("orderIndexes", JSON.stringify(orderIndexes));
        }

        try {
            const accessToken = localStorage.getItem("accessToken");

            const response = await fetch(`${BACKEND_URL}/api/posts`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("게시글이 성공적으로 작성되었습니다!");
                window.location.href = "posts.html"; // 게시글 목록으로 이동
            } else {
                alert(`오류 발생: ${result.message}`);
            }
        } catch (error) {
            console.error("게시글 작성 중 오류 발생:", error);
            alert("게시글 작성 중 오류가 발생했습니다.");
        }
    });
});
