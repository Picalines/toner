import { relations } from 'drizzle-orm'
import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
	id: serial('id').primaryKey(),
	login: varchar('login', { length: 32 }).notNull(),
	displayName: varchar('display_name', { length: 64 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const userRelations = relations(userTable, ({ one }) => ({
	author: one(authorTable, {
		fields: [userTable.id],
		references: [authorTable.userId],
	}),
	listener: one(listenerTable, {
		fields: [userTable.id],
		references: [listenerTable.userId],
	}),
}))

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
})

export const authorTable = pgTable('author', {
	userId: integer('user_id')
		.primaryKey()
		.references(() => userTable.id, { onDelete: 'cascade' }),
})

export const authorRelations = relations(authorTable, ({ one, many }) => ({
	user: one(userTable, {
		fields: [authorTable.userId],
		references: [userTable.id],
	}),
	trackProjects: many(trackProjectTable),
	trackPublications: many(trackPublicationTable),
}))

export const listenerTable = pgTable('listener', {
	userId: integer('user_id')
		.primaryKey()
		.references(() => userTable.id, { onDelete: 'cascade' }),
})

export const listenerRelations = relations(listenerTable, ({ one, many }) => ({
	user: one(userTable, {
		fields: [listenerTable.userId],
		references: [userTable.id],
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
			.references(() => listenerTable.userId, { onDelete: 'cascade' }),
		authorId: integer('author_id')
			.notNull()
			.references(() => authorTable.userId, { onDelete: 'cascade' }),
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
			references: [listenerTable.userId],
		}),
		author: one(authorTable, {
			fields: [subscriptionTable.authorId],
			references: [authorTable.userId],
		}),
	}),
)

// trackPublications

export const trackPublicationTable = pgTable('track_publication', {
	id: serial('id').primaryKey(),
	authorId: integer('author_id')
		.notNull()
		.references(() => authorTable.userId, { onDelete: 'cascade' }),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjectTable.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 64 }).notNull(),
	description: text('description').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const trackPublicationRelations = relations(
	trackPublicationTable,
	({ one, many }) => ({
		author: one(authorTable, {
			fields: [trackPublicationTable.authorId],
			references: [authorTable.userId],
		}),
		project: one(trackProjectTable, {
			fields: [trackPublicationTable.projectId],
			references: [trackProjectTable.id],
		}),
		listens: many(listenTable),
	}),
)

export const listenTable = pgTable(
	'listen',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listenerTable.userId, { onDelete: 'cascade' }),
		publicationId: integer('publication_id')
			.notNull()
			.references(() => trackPublicationTable.id, {
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
		references: [listenerTable.userId],
	}),
	publication: one(trackPublicationTable, {
		fields: [listenTable.publicationId],
		references: [trackPublicationTable.id],
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
			.references(() => listenerTable.userId, { onDelete: 'cascade' }),
		publicationId: integer('publication_id')
			.notNull()
			.references(() => trackPublicationTable.id, {
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
		references: [listenerTable.userId],
	}),
	publication: one(trackPublicationTable, {
		fields: [reactionTable.publicationId],
		references: [trackPublicationTable.id],
	}),
}))

// trackProjects

export const trackProjectTable = pgTable('track_project', {
	id: serial('id').primaryKey(),
	authorId: integer('author_id')
		.notNull()
		.references(() => authorTable.userId, { onDelete: 'cascade' }),
	name: varchar('name', { length: 64 }).notNull(),
	description: text('description').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const trackProjectRelations = relations(
	trackProjectTable,
	({ one, many }) => ({
		author: one(authorTable, {
			fields: [trackProjectTable.authorId],
			references: [authorTable.userId],
		}),
		noteLayers: many(noteLayerTable),
		nodes: many(nodeTable),
		nodeConnections: many(nodeConnectionTable),
	}),
)

export const noteLayerTable = pgTable('note_layer', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjectTable.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 32 }).notNull(),
})

export const noteLayerRelations = relations(
	noteLayerTable,
	({ one, many }) => ({
		project: one(trackProjectTable, {
			fields: [noteLayerTable.projectId],
			references: [trackProjectTable.id],
		}),
		notes: many(noteTable),
	}),
)

export const noteTable = pgTable('note', {
	id: serial('id').primaryKey(),
	layerId: integer('layer_id')
		.notNull()
		.references(() => noteLayerTable.id, { onDelete: 'cascade' }),
	instrumentNodeId: integer('instrumentNode_id')
		.notNull()
		.references(() => nodeTable.id, { onDelete: 'cascade' }),
	startAt: integer('start_at').notNull(),
	duration: integer('duration').notNull(),
	frequency: numeric('frequency', { precision: 9, scale: 3 }).notNull(),
})

export const noteRelations = relations(noteTable, ({ one }) => ({
	layer: one(noteLayerTable, {
		fields: [noteTable.layerId],
		references: [noteLayerTable.id],
	}),
}))

export const nodeTable = pgTable('node', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjectTable.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 32 }).notNull(),
	displayName: varchar('display_name', { length: 32 }),
})

export const nodeRelations = relations(nodeTable, ({ one, many }) => ({
	project: one(trackProjectTable, {
		fields: [nodeTable.projectId],
		references: [trackProjectTable.id],
	}),
	sockets: many(nodeSocketTable),
}))

export const nodeSocketType = pgEnum('node_socket_type', ['input', 'output'])

export const nodeSocketTable = pgTable('node_socket', {
	id: serial('id').primaryKey(),
	nodeId: integer('node_id')
		.notNull()
		.references(() => nodeTable.id, { onDelete: 'cascade' }),
	type: nodeSocketType('type').notNull(),
	name: varchar('name', { length: 32 }).notNull(),
})

export const nodeSocketRelations = relations(nodeSocketTable, ({ one }) => ({
	node: one(nodeTable, {
		fields: [nodeSocketTable.nodeId],
		references: [nodeTable.id],
	}),
}))

export const nodeConnectionTable = pgTable('node_connection', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjectTable.id, { onDelete: 'cascade' }),
	senderId: integer('sender_id')
		.notNull()
		.references(() => nodeSocketTable.id, { onDelete: 'cascade' }),
	receiverId: integer('receiver_id')
		.notNull()
		.references(() => nodeSocketTable.id, { onDelete: 'cascade' }),
})

export const nodeConnectionRelations = relations(
	nodeConnectionTable,
	({ one }) => ({
		project: one(trackProjectTable, {
			fields: [nodeConnectionTable.projectId],
			references: [trackProjectTable.id],
		}),
		sender: one(nodeSocketTable, {
			fields: [nodeConnectionTable.senderId],
			references: [nodeSocketTable.id],
		}),
		receiver: one(nodeSocketTable, {
			fields: [nodeConnectionTable.receiverId],
			references: [nodeSocketTable.id],
		}),
	}),
)
