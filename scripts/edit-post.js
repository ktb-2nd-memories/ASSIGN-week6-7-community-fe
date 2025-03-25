document.addEventListener("DOMContentLoaded", async function () {
    const BACKEND_URL = "http://localhost:8080";
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const imageInput = document.getElementById("post-image");
    const editBtn = document.getElementById("edit-btn");
    const helperText = document.getElementById("helper-text");

    let selectedImages = [];
    let keepImageIds = [];

    if (!postId) {
        alert("잘못된 접근입니다.");
        window.location.href = "posts.html";
        return;
    }

    async function refreshAccessToken() {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const accessToken = localStorage.getItem("accessToken");

            if (!refreshToken || !accessToken) return null;

            const response = await fetch("http://localhost:8080/auth/reissue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!response.ok) return null;

            const data = await response.json();
            const newAccessToken = data.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            return newAccessToken;
        } catch (error) {
            console.error("토큰 갱신 오류:", error);
            return null;
        }
    }

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

    function renderPostDetails(postData) {
        if (!postData) {
            alert("게시글 정보를 가져오는 중 오류가 발생했습니다.");
            return;
        }

        titleInput.value = postData.title;
        contentInput.value = postData.content;

        if (postData.imageUrls.length > 0) {
            keepImageIds = postData.imageUrls.map((_, idx) => idx + 1);
            displayExistingImages(postData.imageUrls);
        }

        validateInputs();
    }

    function displayExistingImages(imageUrls) {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-preview-container");

        imageUrls.forEach((url, index) => {
            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-wrapper");

            const imgElement = document.createElement("img");
            imgElement.src = BACKEND_URL + url;
            imgElement.classList.add("preview-image");
            imgElement.onerror = function () {
                imgElement.src = "../assets/images/default.png";
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

    imageInput.addEventListener("change", function (event) {
        selectedImages = Array.from(event.target.files);
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

    editBtn.addEventListener("click", async function () {
        if (editBtn.disabled) return;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        let accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("data", JSON.stringify({ title, content, keepImageIds }));

        selectedImages.forEach((file) => {
            formData.append("images", file);
        });

        const updatedOrderIndexes = [...keepImageIds.map((_, idx) => idx + 1), ...selectedImages.map((_, idx) => keepImageIds.length + idx + 1)];
        formData.append("orderIndexes", JSON.stringify(updatedOrderIndexes));

        try {
            let response = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${accessToken}` },
                body: formData,
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                if (!newAccessToken) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "login.html";
                    return;
                }

                accessToken = newAccessToken;
                response = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${accessToken}` },
                    body: formData,
                });
            }

            const result = await response.json();

            if (response.ok) {
                alert("게시글이 성공적으로 수정되었습니다!");
                window.location.href = `post.html?id=${postId}`;
            } else {
                alert(`오류 발생: ${result.message}`);
            }
        } catch (error) {
            console.error("게시글 수정 오류:", error);
            alert("게시글 수정 중 오류가 발생했습니다.");
        }
    });

    fetchPostDetails();
});
