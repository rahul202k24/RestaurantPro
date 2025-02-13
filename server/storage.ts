import { IStorage } from "./storage.interface";
import { users, menuCategories, menuItems, qrCodes, orders } from "@shared/schema";
import type { User, MenuCategory, MenuItem, QrCode, Order } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Menu Category Methods
  async getMenuCategories(): Promise<MenuCategory[]> {
    return await db.select().from(menuCategories);
  }

  async createMenuCategory(category: Omit<MenuCategory, "id">): Promise<MenuCategory> {
    const [newCategory] = await db.insert(menuCategories).values(category).returning();
    return newCategory;
  }

  // Menu Item Methods
  async getMenuItems(categoryId?: number): Promise<MenuItem[]> {
    if (categoryId) {
      return await db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId));
    }
    return await db.select().from(menuItems);
  }

  async createMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  // QR Code Methods
  async getQrCodes(): Promise<QrCode[]> {
    return await db.select().from(qrCodes);
  }

  async createQrCode(qrCode: Omit<QrCode, "id">): Promise<QrCode> {
    const [newQrCode] = await db.insert(qrCodes).values(qrCode).returning();
    return newQrCode;
  }

  // Order Methods
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async createOrder(order: Omit<Order, "id">): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();