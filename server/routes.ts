import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertTheaterShowSchema, insertLivestreamSchema, insertMusicTrackSchema, insertStatusMessageSchema, insertBotCommandSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API endpoints
  
  // Members
  app.get("/api/members", async (req, res) => {
    const members = await storage.getAllMembers();
    res.json(members);
  });
  
  app.get("/api/members/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const member = await storage.getMember(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    res.json(member);
  });
  
  app.get("/api/members/search/:name", async (req, res) => {
    const name = req.params.name;
    const member = await storage.getMemberByName(name);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    res.json(member);
  });
  
  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Theater shows
  app.get("/api/theater-shows", async (req, res) => {
    const shows = await storage.getAllTheaterShows();
    res.json(shows);
  });
  
  app.get("/api/theater-shows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const show = await storage.getTheaterShow(id);
    if (!show) {
      return res.status(404).json({ message: "Theater show not found" });
    }
    
    res.json(show);
  });
  
  app.post("/api/theater-shows", async (req, res) => {
    try {
      const validatedData = insertTheaterShowSchema.parse(req.body);
      const show = await storage.createTheaterShow(validatedData);
      res.status(201).json(show);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid theater show data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Livestreams
  app.get("/api/livestreams", async (req, res) => {
    const isLive = req.query.live === "true";
    
    if (req.query.live !== undefined) {
      const livestreams = await storage.getLivestreams(isLive);
      return res.json(livestreams);
    }
    
    const livestreams = await storage.getAllLivestreams();
    res.json(livestreams);
  });
  
  app.get("/api/livestreams/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const livestream = await storage.getLivestream(id);
    if (!livestream) {
      return res.status(404).json({ message: "Livestream not found" });
    }
    
    res.json(livestream);
  });
  
  app.post("/api/livestreams", async (req, res) => {
    try {
      const validatedData = insertLivestreamSchema.parse(req.body);
      const livestream = await storage.createLivestream(validatedData);
      res.status(201).json(livestream);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid livestream data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Music tracks
  app.get("/api/music-tracks", async (req, res) => {
    const tracks = await storage.getAllMusicTracks();
    res.json(tracks);
  });
  
  app.get("/api/music-tracks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const track = await storage.getMusicTrack(id);
    if (!track) {
      return res.status(404).json({ message: "Music track not found" });
    }
    
    res.json(track);
  });
  
  app.post("/api/music-tracks", async (req, res) => {
    try {
      const validatedData = insertMusicTrackSchema.parse(req.body);
      const track = await storage.createMusicTrack(validatedData);
      res.status(201).json(track);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid music track data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Status messages
  app.get("/api/status-messages", async (req, res) => {
    const messages = await storage.getAllStatusMessages();
    res.json(messages);
  });
  
  app.post("/api/status-messages", async (req, res) => {
    try {
      const validatedData = insertStatusMessageSchema.parse(req.body);
      const message = await storage.createStatusMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status message data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Bot commands
  app.get("/api/bot-commands", async (req, res) => {
    const commands = await storage.getAllBotCommands();
    res.json(commands);
  });
  
  app.post("/api/bot-commands", async (req, res) => {
    try {
      const validatedData = insertBotCommandSchema.parse(req.body);
      const command = await storage.createBotCommand(validatedData);
      res.status(201).json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bot command data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
