import express from "express";
import fileUpload from "express-fileupload";
import fs from "fs";
import path, { dirname, join } from "path";
import unzipper from "unzipper";
import { fileURLToPath } from "url";
import fsExtra from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const updateRouter = express.Router();

updateRouter.use(fileUpload());

const config = {
  uploadsPath: process.env.UPLOADS_PATH || "./uploads",
  extractedUpdatesPath:
    process.env.EXTRACTED_UPDATES_PATH || "./extracted-updates",
};

// Function to read the installation path from the update zip
function readUpdateInfoFromZip(extractPath) {
  const configPath = path.join(extractPath, "update-config.json");

  return fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
    : null;
}

// Function to copy or update files and folders recursively
function copyOrUpdateFiles(sourceFolder, targetFolder) {
  try {
    const items = fs.readdirSync(sourceFolder);

    for (const item of items) {
      const sourceItemPath = path.join(sourceFolder, item);
      const targetItemPath = path.join(targetFolder, item);

      const stats = fs.statSync(sourceItemPath);

      if (stats.isDirectory()) {
        // Create the target directory if it doesn't exist
        if (!fs.existsSync(targetItemPath)) {
          fs.mkdirSync(targetItemPath);
        }
        // Recursively copy/update subdirectories and files
        copyOrUpdateFiles(sourceItemPath, targetItemPath);
      } else {
        // Copy/update individual files
        if (!fs.existsSync(targetItemPath)) {
          fs.copyFileSync(sourceItemPath, targetItemPath);
        } else {
          // Update the file if it already exists in the target folder
          const sourceFileContent = fs.readFileSync(sourceItemPath, "utf-8");
          fs.writeFileSync(targetItemPath, sourceFileContent);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error copying or updating files:", error);
    return false;
  }
}

// Function to empty a directory and its contents recursively
async function emptyDirectory(directoryPath) {
  try {
    await fsExtra.emptyDir(directoryPath);
    return true;
  } catch (error) {
    if (error.code === "ENOTEMPTY") {
      // Ignore the error if the directory is not empty
      return true;
    }
    console.error(`Error emptying directory '${directoryPath}':`, error);
    return false;
  }
}

// ====================
// INSTALL UPDATE ROUTE
// ====================
updateRouter.post("/apply-update", async (req, res) => {
  if (!req.files || !req.files.updateZip) {
    return res.status(400).send("No update file was uploaded.");
  }

  const updateZipFile = req.files.updateZip;
  const uploadPath = path.join(__dirname, config.uploadsPath);
  const extractPath = path.join(__dirname, config.extractedUpdatesPath);

  const backendRoutesPath = path.join(__dirname, "backend", "routes");

  fs.mkdirSync(uploadPath, { recursive: true });
  fs.mkdirSync(extractPath, { recursive: true });

  try {
    await updateZipFile.mv(path.join(uploadPath, updateZipFile.name));

    fs.createReadStream(path.join(uploadPath, updateZipFile.name))
      .pipe(unzipper.Extract({ path: extractPath }))
      .on("close", async () => {
        const updateInfo = readUpdateInfoFromZip(extractPath);

        if (!updateInfo || !updateInfo.installPath || !updateInfo.type) {
          return res.status(400).send("Invalid update file.");
        }

        const isFrontendUpdate = updateInfo.type === "frontend";
        const baseDirectory = isFrontendUpdate ? "frontend" : "backend";

        const targetFolder = path.join(
          backendRoutesPath,
          baseDirectory,
          updateInfo.installPath
        );
        console.log("updateInfo:", updateInfo);
        console.log("targetFolder:", targetFolder);

        if (!fs.existsSync(targetFolder)) {
          return res.status(400).send("Target folder does not exist.");
        }

        // Copy or update files and folders from the extracted update to the target folder
        const success = copyOrUpdateFiles(
          path.join(extractPath, baseDirectory, updateInfo.installPath),
          targetFolder
        );

        if (success) {
          // Empty the temporary folders and their contents recursively
          const emptyUploads = await emptyDirectory(uploadPath);
          const emptyExtractedUpdates = await emptyDirectory(extractPath);

          if (emptyUploads && emptyExtractedUpdates) {
            res.send("Update applied successfully.");
          } else {
            res.status(500).send("Error emptying temporary folders.");
          }
        } else {
          res.status(500).send("Error applying the update.");
        }
      });
  } catch (err) {
    console.error("Error processing the update:", err);
    res.status(500).send("Error applying the update.");
  }
});

export default updateRouter;
