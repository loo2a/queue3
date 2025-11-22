/**
 * Firebase Configuration for Clinic Queue System
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZVlnPtq8ZD-dCV4Fn6EOnm0WpXr49Vdk",
  authDomain: "queue6-1b599.firebaseapp.com",
  databaseURL: "https://queue6-1b599-default-rtdb.firebaseio.com",
  projectId: "queue6-1b599",
  storageBucket: "queue6-1b599.firebasestorage.app",
  messagingSenderId: "233840176698",
  appId: "1:233840176698:web:11bf68a36a6f1ce3534f03",
  measurementId: "G-KGH923MY7X"
};

// Database paths
const DB_PATHS = {
  CLINICS: 'clinics',
  CALLS: 'calls',
  SETTINGS: 'settings',
  DISPLAY: 'display',
  INSTANT_AUDIO: 'instant_audio',
  CUSTOM_NAME: 'custom_name'
};

// Firebase REST API Class
class FirebaseStorage {
  constructor(databaseURL) {
    this.baseURL = databaseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  // Get data
  async get(path, shared = false) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`);
      const data = await response.json();
      if (data === null) return null;
      return { value: data };
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  }

  // Set data
  async set(path, data, shared = false) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error setting data:', error);
      throw error;
    }
  }

  // Delete data
  async delete(path, shared = false) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  // Update data (PATCH)
  async update(path, data) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  // Listen to changes (real-time)
  listen(path, callback, interval = 1000) {
    let lastData = null;
    
    const checkChanges = async () => {
      try {
        const result = await this.get(path);
        const currentData = result ? result.value : null;
        
        if (JSON.stringify(currentData) !== JSON.stringify(lastData)) {
          lastData = currentData;
          callback(currentData);
        }
      } catch (error) {
        console.error('Error listening:', error);
      }
    };

    // Initial check
    checkChanges();

    // Set up polling
    const intervalId = setInterval(checkChanges, interval);

    // Return function to stop listening
    return () => clearInterval(intervalId);
  }
}

// Create global storage instance
const storage = new FirebaseStorage(firebaseConfig.databaseURL);

// Make it available globally as window.storage
window.storage = storage;

// Helper functions
const FirebaseHelper = {
  // Get all clinics
  async getClinics() {
    try {
      const result = await storage.get(DB_PATHS.CLINICS);
      return result ? result.value : null;
    } catch (error) {
      return null;
    }
  },

  // Save clinics
  async saveClinics(clinics) {
    return await storage.set(DB_PATHS.CLINICS, clinics);
  },

  // Get settings
  async getSettings() {
    try {
      const result = await storage.get(DB_PATHS.SETTINGS);
      return result ? result.value : null;
    } catch (error) {
      return null;
    }
  },

  // Save settings
  async saveSettings(settings) {
    return await storage.set(DB_PATHS.SETTINGS, settings);
  },

  // Send call
  async sendCall(callData) {
    const timestamp = Date.now();
    return await storage.set(`${DB_PATHS.CALLS}/${timestamp}`, {
      ...callData,
      timestamp
    });
  },

  // Get latest call
  async getLatestCall() {
    const result = await storage.get(DB_PATHS.CALLS);
    const calls = result ? result.value : null;
    if (!calls) return null;
    
    const timestamps = Object.keys(calls).sort().reverse();
    return timestamps.length > 0 ? calls[timestamps[0]] : null;
  },

  // Listen to calls
  listenToCalls(callback, interval = 500) {
    return storage.listen(DB_PATHS.CALLS, (data) => {
      if (data) {
        const timestamps = Object.keys(data).sort().reverse();
        if (timestamps.length > 0) {
          callback(data[timestamps[0]]);
        }
      }
    }, interval);
  },

  // Set display name
  async setDisplayName(name) {
    return await storage.set(DB_PATHS.CUSTOM_NAME, {
      name,
      timestamp: Date.now()
    });
  },

  // Get display name
  async getDisplayName() {
    const result = await storage.get(DB_PATHS.CUSTOM_NAME);
    return result ? result.value : null;
  },

  // Set instant audio
  async setInstantAudio(filename) {
    return await storage.set(DB_PATHS.INSTANT_AUDIO, {
      filename,
      timestamp: Date.now()
    });
  },

  // Get instant audio
  async getInstantAudio() {
    const result = await storage.get(DB_PATHS.INSTANT_AUDIO);
    return result ? result.value : null;
  }
};

// Export
window.firebaseConfig = firebaseConfig;
window.DB_PATHS = DB_PATHS;
window.FirebaseStorage = FirebaseStorage;
window.FirebaseHelper = FirebaseHelper;

console.log('✅ Firebase Storage initialized');
console.log('🔗 Database URL:', firebaseConfig.databaseURL);
