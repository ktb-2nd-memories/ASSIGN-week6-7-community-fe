document.addEventListener("DOMContentLoaded", function () {
    const BACKEND_URL = "http://localhost:8080";
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const imageInput = document.getElementById("post-image");
    const submitBtn = document.getElementById("submit-btn");
    const helperText = document.getElementById("helper-text");
    const imagePreview = document.getElementById("image-preview");

    let selectedImages = [];

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
            console.error("토큰 갱신 중 오류:", error);
            return null;
        }
    }

    titleInput.addEventListener("input", validateInputs);
    contentInput.addEventListener("input", validateInputs);

    imageInput.addEventListener("change", function (event) {
        selectedImages = Array.from(event.target.files);
        displayImagePreviews();
    });

    function displayImagePreviews() {
        imagePreview.innerHTML = "";

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

    submitBtn.addEventListener("click", async function () {
        if (submitBtn.disabled) return;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        const formData = new FormData();
        formData.append("data", JSON.stringify({ title, content }));

        selectedImages.forEach((file) => {
            formData.append("images", file);
        });

        if (selectedImages.length > 0) {
            const orderIndexes = Array.from({ length: selectedImages.length }, (_, i) => i + 1);
            formData.append("orderIndexes", JSON.stringify(orderIndexes));
        }

        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("로그인이 필요합니다.");
            window.location.href = "login.html";
            return;
        }

        try {
            let response = await fetch(`${BACKEND_URL}/api/posts`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
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

                accessToken = newAccessToken;
                response = await fetch(`${BACKEND_URL}/api/posts`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: formData,
                });
            }

            const result = await response.json();

            if (response.ok) {
                alert("게시글이 성공적으로 작성되었습니다!");
                window.location.href = "posts.html";
            } else {
                alert(`오류 발생: ${result.message}`);
            }
        } catch (error) {
            console.error("게시글 작성 중 오류 발생:", error);
            alert("게시글 작성 중 오류가 발생했습니다.");
        }
    });
});
