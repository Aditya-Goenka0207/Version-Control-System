const fs = require("fs").promises;
const path = require("path");
const {
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: "commits/",
    });

    const data = await s3.send(listCommand);
    const objects = data.Contents;

    for (const object of objects) {
      const key = object.Key;

      if (!key || key.endsWith("/")) continue;

      const commitDir = path.join(
        commitsPath,
        path.dirname(key).split("/").pop(),
      );

      await fs.mkdir(commitDir, { recursive: true });

      const getCommand = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      const fileContent = await s3.send(getCommand);

      const buffer = Buffer.from(await fileContent.Body.transformToByteArray());

      await fs.writeFile(path.join(repoPath, key), buffer);
    }

    console.log("All commits pulled from S3");
  } catch (err) {
    console.error("Unable to pull : ", err);
  }
}

module.exports = { pullRepo };
