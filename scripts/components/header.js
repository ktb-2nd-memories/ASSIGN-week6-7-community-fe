document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");

    // 현재 페이지 파일명 가져오기
    const currentPage = window.location.pathname.split("/").pop();

    // 왼쪽 섹션 (뒤로가기 버튼)
    const leftSection = document.createElement("div");
    leftSection.classList.add("left-section");

    // 제목
    const title = document.createElement("h1");
    title.classList.add("title");
    title.textContent = "아무 말 대잔치";

    // 오른쪽 섹션 (프로필 아이콘)
    const rightSection = document.createElement("div");
    rightSection.classList.add("right-section");

    // 뒤로가기 버튼 생성
    const backButton = document.createElement("a");
    backButton.classList.add("back-btn");
    backButton.textContent = "<";

    // 뒤로가기 버튼 URL 설정
    if (currentPage === "signin.html") {
        backButton.href = "login.html"; // 로그인 페이지로 이동
    } else if (["post.html", "make-post.html"].includes(currentPage)) {
        backButton.href = "posts.html"; // 게시글 목록으로 이동
    } else if (currentPage === "edit-post.html") {
        // backButton.href = postId ? `post.html?postId=${postId}` : "posts.html"; // 해당 게시글 상세 페이지로 이동
        backButton.href = "posts.html";
    }

    // 프로필 아이콘 생성
    const profileMenu = document.createElement("div");
    profileMenu.classList.add("profile-menu");
    profileMenu.innerHTML = `
        <img src="../assets/images/profile-icon.png" alt="프로필" class="profile-icon" id="profile-icon">
        <div class="dropdown-menu" id="dropdown-menu">
            <a href="edit-profile.html">회원정보 수정</a>
            <a href="edit-password.html">비밀번호 수정</a>
            <a href="logout.html">로그아웃</a>
        </div>
    `;

    // 필요 요소를 동적으로 추가
    if (currentPage === "login.html") {
        leftSection.classList.add("hidden"); // 자리 차지는 하지만 보이지 않게 처리
        rightSection.classList.add("hidden");
    } else if (currentPage === "signin.html") {
        leftSection.appendChild(backButton);
        rightSection.classList.add("hidden");
    } else if (currentPage === "posts.html") {
        leftSection.classList.add("hidden");
        rightSection.appendChild(profileMenu);
    } else if (["post.html", "make-post.html", "edit-post.html"].includes(currentPage)) {
        leftSection.appendChild(backButton);
        rightSection.appendChild(profileMenu);
    } else if (["edit-profile.html", "edit-password.html"].includes(currentPage)) {
        leftSection.classList.add("hidden");
        rightSection.appendChild(profileMenu);
    }

    // 헤더에 요소 추가
    headerContainer.appendChild(leftSection);
    headerContainer.appendChild(title);
    headerContainer.appendChild(rightSection);
});
