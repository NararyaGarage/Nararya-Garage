import {
  users, type User, type InsertUser,
  members, type Member, type InsertMember,
  theaterShows, type TheaterShow, type InsertTheaterShow,
  livestreams, type Livestream, type InsertLivestream,
  musicTracks, type MusicTrack, type InsertMusicTrack,
  statusMessages, type StatusMessage, type InsertStatusMessage,
  botCommands, type BotCommand, type InsertBotCommand
} from "@shared/schema";
import { eq, count } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Member methods
  getMember(id: number): Promise<Member | undefined>;
  getMemberByName(name: string): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  
  // Theater show methods
  getTheaterShow(id: number): Promise<TheaterShow | undefined>;
  getAllTheaterShows(): Promise<TheaterShow[]>;
  createTheaterShow(show: InsertTheaterShow): Promise<TheaterShow>;
  
  // Livestream methods
  getLivestream(id: number): Promise<Livestream | undefined>;
  getAllLivestreams(): Promise<Livestream[]>;
  getLivestreams(isLive: boolean): Promise<Livestream[]>;
  createLivestream(livestream: InsertLivestream): Promise<Livestream>;
  
  // Music track methods
  getMusicTrack(id: number): Promise<MusicTrack | undefined>;
  getAllMusicTracks(): Promise<MusicTrack[]>;
  createMusicTrack(track: InsertMusicTrack): Promise<MusicTrack>;
  
  // Status message methods
  getAllStatusMessages(): Promise<StatusMessage[]>;
  createStatusMessage(message: InsertStatusMessage): Promise<StatusMessage>;
  
  // Bot command methods
  getAllBotCommands(): Promise<BotCommand[]>;
  createBotCommand(command: InsertBotCommand): Promise<BotCommand>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private members: Map<number, Member>;
  private theaterShows: Map<number, TheaterShow>;
  private livestreams: Map<number, Livestream>;
  private musicTracks: Map<number, MusicTrack>;
  private statusMessages: Map<number, StatusMessage>;
  private botCommands: Map<number, BotCommand>;
  
  private currentIds: {
    user: number;
    member: number;
    theaterShow: number;
    livestream: number;
    musicTrack: number;
    statusMessage: number;
    botCommand: number;
  };

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.theaterShows = new Map();
    this.livestreams = new Map();
    this.musicTracks = new Map();
    this.statusMessages = new Map();
    this.botCommands = new Map();
    
    this.currentIds = {
      user: 1,
      member: 1,
      theaterShow: 1,
      livestream: 1,
      musicTrack: 1,
      statusMessage: 1,
      botCommand: 1
    };
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default status messages
    this.createStatusMessage({ 
      text: "Watching JKT48 High Tension MV", 
      type: "watching" 
    });
    this.createStatusMessage({ 
      text: "Listening to JKT48 songs", 
      type: "listening" 
    });
    this.createStatusMessage({ 
      text: "Monitoring JKT48 news", 
      type: "watching" 
    });
    this.createStatusMessage({ 
      text: "Playing with JKT48 fans", 
      type: "playing" 
    });
    
    // Add sample member
    this.createMember({
      name: "Shani Indira Natio",
      nickname: "Shani",
      team: "Team T",
      birthday: "October 5, 1999",
      height: "167 cm",
      generation: "3rd Generation",
      imageUrl: ""
    });
    
    // Add sample theater show
    this.createTheaterShow({
      title: "JKT48 Theater Show - Team T",
      team: "Team T",
      date: "Today",
      time: "12:00 PM WIB",
      location: "JKT48 Theater - fX Sudirman, Jakarta",
      setlist: "Aitakatta",
      members: "Shani, Feni, Gracia, 13 others"
    });
    
    // Add sample livestream
    this.createLivestream({
      title: "Shani JKT48 - Karaoke Session",
      member: "Shani",
      isLive: true,
      thumbnailUrl: "",
      streamUrl: "https://example.com/stream"
    });
    
    // Add sample music track
    this.createMusicTrack({
      title: "Heavy Rotation",
      artist: "JKT48",
      albumCover: "",
      duration: "3:25"
    });
    
    // Add sample bot commands
    this.createBotCommand({
      name: "help",
      description: "Shows all available commands",
      usage: "/help"
    });
    
    this.createBotCommand({
      name: "member",
      description: "Shows information about a JKT48 member",
      usage: "/member [name]"
    });
    
    this.createBotCommand({
      name: "schedule",
      description: "Shows upcoming theater shows and events",
      usage: "/schedule"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Member methods
  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }
  
  async getMemberByName(name: string): Promise<Member | undefined> {
    const lowercaseName = name.toLowerCase();
    return Array.from(this.members.values()).find(
      (member) => 
        member.name.toLowerCase().includes(lowercaseName) || 
        member.nickname.toLowerCase().includes(lowercaseName)
    );
  }
  
  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }
  
  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = this.currentIds.member++;
    const member: Member = { ...insertMember, id };
    this.members.set(id, member);
    return member;
  }
  
  // Theater show methods
  async getTheaterShow(id: number): Promise<TheaterShow | undefined> {
    return this.theaterShows.get(id);
  }
  
  async getAllTheaterShows(): Promise<TheaterShow[]> {
    return Array.from(this.theaterShows.values());
  }
  
  async createTheaterShow(insertTheaterShow: InsertTheaterShow): Promise<TheaterShow> {
    const id = this.currentIds.theaterShow++;
    const theaterShow: TheaterShow = { ...insertTheaterShow, id };
    this.theaterShows.set(id, theaterShow);
    return theaterShow;
  }
  
  // Livestream methods
  async getLivestream(id: number): Promise<Livestream | undefined> {
    return this.livestreams.get(id);
  }
  
  async getAllLivestreams(): Promise<Livestream[]> {
    return Array.from(this.livestreams.values());
  }
  
  async getLivestreams(isLive: boolean): Promise<Livestream[]> {
    return Array.from(this.livestreams.values()).filter(
      (livestream) => livestream.isLive === isLive
    );
  }
  
  async createLivestream(insertLivestream: InsertLivestream): Promise<Livestream> {
    const id = this.currentIds.livestream++;
    const livestream: Livestream = { ...insertLivestream, id };
    this.livestreams.set(id, livestream);
    return livestream;
  }
  
  // Music track methods
  async getMusicTrack(id: number): Promise<MusicTrack | undefined> {
    return this.musicTracks.get(id);
  }
  
  async getAllMusicTracks(): Promise<MusicTrack[]> {
    return Array.from(this.musicTracks.values());
  }
  
  async createMusicTrack(insertMusicTrack: InsertMusicTrack): Promise<MusicTrack> {
    const id = this.currentIds.musicTrack++;
    const musicTrack: MusicTrack = { ...insertMusicTrack, id };
    this.musicTracks.set(id, musicTrack);
    return musicTrack;
  }
  
  // Status message methods
  async getAllStatusMessages(): Promise<StatusMessage[]> {
    return Array.from(this.statusMessages.values());
  }
  
  async createStatusMessage(insertStatusMessage: InsertStatusMessage): Promise<StatusMessage> {
    const id = this.currentIds.statusMessage++;
    const statusMessage: StatusMessage = { ...insertStatusMessage, id };
    this.statusMessages.set(id, statusMessage);
    return statusMessage;
  }
  
  // Bot command methods
  async getAllBotCommands(): Promise<BotCommand[]> {
    return Array.from(this.botCommands.values());
  }
  
  async createBotCommand(insertBotCommand: InsertBotCommand): Promise<BotCommand> {
    const id = this.currentIds.botCommand++;
    const botCommand: BotCommand = { ...insertBotCommand, id };
    this.botCommands.set(id, botCommand);
    return botCommand;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Member methods
  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }
  
  async getMemberByName(name: string): Promise<Member | undefined> {
    const lowercaseName = name.toLowerCase();
    const allMembers = await db.select().from(members);
    return allMembers.find(
      (member) => 
        member.name.toLowerCase().includes(lowercaseName) || 
        member.nickname.toLowerCase().includes(lowercaseName)
    );
  }
  
  async getAllMembers(): Promise<Member[]> {
    return db.select().from(members);
  }
  
  async createMember(insertMember: InsertMember): Promise<Member> {
    const [member] = await db.insert(members).values(insertMember).returning();
    return member;
  }
  
  // Theater show methods
  async getTheaterShow(id: number): Promise<TheaterShow | undefined> {
    const [show] = await db.select().from(theaterShows).where(eq(theaterShows.id, id));
    return show;
  }
  
  async getAllTheaterShows(): Promise<TheaterShow[]> {
    return db.select().from(theaterShows);
  }
  
  async createTheaterShow(insertTheaterShow: InsertTheaterShow): Promise<TheaterShow> {
    const [show] = await db.insert(theaterShows).values(insertTheaterShow).returning();
    return show;
  }
  
  // Livestream methods
  async getLivestream(id: number): Promise<Livestream | undefined> {
    const [livestream] = await db.select().from(livestreams).where(eq(livestreams.id, id));
    return livestream;
  }
  
  async getAllLivestreams(): Promise<Livestream[]> {
    return db.select().from(livestreams);
  }
  
  async getLivestreams(isLive: boolean): Promise<Livestream[]> {
    return db.select().from(livestreams).where(eq(livestreams.isLive, isLive));
  }
  
  async createLivestream(insertLivestream: InsertLivestream): Promise<Livestream> {
    const [livestream] = await db.insert(livestreams).values(insertLivestream).returning();
    return livestream;
  }
  
  // Music track methods
  async getMusicTrack(id: number): Promise<MusicTrack | undefined> {
    const [track] = await db.select().from(musicTracks).where(eq(musicTracks.id, id));
    return track;
  }
  
  async getAllMusicTracks(): Promise<MusicTrack[]> {
    return db.select().from(musicTracks);
  }
  
  async createMusicTrack(insertMusicTrack: InsertMusicTrack): Promise<MusicTrack> {
    const [track] = await db.insert(musicTracks).values(insertMusicTrack).returning();
    return track;
  }
  
  // Status message methods
  async getAllStatusMessages(): Promise<StatusMessage[]> {
    return db.select().from(statusMessages);
  }
  
  async createStatusMessage(insertStatusMessage: InsertStatusMessage): Promise<StatusMessage> {
    const [message] = await db.insert(statusMessages).values(insertStatusMessage).returning();
    return message;
  }
  
  // Bot command methods
  async getAllBotCommands(): Promise<BotCommand[]> {
    return db.select().from(botCommands);
  }
  
  async createBotCommand(insertBotCommand: InsertBotCommand): Promise<BotCommand> {
    const [command] = await db.insert(botCommands).values(insertBotCommand).returning();
    return command;
  }

  // Initialize with default data if tables are empty
  async initializeDefaultData() {
    // Check if tables are empty
    const statusCount = await db.select({ count: count() }).from(statusMessages);
    const memberCount = await db.select({ count: count() }).from(members);
    const theaterShowCount = await db.select({ count: count() }).from(theaterShows);
    const livestreamCount = await db.select({ count: count() }).from(livestreams);
    const musicTrackCount = await db.select({ count: count() }).from(musicTracks);
    const commandCount = await db.select({ count: count() }).from(botCommands);

    // Add default status messages if none exist
    if (statusCount[0].count === 0) {
      await db.insert(statusMessages).values([
        { text: "Watching JKT48 High Tension MV", type: "watching" },
        { text: "Listening to JKT48 songs", type: "listening" },
        { text: "Monitoring JKT48 news", type: "watching" },
        { text: "Playing with JKT48 fans", type: "playing" }
      ]);
    }
    
    // Add sample member if none exist
    if (memberCount[0].count === 0) {
      await db.insert(members).values({
        name: "Shani Indira Natio",
        nickname: "Shani",
        team: "Team T",
        birthday: "October 5, 1999",
        height: "167 cm",
        generation: "3rd Generation",
        imageUrl: ""
      });
    }
    
    // Add sample theater show if none exist
    if (theaterShowCount[0].count === 0) {
      await db.insert(theaterShows).values({
        title: "JKT48 Theater Show - Team T",
        team: "Team T",
        date: "Today",
        time: "12:00 PM WIB",
        location: "JKT48 Theater - fX Sudirman, Jakarta",
        setlist: "Aitakatta",
        members: "Shani, Feni, Gracia, 13 others"
      });
    }
    
    // Add sample livestream if none exist
    if (livestreamCount[0].count === 0) {
      await db.insert(livestreams).values({
        title: "Shani JKT48 - Karaoke Session",
        member: "Shani",
        isLive: true,
        thumbnailUrl: "",
        streamUrl: "https://example.com/stream",
        platform: "youtube"
      });
    }
    
    // Add sample music track if none exist
    if (musicTrackCount[0].count === 0) {
      await db.insert(musicTracks).values({
        title: "Heavy Rotation",
        artist: "JKT48",
        albumCover: "",
        duration: "3:25"
      });
    }
    
    // Add sample bot commands if none exist
    if (commandCount[0].count === 0) {
      await db.insert(botCommands).values([
        {
          name: "help",
          description: "Shows all available commands",
          usage: "/help"
        },
        {
          name: "member",
          description: "Shows information about a JKT48 member",
          usage: "/member [name]"
        },
        {
          name: "schedule",
          description: "Shows upcoming theater shows and events",
          usage: "/schedule"
        }
      ]);
    }
  }
}

// Initialize a single instance of the storage
export const storage = new DatabaseStorage();

// Initialize default data
storage.initializeDefaultData().catch(console.error);
