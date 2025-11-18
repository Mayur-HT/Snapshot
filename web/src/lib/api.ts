const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    // Dispatch custom event to notify Header component
    window.dispatchEvent(new Event("auth-change"));
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    // Dispatch custom event to notify Header component
    window.dispatchEvent(new Event("auth-change"));
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function login(
  email: string,
  password: string,
  inviteToken?: string
) {
  const body: { email: string; password: string; inviteToken?: string } = {
    email,
    password,
  };
  if (inviteToken) {
    body.inviteToken = inviteToken;
  }
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function register(form: FormData) {
  // FormData already contains inviteToken if provided
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function me() {
  const token = getToken();
  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadPhotos(files: File[]) {
  const token = getToken();
  const fd = new FormData();
  files.forEach((f) => fd.append("photos", f));
  const res = await fetch(`${API}/photos/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function myPhotos() {
  const token = getToken();
  const res = await fetch(`${API}/photos/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sharedPhotos() {
  const token = getToken();
  const res = await fetch(`${API}/photos/shared`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createGroup(name: string) {
  const token = getToken();
  const res = await fetch(`${API}/groups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getGroups() {
  const token = getToken();
  const res = await fetch(`${API}/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getGroup(id: string) {
  const token = getToken();
  const res = await fetch(`${API}/groups/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addGroupMember(groupId: string, email: string) {
  const token = getToken();
  const res = await fetch(`${API}/groups/${groupId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeGroupMember(groupId: string, userId: string) {
  const token = getToken();
  const res = await fetch(`${API}/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createGroupInvite(groupId: string, email?: string) {
  const token = getToken();
  const res = await fetch(`${API}/groups/${groupId}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function acceptGroupInvite(token: string) {
  const authToken = getToken();
  const res = await fetch(`${API}/groups/accept/${token}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteGroup(groupId: string) {
  const token = getToken();
  const res = await fetch(`${API}/groups/${groupId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
