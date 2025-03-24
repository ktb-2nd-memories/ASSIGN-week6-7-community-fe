document.addEventListener("DOMContentLoaded", async function () {
    const BACKEND_URL = "http://localhost:8080"; // 백엔드 API 주소
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id"); // URL에서 postId 가져오기

    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const imageInput = document.getElementById("post-image");
    const editBtn = document.getElementById("edit-btn");
    const helperText = document.getElementById("helper-text");

    let selectedImages = []; // 새로 선택한 이미지 파일 저장
    let keepImageIds = []; // 유지할 기존 이미지 ID 저장

    if (!postId) {
        alert("잘못된 접근입니다.");
        window.location.href = "posts.html";
        return;
    }

    // 게시글 데이터 불러오기
    async function fetchPostDetails() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}`);
            if (!response.ok) throw new Error("게시글을 불러오는 데 실패했습니다.");

            const responseData = await response.json();
            renderPostDetails(responseData.data);
        } catch (error) {
            alert("게시글을 불러오는 중 오류가 발생했습니다.");
        }
    }

    // 게시글 데이터 렌더링
    function renderPostDetails(postData) {
        if (!postData) {
            alert("게시글 정보를 가져오는 중 오류가 발생했습니다.");
            return;
        }

        titleInput.value = postData.title;
        contentInput.value = postData.content;

        if (postData.imageUrls.length > 0) {
            displayExistingImages(postData.imageUrls);
        }

        validateInputs();
    }

    // 기존 이미지 미리보기
    function displayExistingImages(imageUrls) {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-preview-container");

        imageUrls.forEach((url, index) => {
            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-wrapper");

            const imgElement = document.createElement("img");
            imgElement.src = BACKEND_URL + url; // URL 절대경로로 설정
            imgElement.classList.add("preview-image");
            imgElement.onerror = function () {
                imgElement.src = "../assets/images/default.png"; // 이미지 로드 실패 시 기본 이미지
            };

            const removeBtn = document.createElement("button");
            removeBtn.innerText = "X";
            removeBtn.classList.add("remove-image-btn");
            removeBtn.addEventListener("click", function () {
                imgWrapper.remove();
                keepImageIds.splice(index, 1);
            });

            imgWrapper.appendChild(imgElement);
            imgWrapper.appendChild(removeBtn);
            imageContainer.appendChild(imgWrapper);
        });

        document.querySelector(".input-group").appendChild(imageContainer);
    }

    // 입력값 유효성 검사
    function validateInputs() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title.length > 0 && content.length > 0) {
            editBtn.classList.remove("disabled");
            editBtn.classList.add("active");
            editBtn.disabled = false;
            helperText.style.display = "none";
        } else {
            editBtn.classList.add("disabled");
            editBtn.classList.remove("active");
            editBtn.disabled = true;
            helperText.style.display = "block";
        }
    }

    titleInput.addEventListener("input", validateInputs);
    contentInput.addEventListener("input", validateInputs);

    // 새 이미지 선택 시 저장 및 미리보기 추가
    imageInput.addEventListener("change", function (event) {
        selectedImages = Array.from(event.target.files); // 선택된 파일 저장
        displayImagePreviews();
    });

    function displayImagePreviews() {
        const imagePreviewContainer = document.createElement("div");
        imagePreviewContainer.classList.add("image-preview-container");

        selectedImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgWrapper = document.createElement("div");
                imgWrapper.classList.add("image-wrapper");

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

                imgWrapper.appendChild(imgElement);
                imgWrapper.appendChild(removeBtn);
                imagePreviewContainer.appendChild(imgWrapper);
            };
            reader.readAsDataURL(file);
        });

        document.querySelector(".input-group").appendChild(imagePreviewContainer);
    }

    // 게시글 수정 요청
    editBtn.addEventListener("click", async function () {
        if (editBtn.disabled) return;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("data", JSON.stringify({ title, content, keepImageIds }));

        // 새 이미지 추가
        selectedImages.forEach((file) => {
            formData.append("images", file);
        });

        // orderIndex 정확하게 맞추기
        const updatedOrderIndexes = [...keepImageIds.map((_, idx) => idx + 1), ...selectedImages.map((_, idx) => keepImageIds.length + idx + 1)];

        formData.append("orderIndexes", JSON.stringify(updatedOrderIndexes));

        try {
            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("게시글이 성공적으로 수정되었습니다!");
                window.location.href = `post.html?id=${postId}`;
            } else {
                alert(`오류 발생: ${result.message}`);
            }
        } catch (error) {
            console.error("게시글 수정 중 오류 발생:", error);
            alert("게시글 수정 중 오류가 발생했습니다.");
        }
    });

    // 게시글 데이터 불러오기
    fetchPostDetails();
});
