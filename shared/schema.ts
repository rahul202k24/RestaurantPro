import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
});

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // stored in cents
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  modifiers: json("modifiers").$type<{
    name: string;
    options: { name: string; price: number }[];
  }[]>(),
});

export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull(),
  customization: json("customization").$type<{
    logo?: string;
    color?: string;
    pattern?: string;
  }>(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status"), // Made optional instead of removing
  items: json("items").$type<{
    menuItemId: number;
    quantity: number;
    modifiers?: { name: string; option: string }[];
  }[]>(),
  total: integer("total").notNull(), // stored in cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories);
export const insertMenuItemSchema = createInsertSchema(menuItems);
export const insertQrCodeSchema = createInsertSchema(qrCodes);
export const insertOrderSchema = createInsertSchema(orders).omit({
  paymentStatus: true // Exclude from insert schema since we don't need it anymore
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
export type Order = typeof orders.$inferSelect;