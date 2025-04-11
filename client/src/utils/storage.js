// Helper to safely interact with localStorage
const storage = {
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        // Force a storage event for cross-tab communication
        window.dispatchEvent(new Event('storage'));
        return true;
      } catch (error) {
        console.error('localStorage setItem error:', error);
        return false;
      }
    },
    
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
      }
    },
    
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event('storage'));
        return true;
      } catch (error) {
        console.error('localStorage removeItem error:', error);
        return false;
      }
    }
  };
  
  export default storage;