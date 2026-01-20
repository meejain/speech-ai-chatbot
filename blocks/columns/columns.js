import { processImageLinks } from '../../scripts/scripts.js';
import { replaceBlockContent } from '../../scripts/utils.js';

export default async function decorate(block) {
  // Process any image links (links with 'assets' in href) before setting up columns
  await processImageLinks(block, {
    imageType: 'columns',
    replaceLink: true,
  });

  // Replace text content with AI-generated content
  // Limit text for better UI balance with images
  await replaceBlockContent(block, 'columns', {
    selector: 'p, h1, h2, h3, h4, h5, h6',
    limitText: true,
    maxSentences: 6,
    maxChars: 500,
  });

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
