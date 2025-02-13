import { IStorage } from "./storage.interface";
import { User, MenuCategory, MenuItem, QrCode, Order, Transaction } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private menuCategories: Map<number, MenuCategory>;
  private menuItems: Map<number, MenuItem>;
  private qrCodes: Map<number, QrCode>;
  private orders: Map<number, Order>;
  private transactions: Map<number, Transaction>;
  private currentId: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.menuCategories = new Map();
    this.menuItems = new Map();
    this.qrCodes = new Map();
    this.orders = new Map();
    this.transactions = new Map();
    this.currentId = {
      users: 1,
      menuCategories: 1,
      menuItems: 1,
      qrCodes: 1,
      orders: 1,
      transactions: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const id = this.currentId.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Menu Category Methods
  async getMenuCategories(): Promise<MenuCategory[]> {
    return Array.from(this.menuCategories.values());
  }

  async createMenuCategory(category: Omit<MenuCategory, "id">): Promise<MenuCategory> {
    const id = this.currentId.menuCategories++;
    const newCategory = { ...category, id };
    this.menuCategories.set(id, newCategory);
    return newCategory;
  }

  // Menu Item Methods
  async getMenuItems(categoryId?: number): Promise<MenuItem[]> {
    const items = Array.from(this.menuItems.values());
    return categoryId ? items.filter(item => item.categoryId === categoryId) : items;
  }

  async createMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    const id = this.currentId.menuItems++;
    const newItem = { ...item, id };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  // QR Code Methods
  async getQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values());
  }

  async createQrCode(qrCode: Omit<QrCode, "id">): Promise<QrCode> {
    const id = this.currentId.qrCodes++;
    const newQrCode = { ...qrCode, id };
    this.qrCodes.set(id, newQrCode);
    return newQrCode;
  }

  // Order Methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(order: Omit<Order, "id">): Promise<Order> {
    const id = this.currentId.orders++;
    const newOrder = { ...order, id };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      const updatedOrder = { ...order, status };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  async createTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const newTransaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByOrderId(orderId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.orderId === orderId
    );
  }

  async updateOrderPaymentStatus(orderId: number, paymentStatus: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      const updatedOrder = { ...order, paymentStatus };
      this.orders.set(orderId, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }
}

export const storage = new MemStorage();