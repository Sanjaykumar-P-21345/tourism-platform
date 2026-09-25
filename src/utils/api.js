/* =========================================================
   AUTH TOKEN
========================================================= */

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem("token");
  } catch (error) {
    console.error("Failed to get auth token:", error);

    return null;
  }
}

/* =========================================================
   AUTH USER
========================================================= */

export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const user = sessionStorage.getItem("user");

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to parse stored user:", error);

    return null;
  }
}

/* =========================================================
   SET AUTH DATA
========================================================= */

export function setAuthData(token, user = null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (token) {
      sessionStorage.setItem("token", token);
    }

    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to save authentication data:", error);
  }
}

/* =========================================================
   CLEAR AUTH DATA
========================================================= */

export function clearAuthData() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } catch (error) {
    console.error("Failed to clear authentication data:", error);
  }
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
     ACCEPT JSON
  ------------------------------------------------------- */

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  /* -------------------------------------------------------
     AUTHORIZATION
  ------------------------------------------------------- */

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  /* -------------------------------------------------------
     FETCH
  ------------------------------------------------------- */

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
    networkError.url = url;

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
     PARSE RESPONSE
  ------------------------------------------------------- */

  if (rawText) {
    try {
      if (contentType.includes("application/json")) {
        data = JSON.parse(rawText);
      } else {
        /*
         * Some APIs may return JSON without the correct
         * content-type. Try parsing it anyway.
         */
        try {
          data = JSON.parse(rawText);
        } catch {
          data = {
            message: rawText,
          };
        }
      }
    } catch (error) {
      data = {
        message: rawText,
      };
    }
  }

  /* -------------------------------------------------------
     UNAUTHORIZED
     
     IMPORTANT:
     
     Do NOT clear authentication data when the 401 comes
     from the login endpoint.
     
     Login itself can legitimately return 401 when the
     email/password is incorrect.
  ------------------------------------------------------- */

  if (response.status === 401 && !url.includes("/api/admin/login")) {
    clearAuthData();
  }

  /* -------------------------------------------------------
     API ERROR
  ------------------------------------------------------- */

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      data?.error ||
      rawText ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);

    /* -----------------------------------------------------
       ATTACH API INFORMATION
    ----------------------------------------------------- */

    error.status = response.status;

    error.data = data || {
      raw: rawText,
    };

    error.url = url;

    error.method = options.method || "GET";

    error.response = response;

    /* -----------------------------------------------------
       DEVELOPMENT LOGGING
       
       401 and 403 are handled by the UI and are not
       unexpected server errors.
    ----------------------------------------------------- */

    if (
      process.env.NODE_ENV === "development" &&
      response.status !== 401 &&
      response.status !== 403
    ) {
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

    body:
      body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });
}

/* =========================================================
   PUT
========================================================= */

export async function apiPut(url, body, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "PUT",

    body:
      body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });
}

/* =========================================================
   PATCH
========================================================= */

export async function apiPatch(url, body, options = {}) {
  return apiRequest(url, {
    ...options,
    method: "PATCH",

    body:
      body !== undefined && body !== null ? JSON.stringify(body) : undefined,
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
