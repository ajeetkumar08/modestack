const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 7000;

const userRouter = require("./routes/user");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Root route" });
});

app.use((req, res) => {
  res.status(404);

  // respond with json
  if (req.accepts("json")) {
    res.json({ success: false, message: "Route not found" });
  }
});

try {
  app.listen(port, () => {
    console.log(`ModeStack API listening on port ${port}!`);
  });
} catch (error) {
  console.log(error);
}
