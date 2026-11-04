import { passwordError, confirmPasswordError } from "../../utils/formValidation.js";

export const validatePassw = (password) => passwordError(password) || null;
export const validateRepeat = (passwordRepeat, password) => confirmPasswordError(passwordRepeat, password) || null;
