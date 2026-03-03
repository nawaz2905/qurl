import express from "express";
import routes from "./routes/all.routes";
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());


app.use(routes);

const PORT = process.env.PORT || 5000

app.listen(PORT =>{
    console.log(`server running on http://localhost:${PORT}`);
});