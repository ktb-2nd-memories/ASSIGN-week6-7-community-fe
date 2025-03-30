document.addEventListener("DOMContentLoaded", async function () {
    const BACKEND_URL = "http://localhost:8080";
    const postId = new URLSearchParams(window.location.search).get("id");

    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const imageInput = document.getElementById("post-image");
    const editBtn = document.getElementById("edit-btn");
    const helperText = document.getElementById("helper-text");

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-preview-container");
    document.querySelector(".input-group:last-of-type").appendChild(imageContainer);

    let images = []; // [{ id, url }] for existing, [{ file, previewUrl }] for new

    async function refreshAccessToken() {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const accessToken = localStorage.getItem("accessToken");
            if (!refreshToken || !accessToken) return null;

            const res = await fetch(`${BACKEND_URL}/auth/reissue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!res.ok) return null;
            const data = await res.json();
            const newAccessToken = data.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            return newAccessToken;
        } catch {
            return null;
        }
    }

    async function fetchPostDetails() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/posts/${postId}`);
            const data = await res.json();
            const post = data.data;

            titleInput.value = post.title;
            contentInput.value = post.content;

            // ✅ imageUrls → images [{ id, imageUrl, orderIndex }]
            if (post.images?.length) {
                images = post.images
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map(img => ({ id: img.id, url: BACKEND_URL + img.imageUrl }));
            }

            renderImages();
            validateInputs();
        } catch (e) {
            alert("게시글을 불러오는 중 오류 발생");
        }
    }

    function validateInputs() {
        const valid = titleInput.value.trim() && contentInput.value.trim();
        editBtn.disabled = !valid;
        editBtn.classList.toggle("active", valid);
        editBtn.classList.toggle("disabled", !valid);
        helperText.style.display = valid ? "none" : "block";
    }

    function renderImages() {
        imageContainer.innerHTML = "";
        images.forEach((img, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";
            wrapper.draggable = true;
            wrapper.dataset.index = idx;

            const image = document.createElement("img");
            image.className = "preview-image";
            image.src = img.url || img.previewUrl;

            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-image-btn";
            removeBtn.textContent = "X";
            removeBtn.onclick = () => {
                images.splice(idx, 1);
                renderImages();
            };

            wrapper.appendChild(image);
            wrapper.appendChild(removeBtn);

            // Drag & Drop
            wrapper.addEventListener("dragstart", e => {
                e.dataTransfer.setData("from", idx);
            });
            wrapper.addEventListener("dragover", e => e.preventDefault());
            wrapper.addEventListener("drop", e => {
                const from = parseInt(e.dataTransfer.getData("from"));
                const to = idx;
                const moved = images.splice(from, 1)[0];
                images.splice(to, 0, moved);
                renderImages();
            });

            imageContainer.appendChild(wrapper);
        });
    }

    imageInput.addEventListener("change", e => {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                images.push({ file, previewUrl: ev.target.result });
                renderImages();
            };
            reader.readAsDataURL(file);
        });
    });

    titleInput.addEventListener("input", validateInputs);
    contentInput.addEventListener("input", validateInputs);

    editBtn.addEventListener("click", async () => {
        if (editBtn.disabled) return;

        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        const keepImageIds = images.filter(img => img.id).map(img => img.id);
        const orderIndexMap = {};

        images.forEach((img, i) => {
            if (img.id) {
                orderIndexMap[img.id] = i + 1;
            }
        });

        const postData = {
            postData: {
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                keepImageIds,
                orderIndexMap
            }
        };

        const formData = new FormData();

        formData.append("updateData", new Blob([JSON.stringify(postData)], { type: "application/json" }));

        images.forEach(img => {
            if (img.file instanceof File) {
                formData.append("newImages", img.file);
            }
        });

        try {
            let res = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (res.status === 401) {
                const newToken = await refreshAccessToken();
                if (!newToken) return (window.location.href = "login.html");

                res = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${newToken}` },
                    body: formData,
                });
            }

            const result = await res.json();

            if (res.ok) {
                alert("게시글이 수정되었습니다.");
                window.location.href = `post.html?id=${postId}&t=${Date.now()}`;
            } else {
                alert(`수정 실패: ${result.message}`);
            }
        } catch (e) {
            alert("수정 중 오류 발생");
            console.error(e);
        }
    });

    fetchPostDetails();
});
