const ensureOwnUser = (req, res, next) => {
    const loggedUserId = parseInt(req.user?.id);

    const targetUserId =
        req.params?.id ? parseInt(req.params.id) :
        req.body?.userId ? parseInt(req.body.userId) :
        loggedUserId;

    if (isNaN(targetUserId)) {
        return res.status(400).json({
            status: false,
            message: 'ID de usuário inválido.'
        });
    }

    if (loggedUserId !== targetUserId) {
        return res.status(403).json({
            status: false,
            message: `Acesso negado: usuário não autorizado.`
        });
    }

    next();
};
module.exports = ensureOwnUser;