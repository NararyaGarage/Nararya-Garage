import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  discordId: text("discord_id").unique(),
  isAdmin: boolean("is_admin").default(false),
});

// JKT48 members table
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nickname: text("nickname").notNull(),
  team: text("team").notNull(),
  birthday: text("birthday").notNull(),
  height: text("height").notNull(),
  generation: text("generation").notNull(),
  imageUrl: text("image_url"),
});

// Member social media table
export const memberSocialMedia = pgTable("member_social_media", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  platform: text("platform").notNull(), // instagram, twitter, showroom, etc.
  username: text("username").notNull(),
  url: text("url").notNull(),
});

// Theater shows table
export const theaterShows = pgTable("theater_shows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  team: text("team").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  setlist: text("setlist").notNull(),
  members: text("members").notNull(), // Comma-separated list of member IDs for simplicity
});

// Show participating members junction table
export const showMembers = pgTable("show_members", {
  showId: integer("show_id").notNull().references(() => theaterShows.id),
  memberId: integer("member_id").notNull().references(() => members.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.showId, t.memberId] }),
}));

// Livestreams table
export const livestreams = pgTable("livestreams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  member: text("member").notNull(),
  isLive: boolean("is_live").default(false),
  thumbnailUrl: text("thumbnail_url"),
  streamUrl: text("stream_url").notNull(),
  platform: text("platform").notNull().default('youtube'), // youtube, showroom, instagram, etc.
});

// Music tracks table
export const musicTracks = pgTable("music_tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  albumCover: text("album_cover"),
  duration: text("duration").notNull(),
});

// Bot status messages table
export const statusMessages = pgTable("status_messages", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").notNull(),
});

// Bot commands table
export const botCommands = pgTable("bot_commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  usage: text("usage").notNull(),
});

// Notification channels table
export const notificationChannels = pgTable("notification_channels", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull().unique(),
  type: text("type").notNull(), // news, theater, youtube, twitter, etc.
  name: text("name").notNull(),
  guildId: text("guild_id").notNull(),
});

// Define relations
export const membersRelations = relations(members, ({ many }) => ({
  socialMedia: many(memberSocialMedia),
  shows: many(showMembers),
}));

export const memberSocialMediaRelations = relations(memberSocialMedia, ({ one }) => ({
  member: one(members, {
    fields: [memberSocialMedia.memberId],
    references: [members.id],
  }),
}));

export const theaterShowsRelations = relations(theaterShows, ({ many }) => ({
  participants: many(showMembers),
}));

export const showMembersRelations = relations(showMembers, ({ one }) => ({
  show: one(theaterShows, {
    fields: [showMembers.showId],
    references: [theaterShows.id],
  }),
  member: one(members, {
    fields: [showMembers.memberId],
    references: [members.id],
  }),
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  discordId: true,
  isAdmin: true,
});

export const insertMemberSchema = createInsertSchema(members);

export const insertMemberSocialMediaSchema = createInsertSchema(memberSocialMedia);

export const insertTheaterShowSchema = createInsertSchema(theaterShows);

export const insertShowMemberSchema = createInsertSchema(showMembers);

export const insertLivestreamSchema = createInsertSchema(livestreams);

export const insertMusicTrackSchema = createInsertSchema(musicTracks);

export const insertStatusMessageSchema = createInsertSchema(statusMessages);

export const insertBotCommandSchema = createInsertSchema(botCommands);

export const insertNotificationChannelSchema = createInsertSchema(notificationChannels);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertMemberSocialMedia = z.infer<typeof insertMemberSocialMediaSchema>;
export type MemberSocialMedia = typeof memberSocialMedia.$inferSelect;

export type InsertTheaterShow = z.infer<typeof insertTheaterShowSchema>;
export type TheaterShow = typeof theaterShows.$inferSelect;

export type InsertShowMember = z.infer<typeof insertShowMemberSchema>;
export type ShowMember = typeof showMembers.$inferSelect;

export type InsertLivestream = z.infer<typeof insertLivestreamSchema>;
export type Livestream = typeof livestreams.$inferSelect;

export type InsertMusicTrack = z.infer<typeof insertMusicTrackSchema>;
export type MusicTrack = typeof musicTracks.$inferSelect;

export type InsertStatusMessage = z.infer<typeof insertStatusMessageSchema>;
export type StatusMessage = typeof statusMessages.$inferSelect;

export type InsertBotCommand = z.infer<typeof insertBotCommandSchema>;
export type BotCommand = typeof botCommands.$inferSelect;

export type InsertNotificationChannel = z.infer<typeof insertNotificationChannelSchema>;
export type NotificationChannel = typeof notificationChannels.$inferSelect;
