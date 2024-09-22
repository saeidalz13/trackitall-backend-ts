import { promises } from "fs";
import path from "path";
import { ApiLogger } from "./serverUtils";

export default class FileProcessor {
  public static async saveResumeFile(
    userUlid: string,
    jobUlid: string,
    fileBuffer: Buffer
  ): Promise<boolean> {
    try {
      const _path = path.join(
        __dirname,
        "filestorage",
        "resumes",
        userUlid,
        jobUlid
      );
      await promises.mkdir(_path, { recursive: true });

      const filePath = path.join(_path, `resume_${jobUlid}.pdf`);
      await promises.writeFile(filePath, fileBuffer);

      return true;
    } catch (error) {
      ApiLogger.error(error);
      return false;
    }
  }
}
