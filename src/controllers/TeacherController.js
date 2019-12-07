const firebaseApp = require('../config/firebase_config');
require('firebase/auth');

module.exports = {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            await firebaseApp.auth().signInWithEmailAndPassword(email, password);
            res.json({ success: true, message: 'Usuário autenticado com sucesso' });
        } catch (error) {
            console.log(error);
            let message = '';

            switch(error.code) {
                case 'auth/wrong-password': message = 'Senha incorreta'; break;
                case 'auth/user-not-found': message = 'Usuário não encontrado'; break;
            }
            
            res.json({ success: false, message });
        }
    }
}