import express from "express";
import {
    convertVideo,
    deleteRawVideo,
    deleteProcessedVideo,
    downloadRawVideo,
    setupDirectories,
    uploadProcessedVideo
} from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
    let data;
    try {
        const message = Buffer.from(req.body.message.data, "base64").toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error("No video name provided.");
        }
    } catch (err) {
        console.error(err);
        return res.status(400).send(`Bad request: missing video name.`);
    }

    const inputVideo = data.name;
    const outputVideo = `processed-${inputVideo}`;

    // Download the raw video
    await downloadRawVideo(inputVideo);

    // Process the video
    try {
        await convertVideo(inputVideo, outputVideo);
    } catch (err) {
        await Promise.all([
            deleteRawVideo(inputVideo),
            deleteProcessedVideo(outputVideo)
        ]);
        console.error(err);
        return res.status(500).send(`An error occurred while processing the video.`);
    }

    // Upload the processed video
    await uploadProcessedVideo(outputVideo);

    await Promise.all([
        deleteRawVideo(inputVideo),
        deleteProcessedVideo(outputVideo)
    ]);

    return res.status(200).send(`Video processed successfully.`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});