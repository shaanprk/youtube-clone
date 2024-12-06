import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

// Create a new instance of the Storage client
const storage = new Storage();

const rawVideoBucketName = "binni-yt-raw-videos";
const processedVideoBucketName = "binni-yt-processed-videos";

const localRawVideosDir = "./raw-videos";
const localProcessedVideosDir = "./processed-videos";

export function setupDirectories() {
    directoryExists(localRawVideosDir);
    directoryExists(localProcessedVideosDir);
}

/**
 * @param rawVideoName Name of file to be converted from {@link localRawVideosDir}
 * @param processedVideoName Name of the converted file from {@link localProcessedVideosDir}
 * @returns 
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideosDir}/${rawVideoName}`)
            .outputOptions("-vf", "scale=-1:360") // 360p resolution
            .on("end", () => {
                console.log("Video processed successfully.");
                resolve();
            })
            .on("error", (err) => {
                console.error(`An error has occurred: ${err.message}`);
                reject(err);
            })
            .save(`${localProcessedVideosDir}/${processedVideoName}`);
    });
}

/**
 * 
 * @param rawVideo Name of the raw video file to be downloaded
 */
export async function downloadRawVideo(rawVideo: string) {
    await storage.bucket(rawVideoBucketName)
        .file(rawVideo)
        .download({ destination: `${localRawVideosDir}/${rawVideo}` });

    console.log(
        `gs://${rawVideoBucketName}/${rawVideo} downloaded to ${localRawVideosDir}/${rawVideo}.`
    );
}

/**
 * 
 * @param processedVideo Name of the processed video file to be uploaded
 */
export async function uploadProcessedVideo(processedVideo: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideosDir}/${processedVideo}`, {
        destination: processedVideo
    });

    console.log(
        `${localProcessedVideosDir}/${processedVideo} uploaded to gs://${processedVideoBucketName}/${processedVideo}.`
    );

    await bucket.file(processedVideo).makePublic();
}

export function deleteRawVideo(rawVideo: string) {
    return deleteFile(`${localRawVideosDir}/${rawVideo}`);
}

export function deleteProcessedVideo(processedVideo: string) {
    return deleteFile(`${localProcessedVideosDir}/${processedVideo}`);
}



/**
 * 
 * @param filePath Path of the file to be deleted
 * @returns 
 */
function deleteFile(filePath: string) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`An error has occurred: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`File ${filePath} deleted.`);
                    resolve();
                }
            });
        } else {
            reject(`File ${filePath} does not exist.`);
        }
    });
}

/**
 * 
 * @param directoryPath Path of the directory to be created
 */
function directoryExists(directoryPath: string) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true }); // Create directory if it doesn't exist
        console.log(`Directory ${directoryPath} created.`);
    }
}