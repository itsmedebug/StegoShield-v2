
import { db } from "./db";
import { logs, type Log, type InsertLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getLogs(): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  clearLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.createdAt));
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }

  async clearLogs(): Promise<void> {
    await db.delete(logs);
  }
}

export const storage = new DatabaseStorage();
