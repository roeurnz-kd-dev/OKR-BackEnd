import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cluster from 'cluster';
import os from 'os';
import pool from './config/db.js';
import morgan from "morgan";
import compression from "compression";

// --- ROUTES IMPORTS ---
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import okrsRoutes from './routes/okrs.routes.js';
import companyokrsRoutes from './routes/companyokrs.routes.js';
import departmentokrsRoutes from './routes/departmentOkrs.routes.js';
import departmentRoutes from './routes/department.routes.js';
import individualOkrsRoutes from './routes/individualOkrs.routes.js';
import keyresultProgressRoutes from './routes/keyresultProgress.routes.js';
import okrProgressTrackerRoutes from './routes/okrProgressTracker.routes.js';
import kpisRoutes from './routes/kpis.routes.js';
import departmentKpisRoutes from "./routes/departmentKPis.routes.js";
import individualKpisRoutes from "./routes/individualKPI.routes.js";
import companyKpisRoutes from './routes/companyKpi.routes.js';
import leadsRoutes from './routes/lead.routes.js';
import dealRoutes from "./routes/deal.route.js";
import companyRoutes from "./routes/company.routes.js";
import okrsReportRoutes from "./routes/okrReport.routes.js";
import crmdashboardRoutes from "./routes/crmdashboard.routes.js";
import kpireportsRoutes from "./routes/kpireports.routes.js";
import okrdependencyRoutes from './routes/okr_dependency.router.js';
import followupRoutes from './routes/followup.routes.js';
import financialOverviewRoutes from './routes/financialOverviewroutes.js';
import companybulkokrsRoutes from './routes/companybulkokrs.route.js';
import reportdb from "./routes/reportdb.route.js";

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    const app = express();
    app.use(morgan("tiny"));

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    app.use(cors({
        origin:"*",
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    }));

    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // --- Routes ---
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/okrs', okrsRoutes);
    app.use('/api/companyokrs', companyokrsRoutes);
    app.use('/api/departmentokrs', departmentokrsRoutes);
    app.use('/api/individualOkrs', individualOkrsRoutes);
    app.use('/api/keyresultProgress', keyresultProgressRoutes);
    app.use('/api/department', departmentRoutes);
    app.use('/api/okrProgressTracker', okrProgressTrackerRoutes);
    app.use('/api/kpis/define', kpisRoutes);
    app.use('/api/teamKpis', departmentKpisRoutes);
    app.use('/api/individualkpis', individualKpisRoutes);
    app.use('/api/companykpis', companyKpisRoutes);
    app.use('/api/leads', leadsRoutes);
    app.use('/api/deals', dealRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/okrsreports', okrsReportRoutes);
    app.use('/api/crm', crmdashboardRoutes);
    app.use('/api/kpireport', kpireportsRoutes);
    app.use("/api/okr-dependencies", okrdependencyRoutes);
    app.use("/api/followups", followupRoutes);
    app.use("/api/financial-overview", financialOverviewRoutes);
    app.use('/api/companybulk', companybulkokrsRoutes);
    app.use('/api/report', reportdb);

    // --- Socket.IO ---
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join", ({ childId, teacherId }) => {
            socket.join(`chat_${childId}_${teacherId}`);
        });

        socket.on("send_message", async ({ childId, teacherId, sender, message }) => {
            await pool.query(
                "INSERT INTO child_callcentre (child_id, teacher_id, sender, message) VALUES (?, ?, ?, ?)",
                [childId, teacherId, sender, message]
            );

            io.to(`chat_${childId}_${teacherId}`).emit("receive_message", {
                childId,
                teacherId,
                sender,
                message,
                created_at: new Date(),
            });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} running on port ${PORT}`);
    });
}
