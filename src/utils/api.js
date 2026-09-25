/* =========================================================
   AUTH TOKEN
   ========================================================= */

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem("token");
}

/* =========================================================
   AUTH USER
   ========================================================= */

export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = sessionStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to parse stored user:", error);

    return null;
  }
}

/* =========================================================
   SET AUTH DATA
   ========================================================= */

export function setAuthData(token, user) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    sessionStorage.setItem("token", token);
  }

  if (user) {
    sessionStorage.setItem("user", JSON.stringify(user));
  }
}

/* =========================================================
   CLEAR AUTH DATA
   ========================================================= */

export function clearAuthData() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("token");

  sessionStorage.removeItem("user");
}

/* =========================================================
   API REQUEST
   ========================================================= */

export async function apiRequest(url, options = {}) {
  const token = getToken();

  const headers = new Headers(options.headers || {});

  /* -------------------------------------------------------
     CONTENT TYPE
     ------------------------------------------------------- */

  if (
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  /* -------------------------------------------------------
     AUTHORIZATION
     ------------------------------------------------------- */

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Network error:", error);

    const networkError = new Error("Unable to connect to the server.");

    networkError.status = 0;
    networkError.data = null;

    throw networkError;
  }

  /* -------------------------------------------------------
     READ RESPONSE
     ------------------------------------------------------- */

  const contentType = response.headers.get("content-type") || "";

  let data = null;
  let rawText = "";

  try {
    rawText = await response.text();
  } catch (error) {
    console.error("Could not read server response:", error);
  }

  /* -------------------------------------------------------
     PARSE JSON
     ------------------------------------------------------- */

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      data = {
        message: rawText,
      };
    }
  }

  /* -------------------------------------------------------
     UNAUTHORIZED
     ------------------------------------------------------- */

  if (response.status === 401) {
    clearAuthData();
  }

  /* -------------------------------------------------------
     API ERROR
     ------------------------------------------------------- */

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      rawText ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);

    error.status = response.status;

    error.data = data || {
      raw: rawText,
    };

    if (process.env.NODE_ENV === "development") {
      console.error(`API ${response.status} error:`, {
        url,
        method: options.method || "GET",

        status: response.status,

        contentType,

        data,

        rawText,
      });
    }

    throw error;
  }

  /* -------------------------------------------------------
     SUCCESS
     ------------------------------------------------------- */

  return data;
}

/* =========================================================
   GET
   ========================================================= */

export async function apiGet(url, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "GET",
  });
}

/* =========================================================
   POST
   ========================================================= */

export async function apiPost(url, body, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/* =========================================================
   PUT
   ========================================================= */

export async function apiPut(url, body, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/* =========================================================
   PATCH
   ========================================================= */

export async function apiPatch(url, body, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/* =========================================================
   DELETE
   ========================================================= */

export async function apiDelete(url, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "DELETE",
  });
}

/* =========================================================
   LOGOUT
   ========================================================= */

export function logout() {
  clearAuthData();

  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}
