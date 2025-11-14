import mammoth from "mammoth";

const extractTextFromDoc = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth
      .extractRawText({ arrayBuffer })
      .then(function (result) {
        var html = result.value
          .replace(/\u00a0/g, " ") // non-breaking spaces → regular
          .replace(/\[\d+\]/g, "") // remove footnote references like [1]
          .replace(/\s+/g, " ") // collapse multiple spaces/newlines
          .trim(); // The generated HTML
        return html;
      })
      .catch(function (error) {
        console.error(error);
      });
    return result || "";
  } catch (error) {
    console.error("Error extracting text from DOC:", error);
    return "";
  }
};


import { pdfjsLib } from './pdf/pdfJSLib';
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";

const readPdf = async (file: File) => {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  // const pdf = await pdfjsLib.getDocument(fileUrl).promise;
  console.log(`Loaded ${pdf.numPages} pages`);

  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();

  const text = textContent.items
    .map((i: TextItem | TextMarkedContent) => {
      if ("str" in i) {
        return i.str;
      }
      return "";
    })
    .join(" ");
  return text;
};


export const extractTextFromDocument = async (file: File): Promise<string> => {
  const fileType = file.type;
  if (fileType.includes("pdf")) {
    return await readPdf(file);
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return await extractTextFromDoc(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}