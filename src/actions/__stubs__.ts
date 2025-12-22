/**
 * STUBS TEMPORÁRIOS - Server Actions
 *
 * Estes são stubs temporários para permitir que o código compile
 * enquanto os endpoints da API estão sendo implementados.
 *
 * TODO: Remover este arquivo quando todos os componentes migrarem para API
 */

// ============================================
// ADMIN ACTIONS
// ============================================

export async function createEmployeeAction(...args: any[]) {
  console.warn(
    "[STUB] createEmployeeAction chamado. Implemente o endpoint /api/employees",
  );
  return { success: false, message: "Funcionalidade em migração" };
}

export async function updateEmployeeAction(...args: any[]) {
  console.warn("[STUB] updateEmployeeAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function softDeleteEmployeeAction(...args: any[]) {
  console.warn("[STUB] softDeleteEmployeeAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function reactivateEmployeeAction(...args: any[]) {
  console.warn("[STUB] reactivateEmployeeAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deleteStudentAction(...args: any[]) {
  console.warn("[STUB] deleteStudentAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function toggleUserStatusAction(...args: any[]) {
  console.warn("[STUB] toggleUserStatusAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function reactivateStudentAction(...args: any[]) {
  console.warn("[STUB] reactivateStudentAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function softDeleteStudentAction(...args: any[]) {
  console.warn("[STUB] softDeleteStudentAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getCurrentUserIdAction(...args: any[]) {
  console.warn("[STUB] getCurrentUserIdAction chamado");
  return null;
}

export async function getAllStudentsFullDataAction(...args: any[]) {
  console.warn("[STUB] getAllStudentsFullDataAction chamado");
  return { success: false, data: [] };
}

export async function getUserDataAction(...args: any[]) {
  console.warn("[STUB] getUserDataAction chamado");
  return null;
}

export async function updateUserAction(...args: any[]) {
  console.warn("[STUB] updateUserAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function generateUserPasswordAction(...args: any[]) {
  console.warn("[STUB] generateUserPasswordAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function sendPasswordResetLinkAction(...args: any[]) {
  console.warn("[STUB] sendPasswordResetLinkAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function updateStudentAction(...args: any[]) {
  console.warn("[STUB] updateStudentAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getExpensesOverviewAction(...args: any[]) {
  console.warn("[STUB] getExpensesOverviewAction chamado");
  return [];
}

export async function getFinancialReportsAction(...args: any[]) {
  console.warn("[STUB] getFinancialReportsAction chamado");
  return { success: false, data: null };
}

export async function getPaymentDueDatesAction(...args: any[]) {
  console.warn("[STUB] getPaymentDueDatesAction chamado");
  return [];
}

export async function getDashboardStatsAction(...args: any[]) {
  console.warn("[STUB] getDashboardStatsAction chamado");
  return { success: false, data: null };
}

export async function getStudentsPaymentsAction(...args: any[]) {
  console.warn("[STUB] getStudentsPaymentsAction chamado");
  return { success: false, paidStudents: [], pendingStudents: [] };
}

export async function updatePaymentAction(...args: any[]) {
  console.warn("[STUB] updatePaymentAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getStudioSettingsAction(...args: any[]) {
  console.warn("[STUB] getStudioSettingsAction chamado");
  return { success: false, data: null };
}

export async function updateStudioSettingsAction(...args: any[]) {
  console.warn("[STUB] updateStudioSettingsAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function updatePostAction(...args: any[]) {
  console.warn("[STUB] updatePostAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getCategoriesAction(...args: any[]) {
  console.warn("[STUB] getCategoriesAction chamado");
  return [];
}

export async function getEmployeesAction(...args: any[]) {
  console.warn("[STUB] getEmployeesAction chamado");
  return [];
}

export async function getEmployeeTimeRecordsAction(...args: any[]) {
  console.warn("[STUB] getEmployeeTimeRecordsAction chamado");
  return [];
}

export async function getUsersAction(...args: any[]) {
  console.warn("[STUB] getUsersAction chamado");
  return [];
}

export async function getDashboardDetailedAction(...args: any[]) {
  console.warn("[STUB] getDashboardDetailedAction chamado");
  return null;
}

export async function getStudentMonthlyPaymentsAction(...args: any[]) {
  console.warn("[STUB] getStudentMonthlyPaymentsAction chamado");
  return { success: false, payments: [] };
}

// ============================================
// EMPLOYEE ACTIONS
// ============================================

export async function employeeCheckInAction(...args: any[]) {
  console.warn("[STUB] employeeCheckInAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getTodayCheckInsAction(...args: any[]) {
  console.warn("[STUB] getTodayCheckInsAction chamado");
  return { success: false, checkIns: [] };
}

export async function generateReceiptAction(...args: any[]) {
  console.warn("[STUB] generateReceiptAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function manualReceiptAction(...args: any[]) {
  console.warn("[STUB] manualReceiptAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function generateManualReceiptAction(...args: any[]) {
  console.warn("[STUB] generateManualReceiptAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getReceiptsLogAction(...args: any[]) {
  console.warn("[STUB] getReceiptsLogAction chamado");
  return { success: false, receipts: [] };
}

export type ManualReceiptData = any;

// ============================================
// USER ACTIONS
// ============================================

export async function quickCheckInAction(...args: any[]) {
  console.warn("[STUB] quickCheckInAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function createAlunoAction(...args: any[]) {
  console.warn("[STUB] createAlunoAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

// ============================================
// PUBLIC ACTIONS
// ============================================

export async function getPublishedPostsAction(...args: any[]) {
  console.warn("[STUB] getPublishedPostsAction chamado");
  return [];
}

// ============================================
// SETUP ACTIONS
// ============================================

export async function createFirstAdmin(...args: any[]) {
  console.warn("[STUB] createFirstAdmin chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function checkDatabase(...args: any[]) {
  console.warn("[STUB] checkDatabase chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

// ============================================
// AUTH ACTIONS
// ============================================

export async function logoutAction(...args: any[]) {
  console.warn("[STUB] logoutAction chamado. Use useAuth().logout()");
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  }
}

export async function logoutFormAction(...args: any[]) {
  console.warn("[STUB] logoutFormAction chamado. Use useAuth().logout()");
  return { success: true };
}

// ============================================
// WAITLIST ACTIONS
// ============================================

export async function getWaitlistPublicAction(...args: any[]) {
  console.warn("[STUB] getWaitlistPublicAction chamado");
  return { success: false, waitlist: [] };
}

export async function joinWaitlistAction(...args: any[]) {
  console.warn("[STUB] joinWaitlistAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function exportWaitlistPdfAction(...args: any[]) {
  console.warn("[STUB] exportWaitlistPdfAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function completeEnrollFromWaitlistAction(...args: any[]) {
  console.warn("[STUB] completeEnrollFromWaitlistAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deleteWaitlistEntryAction(...args: any[]) {
  console.warn("[STUB] deleteWaitlistEntryAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getWaitlistAdminAction(...args: any[]) {
  console.warn("[STUB] getWaitlistAdminAction chamado");
  return { success: false, waitlist: [] };
}

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

export async function createUserAction(...args: any[]) {
  console.warn("[STUB] createUserAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deleteUserAction(...args: any[]) {
  console.warn("[STUB] deleteUserAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getAllUsersAction(...args: any[]) {
  console.warn("[STUB] getAllUsersAction chamado");
  return { success: false, users: [] };
}

// ============================================
// BLOG ACTIONS
// ============================================

export async function incrementPostViewsAction(...args: any[]) {
  console.warn("[STUB] incrementPostViewsAction chamado");
  return { success: true };
}

export async function getPublishedPostBySlugAction(...args: any[]) {
  console.warn("[STUB] getPublishedPostBySlugAction chamado");
  return null;
}

export async function createPostAction(...args: any[]) {
  console.warn("[STUB] createPostAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deletePostAction(...args: any[]) {
  console.warn("[STUB] deletePostAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getPostsAction(...args: any[]) {
  console.warn("[STUB] getPostsAction chamado");
  return [];
}

// ============================================
// CATEGORIES ACTIONS
// ============================================

export async function createCategoryAction(...args: any[]) {
  console.warn("[STUB] createCategoryAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function updateCategoryAction(...args: any[]) {
  console.warn("[STUB] updateCategoryAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deleteCategoryAction(...args: any[]) {
  console.warn("[STUB] deleteCategoryAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

// ============================================
// EXPENSES ACTIONS
// ============================================

export async function createExpenseAction(...args: any[]) {
  console.warn("[STUB] createExpenseAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function updateExpenseAction(...args: any[]) {
  console.warn("[STUB] updateExpenseAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deleteExpenseAction(...args: any[]) {
  console.warn("[STUB] deleteExpenseAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getExpensesAction(...args: any[]) {
  console.warn("[STUB] getExpensesAction chamado");
  return [];
}

export type CreateExpenseInput = any;

// ============================================
// MAINTENANCE ACTIONS
// ============================================

export async function getMaintenanceSettings(...args: any[]) {
  console.warn("[STUB] getMaintenanceSettings chamado");
  return { enabled: false, message: "" };
}

export async function updateMaintenanceSettings(...args: any[]) {
  console.warn("[STUB] updateMaintenanceSettings chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

// ============================================
// PLANS ACTIONS
// ============================================

export async function createPlanAction(...args: any[]) {
  console.warn("[STUB] createPlanAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function updatePlanAction(...args: any[]) {
  console.warn("[STUB] updatePlanAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function deletePlanAction(...args: any[]) {
  console.warn("[STUB] deletePlanAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getPlansAdminAction(...args: any[]) {
  console.warn("[STUB] getPlansAdminAction chamado");
  return [];
}

export async function getPlansAction(...args: any[]) {
  console.warn("[STUB] getPlansAction chamado");
  return [];
}

export async function getPublicPlansAction(...args: any[]) {
  console.warn("[STUB] getPublicPlansAction chamado");
  return [];
}

export type Plan = any;
export type PublicPlan = any;

// ============================================
// COACH ACTIONS
// ============================================

export async function getStudentsHealthDataAction(...args: any[]) {
  console.warn("[STUB] getStudentsHealthDataAction chamado");
  return { success: false, students: [] };
}

export async function professorCheckInAction(...args: any[]) {
  console.warn("[STUB] professorCheckInAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getProfessorCheckInsAction(...args: any[]) {
  console.warn("[STUB] getProfessorCheckInsAction chamado");
  return { success: false, checkIns: [] };
}

export async function updateCoachObservationsAction(...args: any[]) {
  console.warn("[STUB] updateCoachObservationsAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export type StudentHealthData = any;

// ============================================
// EMPLOYEE TIME RECORDS
// ============================================

export async function registerTimeRecordAction(...args: any[]) {
  console.warn("[STUB] registerTimeRecordAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export type TimeRecord = any;
export type EmployeeFullData = any;

// ============================================
// PAYMENT ACTIONS
// ============================================

export async function updatePaymentStatusAction(...args: any[]) {
  console.warn("[STUB] updatePaymentStatusAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function payMonthlyFeeAction(...args: any[]) {
  console.warn("[STUB] payMonthlyFeeAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getMyPaymentStatusAction(...args: any[]) {
  console.warn("[STUB] getMyPaymentStatusAction chamado");
  return { success: false, payment: null };
}

export async function generatePaymentReceiptAction(...args: any[]) {
  console.warn("[STUB] generatePaymentReceiptAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export type PaymentReceiptData = any;
export type StudentMonthlyPayment = any;

// ============================================
// USER ACTIONS (ADDITIONAL)
// ============================================

export async function updatePassword(...args: any[]) {
  console.warn("[STUB] updatePassword chamado. Use /api/user/change-password");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function addHealthEntryAction(...args: any[]) {
  console.warn("[STUB] addHealthEntryAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function addStudentHealthEntryAction(...args: any[]) {
  console.warn("[STUB] addStudentHealthEntryAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getStudentHealthHistoryAction(...args: any[]) {
  console.warn("[STUB] getStudentHealthHistoryAction chamado");
  return { success: false, entries: [] };
}

export async function checkInAction(...args: any[]) {
  console.warn("[STUB] checkInAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function confirmUserAction(...args: any[]) {
  console.warn("[STUB] confirmUserAction chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getCheckInsAction(...args: any[]) {
  console.warn("[STUB] getCheckInsAction chamado");
  return { success: false, checkIns: [] };
}

export async function getStudentCheckInsAction(...args: any[]) {
  console.warn("[STUB] getStudentCheckInsAction chamado");
  return { success: false, checkIns: [] };
}

export async function getHealthHistoryAction(...args: any[]) {
  console.warn("[STUB] getHealthHistoryAction chamado");
  return { success: false, entries: [] };
}

export async function getStudentDataAction(...args: any[]) {
  console.warn("[STUB] getStudentDataAction chamado");
  return null;
}

// ============================================
// SETUP ACTIONS (ADDITIONAL)
// ============================================

export async function hasAdminUser(...args: any[]) {
  console.warn("[STUB] hasAdminUser chamado");
  return false;
}

export async function testDatabaseConnection(...args: any[]) {
  console.warn("[STUB] testDatabaseConnection chamado");
  return { success: false, message: "Funcionalidade em migração" };
}

export async function getDatabaseInfo(...args: any[]) {
  console.warn("[STUB] getDatabaseInfo chamado");
  return { success: false, info: null };
}
