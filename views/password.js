function checkPasswordStrength(password){
    const strengthDiv = document.getElementById('passwordStrength');
    let strength = 0;

    if(password.length >= 8){
        strength++;
    }

    if(/[a-z]/.test(password) && /[A-Z]/.test(password)){
        strength++;
    }

    if(/\d/.test(password)){
        strength++;
    }

    if(/[^a-zA-z0-9]/.test(password)){
        strength++;
    }

    let message = "";
    let className = "";

    if(strength === 0){
        message = "Very weak";
        className = "weak";
    }

    else if(strength <= 2){
        message = "Weak";
        className = "weak";
    }

     else if(strength === 3){
        message = "Medium";
        className = "medium";
    }

    else if(strength === 4){
        message = "Strong";
        className= "strong";
    }

    strengthDiv.textContent = message;
    strengthDiv.className = className;
}