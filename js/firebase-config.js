/**
 * Firebase Configuration for Clinic Queue System
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing one
 * 3. Go to Project Settings > General
 * 4. Scroll down to "Your apps" and click Web icon (</>)
 * 5. Copy the configuration object and paste it below
 * 6. Enable Realtime Database in Firebase Console
 * 7. Set database rules to allow read/write (for development)
 */

// Firebase configuration object
// Replace these values with your own from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Recommended Database Rules for Development:
 * 
 * {
 *   "rules": {
 *     ".read": true,
 *     ".write": true
 *   }
 * }
 * 
 * For Production (more secure):
 * 
 * {
 *   "rules": {
 *     "clinics": {
 *       ".read": true,
 *       ".write": "auth != null"
 *     },
 *     "calls": {
 *       ".read": true,
 *       ".write": true
 *     },
 *     "settings": {
 *       ".read": true,
 *       ".write": "auth != null"
 *     },
 *     "display": {
 *       ".read": true,
 *       ".write": true
 *     }
 *   }
 * }
 */

// Database paths structure
const DB_PATHS = {
  CLINICS: 'clinics',
  CALLS: 'calls',
  SETTINGS: 'settings',
  DISPLAY: 'display',
  INSTANT_AUDIO: 'instant_audio',
  CUSTOM_NAME: 'custom_name'
};

// Initialize Firebase (if using Firebase SDK)
function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      firebase.initializeApp(firebaseConfig);
      const database = firebase.database();
      console.log('Firebase initialized successfully');
      return database;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return null;
    }
  } else {
    console.warn('Firebase SDK not loaded. Make sure to include Firebase scripts in your HTML.');
    return null;
  }
}

// Alternative: Use Firebase REST API (no SDK needed)
class FirebaseREST {
  constructor(databaseURL) {
    this.baseURL = databaseURL;
  }

  // Get data
  async get(path) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`);
      return await response.json();
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  // Set data
  async set(path, data) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error setting data:', error);
      return null;
    }
  }

  // Update data
  async update(path, data) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating data:', error);
      return null;
    }
  }

  // Delete data
  async delete(path) {
    try {
      const response = await fetch(`${this.baseURL}/${path}.json`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting data:', error);
      return null;
    }
  }

  // Listen to changes (polling method)
  listen(path, callback, interval = 1000) {
    let lastData = null;
    
    const checkChanges = async () => {
      const data = await this.get(path);
      
      if (JSON.stringify(data) !== JSON.stringify(lastData)) {
        lastData = data;
        callback(data);
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

// Create instance
const firebaseREST = new FirebaseREST(firebaseConfig.databaseURL);

// Helper functions for common operations
const FirebaseHelper = {
  // Get all clinics
  async getClinics() {
    return await firebaseREST.get(DB_PATHS.CLINICS);
  },

  // Save clinics
  async saveClinics(clinics) {
    return await firebaseREST.set(DB_PATHS.CLINICS, clinics);
  },

  // Get settings
  async getSettings() {
    return await firebaseREST.get(DB_PATHS.SETTINGS);
  },

  // Save settings
  async saveSettings(settings) {
    return await firebaseREST.set(DB_PATHS.SETTINGS, settings);
  },

  // Send call
  async sendCall(callData) {
    const timestamp = Date.now();
    return await firebaseREST.set(`${DB_PATHS.CALLS}/${timestamp}`, {
      ...callData,
      timestamp
    });
  },

  // Get latest call
  async getLatestCall() {
    const calls = await firebaseREST.get(DB_PATHS.CALLS);
    if (!calls) return null;
    
    const timestamps = Object.keys(calls).sort().reverse();
    return timestamps.length > 0 ? calls[timestamps[0]] : null;
  },

  // Listen to calls
  listenToCalls(callback, interval = 1000) {
    return firebaseREST.listen(DB_PATHS.CALLS, (data) => {
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
    return await firebaseREST.set(DB_PATHS.CUSTOM_NAME, {
      name,
      timestamp: Date.now()
    });
  },

  // Get display name
  async getDisplayName() {
    return await firebaseREST.get(DB_PATHS.CUSTOM_NAME);
  },

  // Set instant audio
  async setInstantAudio(filename) {
    return await firebaseREST.set(DB_PATHS.INSTANT_AUDIO, {
      filename,
      timestamp: Date.now()
    });
  },

  // Get instant audio
  async getInstantAudio() {
    return await firebaseREST.get(DB_PATHS.INSTANT_AUDIO);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    DB_PATHS,
    FirebaseREST,
    FirebaseHelper,
    initializeFirebase
  };
}

// Make available globally
window.firebaseConfig = firebaseConfig;
window.DB_PATHS = DB_PATHS;
window.FirebaseREST = FirebaseREST;
window.FirebaseHelper = FirebaseHelper;
window.firebaseREST = firebaseREST;
