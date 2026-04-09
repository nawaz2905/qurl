import express from "express";
import routes from "./routes/all.routes";
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 5000;
const APP_BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");

app.use(cors());
app.use(express.json());


app.use(routes);

app.listen(PORT, () => {
    console.log(`server running on ${APP_BASE_URL}`);
});
