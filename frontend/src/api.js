const API_BASE = "/api";

export async function getCsrfToken() {
  const response = await fetch(`${API_BASE}/csrf-token/`, {
    credentials: "include",
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { csrfToken: "" };
    }
  }

  return data;
}

export async function checkAuth() {
    const response = await fetch(`${API_BASE}/check-auth/`, {
        credentials: "include",
    });
    
    const data = await response.json();
    return data;
}

export async function signup(username, password, password2, email) {
    const csrfData = await getCsrfToken();

    const response = await fetch(`${API_BASE}/signup/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfData.csrfToken || "",
        },
        body: JSON.stringify({ username, password, password2, email }),
    });

    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: text };
        }
    }

    if (!response.ok) {
        throw new Error(data.error || data.detail || "Signup failed");
    }

    return data;
}
    


export async function login(username, password) {
  const csrfData = await getCsrfToken();

  const response = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfData.csrfToken || "",
    },
    body: JSON.stringify({ username, password }),
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.detail || "Login failed");
  }

  return data;
}


export async function logout() {
  const csrfData = await getCsrfToken();

  const response = await fetch(`${API_BASE}/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfData.csrfToken || "",
    },
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.detail || "Logout failed");
  }

  return data;
}



export async function getDecks() {
  const response = await fetch(`${API_BASE}/decks/`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to fetch decks");
  return response.json();
}

export async function getDeck(id) {
  const response = await fetch(`${API_BASE}/decks/${id}/`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to fetch deck");
  return response.json();
}

export async function createDeck(title, description) {
  const csrfData = await getCsrfToken();

  const response = await fetch(`${API_BASE}/decks/create/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfData.csrfToken || "",
    },
    body: JSON.stringify({ title, description }),
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || "Failed to create deck");
  }

  return data;
}


export async function createCard(deckId, frontText, backText) {
    const csrfData = await getCsrfToken();

    const response = await fetch(`${API_BASE}/decks/${deckId}/cards/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfData.csrfToken || "",
        },
        body: JSON.stringify({ front_text: frontText, back_text: backText }),
    });

    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: text };
        }
    }

    if (!response.ok) {
        throw new Error(data.error || "Failed to create card");
    }

    return data;
}


export async function updateCard(cardId, frontText, backText) {
    const csrfData = await getCsrfToken();
    
    const response = await fetch(`${API_BASE}/cards/${cardId}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfData.csrfToken || "",
        },
        body: JSON.stringify({ front_text: frontText, back_text: backText }),
    });

    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: text };
        }
    }
    
    if (!response.ok) {
        throw new Error(data.error || "Failed to update card");
    }

    return data;
}


export async function deleteCard(cardId) {
    const csrfData = await getCsrfToken();
    
    const response = await fetch(`${API_BASE}/cards/${cardId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfData.csrfToken || "",
        },
    });
    
    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: text };
        }
    }
    
    if (!response.ok) {
        throw new Error(data.error || "Failed to delete card");
    }
    
    return data;
}