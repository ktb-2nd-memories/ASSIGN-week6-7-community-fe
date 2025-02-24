document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const imageInput = document.getElementById("post-image");
    const submitBtn = document.getElementById("submit-btn");
    const helperText = document.getElementById("helper-text");

    function validateForm() {
        const isTitleValid = titleInput.value.trim().length > 0 && titleInput.value.trim().length <= 26;
        const isContentValid = contentInput.value.trim().length > 0;

        if (isTitleValid && isContentValid) {
            submitBtn.classList.add("active");
            submitBtn.classList.remove("disabled");
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "#7F6AEE";
            helperText.style.display = "none"; 
        } else {
            submitBtn.classList.remove("active");
            submitBtn.classList.add("disabled");
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = "#ACA0EB";
            helperText.style.display = "block"; 
        }
    }

    titleInput.addEventListener("input", validateForm);
    contentInput.addEventListener("input", validateForm);

    function convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async function submitPost() {
        if (submitBtn.disabled) {
            helperText.style.display = "block"; 
            return;
        }

        let imageUrl = "";
        if (imageInput.files.length > 0) {
            try {
                imageUrl = await convertImageToBase64(imageInput.files[0]);
            } catch (error) {
                console.error("이미지 변환 실패:", error);
            }
        }

        const postData = {
            title: titleInput.value.trim(),
            content: contentInput.value.trim(),
            author: "작성자",  // 서버에서 사용자 인증이 있다면 변경 필요
            image: imageUrl || null,
        };

        fetch("data/make-post.json")
        .then(response => response.json())
        .then(data => {
            if (data.message === "post_created") {
                alert("게시글이 성공적으로 등록되었습니다.");
                window.location.href = "posts.html";
            } else {
                alert("입력값이 올바르지 않습니다. 제목과 내용을 확인해주세요.");
            }
        })
        .catch(error => {
            console.error("게시글 등록 실패:", error);
            alert("게시글 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
        });
    }

    submitBtn.addEventListener("click", submitPost);
});
