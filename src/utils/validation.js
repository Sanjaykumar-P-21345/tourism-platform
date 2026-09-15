/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

export function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email.trim());
}

/* =========================================================
   PASSWORD VALIDATION
   ========================================================= */

export function isValidPassword(password) {
  if (typeof password !== "string") {
    return false;
  }

  return password.length >= 8;
}

/* =========================================================
   PHONE VALIDATION
   ========================================================= */

export function isValidPhone(phone) {
  if (typeof phone !== "string") {
    return false;
  }

  const cleanedPhone = phone.replace(/[\s\-()]/g, "");

  const phoneRegex = /^\+?[0-9]{10,15}$/;

  return phoneRegex.test(cleanedPhone);
}

/* =========================================================
   NAME VALIDATION
   ========================================================= */

export function isValidName(name) {
  if (typeof name !== "string") {
    return false;
  }

  const trimmedName = name.trim();

  return trimmedName.length >= 2 && trimmedName.length <= 100;
}

/* =========================================================
   REQUIRED STRING VALIDATION
   ========================================================= */

export function isRequiredString(value, minLength = 1, maxLength = 2000) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length >= minLength && trimmedValue.length <= maxLength;
}

/* =========================================================
   ADMIN LOGIN VALIDATION
   ========================================================= */

export function validateAdminLogin(data) {
  const errors = {};

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: {
        general: "Invalid request data.",
      },
    };
  }

  const email = typeof data.email === "string" ? data.email.trim() : "";

  const password = typeof data.password === "string" ? data.password : "";

  if (!email) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (!isValidPassword(password)) {
    errors.password = "Password must be at least 8 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/* =========================================================
   INQUIRY VALIDATION
   ========================================================= */

export function validateInquiry(data) {
  const errors = {};

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: {
        general: "Invalid request data.",
      },
    };
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";

  const email = typeof data.email === "string" ? data.email.trim() : "";

  const phone = typeof data.phone === "string" ? data.phone.trim() : "";

  const subject = typeof data.subject === "string" ? data.subject.trim() : "";

  const message = typeof data.message === "string" ? data.message.trim() : "";

  /* -------------------------
     NAME
     ------------------------- */

  if (!name) {
    errors.name = "Name is required.";
  } else if (!isValidName(name)) {
    errors.name = "Name must be between 2 and 100 characters.";
  }

  /* -------------------------
     EMAIL
     ------------------------- */

  if (!email) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  /* -------------------------
     PHONE
     ------------------------- */

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  /* -------------------------
     SUBJECT
     ------------------------- */

  if (subject.length > 150) {
    errors.subject = "Subject cannot exceed 150 characters.";
  }

  /* -------------------------
     MESSAGE
     ------------------------- */

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < 5) {
    errors.message = "Message must be at least 5 characters.";
  } else if (message.length > 2000) {
    errors.message = "Message cannot exceed 2000 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/* =========================================================
   OBJECT ID VALIDATION
   ========================================================= */

export function isValidObjectId(id) {
  if (typeof id !== "string") {
    return false;
  }

  return /^[0-9a-fA-F]{24}$/.test(id);
}
