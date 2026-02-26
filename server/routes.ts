import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.use("/room.glb", express.static(path.resolve(import.meta.dirname, "..", "client", "public", "room.glb"), {
    maxAge: "1d",
    immutable: true,
    setHeaders: (res) => {
      res.setHeader("Content-Type", "model/gltf-binary");
    }
  }));

  return httpServer;
}
