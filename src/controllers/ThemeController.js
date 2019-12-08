const firebaseApp = require('../config/firebase_config');
require('firebase/firestore');

const collectionName = 'Themes';
const firestore = firebaseApp.firestore();

module.exports = {
    async getAll(req, res){
        try {
            const themesData = await firestore.collection(collectionName).get();
            const themes = [];

            themesData.forEach(theme => {
                themes.push({ id: theme.id, data: theme.data() });
            });

            res.json({ success: true, message: 'Temas listados com sucesso', themes });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: 'Erro ao listar os temas' });
        }
    }
}