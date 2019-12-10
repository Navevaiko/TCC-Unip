const firebaseApp = require('../config/firebase_config');
const uuid = require('uuid');
require('firebase/firestore');

const firestore = firebaseApp.firestore();
const collectionName = 'Questions';

module.exports = {
    async create(req, res){
        try {
            const {
                question,
                number,
                answers,
                correct_answer,
                theme
            } = req.body;

            const docRef = await firestore.collection(collectionName).doc(uuid());

            await docRef.set({
                question,
                number,
                answers,
                correct_answer,
                theme
            });

            res.json({ sucess: true, message: 'Pergunta criada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucess: false, message: 'Erro ao criar a pergunta' });
        }
    },

    async getAll(req, res) {
        try {
            const { theme } = req.query;
            
            const questionsDocs = await firestore.collection(collectionName).get();
            const questions = [];

            questionsDocs.forEach(doc => {
                if(theme == doc.data().theme) questions.push({id: doc.id, data: doc.data() });
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
            
            await firestore.collection(collectionName).doc(id).delete();

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

            await firestore.collection(collectionName).doc(id).update(dataToUpdate);

            res.json({ sucess: true, message: 'Pergunta editada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucess: false, message: 'Erro ao editar pergunta' });
        }
    },

    async getById(id) {
        try {
            const questionData = await firestore.collection(collectionName).doc(id).get();
            
            return { id: questionData.id, data: questionData.data() };
        } catch (error) {
            console.log(error);
            return undefined;
        }
    } 
}