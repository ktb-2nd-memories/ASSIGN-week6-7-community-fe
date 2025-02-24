document.addEventListener("DOMContentLoaded", function () {
    const postList = document.getElementById("post-list");
    const createPostButton = document.querySelector(".write-post-btn");

    // localStorage.clear();

    // 게시글 작성 페이지 이동
    createPostButton.addEventListener("click", function () {
        window.location.href = "make-post.html";
    });

    // localStorage에서 기존 게시글 가져오기 (없으면 빈 배열)
    let storedPosts = JSON.parse(localStorage.getItem("posts")) || [];

    // 숫자 포맷 변환 (예: 1000 → 1k, 10000 → 10k)
    function formatNumber(num) {
        if (num >= 100000) return (num / 1000).toFixed(0) + "k";
        if (num >= 10000) return (num / 1000).toFixed(0) + "k";
        if (num >= 1000) return (num / 1000).toFixed(1) + "k";
        return num;
    }

    // 게시글 렌더링 함수
    function renderPosts(posts, clear = false) {
        if (clear) {
            postList.innerHTML = ""; // 기존 목록 초기화
        }
        posts.forEach(post => {
            const postCard = document.createElement("article");
            postCard.classList.add("post-card");
            postCard.setAttribute("data-id", post.id);

            postCard.innerHTML = `
                <h2 class="post-title">${post.title.length > 26 ? post.title.substring(0, 26) + "..." : post.title}</h2>
                <div class="post-meta">
                    <span class="likes">👍 ${formatNumber(post.likes)}</span>
                    <span class="comments">💬 ${formatNumber(post.comments)}</span>
                    <span class="views">👀 ${formatNumber(post.views)}</span>
                    <span class="date">${post.date}</span>
                </div>
                <p class="author">작성자: ${post.author}</p>
            `;

            postList.appendChild(postCard);
        });
    }

    // 초기 게시글 렌더링 (localStorage 데이터 사용)
    renderPosts(storedPosts, true);

    // 게시글 클릭 시 post.html로 이동
    postList.addEventListener("click", function (event) {
        const postCard = event.target.closest(".post-card");
        if (postCard) {
            const postId = parseInt(postCard.getAttribute("data-id"));
            localStorage.setItem("selectedPost", JSON.stringify(storedPosts.find(post => post.id === postId)));
            window.location.href = `post.html?id=${postId}`;
        }
    });

    // 무한 스크롤 감지
    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
            loadMorePosts();
        }
    }

    window.addEventListener("scroll", handleScroll);

    // 더미 게시글 추가 (무한 스크롤)
    function loadMorePosts() {
        setTimeout(() => {
            let lastPostId = storedPosts.length > 0 ? storedPosts[storedPosts.length - 1].id : 0;
            let newPosts = [];

            for (let i = 0; i < 5; i++) {
                newPosts.push({
                    id: lastPostId + i + 1,
                    title: "새로운 게시글 " + (lastPostId + i + 1),
                    likes: Math.floor(Math.random() * 15000),
                    comments: Math.floor(Math.random() * 20),
                    views: Math.floor(Math.random() * 5000),
                    date: new Date().toISOString().split("T")[0] + " " + new Date().toLocaleTimeString(),
                    author: "작성자 " + (lastPostId + i + 1)
                });
            }

            storedPosts = [...storedPosts, ...newPosts]; // 기존 데이터 유지
            localStorage.setItem("posts", JSON.stringify(storedPosts)); // 전체 데이터 저장
            renderPosts(newPosts, false); // 새 게시글 추가 렌더링
        }, 300);
    }
});
