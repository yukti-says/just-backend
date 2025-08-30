/**
 * Utility function to validate email addresses.
 * Returns true if the email is valid, false otherwise.
 */

function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    // Simple RFC 5322 compliant regex for email validation
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(email);
}
export default isValidEmail;