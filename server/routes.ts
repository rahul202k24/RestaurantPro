import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMenuCategorySchema, insertMenuItemSchema, insertQrCodeSchema, insertOrderSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Menu Categories
  app.get("/api/menu/categories", async (req, res) => {
    const categories = await storage.getMenuCategories();
    res.json(categories);
  });

  app.post("/api/menu/categories", async (req, res) => {
    const parsed = insertMenuCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const category = await storage.createMenuCategory(parsed.data);
    res.status(201).json(category);
  });

  // Menu Items
  app.get("/api/menu/items", async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const items = await storage.getMenuItems(categoryId);
    res.json(items);
  });

  app.post("/api/menu/items", async (req, res) => {
    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const item = await storage.createMenuItem(parsed.data);
    res.status(201).json(item);
  });

  // QR Codes
  app.get("/api/qr-codes", async (req, res) => {
    const codes = await storage.getQrCodes();
    res.json(codes);
  });

  app.post("/api/qr-codes", async (req, res) => {
    const parsed = insertQrCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const code = await storage.createQrCode(parsed.data);
    res.status(201).json(code);
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const order = await storage.createOrder(parsed.data);
    res.status(201).json(order);
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const order = await storage.updateOrderStatus(id, status);
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}
