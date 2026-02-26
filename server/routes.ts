import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.get("/room.glb", (_req, res) => {
    const filePath = path.resolve(import.meta.dirname, "static", "room.glb");
    const stat = fs.statSync(filePath);
    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });

  return httpServer;
}
