import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const transactions = pgTable("transactions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  type: text("type", { enum: ["entrada", "gasto"] }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["recebido", "pendente", "pago"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fixedBills = pgTable("fixed_bills", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  recurrence: text("recurrence", {
    enum: ["monthly", "annual", "weekly"],
  }).notNull(),
  dueDay: integer("due_day").notNull(),
  status: text("status", { enum: ["paid", "pending", "overdue"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const installments = pgTable("installments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalInstallments: integer("total_installments").notNull(),
  paidInstallments: integer("paid_installments").notNull().default(0),
  dueDay: integer("due_day").notNull(),
  startDate: date("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savingsGoals = pgTable("savings_goals", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  current: numeric("current", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  iconKey: text("icon_key").notNull().default("target"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
});
