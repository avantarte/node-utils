"use strict";

import { existsSync, mkdirSync, promises } from "fs";
import prompt from "prompt";
import sharp from "sharp";

interface Error {
  errno: number;
  code: "ENOENT";
  path: "";
}

const promptSchema = {
  properties: {
    svg_folder_path: {
      pattern: /^(.+)\/([^\/]+)$/,
      message: "The path of your SVGs",
      required: true,
    },
    output_height: {
      pattern: /^[0-9]+$/,
      message: "The height of your PNGs",
      default: 120,
    },
    output_width: {
      pattern: /^[0-9]+$/,
      message: "The width of your PNGs",
      default: 120,
    },
  },
};

const convertSvgToPng = async () => {
  prompt.start();
  prompt.get(
    promptSchema,
    async (_, { svg_folder_path, output_height, output_width }) => {
      try {
        const rootPath = svg_folder_path;
        const destinationPath = `${rootPath}/png`;
        const files = await promises.readdir(rootPath as string);
        if (!existsSync(destinationPath)) {
          mkdirSync(destinationPath);
        }
        files.map(async (file, i) => {
          if (!file.includes(".svg")) return;
          console.log(`Converting ${file} to png...`);
          await sharp(`${rootPath}/${file}`)
            .png()
            .resize(Number(output_width), Number(output_height))
            .toFile(`${destinationPath}/${file.replace(".svg", "")}.png`);

          if (i === files.length - 1) {
            console.log(
              `All swell, please find your pngs in ${destinationPath}`
            );
          }
        });
      } catch (err) {
        const error = err as Error;
        if (error?.errno === -2) {
          console.error(`${error.path} does not exist`);
        }
      }
    }
  );
};

convertSvgToPng();
