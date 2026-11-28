
import express from "express";

const app = express();
const PORT = 3001;

app.use(express.json());

// Rota inicial para verificar se o servidor está funcionando
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    message: "Servidor do NuBanko funcionando!",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor NuBanko rodando em http://localhost:${PORT}`);
});
