import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";

const currentDir = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const staticDir = path.resolve(currentDir, "static");

  const serveGLB = (route: string, filename: string) => {
    app.get(route, (_req, res) => {
      const filePath = path.join(staticDir, filename);
      try {
        const stat = fs.statSync(filePath);
        res.setHeader("Content-Type", "model/gltf-binary");
        res.setHeader("Content-Length", stat.size);
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
        stream.on("error", () => {
          if (!res.headersSent) res.status(500).end();
        });
        stream.pipe(res);
      } catch {
        res.status(404).end();
      }
    });
  };

  serveGLB("/room.glb", "room.glb");
  serveGLB("/render3d.glb", "render3d.glb");
  serveGLB("/ballon_dor.glb", "ballon_dor.glb");
  serveGLB("/corner_shelves.glb", "corner_shelves.glb");
  serveGLB("/table.glb", "table.glb");

  return httpServer;
}
