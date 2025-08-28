import express from "express";
import cors from "cors";
import countriesRouter from './routes/countries'

const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', countriesRouter);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Zifala Country Distance API",
    endpoints: {
      countries: "GET /api/countries",
      distances: "POST /api/distances",
      stream: "GET /api/distances/stream?countries=US,CA,MX",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Countries API: http://localhost:${PORT}/api/countries`);
});