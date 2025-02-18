document.addEventListener("DOMContentLoaded", function () {
    const deletePostBtn = document.querySelector(".delete-btn"); 
    const deletePostModal = document.getElementById("delete-post-modal"); 
    const cancelDeletePostBtn = document.getElementById("cancel-delete-post-btn"); 
    const confirmDeletePostBtn = document.getElementById("confirm-delete-post-btn"); 

    const deleteCommentModal = document.getElementById("delete-comment-modal"); 
    const cancelDeleteCommentBtn = document.getElementById("cancel-delete-comment-btn"); 
    const confirmDeleteCommentBtn = document.getElementById("confirm-delete-comment-btn"); 
    let targetComment = null; 

    const editPostBtn = document.querySelector(".edit-btn");
    const likeBtn = document.querySelector(".like-btn");
    const commentInput = document.querySelector(".comment-input");
    const commentSubmitBtn = document.querySelector(".comment-submit");
    const commentList = document.querySelector(".comment-list");

    const dropdownMenu = document.getElementById("dropdown-menu");
    const profileIcon = document.getElementById("profile-icon");

    deletePostModal.style.display = "none";
    deleteCommentModal.style.display = "none";

    document.querySelector(".back-btn").addEventListener("click", function () {
        window.location.href = "posts.html";
    });

    editPostBtn.addEventListener("click", function () {
        localStorage.setItem("editPost", JSON.stringify(selectedPost)); // 기존 데이터 저장
        window.location.href = "edit-post.html"; // 수정 페이지로 이동
    });    

    deletePostBtn.addEventListener("click", function () {
        deletePostModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    cancelDeletePostBtn.addEventListener("click", function () {
        deletePostModal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    confirmDeletePostBtn.addEventListener("click", function () {
        alert("게시글이 삭제되었습니다.");
        window.location.href = "posts.html";
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-comment")) {
            targetComment = event.target.closest(".comment");
            deleteCommentModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        }
    });

    cancelDeleteCommentBtn.addEventListener("click", function () {
        deleteCommentModal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    confirmDeleteCommentBtn.addEventListener("click", function () {
        if (targetComment) {
            targetComment.remove();
            alert("댓글이 삭제되었습니다.");
        }
        deleteCommentModal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    // 숫자 포맷 변환 함수 (1.2k -> 1200 변환)
    function parseFormattedNumber(formattedNumber) {
        if (formattedNumber.includes("k")) {
            return parseFloat(formattedNumber.replace("k", "")) * 1000;
        }
        return parseInt(formattedNumber);
    }

    // 숫자 포맷 표시 함수 (1000 -> 1k 변환)
    function formatCount(number) {
        if (number >= 100000) return (number / 1000).toFixed(0) + "k";
        if (number >= 10000) return (number / 1000).toFixed(0) + "k";
        if (number >= 1000) return (number / 1000).toFixed(1) + "k";
        return number;
    }

    // 📌 게시글 상세 내용 불러오기
    const postTitle = document.querySelector(".post-title");
    const authorName = document.querySelector(".author");
    const postDate = document.querySelector(".date");
    const postText = document.querySelector(".post-text");
    const postImage = document.querySelector(".post-image");

    const viewCountStat = document.querySelector(".stat-btn:nth-child(2)");
    const likeCountStat = document.querySelector(".stat-btn:nth-child(1)");
    const commentCountStat = document.querySelector(".stat-btn:nth-child(3)");

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    let selectedPost = posts.find(post => post.id == postId);

    if (selectedPost) {
        postTitle.textContent = selectedPost.title;
        authorName.textContent = selectedPost.author;
        postDate.textContent = selectedPost.date;
        
        // 본문이 없을 경우 지정된 메시지 출력
        if (!selectedPost.content || selectedPost.content.trim() === "") {
            postText.textContent =
                `
                무엇을 얘기할까요? 아무말이라면, 삶은 항상 놀라운 모험이라고 생각합니다. 우리는 매일 새로운 경험을 하고 배우며 성장합니다. 
                때로는 어려움과 도전이 있지만, 그것들이 우리를 더 강하고 지혜롭게 만듭니다. 또한 우리는 주변의 사람들과 연결되며 사랑과 지지를 받습니다. 
                그래서 우리의 삶은 소중하고 의미가 있습니다.
                
                자연도 아름다운 이야기입니다. 우리 주변의 자연은 끝없는 아름다움과 신비로움을 담고 있습니다. 산, 바다, 숲, 하늘 등 모든 것이 우리를 놀라게 만들고 감동시킵니다. 
                자연은 우리의 생명과 안정을 지키며 우리에게 힘을 주는 곳입니다.
                
                마지막으로, 지식을 향한 탐구는 항상 흥미로운 여정입니다. 우리는 끝없는 지식의 바다에서 배우고 발견할 수 있으며, 이것이 우리를 더 깊이 이해하고 세상을 더 넓게 보게 해줍니다.
                
                그런 의미에서, 삶은 놀라움과 경이로움으로 가득 차 있습니다. 새로운 경험을 즐기고 항상 앞으로 나아가는 것이 중요하다고 생각합니다.
                `;
        } else {
            postText.textContent = selectedPost.content;
        }

        // 이미지가 없을 경우 기본 이미지 적용
        postImage.src = selectedPost.profileImg && selectedPost.profileImg.trim() !== "" 
            ? selectedPost.profileImg 
            : "../assets/images/default.png";

        // 좋아요, 조회수, 댓글 수 업데이트 함수
        function updateStats() {
            likeCountStat.innerHTML = `${formatCount(selectedPost.likes)}<br>좋아요`;
            viewCountStat.innerHTML = `${formatCount(selectedPost.views)}<br>조회수`;
            commentCountStat.innerHTML = `${formatCount(selectedPost.comments)}<br>댓글`;
        }

        // 초기 통계 값 설정
        updateStats();

        // 조회수 증가 후 다시 변환 적용
        selectedPost.views += 1;
        updateStats();

        localStorage.setItem("posts", JSON.stringify(posts));

        // 좋아요 상태 저장을 위한 localStorage 활용
        let likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];

        // 좋아요 버튼 초기 상태 설정 (눌리지 않은 상태로 시작)
        if (likedPosts.includes(postId)) {
            likeBtn.classList.add("liked");
            likeBtn.style.background = "#ACA0EB";
        } else {
            likeBtn.classList.remove("liked");
            likeBtn.style.background = "#d9d9d9";
        }

        // 좋아요 버튼 기능 (숫자 변환 유지)
        likeBtn.addEventListener("click", function () {
            if (likeBtn.classList.contains("liked")) {
                likeBtn.classList.remove("liked");
                likeBtn.style.background = "#d9d9d9";
                selectedPost.likes -= 1;
                likedPosts = likedPosts.filter(id => id !== postId);
            } else {
                likeBtn.classList.add("liked");
                likeBtn.style.background = "#ACA0EB";
                selectedPost.likes += 1;
                likedPosts.push(postId);
            }

            updateStats(); // 좋아요 숫자 업데이트
            localStorage.setItem("posts", JSON.stringify(posts));
            localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
        });
    }

    // 댓글 입력 시 버튼 활성화 유지 (진보라색 유지)
    commentInput.addEventListener("input", function () {
        if (commentInput.value.trim() !== "") {
            commentSubmitBtn.style.background = "#7F6AEE";
            commentSubmitBtn.disabled = false;
        } else {
            commentSubmitBtn.style.background = "#ACA0EB";
            commentSubmitBtn.disabled = true;
        }
    });

    // 댓글 등록 시 사용자 프로필 이미지 추가 (여러 개 댓글 가능 및 버튼 색상 유지)
    commentSubmitBtn.addEventListener("click", function () {
        if (commentInput.value.trim() !== "") {
            const userProfileImg = localStorage.getItem("userProfileImg") || "../assets/images/default.png";

            const newComment = document.createElement("li");
            newComment.classList.add("comment");
            newComment.innerHTML = `
                <div class="comment-header">
                    <img src="${userProfileImg}" alt="사용자 프로필" class="comment-author-img"> 
                    <div class="comment-info">
                        <span class="comment-author">사용자</span>
                        <span class="comment-date">${new Date().toLocaleString()}</span>
                    </div>
                    <div class="comment-actions">
                        <button class="edit-comment">수정</button>
                        <button class="delete-comment">삭제</button>
                    </div>
                </div>
                <p class="comment-text">${commentInput.value}</p>
            `;
            commentList.appendChild(newComment);
            
            // 입력 필드 초기화 후 버튼 색상 유지
            commentInput.value = "";
            commentSubmitBtn.style.background = "#ACA0EB";
            commentSubmitBtn.disabled = true;
        }
    });
});
