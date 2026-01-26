import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 80;

// 将当前文件夹下的 index.html 作为静态页面发布
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Fake site app listening on port ${port}`);
});
