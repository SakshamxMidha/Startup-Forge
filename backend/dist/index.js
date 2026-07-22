"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const app = (0, express_1.default)();
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
app.get('/test-db', async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany();
        res.json({ success: true, users });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Database connection failed' });
    }
});
//# sourceMappingURL=index.js.map