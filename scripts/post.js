document.addEventListener("DOMContentLoaded", function () {
    const postTitle = document.querySelector(".post-title");
    const authorName = document.querySelector(".author");
    const postDate = document.querySelector(".date");
    const postText = document.querySelector(".post-text");
    const postImage = document.querySelector(".post-image");

    const viewCountStat = document.querySelector(".stat-btn:nth-child(2)");
    const likeCountStat = document.querySelector(".stat-btn:nth-child(1)");
    const commentCountStat = document.querySelector(".stat-btn:nth-child(3)");
    const commentList = document.querySelector(".comment-list");

    const deletePostBtn = document.querySelector(".delete-btn");
    const editPostBtn = document.querySelector(".edit-btn");
    const likeBtn = document.querySelector(".like-btn");
    const commentInput = document.querySelector(".comment-input");
    const commentSubmitBtn = document.querySelector(".comment-submit");

    const deletePostModal = document.getElementById("delete-post-modal");
    const cancelDeletePostBtn = document.getElementById("cancel-delete-post-btn");
    const confirmDeletePostBtn = document.getElementById("confirm-delete-post-btn");

    const deleteCommentModal = document.getElementById("delete-comment-modal");
    const cancelDeleteCommentBtn = document.getElementById("cancel-delete-comment-btn");
    const confirmDeleteCommentBtn = document.getElementById("confirm-delete-comment-btn");

    let targetComment = null; // 수정 또는 삭제할 댓글 저장
    let isEditing = false; // 댓글 수정 중인지 확인

    // URL에서 postId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
        
    let postData = {}; // 게시글 데이터 저장용

    // 모달이 자동으로 뜨지 않도록 설정
    if (deletePostModal) {
        deletePostModal.style.display = "none"; 
    }
    if (deleteCommentModal) {
        deleteCommentModal.style.display = "none"; 
    }

    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 숫자 포맷 변환 함수
    function formatCount(number) {
        if (number >= 100000) return (number / 1000).toFixed(0) + "k";
        if (number >= 10000) return (number / 1000).toFixed(0) + "k";
        if (number >= 1000) return (number / 1000).toFixed(1) + "k";
        return number;
    }

    // 게시글 상세 조회 (로컬 JSON 활용)
    async function fetchPostDetails() {
        try {
            const response = await fetch("data/post.json");
            const data = await response.json();

            if (data.message === "post_found" && data.data.postId == postId) {
                postData = data.data;

                postTitle.textContent = postData.title;
                authorName.textContent = postData.author;
                postDate.textContent = postData.date || "날짜 없음";
                postText.textContent = postData.content || "내용이 없습니다.";
                postImage.src = postData.image || "../assets/images/default.png";

                postData.views += 1;
                updateStats();

                commentList.innerHTML = "";
                postData.comments.forEach(comment => {
                    renderComment(comment);
                });
            } else {
                alert("게시글을 찾을 수 없습니다.");
                window.location.href = "posts.html";
            }
        } catch (error) {
            console.error("게시글 불러오기 실패:", error);
        }
    }

    fetchPostDetails(); // 상세 게시글 조회 실행

    // 좋아요, 조회수, 댓글 수 업데이트 함수
    function updateStats() {
        likeCountStat.innerHTML = `${formatCount(postData.likes || 0)}<br>좋아요`;
        viewCountStat.innerHTML = `${formatCount(postData.views || 0)}<br>조회수`;
        commentCountStat.innerHTML = `${formatCount(postData.comments.length || 0)}<br>댓글`;
    }

    // 게시글 수정 기능
    editPostBtn.addEventListener("click", function () {
        localStorage.setItem("editPost", JSON.stringify(postData)); // 기존 데이터 저장
        window.location.href = "edit-post.html"; // 수정 페이지로 이동
    });

    // 게시글 삭제 기능
    deletePostBtn.addEventListener("click", function () {
        deletePostModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    cancelDeletePostBtn.addEventListener("click", function () {
        deletePostModal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    // fetch api 사용하기 전의 코드
    // confirmDeletePostBtn.addEventListener("click", function () {
    //     deletePostModal.style.display = "none";
    //     document.body.style.overflow = "auto";
    //     window.location.href = "posts.html";
    // });
    confirmDeletePostBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("data/post.json", { method: "DELETE" });

            if (response.ok) {
                alert("게시글이 삭제되었습니다.");
                window.location.href = "posts.html";
            } else {
                alert("게시글 삭제 실패");
            }
        } catch (error) {
            console.error("게시글 삭제 실패:", error);
        }
    });

    // 좋아요 기능
    let likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];

    // 초기 로드 시 좋아요 버튼 상태 설정
    function updateLikeButton() {
        if (likedPosts.includes(postId)) {
            likeBtn.classList.add("liked");
        } else {
            likeBtn.classList.remove("liked");
        }
    }

    updateLikeButton(); // 페이지 로드 시 좋아요 상태 반영

    // 좋아요 버튼 클릭 이벤트
    likeBtn.addEventListener("click", function () {
        if (likeBtn.classList.contains("liked")) {
            likeBtn.classList.remove("liked");
            postData.likes -= 1;
            likedPosts = likedPosts.filter(id => id !== postId); // 배열에서 제거
        } else {
            likeBtn.classList.add("liked");
            postData.likes += 1;
            likedPosts.push(postId); // 배열에 추가
        }

        updateStats(); // 좋아요 숫자 업데이트
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    });

    // 댓글 등록 및 수정 기능
    commentSubmitBtn.addEventListener("click", function () {
        const commentContent = commentInput.value.trim();
        if (!commentContent) {
            alert("댓글을 입력해주세요.");
            return;
        }

        if (isEditing && targetComment) {
            // 댓글 수정 모드
            const commentId = targetComment.getAttribute("data-id");
            const comment = postData.comments.find(c => c.commentId == commentId);
            if (comment) {
                comment.content = commentContent;
                comment.date = formatDate(new Date());
                targetComment.querySelector(".comment-text").textContent = commentContent;
                targetComment.querySelector(".comment-date").textContent = comment.date;
            }

            // 수정 완료 후 초기화
            isEditing = false;
            targetComment = null;
            commentSubmitBtn.textContent = "댓글 등록";
            commentInput.value = "";
        } else {
            // 새 댓글 등록
            const newComment = {
                commentId: postData.comments.length + 1,
                content: commentContent,
                author: "사용자",
                date: formatDate(new Date())
            };

            postData.comments.push(newComment);
            renderComment(newComment);
            commentInput.value = ""; // 입력창 초기화

            updateStats(); // 댓글 수 업데이트
        }
    });

    // 댓글 삭제 기능
    commentList.addEventListener("click", function (event) {
        const commentItem = event.target.closest(".comment");
        if (!commentItem) return;

        if (event.target.classList.contains("delete-comment")) {
            targetComment = commentItem;
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
            const commentId = targetComment.getAttribute("data-id");
            postData.comments = postData.comments.filter(c => c.commentId != commentId);
            targetComment.remove();
            updateStats();
        }
        deleteCommentModal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    // 댓글 렌더링 함수
    function renderComment(comment) {
        const commentItem = document.createElement("li");
        commentItem.classList.add("comment");
        commentItem.setAttribute("data-id", comment.commentId);

        commentItem.innerHTML = `
            <div class="comment-header">
                <img src="../assets/images/default.png" alt="댓글 작성자 프로필" class="comment-author-img">
                <div class="comment-info">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-actions">
                    <button class="edit-comment">수정</button>
                    <button class="delete-comment">삭제</button>
                </div>
            </div>
            <p class="comment-text">${comment.content}</p>
        `;

        commentList.appendChild(commentItem);
    }

    // 댓글 수정 기능
    commentList.addEventListener("click", function (event) {
        const commentItem = event.target.closest(".comment");
        if (!commentItem) return;

        if (event.target.classList.contains("edit-comment")) {
            // 댓글 수정 모드 진입
            targetComment = commentItem;
            isEditing = true;
            commentInput.value = commentItem.querySelector(".comment-text").textContent;
            commentSubmitBtn.textContent = "댓글 수정";
        }
    });
});
