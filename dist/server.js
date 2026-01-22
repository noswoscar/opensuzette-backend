"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connexion MongoDB
const MONGO_URL = 'mongodb://localhost:27017';
const client = new mongodb_1.MongoClient(MONGO_URL);
let votesCollection;
client.connect().then(() => {
    const db = client.db('opensuzette');
    votesCollection = db.collection('votes');
    console.log('Connected to MongoDB');
});
console.log('Connecté proprement');
// Enregistrer un vote
app.post('/api/votes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categorieId, besoinId } = req.body;
    if (!categorieId || !besoinId) {
        return res.status(400).json({ error: 'categorieId et besoinId requis' });
    }
    try {
        const result = yield votesCollection.insertOne({
            categorieId,
            besoinId,
            createdAt: new Date()
        });
        res.json({ success: true, voteId: result.insertedId });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Récupérer les votes par besoin
app.get('/api/votes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aggregation = yield votesCollection
            .aggregate([{ $group: { _id: { categorieId: '$categorieId', besoinId: '$besoinId' }, votes: { $sum: 1 } } }])
            .toArray();
        res.json(aggregation);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
