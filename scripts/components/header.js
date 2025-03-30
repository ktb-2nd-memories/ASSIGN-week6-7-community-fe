document.addEventListener("DOMContentLoaded", async function () {
    async function fetchMemberInfoIfNeeded() {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || localStorage.getItem("memberProfileImageUrl")) return;

        const res = await fetch("http://localhost:8080/api/member/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (res.ok) {
            const { data } = await res.json();
            localStorage.setItem("memberNickname", data.nickname);
            localStorage.setItem("memberProfileImageUrl", data.profileImageUrl);
        }
    }

    await fetchMemberInfoIfNeeded();

    const headerContainer = document.getElementById("header-container");
    const currentPage = window.location.pathname.split("/").pop();

    const pageSettings = {
        "signup.html": { showBackBtn: true, backLink: "login.html", showProfile: false },
        "post.html": { showBackBtn: true, backLink: "posts.html", showProfile: true },
        "make-post.html": { showBackBtn: true, backLink: "posts.html", showProfile: true },
        "edit-post.html": { showBackBtn: true, backLink: "posts.html", showProfile: true },
        "login.html": { showBackBtn: false, showProfile: false, hidden: true },
        "posts.html": { showBackBtn: false, showProfile: true },
        "edit-profile.html": { showBackBtn: false, showProfile: true },
        "edit-password.html": { showBackBtn: false, showProfile: true }
    };

    const settings = pageSettings[currentPage] || { showBackBtn: false, showProfile: false };

    const leftSection = document.createElement("div");
    leftSection.classList.add("left-section");

    const title = document.createElement("h1");
    title.classList.add("title");
    title.textContent = "아무 말 대잔치";

    const rightSection = document.createElement("div");
    rightSection.classList.add("right-section");

    if (settings.showBackBtn) {
        const backButton = document.createElement("a");
        backButton.classList.add("back-btn");
        backButton.textContent = "<";
        backButton.href = settings.backLink;
        leftSection.appendChild(backButton);
    }

    if (settings.showProfile) {
        const BACKEND_URL = "http://localhost:8080";
        const storedProfileUrl = localStorage.getItem("memberProfileImageUrl");
        const profileImageSrc = storedProfileUrl
            ? `${BACKEND_URL}${storedProfileUrl}`
            : "../assets/images/profile-icon.png";

        const profileMenu = document.createElement("div");
        profileMenu.classList.add("profile-menu");
        profileMenu.innerHTML = `
            <img src="${profileImageSrc}" alt="프로필" class="profile-icon" id="profile-icon"
                 onerror="this.src='../assets/images/profile-icon.png'">
            <div class="dropdown-menu" id="dropdown-menu" style="display: none;">
                <a href="edit-profile.html">회원정보 수정</a>
                <a href="edit-password.html">비밀번호 수정</a>
                <a href="#" id="logout-btn">로그아웃</a>
            </div>
        `;
        rightSection.appendChild(profileMenu);

        // 드롭다운 토글
        document.addEventListener("click", function (event) {
            const profileIcon = document.getElementById("profile-icon");
            const dropdownMenu = document.getElementById("dropdown-menu");

            if (profileIcon && dropdownMenu) {
                if (profileIcon.contains(event.target)) {
                    dropdownMenu.style.display = dropdownMenu.style.display === "none" ? "block" : "none";
                } else if (!dropdownMenu.contains(event.target)) {
                    dropdownMenu.style.display = "none";
                }
            }
        });
    }

    if (settings.hidden) {
        leftSection.classList.add("hidden");
        rightSection.classList.add("hidden");
    }

    headerContainer.appendChild(leftSection);
    headerContainer.appendChild(title);
    headerContainer.appendChild(rightSection);
});
