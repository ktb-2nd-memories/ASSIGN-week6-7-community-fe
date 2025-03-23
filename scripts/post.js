document.addEventListener("DOMContentLoaded", async function () {
    const postTitle = document.querySelector(".post-title");
    const authorName = document.querySelector(".author");
    const postDate = document.querySelector(".date");
    const postText = document.querySelector(".post-text");
    const postImage = document.querySelector(".post-image");

    const viewCountStat = document.querySelector(".stat-btn:nth-child(2)");
    const likeCountStat = document.querySelector(".stat-btn:nth-child(1)");
    const commentCountStat = document.querySelector(".stat-btn:nth-child(3)");
    const commentList = document.querySelector(".comment-list");
    const likeButton = document.querySelector(".like-btn");

    const commentSubmitBtn = document.querySelector(".comment-submit");

    const replyInputContainer = document.getElementById("reply-input-container");
    const replyInput = document.querySelector(".reply-input");
    const replySubmitBtn = document.querySelector(".reply-submit");
    const replyCancelBtn = document.querySelector(".reply-cancel");

    let targetCommentId = null; // 대댓글 대상 댓글 ID 저장

    const editButton = document.querySelector(".edit-btn");
    const deleteButton = document.querySelector(".delete-btn");
    const deletePostModal = document.getElementById("delete-post-modal");
    const confirmDeletePostBtn = document.getElementById("confirm-delete-post-btn");
    const cancelDeletePostBtn = document.getElementById("cancel-delete-post-btn");

    // URL에서 postId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    if (!postId) {
        alert("잘못된 접근입니다.");
        window.location.href = "posts.html";
    }

    const BACKEND_URL = "http://localhost:8080";
    let memberId = localStorage.getItem("memberId");

    // 📌 게시글 상세 조회 API 호출
    async function fetchPostDetails() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}`);
            if (!response.ok) throw new Error("게시글을 불러오는 데 실패했습니다.");

            const responseData = await response.json();
            renderPostDetails(responseData.data);
        } catch (error) {
            console.error("게시글 조회 오류:", error);
            alert("게시글을 불러오는 중 오류가 발생했습니다.");
        }
    }

    // 📌 게시글 데이터 렌더링
    function renderPostDetails(postData) {
        if (!postData) {
            console.error("❌ postData가 undefined입니다!");
            alert("게시글 정보를 가져오는 중 오류가 발생했습니다.");
            return;
        }

        console.log("📌 렌더링할 게시글 데이터:", postData);

        postTitle.textContent = postData.title;
        authorName.textContent = postData.memberNickname || "익명";
        postDate.textContent = new Date(postData.createdAt).toLocaleString();
        postText.textContent = postData.content || "내용이 없습니다.";
        postImage.src = postData.imageUrls.length > 0 ? postData.imageUrls[0] : "../assets/images/default.png";

        updateStats(postData);
        renderComments(postData.comments);
    }

    // 📌 좋아요 상태 변경 API 호출
    async function toggleLike() {
        try {
            const accessToken = localStorage.getItem("accessToken"); // 저장된 토큰 가져오기
            if (!accessToken) {
                alert("로그인이 필요합니다.");
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/likes/${postId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || "좋아요 변경 실패");
            }

            const responseData = await response.json();
            console.log("좋아요 변경 응답:", responseData);

            if (responseData.status === 200) {
                const isLiked = responseData.data;
                likeButton.classList.toggle("liked", isLiked); // UI 토글
                await updateLikeCount(); // 좋아요 개수 즉시 업데이트
                updateLikeUI(postId, responseData.data); // ❗ result → responseData로 변경
            }
        } catch (error) {
            console.error("좋아요 변경 오류:", error);
            alert("좋아요 변경 중 오류가 발생했습니다.");
        }
    }

    // 📌 좋아요 개수 업데이트 함수
    async function updateLikeCount() {
        try {
            const response = await fetch(`http://localhost:8080/api/likes/${postId}/count`);
            const responseData = await response.json();

            if (response.ok && responseData.status === 200) {
                likeCountStat.innerHTML = `${formatCount(responseData.data)}<br>좋아요`;
            } else {
                throw new Error(responseData.message || "좋아요 개수 조회 실패");
            }
        } catch (error) {
            console.error("좋아요 개수 조회 오류:", error);
        }
    }

    function updateLikeUI(postId, isLiked) {
        const likeElement = document.querySelector(`.likes[data-id="${postId}"]`);
        if (!likeElement) return;

        let likeCount = parseInt(likeElement.textContent.replace(/[^0-9]/g, ""), 10);
        likeCount = isLiked ? likeCount + 1 : likeCount - 1;

        likeElement.textContent = `👍 ${formatNumber(likeCount)}`;
    }

    // 📌 좋아요, 조회수, 댓글 수 업데이트
    function updateStats(postData) {
        likeCountStat.innerHTML = `${formatCount(postData.likeCount)}<br>좋아요`;
        viewCountStat.innerHTML = `${formatCount(postData.viewCount)}<br>조회수`;
        commentCountStat.innerHTML = `${formatCount(postData.commentCount)}<br>댓글`;
    }

    // 📌 댓글 목록 렌더링
    function renderComments(comments) {
        commentList.innerHTML = "";
        comments.forEach(comment => renderComment(comment, commentList));
    }

    // 📌 댓글 렌더링 (삭제된 댓글도 원래 위치 유지)
    function renderComment(comment, parentElement) {
        const commentItem = document.createElement("li");
        commentItem.classList.add("comment");
        commentItem.setAttribute("data-id", comment.id);

        let isDeleted = comment.isDeleted;
        let commentContent = isDeleted ? "삭제된 댓글입니다." : comment.content;
        let authorName = isDeleted ? "(알수없음)" : comment.memberNickname;
        let profileImage = isDeleted ? "../assets/images/default.png" : comment.memberProfileImageUrl || '../assets/images/default.png';

        let actionsHTML = isDeleted ? "" : `
        <button class="reply-comment">답글</button>
        <button class="edit-comment">수정</button>
        <button class="delete-comment">삭제</button>
    `;

        commentItem.innerHTML = `
        <div class="comment-header">
            <img src="${profileImage}" alt="프로필" class="comment-author-img">
            <div class="comment-info">
                <span class="comment-author">${authorName}</span>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-actions">
                ${actionsHTML}
            </div>
        </div>
        <p class="comment-text">${commentContent}</p>
        <ul class="reply-list"></ul>
    `;

        if (isDeleted) {
            commentItem.classList.add("deleted-comment");
        }

        parentElement.appendChild(commentItem);
        const replyList = commentItem.querySelector(".reply-list");

        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => renderComment(reply, replyList));
        }
    }

    // 📌 댓글 등록 처리 (API 호출)
    async function handleCommentSubmit() {
        const commentInput = document.querySelector(".comment-input");
        const commentContent = commentInput.value.trim();

        if (!commentContent) {
            alert("댓글을 입력하세요!");
            return;
        }

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                alert("로그인이 필요합니다.");
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                // body: JSON.stringify({ content: commentContent, memberId: memberId }),
                body: JSON.stringify({ content: commentContent }),
            });

            const responseData = await response.json();

            if (response.ok) {
                renderComment(responseData.data, commentList);
                incrementCommentCount();
            } else {
                throw new Error(responseData.message || "댓글 등록 실패");
            }

            commentInput.value = "";
        } catch (error) {
            console.error("댓글 등록 오류:", error);
            alert(`댓글 등록 중 오류가 발생했습니다.\n${error.message}`);
        }
    }

    // 대댓글도 수정/삭제 버튼 포함
    function renderReply(reply, parentElement) {
        const replyItem = document.createElement("li");
        replyItem.classList.add("reply");
        replyItem.setAttribute("data-id", reply.id);

        replyItem.innerHTML = `
        <div class="comment-header">
            <img src="${reply.memberProfileImageUrl || '../assets/images/default.png'}" alt="프로필" class="comment-author-img">
            <div class="comment-info">
                <span class="comment-author">${reply.memberNickname}</span>
                <span class="comment-date">${formatDate(reply.createdAt)}</span>
            </div>
            <div class="reply-actions"> <!-- 대댓글 수정/삭제 버튼 추가 -->
                <button class="edit-reply">수정</button>
                <button class="delete-reply">삭제</button>
            </div>
        </div>
        <p class="comment-text">${reply.content}</p>
    `;

        parentElement.appendChild(replyItem);
    }

    // 📌 대댓글 입력창 토글 (답글 버튼 클릭 시)
    function handleReplyButtonClick(event) {
        if (event.target.classList.contains("reply-comment")) {
            const commentItem = event.target.closest(".comment");
            targetCommentId = commentItem.getAttribute("data-id");

            // 기존 입력창이 다른 곳에 있으면 숨김
            document.querySelectorAll(".reply-input-container").forEach(el => el.classList.add("hidden"));

            commentItem.appendChild(replyInputContainer);
            replyInputContainer.classList.remove("hidden");
            replyInput.focus();
        }
    }

    // 📌 대댓글 등록 처리
    async function handleReplySubmit() {
        const replyContent = replyInput.value.trim();
        if (!replyContent) {
            alert("대댓글을 입력하세요!");
            return;
        }

        if (!targetCommentId) {
            alert("잘못된 요청입니다.");
            return;
        }

        try {
            const accessToken = localStorage.getItem("accessToken"); // 저장된 토큰 가져오기
            if (!accessToken) {
                alert("로그인이 필요합니다.");
                return;
            }

            // 대댓글 API 요청
            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments/${targetCommentId}/replies`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                // body: JSON.stringify({
                //     content: replyContent,
                //     memberId: memberId,
                // }),
                body: JSON.stringify({ content: replyContent }),
            });

            const responseData = await response.json();
            console.log("대댓글 등록 응답:", responseData);

            if (response.ok) {
                // 새롭게 받아온 대댓글을 UI에 추가
                renderComment(responseData.data, document.querySelector(`.comment[data-id="${targetCommentId}"] .reply-list`));

                // 댓글 개수 즉시 반영
                incrementCommentCount();
            } else {
                throw new Error(responseData.message || "대댓글 등록 실패");
            }

            // 입력창 숨기기
            replyInputContainer.classList.add("hidden");
            replyInput.value = "";
            targetCommentId = null;
        } catch (error) {
            console.error("대댓글 등록 오류:", error);
            alert(`대댓글 등록 중 오류가 발생했습니다.\n${error.message}`);
        }
    }

    // 📌 댓글 수정 처리 (입력창 UI 동일하게 변경)
    async function handleEditComment(event) {
        if (!event.target.classList.contains("edit-comment")) return;

        const commentItem = event.target.closest(".comment");
        const commentId = commentItem.getAttribute("data-id");
        const commentText = commentItem.querySelector(".comment-text");

        // 기존 내용 저장
        const originalContent = commentText.textContent;

        // 기존 내용을 입력창으로 변경 (textarea 사용)
        const editContainer = document.createElement("div");
        editContainer.classList.add("edit-container");

        const textarea = document.createElement("textarea");
        textarea.classList.add("comment-input");
        textarea.value = originalContent;
        textarea.rows = 3;

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "저장";
        saveBtn.classList.add("comment-submit");

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "취소";
        cancelBtn.classList.add("reply-cancel");

        editContainer.appendChild(textarea);
        editContainer.appendChild(saveBtn);
        editContainer.appendChild(cancelBtn);
        commentText.replaceWith(editContainer);

        // 저장 버튼 클릭 시 API 호출
        saveBtn.addEventListener("click", async function () {
            const updatedContent = textarea.value.trim();
            if (!updatedContent) {
                alert("내용을 입력하세요!");
                return;
            }

            try {
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken) {
                    alert("로그인이 필요합니다.");
                    return;
                }

                // API 요청
                const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments/${commentId}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${accessToken}"`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: updatedContent,
                    }),
                });

                const responseData = await response.json();
                console.log("댓글 수정 응답:", responseData);

                if (response.ok) {
                    // 수정된 내용을 UI에 반영
                    commentText.textContent = updatedContent;
                    editContainer.replaceWith(commentText);
                } else {
                    throw new Error(responseData.message || "댓글 수정 실패");
                }
            } catch (error) {
                console.error("댓글 수정 오류:", error);
                alert(`댓글 수정 중 오류가 발생했습니다.\n${error.message}`);
            }
        });

        // 취소 버튼 클릭 시 원래 내용 유지
        cancelBtn.addEventListener("click", function () {
            editContainer.replaceWith(commentText);
        });
    }

    // 📌 댓글 삭제 처리 (삭제 후 계층 유지)
    async function handleDeleteComment(event) {
        if (!event.target.classList.contains("delete-comment")) return;

        const commentItem = event.target.closest(".comment");
        const commentId = commentItem.getAttribute("data-id");

        if (!confirm("댓글을 삭제하시겠습니까?")) return;

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                alert("로그인이 필요합니다.");
                return;
            }

            // API 요청
            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${accessToken}"`,
                },
            });

            const responseData = await response.json();
            console.log("댓글 삭제 응답:", responseData);

            if (response.ok) {
                // "삭제된 댓글입니다." 표시 (대댓글 유지)
                commentItem.querySelector(".comment-text").textContent = "삭제된 댓글입니다.";
                commentItem.classList.add("deleted-comment");

                // 수정/삭제 버튼 제거
                commentItem.querySelector(".edit-comment")?.remove();
                commentItem.querySelector(".delete-comment")?.remove();

                decrementCommentCount();
            } else {
                throw new Error(responseData.message || "댓글 삭제 실패");
            }
        } catch (error) {
            console.error("댓글 삭제 오류:", error);
            alert(`댓글 삭제 중 오류가 발생했습니다.\n${error.message}`);
        }
    }


    // 📌 대댓글 수정 처리 (입력창 UI 동일하게 변경)
    async function handleEditReply(event) {
        if (!event.target.classList.contains("edit-reply")) return;

        const replyItem = event.target.closest(".reply");
        const replyId = replyItem.getAttribute("data-id");
        const replyText = replyItem.querySelector(".comment-text");

        // 기존 내용 저장
        const originalContent = replyText.textContent;

        // 기존 내용을 입력창으로 변경 (textarea 사용)
        const editContainer = document.createElement("div");
        editContainer.classList.add("edit-container");

        const textarea = document.createElement("textarea");
        textarea.classList.add("reply-input");
        textarea.value = originalContent;
        textarea.rows = 3;

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "저장";
        saveBtn.classList.add("reply-submit");

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "취소";
        cancelBtn.classList.add("reply-cancel");

        editContainer.appendChild(textarea);
        editContainer.appendChild(saveBtn);
        editContainer.appendChild(cancelBtn);
        replyText.replaceWith(editContainer);

        // 저장 버튼 클릭 시 API 호출
        saveBtn.addEventListener("click", async function () {
            const updatedContent = textarea.value.trim();
            if (!updatedContent) {
                alert("내용을 입력하세요!");
                return;
            }

            try {
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken) {
                    alert("로그인이 필요합니다.");
                    return;
                }

                // API 요청
                const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments/${replyId}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${accessToken}"`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: updatedContent,
                    }),
                });

                const responseData = await response.json();
                console.log("대댓글 수정 응답:", responseData);

                if (response.ok) {
                    // 수정된 내용을 UI에 반영
                    replyText.textContent = updatedContent;
                    editContainer.replaceWith(replyText);
                } else {
                    throw new Error(responseData.message || "대댓글 수정 실패");
                }
            } catch (error) {
                console.error("대댓글 수정 오류:", error);
                alert(`대댓글 수정 중 오류가 발생했습니다.\n${error.message}`);
            }
        });

        // 취소 버튼 클릭 시 원래 내용 유지
        cancelBtn.addEventListener("click", function () {
            editContainer.replaceWith(replyText);
        });
    }

    // 📌 대댓글 삭제 처리 (삭제 후 계층 유지)
    async function handleDeleteReply(event) {
        if (!event.target.classList.contains("delete-reply")) return;

        const replyItem = event.target.closest(".reply");
        const replyId = replyItem.getAttribute("data-id");

        if (!confirm("대댓글을 삭제하시겠습니까?")) return;

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                alert("로그인이 필요합니다.");
                return;
            }

            // API 요청
            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments/${replyId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${accessToken}"`,
                },
            });

            const responseData = await response.json();
            console.log("대댓글 삭제 응답:", responseData);

            if (response.ok) {
                // "삭제된 댓글입니다." 표시 (대댓글 유지)
                replyItem.querySelector(".comment-text").textContent = "삭제된 댓글입니다.";
                replyItem.classList.add("deleted-comment");

                // 수정/삭제 버튼 제거
                replyItem.querySelector(".edit-reply")?.remove();
                replyItem.querySelector(".delete-reply")?.remove();

                decrementCommentCount();
            } else {
                throw new Error(responseData.message || "대댓글 삭제 실패");
            }
        } catch (error) {
            console.error("대댓글 삭제 오류:", error);
            alert(`대댓글 삭제 중 오류가 발생했습니다.\n${error.message}`);
        }
    }

    // 📌 댓글 개수 감소 함수
    function decrementCommentCount() {
        let count = parseInt(commentCountStat.textContent) || 0;
        commentCountStat.innerHTML = `${Math.max(0, count - 1)}<br>댓글`;
    }

    // 📌 댓글 개수 즉시 업데이트 함수
    function incrementCommentCount() {
        let count = parseInt(commentCountStat.textContent) || 0;
        commentCountStat.innerHTML = `${count + 1}<br>댓글`;
    }

    // 📌 삭제 버튼이 정상적으로 선택되었는지 확인
    console.log("삭제 버튼: ", deleteButton);
    console.log("삭제 모달: ", deletePostModal);

    if (!deleteButton || !deletePostModal || !confirmDeletePostBtn || !cancelDeletePostBtn) {
        console.error("삭제 관련 요소가 정상적으로 로드되지 않았습니다.");
        return;
    }

    // 📌 삭제 버튼 클릭 시 모달 표시
    deleteButton.addEventListener("click", function () {
        console.log("🛠️ 삭제 버튼 클릭됨");
        deletePostModal.style.display = "block";
    });

    // 📌 삭제 취소 버튼 클릭 시 모달 닫기
    cancelDeletePostBtn.addEventListener("click", function () {
        console.log("🛠️ 삭제 취소 버튼 클릭됨");
        deletePostModal.style.display = "none";
    });

    // 📌 게시글 삭제 요청
    confirmDeletePostBtn.addEventListener("click", async function () {
        console.log("🛠️ 삭제 확인 버튼 클릭됨");

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                alert("로그인이 필요합니다.");
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const responseData = await response.json();
            if (response.ok) {
                alert("게시글이 삭제되었습니다.");
                window.location.href = "posts.html"; // 게시글 목록 페이지로 이동
            } else {
                throw new Error(responseData.message || "게시글 삭제 실패");
            }
        } catch (error) {
            console.error("게시글 삭제 오류:", error);
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    });

    // 📌 날짜 포맷 함수
    function formatDate(dateString) {
        if (!dateString) return "날짜 없음";
        const d = new Date(dateString);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    }

    // 📌 숫자 포맷 변환 함수
    function formatCount(number) {
        if (number >= 100000) return (number / 1000).toFixed(0) + "k";
        if (number >= 10000) return (number / 1000).toFixed(0) + "k";
        if (number >= 1000) return (number / 1000).toFixed(1) + "k";
        return number;
    }

    // 📌 이벤트 리스너 추가
    commentList.addEventListener("click", handleReplyButtonClick);
    commentSubmitBtn.addEventListener("click", handleCommentSubmit);
    replySubmitBtn.addEventListener("click", handleReplySubmit);
    commentList.addEventListener("click", handleEditComment);
    commentList.addEventListener("click", handleDeleteComment);
    commentList.addEventListener("click", handleEditReply);
    commentList.addEventListener("click", handleDeleteReply);
    replyCancelBtn.addEventListener("click", function () {
        replyInputContainer.classList.add("hidden");
        replyInput.value = "";
        targetCommentId = null;
    });

    // 📌 이벤트 리스너 추가
    likeButton.addEventListener("click", toggleLike);

    // 📌 수정 버튼 클릭 시 게시글 수정 페이지로 이동
    editButton.addEventListener("click", function () {
        window.location.href = `edit-post.html?id=${postId}`;
    });

    // 📌 게시글 데이터 불러오기
    fetchPostDetails();
});
