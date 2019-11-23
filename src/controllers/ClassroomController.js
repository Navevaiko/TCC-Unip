const firebaseApp = require('../config/firebase_config');
const uuid = require('uuid');
require('firebase/firestore');

module.exports = {
    async create(req, res) {
        try {
            const {
                name,
                period
            } = req.body;

            const docReference = await firebaseApp.firestore().collection('Classrooms').doc(uuid());

            await docReference.set({ name, period });
            res.json({ sucesso: true, mensagem: 'Sala criada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucesso: false, mensagem: 'Erro ao criar a sala' });
        }

    },

    async getAll(req, res) {
        try {
            let classrooms = [];

            const classroomsDocs = await firebaseApp.firestore().collection('Classrooms').get();

            classroomsDocs.forEach(doc => {
                classrooms.push({ id: doc.id, data: doc.data() });
            });

            res.json({ sucesso: true, mensagem: 'Salas listadas com sucesso', data: classrooms });
        } catch (error) {
            console.log(error);
            res.json({ sucesso: false, mensagem: 'Erro ao listar salas' });
        }

    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            await firebaseApp.firestore().collection('Classrooms').doc(id).delete();

            res.json({ sucesso: true, mensagem: 'Sala deletada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucesso: false, mensagem: 'Erro ao deletar a sala' });
        }

    },

    async edit(req, res) {
        try {
            const { id } = req.params;
            const body = req.body;
            
            let dataToUpdate = {};

            for(let key in body) {
                dataToUpdate[key] = body[key];
            }
            
            await firebaseApp.firestore().collection('Classrooms').doc(id).update(dataToUpdate);

            res.json({ sucesso: true, mensagem: 'Sala editada com sucesso' });
        } catch (error) {
            console.log(error);
            res.json({ sucesso: false, mensagem: 'Erro ao editar a sala' });
        }
        
    }
}