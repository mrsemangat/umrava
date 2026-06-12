import {
  pgTable, text, timestamp, boolean, integer, date, jsonb,
  primaryKey, unique,
} from 'drizzle-orm/pg-core'
// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  password: text('password'),          // bcrypt hash, null untuk OAuth user
  fullName: text('full_name'),
  city: text('city'),
  departureDate: date('departure_date'),
  plan: text('plan').default('free'),  // free | premium
  premiumActivatedAt: timestamp('premium_activated_at', { withTimezone: true }),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Accounts (NextAuth OAuth) ────────────────────────────────────────────────
export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })])

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Doa Favorites ────────────────────────────────────────────────────────────
export const doaFavorites = pgTable('doa_favorites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  doaId: text('doa_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [unique().on(t.userId, t.doaId)])

// ─── Ibadah Progress ──────────────────────────────────────────────────────────
export const ibadahProgress = pgTable('ibadah_progress', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tahapId: text('tahap_id').notNull(),
  counterValue: integer('counter_value').default(0),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [unique().on(t.userId, t.tahapId)])

// ─── Checklist Progress ───────────────────────────────────────────────────────
export const checklistProgress = pgTable('checklist_progress', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull(),
  checked: boolean('checked').default(false),
  checkedAt: timestamp('checked_at', { withTimezone: true }),
}, (t) => [unique().on(t.userId, t.itemId)])

// ─── Itineraries ──────────────────────────────────────────────────────────────
export const itineraries = pgTable('itineraries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').default('Itinerary Umroh Saya'),
  templateId: text('template_id'),
  days: jsonb('days').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Cost Estimates ───────────────────────────────────────────────────────────
export const costEstimates = pgTable('cost_estimates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').default('Estimasi Biaya'),
  config: jsonb('config').notNull(),
  result: jsonb('result').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── Travel Notes ─────────────────────────────────────────────────────────────
export const travelNotes = pgTable('travel_notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  flightNumber: text('flight_number'),
  hotelMakkah: text('hotel_makkah'),
  hotelMadinah: text('hotel_madinah'),
  travelAgent: text('travel_agent'),
  emergencyContact: text('emergency_contact'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Manual Payments ──────────────────────────────────────────────────────────
export const manualPayments = pgTable('manual_payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  merchantOrderId: text('merchant_order_id').unique().notNull(),
  userName: text('user_name'),
  userEmail: text('user_email'),
  amount: integer('amount').notNull().default(49000),
  bankName: text('bank_name'),
  status: text('status').notNull().default('pending'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Webhook Logs ─────────────────────────────────────────────────────────────
export const webhookLogs = pgTable('webhook_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  source: text('source'),
  event: text('event'),
  orderId: text('order_id'),
  buyerEmail: text('buyer_email'),
  buyerName: text('buyer_name'),
  amount: integer('amount'),
  status: text('status'),
  userId: text('user_id'),
  userUpgraded: boolean('user_upgraded').default(false),
  payload: jsonb('payload'),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
