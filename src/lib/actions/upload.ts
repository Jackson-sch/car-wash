"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

function generateSignature(params: Record<string, string>, apiSecret: string) {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  return crypto.createHash("sha1").update(paramString + apiSecret).digest("hex");
}

export async function uploadLogoAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo" };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const hasCloudinary = cloudName && apiKey && apiSecret;

    if (hasCloudinary) {
      console.log("Subiendo archivo a Cloudinary...");
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const params = {
        folder: "carwash_logos",
        timestamp,
      };

      const signature = generateSignature(params, apiSecret);

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("api_key", apiKey);
      cloudinaryFormData.append("timestamp", timestamp);
      cloudinaryFormData.append("signature", signature);
      cloudinaryFormData.append("folder", "carwash_logos");

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: cloudinaryFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }

      const result = await response.json();
      return { success: true, url: result.secure_url };
    } else {
      console.log("Cloudinary no configurado. Guardando archivo localmente...");
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "logo");
      await mkdir(uploadsDir, { recursive: true });

      const fileExtension = file.name.split(".").pop() || "png";
      const fileName = `logo-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const url = `/uploads/logo/${fileName}`;
      return { success: true, url };
    }
  } catch (error: any) {
    console.error("Error en uploadLogoAction:", error);
    return { success: false, error: error.message || "Error al procesar el archivo" };
  }
}
