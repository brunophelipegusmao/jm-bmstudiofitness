// Exemplos de uso do sistema de controle de acesso

import {
  AccessControlError,
  ACTIONS,
  createPermissionChecker,
  PermissionChecker,
  RESOURCES,
  UserSession,
} from "./access-control";
import { UserRole } from "./user-roles";

// Exemplo de sessões de usuário
const adminUser: UserSession = {
  id: "admin-123",
  role: UserRole.ADMIN,
  name: "Administrador",
};

const professorUser: UserSession = {
  id: "prof-456",
  role: UserRole.PROFESSOR,
  name: "Professor João",
};

const funcionarioUser: UserSession = {
  id: "func-789",
  role: UserRole.FUNCIONARIO,
  name: "Carlos Funcionário",
};

const alunoUser: UserSession = {
  id: "aluno-999",
  role: UserRole.ALUNO,
  name: "Maria Silva",
};

// Exemplos de uso
export function exemploUsagePermissoes() {
  // Criando checkers de permissão
  const adminChecker = createPermissionChecker(adminUser);
  const professorChecker = createPermissionChecker(professorUser);
  const funcionarioChecker = createPermissionChecker(funcionarioUser);
  const alunoChecker = createPermissionChecker(alunoUser);

  console.log("=== EXEMPLOS DE VERIFICAÇÃO DE PERMISSÕES ===\n");

  // 1. Verificando se pode criar usuários
  console.log("1. Criação de usuários:");
  console.log(
    `Admin pode criar usuários: ${adminChecker.can(ACTIONS.CREATE, RESOURCES.USERS)}`,
  );
  console.log(
    `Professor pode criar usuários: ${professorChecker.can(ACTIONS.CREATE, RESOURCES.USERS)}`,
  );
  console.log(
    `Funcionário pode criar usuários: ${funcionarioChecker.can(ACTIONS.CREATE, RESOURCES.USERS)}`,
  );
  console.log(
    `Aluno pode criar usuários: ${alunoChecker.can(ACTIONS.CREATE, RESOURCES.USERS)}\n`,
  );

  // 2. Verificando acesso a dados financeiros
  console.log("2. Acesso a dados financeiros:");
  console.log(
    `Admin pode ler dados financeiros: ${adminChecker.can(ACTIONS.READ, RESOURCES.FINANCIAL)}`,
  );
  console.log(
    `Professor pode ler dados financeiros: ${professorChecker.can(ACTIONS.READ, RESOURCES.FINANCIAL)}`,
  );
  console.log(
    `Funcionário pode ler dados financeiros: ${funcionarioChecker.can(ACTIONS.READ, RESOURCES.FINANCIAL)}`,
  );
  console.log(
    `Professor pode ler dados financeiros: ${professorChecker.can(ACTIONS.READ, RESOURCES.FINANCIAL)}`,
  );
  console.log(
    `Aluno pode ler próprios dados financeiros: ${alunoChecker.can(ACTIONS.READ, RESOURCES.FINANCIAL, { targetUserId: alunoUser.id })}\n`,
  );

  // 3. Verificando acesso a observações particulares do coach
  console.log("3. Observações particulares do coach:");
  console.log(
    `Admin pode ler observações: ${adminChecker.can(ACTIONS.READ, RESOURCES.COACH_OBSERVATIONS)}`,
  );
  console.log(
    `Professor pode ler observações: ${professorChecker.can(ACTIONS.READ, RESOURCES.COACH_OBSERVATIONS)}`,
  );
  console.log(
    `Funcionário pode ler observações: ${funcionarioChecker.can(ACTIONS.READ, RESOURCES.COACH_OBSERVATIONS)}`,
  );
  console.log(
    `Professor pode ler observações: ${professorChecker.can(ACTIONS.READ, RESOURCES.COACH_OBSERVATIONS)}`,
  );
  console.log(
    `Aluno pode ler observações: ${alunoChecker.can(ACTIONS.READ, RESOURCES.COACH_OBSERVATIONS)}\n`,
  );

  // 4. Exemplo de autorização com erro
  console.log("4. Exemplo de autorização com erro:");
  try {
    alunoChecker.authorize(ACTIONS.DELETE, RESOURCES.USERS);
    console.log("Aluno conseguiu deletar usuários!"); // Não deve acontecer
  } catch (error) {
    if (error instanceof AccessControlError) {
      console.log(`Erro esperado: ${error.message}\n`);
    }
  }

  // 5. Filtragem de dados sensíveis
  console.log("5. Filtragem de dados sensíveis:");
  const dadosCompletos = {
    id: "health-123",
    userId: "aluno-789",
    heightCm: "170",
    weightKg: "65",
    coachObservationsParticular: "Precisa melhorar flexibilidade",
    otherNotes: "Progresso satisfatório",
  };

  const dadosParaAluno = alunoChecker.filterSensitiveData(
    dadosCompletos,
    RESOURCES.HEALTH_METRICS,
  );
  console.log("Dados que o aluno pode ver:", dadosParaAluno);

  const dadosParaProfessor = professorChecker.filterSensitiveData(
    dadosCompletos,
    RESOURCES.HEALTH_METRICS,
  );
  console.log("Dados que o professor pode ver:", dadosParaProfessor);
}

// Exemplo de classe de serviço usando o sistema de permissões
export class UserService {
  constructor(private permissionChecker: PermissionChecker) {}

  async getUserData(targetUserId: string) {
    // Verifica se pode acessar dados do usuário
    this.permissionChecker.authorize(ACTIONS.READ, RESOURCES.USERS, {
      targetUserId,
      // ownData: this.permissionChecker.user.id === targetUserId
    });

    // Busca os dados... (implementação real)
    const userData = {
      /* dados do usuário */
    };

    // Filtra dados sensíveis baseado no role
    return this.permissionChecker.filterSensitiveData(
      userData,
      RESOURCES.USERS,
    );
  }

  async updatePersonalData(
    targetUserId: string,
    data: Record<string, unknown>,
  ) {
    // Verifica permissão para atualizar dados pessoais
    this.permissionChecker.authorize(ACTIONS.UPDATE, RESOURCES.PERSONAL_DATA, {
      targetUserId,
      // ownData: this.permissionChecker.user.id === targetUserId
    });

    // Atualiza os dados... (implementação real)
    console.log(`Atualizando dados pessoais do usuário ${targetUserId}`, data);
  }

  async deleteUser(targetUserId: string) {
    // Apenas admin pode deletar usuários
    this.permissionChecker.authorize(ACTIONS.DELETE, RESOURCES.USERS);

    // Deleta o usuário... (implementação real)
    console.log(`Deletando usuário ${targetUserId}`);
  }
}

// Como usar em um endpoint/controller
export function exemploController() {
  const user: UserSession = {
    id: "current-user-id",
    role: UserRole.PROFESSOR,
    name: "Professor",
  };

  const checker = createPermissionChecker(user);
  // const userService = new UserService(checker);

  // Exemplo de uso em um endpoint
  try {
    // userService.getUserData("some-student-id");
    // userService.updatePersonalData("some-student-id", { address: "Nova rua" });
    // userService.deleteUser("some-user-id"); // Vai dar erro se não for admin
    console.log("Checker criado:", checker.isAdmin());
  } catch (error) {
    if (error instanceof AccessControlError) {
      console.log("Acesso negado:", error.message);
      // Retornar 403 Forbidden
    }
  }
}
