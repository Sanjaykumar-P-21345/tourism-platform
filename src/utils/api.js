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
     JSON CONTENT TYPE
     ------------------------------------------------------- */

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  /* -------------------------------------------------------
     AUTHORIZATION
     ------------------------------------------------------- */

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    /* -----------------------------------------------------
       PARSE RESPONSE
       ----------------------------------------------------- */

    let data = null;

    const contentType =
      response.headers.get("content-type");

    if (
      contentType &&
      contentType.includes("application/json")
    ) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = text
        ? { message: text }
        : null;
    }

    /* -----------------------------------------------------
       UNAUTHORIZED
       ----------------------------------------------------- */

    if (response.status === 401) {
      clearAuthData();
    }

    /* -----------------------------------------------------
       API ERROR
       ----------------------------------------------------- */

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          `Request failed with status ${response.status}`,
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    /* -----------------------------------------------------
       SUCCESS
       ----------------------------------------------------- */

    return data;
  } catch (error) {
    /*
      Authentication errors are handled by the UI.
    */

    if (
      error?.status !== 401 &&
      error?.status !== 403
    ) {
      console.error(
        "API request failed:",
        error,
      );
    }

    throw error;
  }
}

/* =========================================================
   GET REQUEST
   ========================================================= */

export async function apiGet(
  url,
  options = {},
) {
  return apiRequest(url, {
    ...options,
    method: "GET",
  });
}

/* =========================================================
   POST REQUEST
   ========================================================= */

export async function apiPost(
  url,
  body,
  options = {},
) {
  return apiRequest(url, {
    ...options,
    method: "POST",
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });
}

/* =========================================================
   PUT REQUEST
   ========================================================= */

export async function apiPut(
  url,
  body,
  options = {},
) {
  return apiRequest(url, {
    ...options,
    method: "PUT",
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });
}

/* =========================================================
   PATCH REQUEST
   ========================================================= */

export async function apiPatch(
  url,
  body,
  options = {},
) {
  return apiRequest(url, {
    ...options,
    method: "PATCH",
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });
}

/* =========================================================
   DELETE REQUEST
   ========================================================= */

export async function apiDelete(
  url,
  options = {},
) {
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