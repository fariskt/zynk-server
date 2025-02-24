import { saveMessage } from "../controller/chatController.js";

export const chatSocket = (io) => { 
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // ✅ Track User Connection
        socket.on("user_connected", (userId) => {
            if (!userId) {
                console.error("⚠️ Missing userId on connection");
                return;
            }

            onlineUsers.set(userId, socket.id);
            console.log(`✅ User ${userId} is now online.`);
            io.emit("online_users", Array.from(onlineUsers.keys()));
        });

        // 💬 Handle Incoming Messages
        socket.on("send_message", async (data) => {
            if (!data.receiverId || typeof data.receiverId !== "string") {
                console.error("⚠️ Invalid or missing receiver ID:", data);
                return;
            }

            const messageData = {
                ...data,
                timestamp: new Date(),
            };

            try {
                await saveMessage(messageData);
            } catch (error) {
                console.error("❌ Error saving message:", error);
                socket.emit("error_message", "Failed to save message.");
                return;
            }

            // 📡 Forward Message if Receiver is Online
            const receiverSocket = onlineUsers.get(messageData.receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit("receive_message", messageData);
            }
        });

        // 🚪 Handle User Disconnection
        socket.on("disconnect", () => {
            const userId = [...onlineUsers.entries()].find(([key, value]) => value === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                console.log(`🚪 User ${userId} disconnected.`);
                io.emit("online_users", Array.from(onlineUsers.keys()));
            }
        });
    });
};
