import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: [process.env.CORS_ORIGIN || "http://localhost:5174", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js"
import adminRouter from "./routes/admin.route.js"
import donorRouter from "./routes/doner.route.js"
import recipientRouter from "./routes/recipient.route.js"
import donorRequestRouter from "./routes/donerRequest.route.js"
import recipientRequestRouter from "./routes/recipientRequest.route.js"
import matchRouter from "./routes/match.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/donor", donorRouter)
app.use("/api/v1/recipient", recipientRouter)
app.use("/api/v1/match", matchRouter)
app.use("/api/v1/recipientRequest", recipientRequestRouter)
app.use("/api/v1/donorRequest", donorRequestRouter)

app.get("/", (req, res) => {
    res.send("working")
})


export { app }