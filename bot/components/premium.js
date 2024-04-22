import dispense from "../dispense.js";

const premium = {
    id: 'premium',
    async run(client, interaction) {
        try {
            dispense(client, interaction)
        } catch (error) {
            console.error('Error handling "premium" button:', error);
        }
    }
};

export default premium;
