import { relations } from 'drizzle-orm'
import {
	doublePrecision,
	foreignKey,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	serial,
	smallint,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

export const accountTable = pgTable('account', {
	id: serial('id').primaryKey(),
	login: varchar('login', { length: 32 }).notNull().unique(),
	passwordHash: text('hashed_password').notNull(),
	displayName: varchar('display_name', { length: 64 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const accountRelations = relations(accountTable, ({ one }) => ({
	author: one(authorTable, {
		fields: [accountTable.id],
		references: [authorTable.accountId],
	}),
	listener: one(listenerTable, {
		fields: [accountTable.id],
		references: [listenerTable.accountId],
	}),
}))

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => accountTable.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
})

export const authorTable = pgTable('author', {
	accountId: integer('account_id')
		.primaryKey()
		.references(() => accountTable.id, { onDelete: 'cascade' }),
})

export const authorRelations = relations(authorTable, ({ one, many }) => ({
	account: one(accountTable, {
		fields: [authorTable.accountId],
		references: [accountTable.id],
	}),
	compositions: many(compositionTable),
	publications: many(publicationTable),
}))

export const listenerTable = pgTable('listener', {
	accountId: integer('account_id')
		.primaryKey()
		.references(() => accountTable.id, { onDelete: 'cascade' }),
})

export const listenerRelations = relations(listenerTable, ({ one, many }) => ({
	account: one(accountTable, {
		fields: [listenerTable.accountId],
		references: [accountTable.id],
	}),
	listens: many(listenTable),
	subscriptions: many(subscriptionTable),
	reactions: many(reactionTable),
}))

export const subscriptionTable = pgTable(
	'subscription',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listenerTable.accountId, { onDelete: 'cascade' }),
		authorId: integer('author_id')
			.notNull()
			.references(() => authorTable.accountId, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	table => ({
		primaryKey: primaryKey({ columns: [table.listenerId, table.authorId] }),
	}),
)

export const subscriptionRelations = relations(
	subscriptionTable,
	({ one }) => ({
		listener: one(listenerTable, {
			fields: [subscriptionTable.listenerId],
			references: [listenerTable.accountId],
		}),
		author: one(authorTable, {
			fields: [subscriptionTable.authorId],
			references: [authorTable.accountId],
		}),
	}),
)

// publication

export const publicationTable = pgTable('publication', {
	id: serial('id').primaryKey(),
	authorId: integer('author_id')
		.notNull()
		.references(() => authorTable.accountId, { onDelete: 'cascade' }),
	compositionId: integer('composition_id')
		.notNull()
		.references(() => compositionTable.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 64 }).notNull(),
	description: text('description').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const publicationRelations = relations(
	publicationTable,
	({ one, many }) => ({
		author: one(authorTable, {
			fields: [publicationTable.authorId],
			references: [authorTable.accountId],
		}),
		composition: one(compositionTable, {
			fields: [publicationTable.compositionId],
			references: [compositionTable.id],
		}),
		listens: many(listenTable),
	}),
)

export const listenTable = pgTable(
	'listen',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listenerTable.accountId, { onDelete: 'cascade' }),
		publicationId: integer('publication_id')
			.notNull()
			.references(() => publicationTable.id, {
				onDelete: 'cascade',
			}),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	table => ({
		primaryKey: primaryKey({
			columns: [table.listenerId, table.publicationId],
		}),
	}),
)

export const listenRelations = relations(listenTable, ({ one }) => ({
	listener: one(listenerTable, {
		fields: [listenTable.listenerId],
		references: [listenerTable.accountId],
	}),
	publication: one(publicationTable, {
		fields: [listenTable.publicationId],
		references: [publicationTable.id],
	}),
}))

export const reactionType = pgEnum('reaction_type', [
	'heart',
	'brokenHeart',
	'smile',
	'laugh',
])

export const reactionTable = pgTable(
	'reaction',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listenerTable.accountId, { onDelete: 'cascade' }),
		publicationId: integer('publication_id')
			.notNull()
			.references(() => publicationTable.id, {
				onDelete: 'cascade',
			}),
		type: reactionType('type').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	table => ({
		primaryKey: primaryKey({
			columns: [table.listenerId, table.publicationId],
		}),
	}),
)

export const reactionRelations = relations(reactionTable, ({ one }) => ({
	listener: one(listenerTable, {
		fields: [reactionTable.listenerId],
		references: [listenerTable.accountId],
	}),
	publication: one(publicationTable, {
		fields: [reactionTable.publicationId],
		references: [publicationTable.id],
	}),
}))

// composition

export const compositionTable = pgTable('composition', {
	id: serial('id').primaryKey(),
	authorId: integer('author_id')
		.notNull()
		.references(() => authorTable.accountId, { onDelete: 'cascade' }),
	name: varchar('name', { length: 64 }).notNull(),
	description: text('description').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at'),
})

export const compositionRelations = relations(
	compositionTable,
	({ one, many }) => ({
		author: one(authorTable, {
			fields: [compositionTable.authorId],
			references: [authorTable.accountId],
		}),
		musicLayers: many(musicLayerTable),
		audioNodes: many(audioNodeTable),
		audioNodeEdges: many(audioEdgeTable),
	}),
)

export const musicLayerTable = pgTable(
	'music_layer',
	{
		compositionId: integer('composition_id')
			.notNull()
			.references(() => compositionTable.id, { onDelete: 'cascade' }),
		id: varchar('id', { length: 36 }).notNull(),
		name: varchar('name', { length: 32 }).notNull(),
	},
	table => ({
		primaryKey: primaryKey({ columns: [table.compositionId, table.id] }),
	}),
)

export const musicLayerRelations = relations(
	musicLayerTable,
	({ one, many }) => ({
		composition: one(compositionTable, {
			fields: [musicLayerTable.compositionId],
			references: [compositionTable.id],
		}),
		musicKeys: many(musicKeyTable),
	}),
)

export const musicKeyTable = pgTable(
	'music_key',
	{
		compositionId: integer('composition_id').notNull(),
		layerId: varchar('layer_id', { length: 36 }).notNull(),
		id: varchar('id', { length: 36 }).notNull(),
		instrumentId: varchar('instrument_id', { length: 36 }).notNull(),
		time: integer('time').notNull(),
		duration: integer('duration').notNull(),
		velocity: real('velocity').notNull(),
		note: smallint('note').notNull(), // number of half steps from C0
	},
	table => ({
		foreignKey: foreignKey({
			name: 'composition_layer_key',
			columns: [table.compositionId, table.layerId],
			foreignColumns: [musicLayerTable.compositionId, musicLayerTable.id],
		}).onDelete('cascade'),
		primaryKey: primaryKey({
			columns: [table.compositionId, table.id],
		}),
	}),
)

export const musicKeyRelations = relations(musicKeyTable, ({ one }) => ({
	composition: one(compositionTable, {
		fields: [musicKeyTable.id],
		references: [compositionTable.id],
	}),
	layer: one(musicLayerTable, {
		fields: [musicKeyTable.layerId],
		references: [musicLayerTable.id],
	}),
}))

export const audioNodeTable = pgTable(
	'audio_node',
	{
		compositionId: integer('composition_id')
			.notNull()
			.references(() => compositionTable.id, { onDelete: 'cascade' }),
		id: varchar('id', { length: 36 }).notNull(),
		type: varchar('type', { length: 32 }).notNull(),
		label: varchar('label', { length: 32 }),
		centerX: doublePrecision('center_x').notNull().default(0),
		centerY: doublePrecision('center_y').notNull().default(0),
		properties: jsonb('properties').notNull().default({}),
	},
	table => ({
		primaryKey: primaryKey({
			name: 'primary_key',
			columns: [table.compositionId, table.id],
		}),
	}),
)

export const audioNodeRelations = relations(audioNodeTable, ({ one }) => ({
	composition: one(compositionTable, {
		fields: [audioNodeTable.compositionId],
		references: [compositionTable.id],
	}),
}))

export const audioEdgeTable = pgTable(
	'audio_edge',
	{
		compositionId: integer('composition_id')
			.notNull()
			.references(() => compositionTable.id, { onDelete: 'cascade' }),
		id: varchar('id', { length: 36 }).notNull(),
		sourceId: varchar('source_id', { length: 36 }).notNull(),
		targetId: varchar('target_id', { length: 36 }).notNull(),
		sourceSocket: integer('source_socket').notNull().default(0),
		targetSocket: integer('target_socket').notNull().default(0),
	},
	table => ({
		primaryKey: primaryKey({ columns: [table.compositionId, table.id] }),
	}),
)

export const audioNodeEdgeRelations = relations(audioEdgeTable, ({ one }) => ({
	composition: one(compositionTable, {
		fields: [audioEdgeTable.compositionId],
		references: [compositionTable.id],
	}),
}))
