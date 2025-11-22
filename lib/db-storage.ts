import localforage from "localforage"

// Initialize localForage with custom config
localforage.config({
  name: "table-editor-db",
  storeName: "table-data",
})

interface StorageInterface {
  setDataCache(data: any[]): Promise<boolean>
  getDataCache(): Promise<any[] | null>
  clearDataCache(): Promise<boolean>
  hasDataCache(): Promise<boolean>
  getCacheMetadata(): Promise<any>
  setCacheMetadata(metadata: any): Promise<boolean>
}

export const DB_STORAGE: StorageInterface = {
  // Store large dataset in IndexedDB
  async setDataCache(data: any[]): Promise<boolean> {
    try {
      await localforage.setItem("table-dataset", data)
      return true
    } catch (error) {
      console.error("[v0] Failed to store data in IndexedDB:", error)
      return false
    }
  },

  // Retrieve large dataset from IndexedDB
  async getDataCache(): Promise<any[] | null> {
    try {
      const data = await localforage.getItem("table-dataset")
      return data
    } catch (error) {
      console.error("[v0] Failed to retrieve data from IndexedDB:", error)
      return null
    }
  },

  // Clear large dataset cache
  async clearDataCache(): Promise<boolean> {
    try {
      await localforage.removeItem("table-dataset")
      return true
    } catch (error) {
      console.error("[v0] Failed to clear data cache:", error)
      return false
    }
  },

  // Check if data cache exists
  async hasDataCache(): Promise<boolean> {
    try {
      const data = await localforage.getItem("table-dataset")
      return data !== null
    } catch (error) {
      console.error("[v0] Failed to check cache:", error)
      return false
    }
  },

  // Get cache metadata
  async getCacheMetadata(): Promise<any> {
    try {
      const metadata = await localforage.getItem("cache-metadata")
      return metadata
    } catch (error) {
      return null
    }
  },

  // Set cache metadata
  async setCacheMetadata(metadata: any): Promise<boolean> {
    try {
      await localforage.setItem("cache-metadata", metadata)
      return true
    } catch (error) {
      console.error("[v0] Failed to store metadata:", error)
      return false
    }
  },
}
