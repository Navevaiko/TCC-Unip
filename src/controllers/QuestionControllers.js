const firebaseApp = require('firebase');
const uuid = require('uuid');
require('firebase/firestore');

module.exports = {
    async create(req, res){
        try {
            const {
                question,
                number,
                answers,
                correct_answer,
            } = req.body;

            const docRef = await firebaseApp.firestore().collection('Questions').doc(uuid());

            await docRef.set({
                question,
                number,
                answers,
                correct_answer
            });

            res.json({ sucess: true, message: 'Pergunta criada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucess: false, message: 'Erro ao criar a pergunta' });
        }
    },

    async getAll(req, res) {
        try {
            const questionsDocs = await firebaseApp.firestore().collection('Questions').get();
            const questions = [];

            questionsDocs.forEach(doc => {
                questions.push({id: doc.id, data: doc.data() });
            });

            res.json({ sucess: true, message: 'Perguntas listadas com sucesso', data: questions });
        } catch (error) {
            console.log(error);
            res.json({ sucess: false, message: 'Erro ao listar as perguntas' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            await firebaseApp.firestore().collection('Questions').doc(id).delete();

            res.json({ sucess: true, message: 'Pergunta deletada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucess: false, message: 'Erro ao deletar pergunta' });
        }
    },

    async edit(req, res) {
        try {
            const { id } = req.params;
            const body  = req.body;
            let dataToUpdate = {};

            for(let key in body) {
                dataToUpdate[key] = body[key];
            };

            await firebaseApp.firestore().collection('Questions').doc(id).update(dataToUpdate);

            res.json({ sucess: true, message: 'Pergunta editada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucess: false, message: 'Erro ao editar pergunta' });
        }
    }
}