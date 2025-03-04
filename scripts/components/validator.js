export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
export const nicknamePattern = /^[a-zA-Z0-9가-힣]{1,10}$/;

export function validateEmail(email, helperText, usedEmails = []) {
    if (!email) {
        helperText.textContent = "*이메일을 입력해주세요.";
    } else if (!emailPattern.test(email)) {
        helperText.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
    } else if (usedEmails.includes(email)) {
        helperText.textContent = "*중복된 이메일입니다.";
    } else {
        helperText.style.display = "none";
        return true;
    }
    helperText.style.display = "block";
    return false;
}

export function validatePassword(password, helperText) {
    if (!password) {
        helperText.textContent = "*비밀번호를 입력해주세요.";
    } else if (!passwordPattern.test(password)) {
        helperText.textContent = "*비밀번호는 8~20자이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
    } else {
        helperText.style.display = "none";
        return true;
    }
    helperText.style.display = "block";
    return false;
}

export function validateConfirmPassword(password, confirmPassword, helperText) {
    if (!confirmPassword) {
        helperText.textContent = "*비밀번호를 한 번 더 입력해주세요.";
    } else if (confirmPassword !== password) {
        helperText.textContent = "*비밀번호가 다릅니다.";
    } else {
        helperText.style.display = "none";
        return true;
    }
    helperText.style.display = "block";
    return false;
}

export function validateNickname(nickname, helperText, usedNicknames = []) {
    if (!nickname) {
        helperText.textContent = "*닉네임을 입력해주세요.";
    } else if (/\s/.test(nickname)) {
        helperText.textContent = "*띄어쓰기를 없애주세요.";
    } else if (!nicknamePattern.test(nickname)) {
        helperText.textContent = "*닉네임은 1~10자의 한글, 영문, 숫자로 구성됩니다.";
    } else if (usedNicknames.includes(nickname)) {
        helperText.textContent = "*중복된 닉네임입니다.";
    } else {
        helperText.style.display = "none";
        return true;
    }
    helperText.style.display = "block";
    return false;
}