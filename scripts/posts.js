document.addEventListener("DOMContentLoaded", function () {
    const postList = document.getElementById("post-list");
    const createPostButton = document.querySelector(".write-post-btn");

    let storedPosts = [];
    let isFetching = false;
    let cursor = null;

    createPostButton.addEventListener("click", function () {
        window.location.href = "make-post.html";
    });

    function formatNumber(num) {
        if (num >= 100000) return (num / 1000).toFixed(0) + "k";
        if (num >= 10000) return (num / 1000).toFixed(0) + "k";
        if (num >= 1000) return (num / 1000).toFixed(1) + "k";
        return num;
    }

    function renderPosts(posts, clear = false) {
        if (clear) postList.innerHTML = "";
        posts.forEach(post => {
            const postCard = document.createElement("article");
            postCard.classList.add("post-card");
            postCard.setAttribute("data-id", post.id);

            // sessionStorage에서 최신 좋아요 개수 가져오기
            const storedLikeCount = sessionStorage.getItem(`likeCount-${post.id}`);
            const likeCount = storedLikeCount !== null ? parseInt(storedLikeCount, 10) : post.likeCount;

            postCard.innerHTML = `
            <h2 class="post-title">${post.title.length > 26 ? post.title.substring(0, 26) + "..." : post.title}</h2>
            <div class="post-meta">
                <span class="likes">👍 ${formatNumber(likeCount)}</span>
                <span class="comments">💬 ${formatNumber(post.commentCount)}</span>
                <span class="views">👀 ${formatNumber(post.viewCount)}</span>
                <span class="date">${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="author">작성자: ${post.memberNickname || "익명"}</p>
        `;

            postList.appendChild(postCard);
        });
    }

    const BACKEND_URL = "http://localhost:8080";

    async function fetchPosts() {
        if (isFetching) return;
        isFetching = true;

        let url = `${BACKEND_URL}/api/posts?size=10`;
        if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

        const accessToken = localStorage.getItem("accessToken");

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (!response.ok) throw new Error("게시글을 불러오는 중 오류가 발생했습니다.");

            const data = await response.json();
            if (data.status === 200 && Array.isArray(data.data)) {
                const newPosts = data.data;
                storedPosts = [...storedPosts, ...newPosts];

                renderPosts(newPosts, cursor === null);
                if (newPosts.length > 0) cursor = newPosts[newPosts.length - 1].createdAt;
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            isFetching = false;
        }
    }

    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) fetchPosts();
    }

    window.addEventListener("scroll", handleScroll);

    postList.addEventListener("click", function (event) {
        const postCard = event.target.closest(".post-card");
        if (postCard) {
            const postId = parseInt(postCard.getAttribute("data-id"));
            window.location.href = `post.html?id=${postId}`;
        }
    });

    fetchPosts();
});
