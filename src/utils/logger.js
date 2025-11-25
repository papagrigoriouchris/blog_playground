const path = require("path");
const { promises: fs } = require("fs");

const LOG_FILE_PATH = path.join(process.cwd(), "blog_activity.log");

async function ensureLogFile() {
  try {
    await fs.access(LOG_FILE_PATH);
  } catch {
    await fs.writeFile(LOG_FILE_PATH, "", { flag: "a" });
  }
}

async function logActivity(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  await ensureLogFile();
  await fs.appendFile(LOG_FILE_PATH, line);
}

module.exports = {
  LOG_FILE_PATH,
  ensureLogFile,
  logActivity,
};
