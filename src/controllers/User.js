const firebaseApp = require('../config/firebase_config');
require('firebase/auth');
require('firebase/database');

const addExtraUserInfo = async(uid, extraData) => {
    try {
        const response = await firebaseApp.database().ref('/users/' + uid).set(extraData);

        return true;
    } catch (error) {
        console.log(error); 
        response.user.delete();
        return false;
    }
};

module.exports = {
    async createNewUser(req, res) {
        try {
            const { 
                name,
                email, 
                password,
                type
            } = req.body;
            
            const response = await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
            const extraDataResult = await addExtraUserInfo(response.user.uid, { name, email, password, type });
            
            if(extraDataResult) {
                res.json({ success: true, message: 'Usuário criado com sucesso', userId: response.user.uid });
            }else{
                res.json({ success: false, message: 'Erro ao criar usuário' });
            }
        }catch(error) {
            let message = "";

            switch(error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email já cadastrado';
                    break;
                case 'auth/invalid-email':
                    message = 'Email inválido';
                    break;
                case 'auth/operation-not-allowed':
                    message = "Conta desativada"
                    break;
                case 'auth/weak-password':
                    message = 'Senha muito fraca';
                    break;
                default:
                    console.log(error);
                    message = 'Ocorreu um erro';
            }
            
            res.json({ success: false, message });
        }
    },
    async login(req, res) {

    }
}