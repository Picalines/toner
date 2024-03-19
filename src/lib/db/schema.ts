import { relations } from 'drizzle-orm'
import { date, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: serial('id').primaryKey().notNull(),
	login: varchar('login', { length: 32 }),
	displayName: varchar('displayName', { length: 64 }),
	createdDate: date('createdDate').defaultNow(),
})

export const userRelations = relations(users, ({ one }) => ({
	author: one(authors, { fields: [users.id], references: [authors.userId] }),
	listener: one(listeners, {
		fields: [users.id],
		references: [listeners.userId],
	}),
}))

export const authors = pgTable('authors', {
	userId: integer('userId')
		.primaryKey()
		.references(() => users.id),
})

export const listeners = pgTable('listeners', {
	userId: integer('userId')
		.primaryKey()
		.references(() => users.id),
})
