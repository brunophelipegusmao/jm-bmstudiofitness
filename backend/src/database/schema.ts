import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Enum para roles de usuÃ¡rio
export enum UserRole {
  MASTER = 'master',
  ADMIN = 'admin',
  FUNCIONARIO = 'funcionario',
  COACH = 'coach',
  ALUNO = 'aluno',
}

// Tabela de usuÃ¡rios
export const tbUsers = pgTable('tb_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  password: text('password'),
  userRole: text('user_role').default(UserRole.ALUNO).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
  createdAt: date('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de dados pessoais
export const tbPersonalData = pgTable('tb_personal_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  cpf: varchar('cpf', { length: 11 }).notNull().unique(),
  bornDate: date('born_date').notNull(),
  sex: text('sex').default('masculino').notNull(),
  address: text('address').notNull(),
  telephone: text('telephone').notNull(),
  email: text('email').notNull().unique(),
});

// Tabela de dados de saÃºde
export const tbHealthMetrics = pgTable('tb_health_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id)
    .unique(),
  heightCm: varchar('height_cm', { length: 5 }).notNull(),
  weightKg: varchar('weight_kg', { length: 5 }).notNull(),
  bloodType: varchar('blood_type', { length: 3 }).notNull(),
  hasPracticedSports: boolean('has_practiced_sports').notNull(),
  lastExercise: text('last_exercise').notNull(),
  historyDiseases: text('history_diseases').notNull(),
  medications: text('medications').notNull(),
  sportsHistory: text('sports_history').notNull(),
  allergies: text('allergies').notNull(),
  injuries: text('injuries').notNull(),
  alimentalRoutine: text('alimental_routine').notNull(),
  diaryRoutine: text('diary_routine').notNull(),
  useSupplements: boolean('use_supplements').notNull(),
  whatSupplements: text('what_supplements'),
  otherNotes: text('other_notes'),
  coachObservations: text('coach_observations'), // PÃºblico
  coachObservationsParticular: text('coach_observations_particular'), // Privado
  updatedAt: date('updated_at').defaultNow().notNull(),
});

// Tabela financeira
export const tbFinancial = pgTable('tb_financial', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  monthlyFeeValue: integer('monthly_fee_value').notNull(), // Em centavos
  dueDate: integer('due_date').notNull(), // Dia do mÃªs (1-31)
  paid: boolean('paid').default(false).notNull(),
  paymentMethod: text('payment_method').notNull(),
  lastPaymentDate: date('last_payment_date'),
  createdAt: date('created_at').defaultNow().notNull(),
  updatedAt: date('updated_at').defaultNow().notNull(),
});

// Tabela de check-ins
export const tbCheckIns = pgTable('tb_check_ins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  checkInDate: date('check_in_date').defaultNow().notNull(),
  checkInTime: text('check_in_time').notNull(),
  method: text('method').notNull(),
  identifier: text('identifier').notNull(),
  checkedInBy: uuid('checked_in_by').references(() => tbUsers.id), // Quem fez o check-in (funcionÃ¡rio/coach)
  createdAt: date('created_at').defaultNow().notNull(),
});

