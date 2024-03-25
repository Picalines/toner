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

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	login: varchar('login', { length: 32 }).notNull(),
	displayName: varchar('display_name', { length: 64 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const userRelations = relations(users, ({ one }) => ({
	author: one(authors, { fields: [users.id], references: [authors.userId] }),
	listener: one(listeners, {
		fields: [users.id],
		references: [listeners.userId],
	}),
}))

export const authors = pgTable('authors', {
	userId: integer('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
})

export const authorRelations = relations(authors, ({ one, many }) => ({
	user: one(users, {
		fields: [authors.userId],
		references: [users.id],
	}),
	trackProjects: many(trackProjects),
	trackPublications: many(trackPublications),
}))

export const listeners = pgTable('listeners', {
	userId: integer('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
})

export const listenerRelations = relations(listeners, ({ one, many }) => ({
	user: one(users, {
		fields: [listeners.userId],
		references: [users.id],
	}),
	listens: many(listens),
	subscriptions: many(subscriptions),
	reactions: many(reactions),
}))

export const subscriptions = pgTable(
	'subscriptions',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listeners.userId, { onDelete: 'cascade' }),
		authorId: integer('author_id')
			.notNull()
			.references(() => authors.userId, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	table => ({
		primaryKey: primaryKey({ columns: [table.listenerId, table.authorId] }),
	}),
)

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
	listener: one(listeners, {
		fields: [subscriptions.listenerId],
		references: [listeners.userId],
	}),
	author: one(authors, {
		fields: [subscriptions.authorId],
		references: [authors.userId],
	}),
}))

// trackPublications

export const trackPublications = pgTable('track_publications', {
	id: serial('id').primaryKey(),
	authorId: integer('author_id')
		.notNull()
		.references(() => authors.userId, { onDelete: 'cascade' }),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjects.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 64 }).notNull(),
	description: text('description').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const trackPublicationRelations = relations(
	trackPublications,
	({ one, many }) => ({
		author: one(authors, {
			fields: [trackPublications.authorId],
			references: [authors.userId],
		}),
		project: one(trackProjects, {
			fields: [trackPublications.projectId],
			references: [trackProjects.id],
		}),
		listens: many(listens),
	}),
)

export const listens = pgTable(
	'listens',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listeners.userId, { onDelete: 'cascade' }),
		publicationId: integer('publication_id')
			.notNull()
			.references(() => trackPublications.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	table => ({
		primaryKey: primaryKey({
			columns: [table.listenerId, table.publicationId],
		}),
	}),
)

export const listenRelations = relations(listens, ({ one }) => ({
	listener: one(listeners, {
		fields: [listens.listenerId],
		references: [listeners.userId],
	}),
	publication: one(trackPublications, {
		fields: [listens.publicationId],
		references: [trackPublications.id],
	}),
}))

export const reactionType = pgEnum('reaction_type', [
	'heart',
	'brokenHeart',
	'smile',
	'laugh',
])

export const reactions = pgTable(
	'reactions',
	{
		listenerId: integer('listener_id')
			.notNull()
			.references(() => listeners.userId, { onDelete: 'cascade' }),
		publicationId: integer('publication_id')
			.notNull()
			.references(() => trackPublications.id, { onDelete: 'cascade' }),
		type: reactionType('type').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	table => ({
		primaryKey: primaryKey({
			columns: [table.listenerId, table.publicationId],
		}),
	}),
)

export const reactionRelations = relations(reactions, ({ one }) => ({
	listener: one(listeners, {
		fields: [reactions.listenerId],
		references: [listeners.userId],
	}),
	publication: one(trackPublications, {
		fields: [reactions.publicationId],
		references: [trackPublications.id],
	}),
}))

// trackProjects

export const trackProjects = pgTable('track_projects', {
	id: serial('id').primaryKey(),
	authorId: integer('author_id')
		.notNull()
		.references(() => authors.userId, { onDelete: 'cascade' }),
	name: varchar('name', { length: 64 }).notNull(),
	description: text('description').notNull().default(''),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const trackProjectRelations = relations(
	trackProjects,
	({ one, many }) => ({
		author: one(authors, {
			fields: [trackProjects.authorId],
			references: [authors.userId],
		}),
		noteLayers: many(noteLayers),
		nodes: many(nodes),
		nodeConnections: many(nodeConnections),
	}),
)

export const noteLayers = pgTable('note_layers', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjects.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 32 }).notNull(),
})

export const noteLayerRelations = relations(noteLayers, ({ one, many }) => ({
	project: one(trackProjects, {
		fields: [noteLayers.projectId],
		references: [trackProjects.id],
	}),
	notes: many(notes),
}))

export const notes = pgTable('notes', {
	id: serial('id').primaryKey(),
	layerId: integer('layer_id')
		.notNull()
		.references(() => noteLayers.id, { onDelete: 'cascade' }),
	instrumentNodeId: integer('instrumentNode_id')
		.notNull()
		.references(() => nodes.id, { onDelete: 'cascade' }),
	startAt: integer('start_at').notNull(),
	duration: integer('duration').notNull(),
	frequency: numeric('frequency', { precision: 9, scale: 3 }).notNull(),
})

export const noteRelations = relations(notes, ({ one }) => ({
	layer: one(noteLayers, {
		fields: [notes.layerId],
		references: [noteLayers.id],
	}),
}))

export const nodes = pgTable('nodes', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjects.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 32 }).notNull(),
	displayName: varchar('display_name', { length: 32 }),
})

export const nodeRelations = relations(nodes, ({ one, many }) => ({
	project: one(trackProjects, {
		fields: [nodes.projectId],
		references: [trackProjects.id],
	}),
	sockets: many(nodeSockets),
}))

export const nodeSocketType = pgEnum('node_socket_type', ['input', 'output'])

export const nodeSockets = pgTable('node_sockets', {
	id: serial('id').primaryKey(),
	nodeId: integer('node_id')
		.notNull()
		.references(() => nodes.id, { onDelete: 'cascade' }),
	type: nodeSocketType('type').notNull(),
	name: varchar('name', { length: 32 }).notNull(),
})

export const nodeSocketRelations = relations(nodeSockets, ({ one }) => ({
	node: one(nodes, {
		fields: [nodeSockets.nodeId],
		references: [nodes.id],
	}),
}))

export const nodeConnections = pgTable('node_connections', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => trackProjects.id, { onDelete: 'cascade' }),
	senderId: integer('sender_id')
		.notNull()
		.references(() => nodeSockets.id, { onDelete: 'cascade' }),
	receiverId: integer('receiver_id')
		.notNull()
		.references(() => nodeSockets.id, { onDelete: 'cascade' }),
})

export const nodeConnectionRelations = relations(
	nodeConnections,
	({ one }) => ({
		project: one(trackProjects, {
			fields: [nodeConnections.projectId],
			references: [trackProjects.id],
		}),
		sender: one(nodeSockets, {
			fields: [nodeConnections.senderId],
			references: [nodeSockets.id],
		}),
		receiver: one(nodeSockets, {
			fields: [nodeConnections.receiverId],
			references: [nodeSockets.id],
		}),
	}),
)
