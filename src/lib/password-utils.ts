/**
 * Gera uma senha aleatória segura
 * @returns string com a senha gerada
 */
export function generateSecurePassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*";
  let password = "";

  // Garantir pelo menos um número
  password += "0123456789"[Math.floor(Math.random() * 10)];

  // Garantir pelo menos uma letra maiúscula
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];

  // Garantir pelo menos uma letra minúscula
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];

  // Garantir pelo menos um caractere especial
  password += "#@$%&*"[Math.floor(Math.random() * 6)];

  // Preencher o resto da senha com caracteres aleatórios
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Embaralhar a senha
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
