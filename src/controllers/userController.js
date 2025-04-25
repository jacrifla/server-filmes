const UserService = require('../services/userService');

const UserController = {
    async getAll(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json({
                status: true,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);
            if (!user){
                return res.status(404).json({
                    status:false,
                    message: 'Usuário não encontrado'
                });
            }
            res.json({
                status:true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;
            const user = await UserService.updateUser(id, { name, email });
            if (!user){
                return res.status(404).json({
                    status: false,
                    message: 'Usuário não encontrado ou deletado'
                });
            }
            res.json({
                status: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async softDelete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await UserService.softDeleteUser(id);
            if (!deleted) {
                return res.status(404).json({
                    status: false,
                    message: 'Usuario não encontrado' 
                });
            }
            res.json({
                status: true,
                message: 'Usuário deletado'
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async getStats(req, res) {
        try {
            const userId = req.params.id;
            
            const stats = await UserService.getStats(userId);
            res.status(200).json({
                status: true,
                data: stats
            })
            
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro ao buscar estatísticas: ${error}`
            });
        }
    }
};

module.exports = UserController;
