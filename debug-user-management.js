#!/usr/bin/env node

// Script para testar manualmente as funções do usuário
// Usar: node debug-user-management.js

const {
  deleteUserAction,
  getAllUsersAction,
} = require("./src/actions/admin/user-management-actions");

async function testUserManagement() {
  console.log("🧪 Testando sistema de gerenciamento de usuários...\n");

  try {
    // 1. Listar todos os usuários
    console.log("📋 Listando usuários...");
    const result = await getAllUsersAction();

    if (result.success && result.users) {
      console.log(`✅ Total de usuários: ${result.users.length}`);
      result.users.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`,
        );
      });
    } else {
      console.log("❌ Erro ao listar usuários:", result.error);
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

testUserManagement();
