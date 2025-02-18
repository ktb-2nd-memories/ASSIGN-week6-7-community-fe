document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const submitBtn = document.getElementById("submit-btn");
    const helperText = document.getElementById("helper-text");

    function validateForm() {
        const isTitleValid = titleInput.value.trim().length > 0;
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

    validateForm();

    titleInput.addEventListener("input", validateForm);
    contentInput.addEventListener("input", validateForm);

    submitBtn.addEventListener("click", function () {
        if (submitBtn.disabled) {
            helperText.style.display = "block"; 
        } else {
            // **기존 게시글 가져오기 (localStorage 사용)**
            let posts = JSON.parse(localStorage.getItem("posts")) || [];

            // **새로운 id 설정 (기존 게시글 중 가장 큰 id + 1)**
            let newId = posts.length > 0 ? Math.max(...posts.map(post => post.id)) + 1 : 1;

            // **새로운 게시글 객체 생성**
            const newPost = {
                id: newId,
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                likes: 0,
                comments: 0,
                views: 0,
                date: new Date().toISOString().split("T")[0] + " " + new Date().toLocaleTimeString(), 
                author: "작성자",
            };

            // **새로운 게시글 추가 및 저장**
            posts.push(newPost);
            localStorage.setItem("posts", JSON.stringify(posts));

            alert("게시글이 등록되었습니다.");

            // **posts.html로 이동 후 강제 새로고침하여 반영**
            window.location.href = "posts.html";
        }
    });
});
