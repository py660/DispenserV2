import fs from 'fs';
import path from 'path';

const componentsDir = path.join(new URL('./', import.meta.url).pathname);

const registerComponents = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const customId = interaction.customId;
        
        try {
            const files = fs.readdirSync(componentsDir);
            
            for (const file of files) {
                const componentFilePath = path.join(componentsDir, file);
                const { default: component } = await import(componentFilePath);

                if (component.id === customId && typeof component.run === 'function') {
                    await component.run(client, interaction);
                    return;
                }
            }

            console.error(`Error: No component found for custom ID ${customId}`);
        } catch (error) {
            console.error(`Error processing components:`, error);
        }
    });
};

export default registerComponents;
