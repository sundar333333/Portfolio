import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";
import { getUncachableGmailClient } from "./gmail";

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
  serveGLB("/myroom.glb", "myroom.glb");
  serveGLB("/ballon_dor.glb", "ballon_dor.glb");
  serveGLB("/corner_shelves.glb", "corner_shelves.glb");
  serveGLB("/table.glb", "table.glb");

  

  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, message } = req.body;

      if (!email || !message) {
        return res.status(400).json({ error: "Email and message are required" });
      }

      const gmail = await getUncachableGmailClient();

      const subject = `Portfolio Contact: ${firstName || ""} ${lastName || ""}`.trim();
      const body = [
        `New message from your portfolio contact form:`,
        ``,
        `Name: ${firstName || ""} ${lastName || ""}`.trim(),
        `Email: ${email}`,
        ``,
        `Message:`,
        message,
      ].join("\n");

      const rawMessage = [
        `To: leosr1033@gmail.com`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        ``,
        body,
      ].join("\n");

      const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Contact form error:", error?.message || error);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

  return httpServer;
}
