export const notificationSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔔 Notification Socket Connected: ${socket.id}`);

        // 📤 Handle Sending Notifications
        socket.on("send_notification", (data) => {
            const { receiverId } = data;

            if (!receiverId) {
                console.error("⚠️ No receiverId provided in notification");
                return;
            }

            // ✅ Use io.to() correctly
            io.to(receiverId).emit("receive_notification", data);
            console.log(`📢 Notification sent to user ${receiverId}`);
        });

        // 💡 Join user to a room based on their user ID (for targeted notifications)
        socket.on("user_connected", (userId) => {
            socket.join(userId); // 🎯 Users join a room with their user ID
            console.log(`👤 User ${userId} joined their notification room`);
        });
    });
};
