export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    if (!refreshToken || !accessToken) return null;

    try {
        const response = await fetch("http://localhost:8080/auth/reissue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken, accessToken }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const newAccessToken = data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error("AccessToken 갱신 실패:", error);
        return null;
    }
}

export async function fetchWithAuthRetry(url, options = {}, retry = true) {
    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "login.html";
        return;
    }

    options.headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${accessToken}`,
    };

    try {
        let response = await fetch(url, options);
        if (response.status === 401 && retry) {
            const newAccessToken = await refreshAccessToken();
            if (!newAccessToken) {
                alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                window.location.href = "login.html";
                return;
            }

            options.headers["Authorization"] = `Bearer ${newAccessToken}`;
            response = await fetch(url, options);
        }

        return response;
    } catch (error) {
        console.error("fetchWithAuthRetry 오류:", error);
        alert("요청 중 문제가 발생했습니다.");
        return null;
    }
}
