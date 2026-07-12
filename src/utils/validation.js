/**
 * Reusable Validation Utility
 */

export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  // Example: At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  if (!password) return false;
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers;
};

export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validates an entire form object against a schema
 * @param {Object} formData - The data to validate
 * @param {Object} schema - The validation rules { fieldName: [rule1, rule2] }
 * @returns {Object} - An object containing errors, empty if valid
 */
export const validateForm = (formData, schema) => {
  const errors = {};

  for (const field in schema) {
    const rules = schema[field];
    for (const rule of rules) {
      const errorMsg = rule(formData[field], formData);
      if (errorMsg) {
        errors[field] = errorMsg;
        break; // Stop at the first error for this field
      }
    }
  }

  return errors;
};

// --- Validation Rule Generators for schema ---

export const ruleRequired = (message = 'Trường này là bắt buộc') => {
  return (value) => (!isRequired(value) ? message : null);
};

export const ruleEmail = (message = 'Địa chỉ email không hợp lệ') => {
  return (value) => (value && !isValidEmail(value) ? message : null);
};

export const ruleMinLength = (length, message) => {
  return (value) => (value && value.length < length ? message : null);
};

export const rulePassword = (message = 'Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số') => {
  return (value) => (value && !isValidPassword(value) ? message : null);
};

export const ruleMatch = (matchField, message = 'Mật khẩu không khớp') => {
  return (value, formData) => (value !== formData[matchField] ? message : null);
};
