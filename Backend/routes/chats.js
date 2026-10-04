import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIResponse from "../utils/openai.js";

const router = express.Router();

router.post("/test", async (req, res) => {
    try {
        let thread = new Thread({
            message: req.body.message
        });
        await thread.save();
        res.status(201).json({ message: "Thread created successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/threads", async (req, res) => {
    try {
        let threads = await Thread.find();
        res.json(threads);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/threads/:threadId", async (req, res) => {
    try {
        let thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread.messages);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/threads/:threadId", async (req, res) => {
    try {
        let thread = await Thread.findByIdAndDelete(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json({ message: "Thread deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Thread ID and message are required" });
    }

    try {
        let thread = await Thread.findById(threadId);
        if (!thread) {
            thread = new Thread({ _id: threadId, title: message, messages: [{role: "user", content: message}] });
        }
        else {
            thread.messages.push({ role: "user", content: message });
        }

        const aiResponse = await getOpenAIResponse(thread.messages);
        thread.messages.push({ role: "assistant", content: aiResponse });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({ message: "Message sent successfully" });
    } 
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;