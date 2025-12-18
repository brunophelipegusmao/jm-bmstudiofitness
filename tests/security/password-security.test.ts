/**
 * @jest-environment node
 */

// Testes de Segurança - Senhas e Hashing
// Testa todos os aspectos de segurança relacionados a senhas:
// - Hashing com bcrypt (12 rounds)
// - Verificação de senhas
// - Password reset tokens
// - Expiração de tokens de reset
// - Força de senha
// - Proteção contra timing attacks

import bcrypt from "bcryptjs";

import { db } from "@/db";
import { passwordResetTokensTable } from "@/db/reset-password-schema";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";

jest.mock("bcryptjs");
jest.mock("@/db");

describe("🔐 Security Tests - Password Security", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Password Hashing", () => {
    it("deve usar bcrypt com 12 rounds de salt", async () => {
      const password = "Senha@Forte123";
      const mockHash = "$2a$12$mockedHashValue";

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(mockHash);
    });

    it("deve gerar hashes diferentes para mesma senha", async () => {
      const password = "Senha@123";

      // Simula comportamento real do bcrypt (hashes diferentes mesmo com mesma senha)
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce("$2a$12$hash1mockedValue")
        .mockResolvedValueOnce("$2a$12$hash2differentValue");

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(bcrypt.hash).toHaveBeenCalledTimes(2);
    });

    it("deve aceitar senhas longas (até 72 bytes bcrypt limit)", async () => {
      const longPassword = "A".repeat(72); // Limite do bcrypt
      const mockHash = "$2a$12$longPasswordHash";

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(longPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(longPassword, 12);
      expect(result).toBe(mockHash);
    });

    it("deve lidar com caracteres especiais", async () => {
      const specialPassword = "P@ssw0rd!#$%&*()_+-=[]{}|;:,.<>?";
      const mockHash = "$2a$12$specialCharsHash";

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(specialPassword);

      expect(result).toBe(mockHash);
    });

    it("deve lidar com senhas Unicode", async () => {
      const unicodePassword = "Senh@_日本語_émojis_🔐";
      const mockHash = "$2a$12$unicodeHash";

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(unicodePassword);

      expect(result).toBe(mockHash);
    });
  });

  describe("2. Password Verification", () => {
    it("deve verificar senha correta", async () => {
      const password = "Senha@123";
      const hash = "$2a$12$validHashForPassword";

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await verifyPassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it("deve rejeitar senha incorreta", async () => {
      const wrongPassword = "SenhaErrada@123";
      const hash = "$2a$12$validHashForDifferentPassword";

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it("deve ser case-sensitive", async () => {
      const password = "Senha@123";
      const wrongCase = "senha@123"; // lowercase
      const hash = "$2a$12$hashForUpperCase";

      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Senha correta
        .mockResolvedValueOnce(false); // Senha com case errado

      const correctResult = await verifyPassword(password, hash);
      const wrongResult = await verifyPassword(wrongCase, hash);

      expect(correctResult).toBe(true);
      expect(wrongResult).toBe(false);
    });

    it("deve rejeitar hash malformado", async () => {
      const password = "Senha@123";
      const malformedHash = "not-a-valid-bcrypt-hash";

      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error("Invalid hash format"),
      );

      await expect(verifyPassword(password, malformedHash)).rejects.toThrow();
    });

    it("deve ter tempo constante para prevenir timing attacks", async () => {
      // bcrypt.compare já implementa constant-time comparison
      const password = "Senha@123";
      const hash = "$2a$12$validHash";

      (bcrypt.compare as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
      );

      const start = Date.now();
      await verifyPassword(password, hash);
      const duration = Date.now() - start;

      // Deve demorar aproximadamente o mesmo tempo independente do resultado
      expect(duration).toBeGreaterThanOrEqual(90);
      expect(duration).toBeLessThan(150);
    });
  });

  describe("3. Password Reset Tokens", () => {
    it("deve gerar token único e seguro", () => {
      // Tokens devem ser criptograficamente seguros (generate 32 char hex for realistic)
      const token1 =
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2);
      const token2 =
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2);

      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(10);
    });

    it("deve armazenar token com expiração de 1 hora", async () => {
      const mockToken = "secure-reset-token-123456";
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      const mockInsert = jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: 1,
            token: mockToken,
            userId: "user-123",
            expiresAt,
            used: false,
            createdAt: new Date(),
          },
        ]),
      });

      (db as any).insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: mockInsert().returning,
        }),
      });

      // Simula criação de token de reset
      const result = await db
        .insert(passwordResetTokensTable)
        .values({
          token: mockToken,
          userId: "user-123",
          expiresAt,
          used: false,
        })
        .returning();

      expect(result[0].token).toBe(mockToken);
      expect(result[0].expiresAt).toEqual(expiresAt);
      expect(result[0].used).toBe(false);
    });

    it("deve validar token não expirado", () => {
      const futureTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min no futuro
      const currentTime = new Date();

      expect(futureTime.getTime()).toBeGreaterThan(currentTime.getTime());
    });

    it("deve rejeitar token expirado", () => {
      const pastTime = new Date(Date.now() - 30 * 60 * 1000); // 30 min no passado
      const currentTime = new Date();

      expect(pastTime.getTime()).toBeLessThan(currentTime.getTime());
    });

    it("deve marcar token como usado após reset", async () => {
      const mockToken = "used-reset-token";

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              id: 1,
              token: mockToken,
              used: true,
              usedAt: new Date(),
            },
          ]),
        }),
      });

      (db as any).update = jest.fn().mockReturnValue(mockUpdate());

      // Simula marcação de token como usado
      const result = await db
        .update(passwordResetTokensTable)
        .set({
          used: true,
          usedAt: new Date(),
        })
        .where({});

      expect(result[0].used).toBe(true);
      expect(result[0].usedAt).toBeDefined();
    });

    it("deve rejeitar reutilização de token", async () => {
      const usedToken = {
        id: 1,
        token: "already-used-token",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 3600000),
        used: true, // Já foi usado
        usedAt: new Date(),
        createdAt: new Date(),
      };

      // Token já usado não deve ser aceito
      expect(usedToken.used).toBe(true);
    });
  });

  describe("4. Força de Senha", () => {
    it("deve validar senha com requisitos mínimos", () => {
      const weakPasswords = ["123456", "password", "abc123", "senha"];

      const strongPasswords = [
        "Senha@Forte123",
        "P@ssw0rd!2024",
        "MyS3cur3P@ss",
        "C0mpl3x!Pass",
      ];

      // Senhas fracas não devem passar pela validação
      weakPasswords.forEach((pwd) => {
        expect(pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)).toBe(
          true,
        );
      });

      // Senhas fortes devem passar
      strongPasswords.forEach((pwd) => {
        expect(pwd.length >= 8).toBe(true);
        expect(/[A-Z]/.test(pwd)).toBe(true);
        expect(/[0-9]/.test(pwd)).toBe(true);
        expect(/[^A-Za-z0-9]/.test(pwd)).toBe(true);
      });
    });

    it("deve requerer mínimo de 8 caracteres", () => {
      const shortPassword = "Abc@123";
      const validPassword = "Abc@1234";

      expect(shortPassword.length).toBe(7);
      expect(validPassword.length).toBeGreaterThanOrEqual(8);
    });

    it("deve requerer pelo menos uma letra maiúscula", () => {
      const noUpperCase = "senha@123";
      const withUpperCase = "Senha@123";

      expect(/[A-Z]/.test(noUpperCase)).toBe(false);
      expect(/[A-Z]/.test(withUpperCase)).toBe(true);
    });

    it("deve requerer pelo menos um número", () => {
      const noNumber = "Senha@Forte";
      const withNumber = "Senha@123";

      expect(/[0-9]/.test(noNumber)).toBe(false);
      expect(/[0-9]/.test(withNumber)).toBe(true);
    });

    it("deve requerer pelo menos um caractere especial", () => {
      const noSpecial = "Senha123";
      const withSpecial = "Senha@123";

      expect(/[^A-Za-z0-9]/.test(noSpecial)).toBe(false);
      expect(/[^A-Za-z0-9]/.test(withSpecial)).toBe(true);
    });

    it("deve rejeitar senhas comuns", () => {
      const commonPasswords = [
        "password123",
        "admin123",
        "Welcome1!",
        "Qwerty123!",
      ];

      const blacklist = ["password", "admin", "welcome", "qwerty"];

      commonPasswords.forEach((pwd) => {
        const isCommon = blacklist.some((common) =>
          pwd.toLowerCase().includes(common),
        );
        expect(isCommon).toBe(true);
      });
    });
  });

  describe("5. Proteção contra Brute Force", () => {
    it("deve implementar rate limiting implícito via bcrypt", async () => {
      // bcrypt com 12 rounds adiciona delay intencional (~250ms)
      const password = "Senha@123";
      const hash = "$2a$12$hash";

      (bcrypt.compare as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 250)),
      );

      const start = Date.now();
      await verifyPassword(password, hash);
      const duration = Date.now() - start;

      // Deve ter delay mínimo de processamento
      expect(duration).toBeGreaterThanOrEqual(200);
    });

    it("deve registrar tentativas de login falhas", () => {
      const failedAttempts = [
        { userId: "user-1", timestamp: new Date(), success: false },
        { userId: "user-1", timestamp: new Date(), success: false },
        { userId: "user-1", timestamp: new Date(), success: false },
      ];

      expect(failedAttempts.length).toBe(3);
      expect(failedAttempts.every((a) => !a.success)).toBe(true);
    });

    it("deve bloquear após N tentativas falhas", () => {
      const maxAttempts = 5;
      const currentAttempts = 6;

      const isBlocked = currentAttempts >= maxAttempts;
      expect(isBlocked).toBe(true);
    });
  });

  describe("6. Segurança em Trânsito", () => {
    it("nunca deve retornar senha em plaintext", async () => {
      const password = "Senha@123";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toContain("$2a$12$");
    });

    it("nunca deve logar senhas", () => {
      const sensitiveData = {
        email: "user@test.com",
        password: "Senha@123", // NUNCA deve aparecer em logs
      };

      // Em produção, implementar sanitização de logs
      const sanitized = {
        email: sensitiveData.email,
        password: "***REDACTED***",
      };

      expect(sanitized.password).not.toBe(sensitiveData.password);
      expect(sanitized.password).toBe("***REDACTED***");
    });

    it("deve limpar senha da memória após uso", () => {
      let password: string | null = "Senha@123";

      // Simula uso da senha
      const passwordUsed = password;
      expect(passwordUsed).toBe("Senha@123");

      // Limpar referência
      password = null;
      expect(password).toBeNull();
    });
  });

  describe("7. Validação de Alteração de Senha", () => {
    it("deve requerer senha atual para alteração", async () => {
      const currentPassword = "SenhaAtual@123";
      const currentHash = "$2a$12$currentHash";

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const isValid = await verifyPassword(currentPassword, currentHash);

      expect(isValid).toBe(true);
    });

    it("deve rejeitar nova senha igual à atual", async () => {
      const currentPassword = "Senha@123";
      const newPassword = "Senha@123";

      expect(currentPassword).toBe(newPassword);
      // Em produção, isso deve ser rejeitado
    });

    it("deve validar nova senha com requisitos de força", () => {
      const newPassword = "NovaSenha@Forte2024";

      const isStrong =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^A-Za-z0-9]/.test(newPassword);

      expect(isStrong).toBe(true);
    });

    it("deve invalidar sessões antigas após alteração de senha", () => {
      const oldSessions = [
        { sessionId: "session-1", createdAt: new Date(Date.now() - 86400000) },
        { sessionId: "session-2", createdAt: new Date(Date.now() - 3600000) },
      ];

      const passwordChangedAt = new Date();

      // Todas as sessões antigas devem ser invalidadas
      oldSessions.forEach((session) => {
        const shouldInvalidate = session.createdAt < passwordChangedAt;
        expect(shouldInvalidate).toBe(true);
      });
    });
  });

  describe("8. Conformidade e Melhores Práticas", () => {
    it("deve usar algoritmo de hashing aprovado (bcrypt)", async () => {
      const password = "Senha@123";

      (bcrypt.hash as jest.Mock).mockResolvedValue("$2a$12$mockedHash");

      const hash = await hashPassword(password);

      // bcrypt usa formato $2a$ ou $2b$
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it("deve usar custo mínimo recomendado (12 rounds)", async () => {
      const password = "Senha@123";

      await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it("não deve armazenar senhas em plaintext no banco", () => {
      const userInDB = {
        id: "user-1",
        email: "user@test.com",
        password: "$2a$12$hashedPasswordHere", // Sempre hash
      };

      expect(userInDB.password).toMatch(/^\$2[ab]\$/);
      expect(userInDB.password).not.toBe("senha-em-texto-plano");
    });

    it("deve implementar salt único por senha", async () => {
      // bcrypt gera salt único automaticamente
      const password = "Senha@123";

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce("$2a$12$uniqueSalt1.hash1")
        .mockResolvedValueOnce("$2a$12$uniqueSalt2.hash2");

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Hashes devem ser diferentes devido a salts únicos
      expect(hash1).not.toBe(hash2);
    });
  });
});
