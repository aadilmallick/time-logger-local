// --- IndexedDB Engine ---

import type { Category, TimeLog } from "../types";
import { DEFAULT_CATEGORIES, generateId, getLocalDateString } from "./utils";

const DB_NAME = "TimeTrackerDB";
const DB_VERSION = 1;

class DB {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("timelogs")) {
          db.createObjectStore("timelogs", { keyPath: "date" });
        }
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" });
        }
      };
      req.onsuccess = async () => {
        this.db = req.result;
        await this.seedCategories();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async seedCategories() {
    const cats = await this.getAll("categories");
    if (cats.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await this.put("categories", cat);
      }
    }
  }

  private async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async put(storeName: string, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      const req = tx.objectStore(storeName).put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Domain Specific
  async getCategories(): Promise<Category[]> {
    return this.getAll("categories");
  }
  async saveCategory(cat: Category) {
    return this.put("categories", cat);
  }

  async getTimeLog(date: string): Promise<TimeLog | undefined> {
    return this.get("timelogs", date);
  }
  async getAllTimeLogs(): Promise<TimeLog[]> {
    return this.getAll("timelogs");
  }
  async saveTimeLog(log: TimeLog) {
    return this.put("timelogs", log);
  }
  async deleteTimeLog(date: string) {
    return this.delete("timelogs", date);
  }

  async getOrCreateTodayLog(): Promise<TimeLog> {
    const today = getLocalDateString();
    let log = await this.getTimeLog(today);
    if (!log) {
      log = {
        id: generateId(),
        date: today,
        entries: [],
        createdAt: new Date().toISOString(),
      };
      await this.saveTimeLog(log);
    }
    return log;
  }

  async resetAll() {
    await this.clear("timelogs");
    await this.clear("categories");
    await this.seedCategories();
  }
}

export const db = new DB();
