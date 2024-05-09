import { relations } from 'drizzle-orm'
import {
	doublePrecision,
	integer,
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
	author: one(authorTable),
	listener: one(listenerTable),
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
	account: one(accountTable),
	compositions: many(compositionTable),
	publications: many(publicationTable),
}))

export const listenerTable = pgTable('listener', {
	accountId: integer('account_id')
		.primaryKey()
		.references(() => accountTable.id, { onDelete: 'cascade' }),
})

export const listenerRelations = relations(listenerTable, ({ one, many }) => ({
	account: one(accountTable),
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
		listener: one(listenerTable),
		author: one(authorTable),
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
		author: one(authorTable),
		composition: one(compositionTable),
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
	listener: one(listenerTable),
	publication: one(publicationTable),
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
	listener: one(listenerTable),
	publication: one(publicationTable),
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
})

export const compositionRelations = relations(
	compositionTable,
	({ one, many }) => ({
		author: one(authorTable),
		keyLayers: many(keyLayerTable),
		nodes: many(nodeTable),
		nodeConnections: many(nodeConnectionTable),
	}),
)

export const keyLayerTable = pgTable('key_layer', {
	id: serial('id').primaryKey(),
	compositionId: integer('composition_id')
		.notNull()
		.references(() => compositionTable.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 32 }).notNull(),
})

export const keyLayerRelations = relations(keyLayerTable, ({ one, many }) => ({
	composition: one(compositionTable),
	keys: many(keyTable),
}))

export const keyTable = pgTable('key', {
	id: serial('id').primaryKey(),
	layerId: integer('layer_id')
		.notNull()
		.references(() => keyLayerTable.id, { onDelete: 'cascade' }),
	synthNodeId: integer('synth_node_id')
		.notNull()
		.references(() => nodeTable.id, { onDelete: 'cascade' }),
	time: integer('time').notNull(),
	duration: integer('duration').notNull(),
	velocity: real('velocity').notNull(),
	note: smallint('note').notNull(), // number of half steps from C0
})

export const keyRelations = relations(keyTable, ({ one }) => ({
	layer: one(keyLayerTable),
}))

export const nodeTable = pgTable('node', {
	id: serial('id').primaryKey(),
	compositionId: integer('composition_id')
		.notNull()
		.references(() => compositionTable.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 32 }).notNull(),
	displayName: varchar('display_name', { length: 32 }),
	centerX: doublePrecision('center_x').notNull(),
	centerY: doublePrecision('center_y').notNull(),
})

export const nodeRelations = relations(nodeTable, ({ one, many }) => ({
	composition: one(compositionTable),
	properties: many(nodePropertyTable),
}))

export const nodeConnectionTable = pgTable(
	'node_connection',
	{
		compositionId: integer('composition_id').references(
			() => compositionTable.id,
			{
				onDelete: 'cascade',
			},
		),
		senderId: integer('sender_id').references(() => nodeTable.id, {
			onDelete: 'cascade',
		}),
		receiverId: integer('receiver_id').references(() => nodeTable.id, {
			onDelete: 'cascade',
		}),
		outputSocket: integer('output_socket'),
		inputSocket: integer('input_socket'),
	},
	table => ({
		primaryKey: primaryKey({
			columns: [
				table.compositionId,
				table.senderId,
				table.receiverId,
				table.outputSocket,
				table.inputSocket,
			],
		}),
	}),
)

export const nodeConnectionRelations = relations(
	nodeConnectionTable,
	({ one }) => ({
		composition: one(compositionTable, {
			fields: [nodeConnectionTable.compositionId],
			references: [compositionTable.id],
		}),
		sender: one(nodeTable, {
			fields: [nodeConnectionTable.senderId],
			references: [nodeTable.id],
		}),
		receiver: one(nodeTable, {
			fields: [nodeConnectionTable.receiverId],
			references: [nodeTable.id],
		}),
	}),
)
