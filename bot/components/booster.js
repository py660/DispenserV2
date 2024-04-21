import dispense from "../dispense.js";

const booster = {
    id: 'booster',
    async run(client, interaction) {
        try {
            dispense(client, interaction)
        } catch (error) {
            console.error('Error handling "booster" button:', error);
        }
    }
};

export default booster;
