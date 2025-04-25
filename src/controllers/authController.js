const AuthService = require('../services/authService');

const AuthController = {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'Todos os campos são obrigatórios.'
                });
            }

            const trimmedName = name.trim();
            const normalizedEmail = email.trim().toLowerCase();

            const result = await AuthService.register({ name: trimmedName, email: normalizedEmail, password, });

            res.status(201).json({
                status: true,
                data: result
            });
        } catch (err) {
            res.status(400).json({
                status: false,
                message: err.message
            });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });
            res.json({
                status: true,
                data: result
            });
        } catch (err) {
            res.status(400).json({
                status: false,
                message: err.message
            });
        }
    },

    async requestResetPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.requestResetPassword(email);
            res.json({
                status: true,
                message: 'E-mail enviado com instruçoes para redefinir a senha',
                token: result.token
            })
        } catch (error) {
            res.status(400).json({
                status: false,
                message: error.message,
            })
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const result = await AuthService.resetPassword(token, newPassword);
            res.json({
                status: true,
                message: result.message
            });
        } catch (err) {
            res.status(400).json({
                status: false,
                message: err.message
            });
        }
    },

    async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;

            const result = await AuthService.changePassword(userId, currentPassword, newPassword);
            res.json({
                status: true,
                message: result.message
            })
        } catch (error) {
            res.status(400).json({
                status: false,
                message: err.message
            });
        }
    }
};

module.exports = AuthController;
