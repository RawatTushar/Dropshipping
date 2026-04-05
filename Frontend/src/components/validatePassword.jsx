
const validatePassword = (formData, setError, setLoading) => {  
 const password = formData.password || '';
    const specialCharRegex = /[!@#$%^&*(),.?"{}|<>]/;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return false;
    }

    if (password[0] !== password[0]?.toUpperCase()) {
      setError('Password must start with an uppercase letter.');
      setLoading(false);
      return false; 
    }

    if (!specialCharRegex.test(password)) {
      setError('Password must include at least one special character (e.g. @, #, $, %).');
      setLoading(false);
      return false;
    }

    return true;
};

export default validatePassword;