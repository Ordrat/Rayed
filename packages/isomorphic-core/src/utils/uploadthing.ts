import { generateUploadButton, generateUploadDropzone, generateUploader, generateReactHelpers } from "@uploadthing/react";

// Note: This uses a generic 'any' type for the file router to avoid hardcoded paths
// Each app should ideally implement its own uploadthing utilities with proper types
export const Uploader: ReturnType<typeof generateUploader> = generateUploader<any>();
export const UploadButton: ReturnType<typeof generateUploadButton> = generateUploadButton<any>();
export const UploadDropzone: ReturnType<typeof generateUploadDropzone> = generateUploadDropzone<any>();

export const { useUploadThing, uploadFiles } = generateReactHelpers<any>();
