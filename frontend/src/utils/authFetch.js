export async function authFetch(url, options = {}) {
  const finalOptions = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };
  const response = await fetch(url, finalOptions);
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  return response;
}