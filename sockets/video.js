export const videoCall = (io) => {
    let users = new Map(); // Use Map instead of an object

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Store the userId and socketId when user logs in
        socket.on("register", (userId) => {
            users.set(userId, socket.id);
            console.log("User registered:", Array.from(users.entries())); // Logs users as an array
        });

        // Handle call request
        socket.on("call-user", ({ from, to, offer }) => {
            if (users.has(to)) {
                io.to(users.get(to)).emit("incoming-call", { from, offer });
            } else {
                console.error(`User ${to} is not online.`);
            }
        });

        // Handle answering a call
        socket.on("answer-call", ({ from, answer }) => {
            if (users.has(from)) {
                io.to(users.get(from)).emit("call-answered", { answer });
            }
        });

        // Handle ICE Candidates
        socket.on("ice-candidate", ({ from, to, candidate }) => {
            if (users.has(to)) {
                io.to(users.get(to)).emit("ice-candidate", { candidate });
            }
        });
        
        //end call
        socket.on("end-call", ({ from, to }) => {
            io.to(to).emit("call-ended"); // Notify the other user
          });
          

        // Handle disconnection
        socket.on("disconnect", () => {
            const userId = [...users.entries()].find(([key, value]) => value === socket.id)?.[0];
            if (userId) {
                users.delete(userId);
                console.log("User disconnected:", userId);
            }
        });
    });
};
