import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/lib/db.ts";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Multer config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  // File filter for different types
  const fileFilter = (req: any, file: any, cb: any) => {
    const type = req.body.type;
    const ext = path.extname(file.originalname).toLowerCase();

    if (type === 'article' || type === 'plagiarism') {
      // Article and plagiarism: pdf, doc, docx, txt, rtf
      const allowed = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Для статей и антиплагиата допускаются только файлы: PDF, DOC, DOCX, TXT, RTF'));
      }
    } else if (type === 'payment') {
      // Payment: images only
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Для чека об оплате допускаются только изображения: JPG, PNG, GIF, WEBP'));
      }
    } else {
      cb(null, true);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/register", async (req, res) => {
    const { full_name, email, phone, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare(
        "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)"
      );
      const info = stmt.run(full_name, email, phone, hashedPassword);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
  });

  app.get("/api/me", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, full_name, email, phone, role FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  // Update profile
  app.put("/api/profile", authenticateToken, async (req: any, res) => {
    const { full_name, phone } = req.body;
    try {
      db.prepare("UPDATE users SET full_name = ?, phone = ? WHERE id = ?")
        .run(full_name, phone, req.user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Change password
  app.post("/api/change-password", authenticateToken, async (req: any, res) => {
    const { current_password, new_password } = req.body;
    try {
      const user = db.prepare("SELECT password FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user || !(await bcrypt.compare(current_password, user.password))) {
        return res.status(401).json({ error: "Неверный текущий пароль" });
      }
      const hashedPassword = await bcrypt.hash(new_password, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, req.user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Applications
  app.get("/api/application", authenticateToken, (req: any, res) => {
    const application = db.prepare("SELECT * FROM applications WHERE user_id = ?").get(req.user.id);
    if (!application) return res.json(null);
    
    const files = db.prepare("SELECT * FROM files WHERE application_id = ?").all(application.id);
    res.json({ ...application, files });
  });

  app.post("/api/application", authenticateToken, (req: any, res) => {
    const { direction, participation_format, affiliation, position, talk_type } = req.body;
    const existing = db.prepare("SELECT id FROM applications WHERE user_id = ?").get(req.user.id);

    if (existing) {
      db.prepare("UPDATE applications SET direction = ?, participation_format = ?, affiliation = ?, position = ?, talk_type = ? WHERE id = ?")
        .run(direction, participation_format, affiliation || null, position || null, talk_type || null, existing.id);
      return res.json({ id: existing.id });
    } else {
      const info = db.prepare("INSERT INTO applications (user_id, direction, participation_format, affiliation, position, talk_type) VALUES (?, ?, ?, ?, ?, ?)")
        .run(req.user.id, direction, participation_format, affiliation || null, position || null, talk_type || null);
      return res.json({ id: info.lastInsertRowid });
    }
  });

  // Upload
  app.post("/api/upload", authenticateToken, upload.single("file"), (req: any, res) => {
    const { type, application_id } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileUrl = `/uploads/${file.filename}`;

    const stmt = db.prepare(
      "INSERT INTO files (application_id, type, file_url, original_name) VALUES (?, ?, ?, ?)"
    );
    stmt.run(application_id || null, type, fileUrl, file.originalname);

    res.json({ url: fileUrl });
  });

  // Delete file
  app.delete("/api/files/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    try {
      const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id) as any;
      if (!file) return res.status(404).json({ error: "File not found" });

      // Verify ownership
      const app = db.prepare("SELECT * FROM applications WHERE id = ?").get(file.application_id) as any;
      if (!app || app.user_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      db.prepare("DELETE FROM files WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Global Files (Hero buttons)
  app.get("/api/files", (req, res) => {
    const { type } = req.query;
    const files = db.prepare("SELECT * FROM files WHERE application_id IS NULL AND type = ?").all(type);
    res.json(files);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
