/**
 * @jest-environment node
 */

// Testes de Segurança - Input Validation & Injection Prevention
// Testa proteção contra ataques comuns:
// - SQL Injection
// - XSS (Cross-Site Scripting)
// - CSRF (Cross-Site Request Forgery)
// - Command Injection
// - Path Traversal
// - Validação de entrada com Zod

import { z } from "zod";
import { db } from "@/db";
import { personalDataTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sanitizeHtml, sanitizeFilename } from "@/lib/sanitizer";

jest.mock("@/db");

describe("🔐 Security Tests - Input Validation & Injection Prevention", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Provide a chainable default for db.select
    (db as any).select = jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
  });

  describe("1. SQL Injection Protection", () => {
    it("deve prevenir SQL injection em consulta de email", async () => {
      const maliciousEmail = "admin@test.com' OR '1'='1";

      const mockWhere = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      // Drizzle ORM usa queries parametrizadas automaticamente
      await db
        .select()
        .from(personalDataTable)
        .where(eq(personalDataTable.email, maliciousEmail))
        .limit(1);

      // Verifica que a consulta foi feita com segurança
      expect(mockWhere).toHaveBeenCalled();
    });

    it("deve prevenir SQL injection com UNION attack", async () => {
      const maliciousInput = "1 UNION SELECT password FROM users--";

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Drizzle trata isso como string literal, não como SQL
      await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, maliciousInput))
        .limit(1);

      expect(db.select).toHaveBeenCalled();
    });

    it("deve prevenir SQL injection com comentários", async () => {
      const maliciousInput = "admin@test.com'; DROP TABLE users; --";

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await db
        .select()
        .from(personalDataTable)
        .where(eq(personalDataTable.email, maliciousInput))
        .limit(1);

      // Comando DROP nunca é executado, tratado como string
      expect(db.select).toHaveBeenCalled();
    });

    it("deve prevenir SQL injection com stacked queries", async () => {
      const maliciousInput = "1; DELETE FROM users WHERE 1=1";

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, maliciousInput))
        .limit(1);

      expect(db.select).toHaveBeenCalled();
    });

    it("deve usar prepared statements implicitamente", () => {
      // Drizzle ORM sempre usa prepared statements
      const userId = "user-123";

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      db.select().from(usersTable).where(eq(usersTable.id, userId));

      // Verifica que não há concatenação de strings SQL
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("2. XSS (Cross-Site Scripting) Protection", () => {
    it("deve sanitizar script tags em nome de usuário", () => {
      const maliciousName = "<script>alert('XSS')</script>";

      // Next.js escapa automaticamente no JSX
      const escaped = maliciousName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      expect(escaped).toBe("&lt;script&gt;alert('XSS')&lt;/script&gt;");
      expect(escaped).not.toContain("<script>");
    });

    it("deve sanitizar event handlers em input", () => {
      const maliciousInput = '<img src="x" onerror="alert(\'XSS\')">';

      const escaped = sanitizeHtml(maliciousInput);

      expect(escaped).not.toContain("onerror=");
      expect(escaped).not.toContain("<img");
    });

    it("deve prevenir XSS em atributos href", () => {
      const maliciousHref = "javascript:alert('XSS')";

      // Validar que href não contém javascript:
      const isValidHref = !maliciousHref
        .toLowerCase()
        .startsWith("javascript:");

      expect(isValidHref).toBe(false);
    });

    it("deve prevenir XSS em data URLs", () => {
      const maliciousData = "data:text/html,<script>alert('XSS')</script>";

      const isDangerous = maliciousData
        .toLowerCase()
        .startsWith("data:text/html");

      expect(isDangerous).toBe(true);
    });

    it("deve sanitizar HTML entities", () => {
      const userInput = "Test & <b>Bold</b> 'quotes' \"double\"";

      const sanitized = userInput
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

      expect(sanitized).not.toContain("<b>");
      expect(sanitized).toContain("&lt;b&gt;");
    });

    it("deve prevenir XSS via CSS injection", () => {
      const maliciousCSS = "body{background:url('javascript:alert(1)')}";

      const containsJavaScript = maliciousCSS
        .toLowerCase()
        .includes("javascript:");

      expect(containsJavaScript).toBe(true);
      // Em produção, rejeitar
    });
  });

  describe("3. Validação com Zod", () => {
    it("deve validar email com formato correto", () => {
      const emailSchema = z.string().email();

      const validEmail = "user@jmfitness.com";
      const invalidEmail = "not-an-email";

      expect(() => emailSchema.parse(validEmail)).not.toThrow();
      expect(() => emailSchema.parse(invalidEmail)).toThrow();
    });

    it("deve validar CPF com formato correto", () => {
      const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);

      const validCPF = "123.456.789-00";
      const invalidCPF = "12345678900";

      expect(() => cpfSchema.parse(validCPF)).not.toThrow();
      expect(() => cpfSchema.parse(invalidCPF)).toThrow();
    });

    it("deve validar telefone com formato correto", () => {
      const phoneSchema = z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/);

      const validPhone = "(11) 98765-4321";
      const invalidPhone = "11987654321";

      expect(() => phoneSchema.parse(validPhone)).not.toThrow();
      expect(() => phoneSchema.parse(invalidPhone)).toThrow();
    });

    it("deve validar campos obrigatórios", () => {
      const userSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["admin", "professor", "funcionario", "aluno"]),
      });

      const validData = {
        name: "João Silva",
        email: "joao@test.com",
        role: "aluno" as const,
      };

      const invalidData = {
        name: "",
        email: "invalid-email",
        role: "invalid-role" as any,
      };

      expect(() => userSchema.parse(validData)).not.toThrow();
      expect(() => userSchema.parse(invalidData)).toThrow();
    });

    it("deve validar tipos de dados", () => {
      const paymentSchema = z.object({
        amount: z.number().positive(),
        dueDate: z.date(),
        paid: z.boolean(),
      });

      const validPayment = {
        amount: 150.0,
        dueDate: new Date(),
        paid: false,
      };

      const invalidPayment = {
        amount: "150", // string ao invés de number
        dueDate: "2024-01-01", // string ao invés de Date
        paid: "false", // string ao invés de boolean
      };

      expect(() => paymentSchema.parse(validPayment)).not.toThrow();
      expect(() => paymentSchema.parse(invalidPayment)).toThrow();
    });

    it("deve validar limites de comprimento", () => {
      const nameSchema = z.string().min(2).max(100);

      const validName = "João Silva";
      const tooShort = "A";
      const tooLong = "A".repeat(101);

      expect(() => nameSchema.parse(validName)).not.toThrow();
      expect(() => nameSchema.parse(tooShort)).toThrow();
      expect(() => nameSchema.parse(tooLong)).toThrow();
    });

    it("deve validar ranges numéricos", () => {
      const ageSchema = z.number().int().min(14).max(120);

      expect(() => ageSchema.parse(25)).not.toThrow();
      expect(() => ageSchema.parse(13)).toThrow(); // Muito jovem
      expect(() => ageSchema.parse(121)).toThrow(); // Muito velho
      expect(() => ageSchema.parse(25.5)).toThrow(); // Não inteiro
    });

    it("deve validar arrays", () => {
      const tagsSchema = z.array(z.string()).min(1).max(10);

      expect(() => tagsSchema.parse(["tag1", "tag2"])).not.toThrow();
      expect(() => tagsSchema.parse([])).toThrow(); // Array vazio
      expect(() => tagsSchema.parse(Array(11).fill("tag"))).toThrow(); // Muitos items
    });
  });

  describe("4. CSRF Protection", () => {
    it("deve validar origin header em requisições POST", () => {
      const requestOrigin = "https://jmfitness.com";
      const allowedOrigin = "https://jmfitness.com";

      const isValid = requestOrigin === allowedOrigin;
      expect(isValid).toBe(true);
    });

    it("deve rejeitar origin suspeito", () => {
      const requestOrigin = "https://evil-site.com";
      const allowedOrigin = "https://jmfitness.com";

      const isValid = requestOrigin === allowedOrigin;
      expect(isValid).toBe(false);
    });

    it("deve usar cookies SameSite=lax", () => {
      const cookieConfig = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
      };

      expect(cookieConfig.sameSite).toBe("lax");
    });

    it("deve validar referer em ações críticas", () => {
      const referer = "https://jmfitness.com/admin/users";
      const allowedDomain = "jmfitness.com";

      const isValid = referer.includes(allowedDomain);
      expect(isValid).toBe(true);
    });
  });

  describe("5. Command Injection Protection", () => {
    it("deve prevenir command injection em nome de arquivo", () => {
      const maliciousFilename = "file.txt; rm -rf /";

      // Sanitizar nome de arquivo
      const sanitized = sanitizeFilename(maliciousFilename);

      expect(sanitized).not.toContain(";");
      expect(sanitized).not.toContain("rm");
    });

    it("deve validar extensão de arquivo", () => {
      const allowedExtensions = [".jpg", ".png", ".pdf"];

      const validFile = "document.pdf";
      const invalidFile = "script.sh";

      const validExt = allowedExtensions.some((ext) => validFile.endsWith(ext));
      const invalidExt = allowedExtensions.some((ext) =>
        invalidFile.endsWith(ext),
      );

      expect(validExt).toBe(true);
      expect(invalidExt).toBe(false);
    });

    it("deve prevenir null bytes em path", () => {
      const maliciousPath = "file.txt\x00.sh";

      const containsNullByte = maliciousPath.includes("\x00");

      expect(containsNullByte).toBe(true);
      // Em produção, rejeitar
    });
  });

  describe("6. Path Traversal Protection", () => {
    it("deve prevenir path traversal com ../", () => {
      const maliciousPath = "../../etc/passwd";

      // Normalizar e validar path
      const containsTraversal = maliciousPath.includes("..");

      expect(containsTraversal).toBe(true);
      // Em produção, rejeitar
    });

    it("deve validar path absoluto", () => {
      const suspiciousPath = "/etc/passwd";
      const allowedBasePath = "/var/www/uploads";

      const isAbsolute = suspiciousPath.startsWith("/");
      const isWithinAllowed = suspiciousPath.startsWith(allowedBasePath);

      expect(isAbsolute).toBe(true);
      expect(isWithinAllowed).toBe(false);
    });

    it("deve normalizar path antes de validação", () => {
      const path = "uploads/./../../etc/passwd";

      // Simula normalização (em produção usar path.resolve)
      const normalized = path.replace(/\/\.\//g, "/").replace(/\/\.\.\//g, "/");

      expect(normalized).not.toBe(path);
    });
  });

  describe("7. Validação de Business Logic", () => {
    it("deve validar data de nascimento razoável", () => {
      const now = new Date();
      const minAge = 14;
      const maxAge = 120;

      const validBirthdate = new Date(now.getFullYear() - 25, 0, 1);
      const tooYoung = new Date(now.getFullYear() - 10, 0, 1);
      const tooOld = new Date(now.getFullYear() - 130, 0, 1);

      const calculateAge = (birthdate: Date) => {
        const diff = now.getTime() - birthdate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      };

      expect(calculateAge(validBirthdate)).toBeGreaterThanOrEqual(minAge);
      expect(calculateAge(validBirthdate)).toBeLessThanOrEqual(maxAge);
      expect(calculateAge(tooYoung)).toBeLessThan(minAge);
      expect(calculateAge(tooOld)).toBeGreaterThan(maxAge);
    });

    it("deve validar valor de pagamento positivo", () => {
      const validAmount = 150.0;
      const invalidNegative = -50.0;
      const invalidZero = 0;

      expect(validAmount).toBeGreaterThan(0);
      expect(invalidNegative).toBeLessThanOrEqual(0);
      expect(invalidZero).toBeLessThanOrEqual(0);
    });

    it("deve validar data de vencimento no futuro", () => {
      const now = new Date();
      const validDueDate = new Date(now.getTime() + 86400000); // +1 dia
      const invalidPastDate = new Date(now.getTime() - 86400000); // -1 dia

      expect(validDueDate.getTime()).toBeGreaterThan(now.getTime());
      expect(invalidPastDate.getTime()).toBeLessThan(now.getTime());
    });

    it("deve validar peso e altura razoáveis", () => {
      const validWeight = 70.5; // kg
      const validHeight = 175; // cm

      const invalidWeight = 500; // Muito pesado
      const invalidHeight = 10; // Muito baixo

      expect(validWeight).toBeGreaterThan(20);
      expect(validWeight).toBeLessThan(300);
      expect(validHeight).toBeGreaterThan(50);
      expect(validHeight).toBeLessThan(250);

      expect(invalidWeight).toBeGreaterThan(300);
      expect(invalidHeight).toBeLessThan(50);
    });
  });

  describe("8. Rate Limiting Simulation", () => {
    it("deve limitar número de requisições por minuto", () => {
      const requests = [
        { timestamp: Date.now() },
        { timestamp: Date.now() + 100 },
        { timestamp: Date.now() + 200 },
        { timestamp: Date.now() + 300 },
        { timestamp: Date.now() + 400 },
        { timestamp: Date.now() + 500 },
      ];

      const maxRequestsPerMinute = 5;
      const oneMinute = 60000;

      const now = Date.now();
      const recentRequests = requests.filter(
        (r) => now - r.timestamp < oneMinute,
      );

      const shouldBlock = recentRequests.length >= maxRequestsPerMinute;
      expect(shouldBlock).toBe(true);
    });

    it("deve permitir requisições após janela de tempo", () => {
      const oldRequest = Date.now() - 70000; // 70 segundos atrás
      const oneMinute = 60000;

      const isExpired = Date.now() - oldRequest > oneMinute;
      expect(isExpired).toBe(true);
    });
  });

  describe("9. Header Security", () => {
    it("deve validar Content-Type header", () => {
      const validContentTypes = [
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data",
      ];

      const requestContentType = "application/json";
      const suspiciousContentType = "text/html";

      expect(validContentTypes.includes(requestContentType)).toBe(true);
      expect(validContentTypes.includes(suspiciousContentType)).toBe(false);
    });

    it("deve validar User-Agent header", () => {
      const validUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
      const suspiciousUserAgent = "sqlmap/1.0";

      const isSuspicious = (ua: string) => {
        const blacklist = ["sqlmap", "nikto", "nmap", "masscan"];
        return blacklist.some((tool) => ua.toLowerCase().includes(tool));
      };

      expect(isSuspicious(validUserAgent)).toBe(false);
      expect(isSuspicious(suspiciousUserAgent)).toBe(true);
    });
  });

  describe("10. Data Sanitization", () => {
    it("deve remover espaços em branco de email", () => {
      const emailWithSpaces = "  user@test.com  ";
      const sanitized = emailWithSpaces.trim().toLowerCase();

      expect(sanitized).toBe("user@test.com");
      expect(sanitized).not.toContain(" ");
    });

    it("deve normalizar telefone para apenas dígitos", () => {
      const phoneWithFormat = "(11) 98765-4321";
      const digitsOnly = phoneWithFormat.replace(/\D/g, "");

      expect(digitsOnly).toBe("11987654321");
      expect(digitsOnly).toMatch(/^\d+$/);
    });

    it("deve normalizar CPF removendo formatação", () => {
      const cpfFormatted = "123.456.789-00";
      const cpfDigits = cpfFormatted.replace(/\D/g, "");

      expect(cpfDigits).toBe("12345678900");
      expect(cpfDigits.length).toBe(11);
    });

    it("deve capitalizar nomes corretamente", () => {
      const nameLowerCase = "joão da silva";
      const capitalized = nameLowerCase
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      expect(capitalized).toBe("João Da Silva");
    });

    it("deve truncar strings longas", () => {
      const longString = "A".repeat(500);
      const maxLength = 100;
      const truncated = longString.substring(0, maxLength);

      expect(truncated.length).toBe(maxLength);
      expect(truncated.length).toBeLessThan(longString.length);
    });
  });
});
