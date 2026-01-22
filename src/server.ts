import cors from 'cors'
import express from 'express'
import { MongoClient } from 'mongodb'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

// Connexion MongoDB
const MONGO_URL = 'mongodb://localhost:27017'
const client = new MongoClient(MONGO_URL)
let votesCollection: any

client.connect().then(() => {
	const db = client.db('opensuzette')
	votesCollection = db.collection('votes')
	console.log('Connected to MongoDB')
})

// Enregistrer un vote
app.post('/api/votes', async (req, res) => {
	const { categorieId, besoinId } = req.body

	if (!categorieId || !besoinId) {
		return res.status(400).json({ error: 'categorieId et besoinId requis' })
	}

	try {
		const result = await votesCollection.insertOne({
			categorieId,
			besoinId,
			createdAt: new Date()
		})
		res.json({ success: true, voteId: result.insertedId })
	} catch (err: any) {
		res.status(500).json({ error: err.message })
	}
})

// Récupérer les votes par besoin
app.get('/api/votes', async (req, res) => {
	try {
		const aggregation = await votesCollection
			.aggregate([{ $group: { _id: { categorieId: '$categorieId', besoinId: '$besoinId' }, votes: { $sum: 1 } } }])
			.toArray()
		res.json(aggregation)
	} catch (err: any) {
		res.status(500).json({ error: err.message })
	}
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
