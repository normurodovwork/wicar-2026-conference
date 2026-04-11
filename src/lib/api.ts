const API_URL = typeof window !== 'undefined' ? window.location.origin : '';
console.log('API_URL initialized as:', API_URL);

export const api = {
  async get(endpoint: string, token?: string) {
    const url = `${API_URL}${endpoint}`;
    console.log(`Fetching: ${url}`, { hasToken: !!token });
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`API Error (${res.status}) for ${endpoint}: ${text}`);
        throw new Error(text);
      }
      return res.json();
    } catch (err) {
      console.error(`Fetch failed for ${endpoint}:`, err);
      throw err;
    }
  },

  async post(endpoint: string, data: any, token?: string) {
    console.log(`Posting to: ${API_URL}${endpoint}`);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`API Error (${res.status}): ${text}`);
        throw new Error(text);
      }
      return res.json();
    } catch (err) {
      console.error(`Post failed for ${endpoint}:`, err);
      throw err;
    }
  },

  async put(endpoint: string, data: any, token?: string) {
    console.log(`Putting to: ${API_URL}${endpoint}`);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`API Error (${res.status}): ${text}`);
        throw new Error(text);
      }
      return res.json();
    } catch (err) {
      console.error(`Put failed for ${endpoint}:`, err);
      throw err;
    }
  },

  async upload(endpoint: string, formData: FormData, token?: string) {
    const url = `${API_URL}${endpoint}`;
    console.log(`Uploading to: ${url}`, { hasToken: !!token });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Upload Error (${res.status}) for ${endpoint}: ${text}`);
        throw new Error(text);
      }
      return res.json();
    } catch (err) {
      console.error(`Upload failed for ${endpoint}:`, err);
      throw err;
    }
  },

  async delete(endpoint: string, token?: string) {
    const url = `${API_URL}${endpoint}`;
    console.log(`Deleting: ${url}`, { hasToken: !!token });
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`API Error (${res.status}) for ${endpoint}: ${text}`);
        throw new Error(text);
      }
      return res.json();
    } catch (err) {
      console.error(`Delete failed for ${endpoint}:`, err);
      throw err;
    }
  },
};
