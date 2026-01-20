import { fetchPlaceholders } from '../../scripts/aem.js';

/**
 * Replaces content in a block with AI-generated text
 * @param {Element} block - The block element to update
 * @param {string} blockType - The type of block (e.g., 'hero', 'columns', 'cards')
 * @param {Object} options - Configuration options
 * @param {string} options.selector - CSS selector for elements to replace (default: 'p, h1, h2, h3, h4, h5, h6')
 * @param {boolean} options.limitText - Whether to limit text for better UI balance (default: true for cards/columns)
 * @param {number} options.maxSentences - Maximum number of sentences to include (default: 2)
 * @param {number} options.maxChars - Maximum characters to include (default: 150)
 * @returns {Promise<boolean>} True if content was replaced, false otherwise
 */
export async function replaceBlockContent(block, blockType, options = {}) {
    const { 
        selector = 'p, h1, h2, h3, h4, h5, h6',
        limitText = true,
        maxSentences = 2,
        maxChars = 150
    } = options;
    
    console.log(`[replaceBlockContent] Starting for blockType: ${blockType}`);
    
    // Check if AI image data is already available, otherwise fetch it
    let placeholders;
    if (window.placeholders && window.placeholders.aiImageLog) {
        placeholders = await window.placeholders.aiImageLog;
    } else {
        placeholders = await fetchPlaceholders();
    }
    
    console.log('[replaceBlockContent] Placeholders:', placeholders);
    
    // Try both singular and plural versions
    const pluralType = blockType.endsWith('s') ? blockType : `${blockType}s`;
    const singularType = blockType.endsWith('s') ? blockType.slice(0, -1) : blockType;
    
    let blockData;
    if (placeholders[blockType]) {
        blockData = placeholders[blockType];
        console.log(`[replaceBlockContent] Found data for ${blockType}`);
    } else if (placeholders[pluralType]) {
        blockData = placeholders[pluralType];
        console.log(`[replaceBlockContent] Found data for ${pluralType}`);
    } else if (placeholders[singularType]) {
        blockData = placeholders[singularType];
        console.log(`[replaceBlockContent] Found data for ${singularType}`);
    }
    
    console.log('[replaceBlockContent] Block data:', blockData);
    
    if (blockData && blockData.length > 0) {
        const textElements = blockData.filter(item => item.generatedText);
        console.log('[replaceBlockContent] Text elements with generatedText:', textElements.length);
        textElements.forEach((elem, idx) => {
            console.log(`[replaceBlockContent] AI Element ${idx + 1}:`, elem.generatedText ? elem.generatedText.substring(0, 80) + '...' : 'NO TEXT');
        });
        
        if (textElements.length > 0) {
            // Process each row/card independently
            const rows = block.querySelectorAll(':scope > div');
            console.log('[replaceBlockContent] Found rows:', rows.length);
            console.log(`[replaceBlockContent] We have ${textElements.length} AI entries available - will only replace that many containers`);
            
            let processedCount = 0;
            
            // Process each row separately to maintain row/card boundaries
            rows.forEach((row, rowIndex) => {
                // Stop if we've already processed all available AI entries
                if (processedCount >= textElements.length) {
                    console.log(`[replaceBlockContent] Already processed ${processedCount} containers (all AI entries used), skipping remaining rows`);
                    return;
                }
                
                const cols = row.children;
                console.log(`[replaceBlockContent] Processing row ${rowIndex + 1} with ${cols.length} columns`);
                
                // Find ALL text containers in THIS row (there might be multiple)
                const textContainersInRow = [];
                for (const col of cols) {
                    const hasPicture = col.querySelector('picture');
                    const hasText = col.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol');
                    console.log('[replaceBlockContent] Column - hasPicture:', !!hasPicture, 'hasText:', !!hasText);
                    
                    if (!hasPicture && hasText) {
                        textContainersInRow.push(col);
                        console.log('[replaceBlockContent] Found text container', textContainersInRow.length, 'in this row');
                    }
                }
                
                // Skip this row if no text containers found
                if (textContainersInRow.length === 0) {
                    console.log('[replaceBlockContent] No text containers in this row, skipping');
                    return;
                }
                
                console.log(`[replaceBlockContent] Found ${textContainersInRow.length} text container(s) in row ${rowIndex + 1}`);
                
                // Process each text container in this row (but stop if we run out of AI entries)
                textContainersInRow.forEach((textContainer, colIndex) => {
                    // Check if we still have AI entries available
                    if (processedCount >= textElements.length) {
                        console.log(`[replaceBlockContent] No more AI entries available (have ${textElements.length}, processed ${processedCount}), leaving this container unchanged`);
                        return;
                    }
                    console.log(`[replaceBlockContent] === Processing text container ${colIndex + 1}/${textContainersInRow.length} in row ${rowIndex + 1} ===`);
                    console.log('[replaceBlockContent] Current content:', textContainer.innerHTML.substring(0, 100));
                    
                    // Calculate AI text index based on total processed count
                    const textElementIndex = processedCount % textElements.length;
                    console.log(`[replaceBlockContent] processedCount: ${processedCount}, textElements.length: ${textElements.length}, index: ${textElementIndex}`);
                    
                    let generatedText = textElements[textElementIndex].generatedText;
                    console.log(`[replaceBlockContent] Using AI text element ${textElementIndex + 1}/${textElements.length}`);
                    console.log(`[replaceBlockContent] AI text preview:`, generatedText ? generatedText.substring(0, 100) : 'NO TEXT');
                    
                    // Increment BEFORE processing so next container gets next AI entry
                    processedCount++;
                    
                    if (generatedText) {
                        console.log('[replaceBlockContent] Original generated text:', generatedText);
                        
                        // Clean markdown formatting from AI-generated text
                        // Remove markdown headings (# ## ### etc)
                        generatedText = generatedText.replace(/^#{1,6}\s+/gm, '');
                        // Remove bold/italic markers (**text**, *text*)
                        generatedText = generatedText.replace(/\*\*([^*]+)\*\*/g, '$1');
                        generatedText = generatedText.replace(/\*([^*]+)\*/g, '$1');
                        // Remove other common markdown syntax
                        generatedText = generatedText.replace(/`([^`]+)`/g, '$1');
                        
                        console.log('[replaceBlockContent] Cleaned text:', generatedText);
                        
                        // Check if there's an image in the same row (for better UI balance)
                        const row = textContainer.closest(':scope > div') || textContainer.parentElement;
                        const hasImageInRow = row?.querySelector('picture') !== null;
                        console.log('[replaceBlockContent] Has image in row:', hasImageInRow);
                        
                        // Adjust content length based on block type and image presence
                        let adjustedText = generatedText;
                        
                        // For cards and columns with images, use shorter, more concise text for better UI
                        const shouldLimit = limitText && 
                                          (blockType === 'cards' || blockType === 'card' || 
                                           blockType === 'columns' || blockType === 'column') && 
                                          hasImageInRow;
                    
                    if (shouldLimit) {
                        // Split into paragraphs (remove empty ones)
                        const paragraphs = generatedText.split(/\n\n+/).filter(para => para.trim().length > 0);
                        
                        console.log('[replaceBlockContent] Found', paragraphs.length, 'paragraphs');
                        console.log('[replaceBlockContent] All paragraphs:', paragraphs);
                        
                        // Separate heading and content
                        let heading = '';
                        let contentParagraphs = [];
                        
                        for (const para of paragraphs) {
                            const trimmed = para.trim();
                            const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
                            
                            console.log('[replaceBlockContent] Paragraph with', sentences.length, 'sentences:', trimmed.substring(0, 80));
                            
                            // First single-sentence paragraph is likely the heading
                            if (!heading && sentences.length === 1 && trimmed.length < 100) {
                                heading = trimmed;
                                console.log('[replaceBlockContent] Found heading:', heading);
                            } else {
                                // Everything else is content
                                contentParagraphs.push(trimmed);
                            }
                        }
                        
                        // Build adjusted text with heading + content
                        let parts = [];
                        
                        // Add heading if we found one
                        if (heading) {
                            parts.push(`HEADING:${heading}`); // Mark it so we can create h3 element
                        }
                        
                        // Add content paragraphs
                        if (contentParagraphs.length > 0) {
                            // Combine all content paragraphs
                            const fullContent = contentParagraphs.join(' ');
                            const sentences = fullContent.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
                            
                            console.log('[replaceBlockContent] Found', sentences.length, 'content sentences');
                            
                            // Take more sentences for better balance with images
                            let limitedContent = sentences.slice(0, maxSentences).join(' ').trim();
                            
                            // Apply character limit only if still too long
                            if (limitedContent.length > maxChars) {
                                const lastSpace = limitedContent.lastIndexOf(' ', maxChars);
                                limitedContent = limitedContent.substring(0, lastSpace > 0 ? lastSpace : maxChars).trim() + '...';
                            }
                            
                            parts.push(limitedContent);
                        }
                        
                        adjustedText = parts.join('\n\n');
                        
                        console.log('[replaceBlockContent] Text adjusted for better UI balance');
                        console.log('[replaceBlockContent] Heading:', heading);
                        console.log('[replaceBlockContent] Original length:', generatedText.length, 'chars');
                        console.log('[replaceBlockContent] Adjusted length:', adjustedText.length, 'chars');
                        console.log('[replaceBlockContent] Adjusted text:', adjustedText);
                    }
                        
                        // CLEAR ALL existing content in the text container
                        textContainer.innerHTML = '';
                        
                        // Split adjusted text by double newlines for paragraphs
                        const paragraphs = adjustedText.split('\n\n').filter(para => para.trim().length > 0);
                        
                        // Create new elements (h3 for heading, p for content)
                        paragraphs.forEach(paragraph => {
                            const trimmed = paragraph.trim();
                            
                            // Check if this is a heading (marked with HEADING:)
                            if (trimmed.startsWith('HEADING:')) {
                                const headingText = trimmed.substring(8).trim(); // Remove HEADING: prefix
                                const heading = document.createElement('h3');
                                heading.textContent = headingText;
                                textContainer.appendChild(heading);
                                console.log('[replaceBlockContent] Added heading element:', headingText);
                            } else {
                                // Regular paragraph
                                const newP = document.createElement('p');
                                newP.textContent = trimmed;
                                textContainer.appendChild(newP);
                                console.log('[replaceBlockContent] Added paragraph element');
                            }
                        });
                        
                        console.log(`[replaceBlockContent] Container ${colIndex + 1} in row ${rowIndex + 1} replacement complete`);
                    }
                }); // End forEach textContainersInRow
            }); // End forEach rows
            
            if (processedCount > 0) {
                console.log(`[replaceBlockContent] Processed ${processedCount} rows/cards with content replacement`);
                return true;
            } else {
                console.log('[replaceBlockContent] No text containers found in any rows');
            }
        }
    }
    
    console.log('[replaceBlockContent] No content to replace');
    return false;
}

/**
 * Replaces content in the .section.description section with hero's AI-generated text
 * This is specifically for a separate description section on the page, not the hero block itself
 * @returns {Promise<void>}
 */
export async function enableDescription() {
    // Check if AI image data is already available, otherwise fetch it
    let placeholders;
    if (window.placeholders && window.placeholders.aiImageLog) {
        // If aiImageLog exists, it might be a Promise, so await it
        placeholders = await window.placeholders.aiImageLog;
    } else {
        placeholders = await fetchPlaceholders();
    }
    
    // Check if Hero key exists and has generatedText
    if (placeholders && placeholders.hero && placeholders.hero.length > 0) {
        const heroData = placeholders.hero[0]; // Get the latest hero entry
        let generatedText = heroData.generatedText;
        
        if (generatedText) {
            // Clean markdown formatting
            generatedText = generatedText.replace(/^#{1,6}\s+/gm, '');
            generatedText = generatedText.replace(/\*\*([^*]+)\*\*/g, '$1');
            generatedText = generatedText.replace(/\*([^*]+)\*/g, '$1');
            generatedText = generatedText.replace(/`([^`]+)`/g, '$1');
            
            console.log('[enableDescription] Cleaned generated text:', generatedText);
            
            // Target the section with .section.description classes
            const descriptionSection = document.querySelector('.section.description');
            
            if (descriptionSection) {
                console.log('[enableDescription] Found description section');
                
                // Find or create the inner wrapper div (preserves padding/structure)
                let wrapper = descriptionSection.querySelector(':scope > div');
                if (!wrapper) {
                    wrapper = document.createElement('div');
                    descriptionSection.appendChild(wrapper);
                    console.log('[enableDescription] Created wrapper div');
                } else {
                    console.log('[enableDescription] Found existing wrapper div');
                }
                
                // Clear the wrapper content (not the section)
                wrapper.innerHTML = '';
                
                // Split into paragraphs
                const paragraphs = generatedText.split(/\n\n+/).filter(para => para.trim().length > 0);
                console.log('[enableDescription] Found', paragraphs.length, 'paragraphs');
                
                // Separate heading and content
                let heading = '';
                let contentParagraphs = [];
                
                for (const para of paragraphs) {
                    const trimmed = para.trim();
                    const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
                    
                    console.log('[enableDescription] Paragraph with', sentences.length, 'sentences:', trimmed.substring(0, 80));
                    
                    // First single-sentence paragraph is likely the heading
                    if (!heading && sentences.length === 1 && trimmed.length < 100) {
                        heading = trimmed;
                        console.log('[enableDescription] Found heading:', heading);
                    } else {
                        // Everything else is content
                        contentParagraphs.push(trimmed);
                    }
                }
                
                // Add heading as h2
                if (heading) {
                    const h2 = document.createElement('h2');
                    h2.textContent = heading;
                    wrapper.appendChild(h2);
                    console.log('[enableDescription] Added heading element');
                }
                
                // Add content paragraphs
                contentParagraphs.forEach(para => {
                    const p = document.createElement('p');
                    p.textContent = para.trim();
                    wrapper.appendChild(p);
                    console.log('[enableDescription] Added paragraph element');
                });
            } else {
                console.log('[enableDescription] Description section not found');
            }
        }
    }
    // If Hero key doesn't exist or no generatedText, keep the text as it is
}