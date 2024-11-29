import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

type GetNextImageOptions = {
  lastImageName: string | undefined;
};

type NextImage = {
  imageName: string;
  absolutePath: string;
  loopedAround: boolean;
};

async function getNextImage(options?: GetNextImageOptions): Promise<NextImage> {
  const readdir = util.promisify(fs.readdir);
  const imagesDir = path.resolve(__dirname, '../../imagequeue');
  const imageFiles = (await readdir(imagesDir)).sort();
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
  const validImageFiles = imageFiles.filter((filename) => imageRegex.test(filename));

  if (validImageFiles.length === 0) {
    throw new Error('No image files found in the directory.');
  }

  const randomIndex = Math.floor(Math.random() * validImageFiles.length);
  const imageName = validImageFiles[randomIndex];
  const absolutePath = path.join(imagesDir, imageName);

  return {
    imageName,
    absolutePath,
    loopedAround: false, // No looping logic needed for random selection
  };
}

export { getNextImage };
