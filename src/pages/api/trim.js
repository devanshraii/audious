import nc from 'next-connect';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';

const unlinkAsync = promisify(fs.unlink);

const upload = multer({ dest: 'uploads/' });

const handler = nc()
  .use(upload.single('file'))
  .post(async (req, res) => {
    const { file } = req;
    const { start, end } = req.body;
    const outputFilePath = `uploads/trimmed-${file.filename}.mp3`;

    try {
      console.log(`Starting ffmpeg with start time: ${start}, end time: ${end}`);
      
      await new Promise((resolve, reject) => {
        ffmpeg(file.path)
          .setFfmpegPath(ffmpegPath) // Set the path to ffmpeg binary
          .setStartTime(parseFloat(start))
          .setDuration(parseFloat(end) - parseFloat(start))
          .output(outputFilePath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      res.setHeader('Content-Disposition', `attachment; filename="trimmed-${file.originalname}"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      
      const fileStream = fs.createReadStream(outputFilePath);
      fileStream.pipe(res);

      fileStream.on('end', async () => {
        await unlinkAsync(file.path);
        await unlinkAsync(outputFilePath);
      });

      fileStream.on('error', async (error) => {
        await unlinkAsync(file.path);
        await unlinkAsync(outputFilePath);
        console.error('Error streaming file:', error);
        res.status(500).json({ error: 'Failed to process audio file' });
      });

    } catch (error) {
      console.error('Error processing audio file:', error);
      res.status(500).json({ error: 'Failed to process audio file' });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