// Tabela de permissÃµes de funcionÃ¡rios (granular)
export const tbEmployeePermissions = pgTable('tb_employee_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id)
    .unique(),
  canViewFinancial: boolean('can_view_financial').default(false).notNull(),
  canEditFinancial: boolean('can_edit_financial').default(false).notNull(),
  canDeleteFinancial: boolean('can_delete_financial').default(false).notNull(),
  canManageCheckIns: boolean('can_manage_check_ins').default(true).notNull(),
  canViewStudents: boolean('can_view_students').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de permissÃµes de alunos (o que podem editar em saÃºde)
export const tbStudentPermissions = pgTable('tb_student_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id)
    .unique(),
  canEditHeight: boolean('can_edit_height').default(false).notNull(),
  canEditWeight: boolean('can_edit_weight').default(true).notNull(),
  canEditBloodType: boolean('can_edit_blood_type').default(false).notNull(),
  canEditMedications: boolean('can_edit_medications').default(true).notNull(),
  canEditAllergies: boolean('can_edit_allergies').default(true).notNull(),
  canEditInjuries: boolean('can_edit_injuries').default(true).notNull(),
  canEditRoutine: boolean('can_edit_routine').default(true).notNull(),
  canEditSupplements: boolean('can_edit_supplements').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de configuraÃ§Ãµes do estÃºdio
export const tbStudioSettings = pgTable('tb_studio_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  // InformaÃ§Ãµes bÃ¡sicas
  studioName: text('studio_name').notNull().default('JM Fitness Studio'),
  email: text('email').notNull().default('contato@jmfitness.com'),
  phone: text('phone').notNull().default('(21) 98099-5749'),
  address: text('address').notNull().default('Rua das Flores, 123'),
  city: text('city').notNull().default('Rio de Janeiro'),
  state: text('state').notNull().default('RJ'),
  zipCode: text('zip_code').notNull().default('20000-000'),

  // HorÃ¡rios de funcionamento
  mondayOpen: text('monday_open').notNull().default('06:00'),
  mondayClose: text('monday_close').notNull().default('22:00'),
  tuesdayOpen: text('tuesday_open').notNull().default('06:00'),
  tuesdayClose: text('tuesday_close').notNull().default('22:00'),
  wednesdayOpen: text('wednesday_open').notNull().default('06:00'),
  wednesdayClose: text('wednesday_close').notNull().default('22:00'),
  thursdayOpen: text('thursday_open').notNull().default('06:00'),
  thursdayClose: text('thursday_close').notNull().default('22:00'),
  fridayOpen: text('friday_open').notNull().default('06:00'),
  fridayClose: text('friday_close').notNull().default('22:00'),
  saturdayOpen: text('saturday_open'),
  saturdayClose: text('saturday_close'),
  sundayOpen: text('sunday_open'),
  sundayClose: text('sunday_close'),

  // Valores e planos (em centavos)
  monthlyFeeDefault: integer('monthly_fee_default').notNull().default(15000),
  registrationFee: integer('registration_fee').notNull().default(5000),
  personalTrainingHourlyRate: integer('personal_training_hourly_rate')
    .notNull()
    .default(10000),

  // PolÃ­ticas
  paymentDueDateDefault: integer('payment_due_date_default')
    .notNull()
    .default(10),
  gracePeriodDays: integer('grace_period_days').notNull().default(5),
  maxCheckInsPerDay: integer('max_check_ins_per_day').notNull().default(2),
  allowWeekendCheckIn: boolean('allow_weekend_check_in')
    .notNull()
    .default(false),

  // Lista de Espera
  waitlistEnabled: boolean('waitlist_enabled').notNull().default(false),

  // Modo ManutenÃ§Ã£o
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  maintenanceRedirectUrl: text('maintenance_redirect_url').default('/waitlist'),

  // Controle de Acesso Ã s Rotas
  routeHomeEnabled: boolean('route_home_enabled').notNull().default(true),
  routeUserEnabled: boolean('route_user_enabled').notNull().default(true),
  routeCoachEnabled: boolean('route_coach_enabled').notNull().default(true),
  routeEmployeeEnabled: boolean('route_employee_enabled')
    .notNull()
    .default(true),
  routeShoppingEnabled: boolean('route_shopping_enabled')
    .notNull()
    .default(true),
  routeBlogEnabled: boolean('route_blog_enabled').notNull().default(true),
  routeEventsEnabled: boolean('route_events_enabled').notNull().default(true),
  routeServicesEnabled: boolean('route_services_enabled')
    .notNull()
    .default(true),
  routeContactEnabled: boolean('route_contact_enabled').notNull().default(true),
  routeWaitlistEnabled: boolean('route_waitlist_enabled')
    .notNull()
    .default(true),

  // Termos e polÃ­ticas de texto
  termsAndConditions: text('terms_and_conditions'),
  privacyPolicy: text('privacy_policy'),
  cancellationPolicy: text('cancellation_policy'),

  // Imagens do carrossel da pÃ¡gina inicial (mÃ¡ximo 7)
  carouselImage1: text('carousel_image_1').default('/gym1.jpg'),
  carouselImage2: text('carousel_image_2').default('/gym2.jpg'),
  carouselImage3: text('carousel_image_3').default('/gym3.jpg'),
  carouselImage4: text('carousel_image_4'),
  carouselImage5: text('carousel_image_5'),
  carouselImage6: text('carousel_image_6'),
  carouselImage7: text('carousel_image_7'),
  carouselCaption1: text('carousel_caption_1'),
  carouselCaption2: text('carousel_caption_2'),
  carouselCaption3: text('carousel_caption_3'),
  carouselCaption4: text('carousel_caption_4'),
  carouselCaption5: text('carousel_caption_5'),
  carouselCaption6: text('carousel_caption_6'),
  carouselCaption7: text('carousel_caption_7'),
  carouselEnabled: boolean('carousel_enabled').notNull().default(true),

  // ConteÃºdo customizÃ¡vel da home
  homeHistoryMarkdown: text('home_history_markdown'),
  homeHistoryImage: text('home_history_image'),
  foundationDate: date('foundation_date'),
  promoBannerEnabled: boolean('promo_banner_enabled').default(false),
  promoBannerMediaType: text('promo_banner_media_type'),
  promoBannerUrl: text('promo_banner_url'),
  promoBannerTitle: text('promo_banner_title'),
  promoBannerDescription: text('promo_banner_description'),
  promoBannerLink: text('promo_banner_link'),

  // Metadados
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de tokens de reset de senha
export const tbPasswordResetTokens = pgTable('tb_password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de funcionÃ¡rios
export const tbEmployees = pgTable('tb_employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => tbUsers.id),
  position: text('position').notNull(),
  shift: text('shift').notNull(),
  shiftStartTime: text('shift_start_time').notNull(),
  shiftEndTime: text('shift_end_time').notNull(),
  salaryInCents: integer('salary_in_cents').notNull(),
  hireDate: date('hire_date').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de histÃ³rico de salÃ¡rios
export const tbEmployeeSalaryHistory = pgTable('tb_employee_salary_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => tbEmployees.id),
  previousSalaryInCents: integer('previous_salary_in_cents').notNull(),
  newSalaryInCents: integer('new_salary_in_cents').notNull(),
  changeReason: text('change_reason'),
  changedBy: uuid('changed_by')
    .notNull()
    .references(() => tbUsers.id),
  effectiveDate: date('effective_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de registro de ponto
export const tbEmployeeTimeRecords = pgTable('tb_employee_time_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => tbEmployees.id),
  date: date('date').notNull(),
  checkInTime: text('check_in_time'),
  checkOutTime: text('check_out_time'),
  totalHours: text('total_hours'),
  notes: text('notes'),
  approved: boolean('approved').default(false).notNull(),
  approvedBy: uuid('approved_by').references(() => tbUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de planos
export const tbPlans = pgTable('tb_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priceInCents: integer('price_in_cents').notNull(),
  durationInDays: integer('duration_in_days').notNull(),
  features: text('features').array(),
  isPopular: boolean('is_popular').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de lista de espera
export const tbWaitlist = pgTable('tb_waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  interestPlanId: uuid('interest_plan_id').references(() => tbPlans.id),
  source: text('source'),
  notes: text('notes'),
  status: text('status').default('pending').notNull(),
  contactedAt: timestamp('contacted_at'),
  convertedAt: timestamp('converted_at'),
  convertedToUserId: uuid('converted_to_user_id').references(() => tbUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de categorias (legado do blog)
export const tbBlogCategories = pgTable('tb_blog_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de eventos (usa tabela legada tb_blog_posts)
export const tbBlogPosts = pgTable('tb_blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  eventDate: date('event_date').notNull(),
  eventTime: text('event_time'),
  location: text('location'),
  hideLocation: boolean('hide_location').notNull().default(false),
  requireAttendance: boolean('require_attendance').notNull().default(false),
  coverImage: text('cover_image'),
  categoryId: uuid('category_id').references(() => tbBlogCategories.id),
  authorId: uuid('author_id')
    .notNull()
    .references(() => tbUsers.id),
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  viewCount: integer('view_count').default(0).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de despesas do estÃºdio
export const tbExpenses = pgTable('tb_expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  description: text('description').notNull(),
  amountInCents: integer('amount_in_cents').notNull(),
  category: text('category').notNull(),
  paymentMethod: text('payment_method'),
  expenseDate: date('expense_date').notNull(),
  receipt: text('receipt'),
  notes: text('notes'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => tbUsers.id),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de recibos de pagamentos
export const tbPaymentReceipts = pgTable('tb_payment_receipts', {
  id: uuid('id').defaultRandom().primaryKey(),
  financialId: uuid('financial_id')
    .notNull()
    .references(() => tbFinancial.id),
  receiptNumber: text('receipt_number').notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  issuedBy: uuid('issued_by')
    .notNull()
    .references(() => tbUsers.id),
  pdfUrl: text('pdf_url'),
  emailSentAt: timestamp('email_sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ConfirmaÃ§Ãµes de presenÃ§a em eventos
export const tbEventAttendance = pgTable('tb_event_attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => tbBlogPosts.id),
  name: text('name').notNull(),
  email: text('email'),
  confirmedAt: timestamp('confirmed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Eventos pessoais de alunos
export const tbPersonalEvents = pgTable('tb_personal_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  eventDate: date('event_date').notNull(),
  eventTime: text('event_time'),
  location: text('location'),
  hideLocation: boolean('hide_location').notNull().default(false),
  requestPublic: boolean('request_public').notNull().default(false),
  approvalStatus: text('approval_status').notNull().default('private'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de medidas corporais
export const tbBodyMeasurements = pgTable('tb_body_measurements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => tbUsers.id),
  measurementDate: date('measurement_date').notNull(),
  weight: text('weight'),
  height: text('height'),
  bodyFatPercentage: text('body_fat_percentage'),
  bodyFatMethod: text('body_fat_method'),
  muscleMass: text('muscle_mass'),
  chest: text('chest'),
  waist: text('waist'),
  hips: text('hips'),
  leftArm: text('left_arm'),
  rightArm: text('right_arm'),
  leftThigh: text('left_thigh'),
  rightThigh: text('right_thigh'),
  leftCalf: text('left_calf'),
  rightCalf: text('right_calf'),
  // Dobras cutâneas (mm)
  chestSkinfoldMm: text('chest_skinfold_mm'),
  abdominalSkinfoldMm: text('abdominal_skinfold_mm'),
  suprailiacSkinfoldMm: text('suprailiac_skinfold_mm'),
  thighSkinfoldMm: text('thigh_skinfold_mm'),
  tricepsSkinfoldMm: text('triceps_skinfold_mm'),
  axillarySkinfoldMm: text('axillary_skinfold_mm'),
  subscapularSkinfoldMm: text('subscapular_skinfold_mm'),
  notes: text('notes'),
  measuredBy: uuid('measured_by').references(() => tbUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

