const Users = require('../user/userModel');
const userControll = require('../user/userController');
const Books = require('../books/bookModel');
const bookControl = require('../books/bookController');
const { Op, Sequelize } = require('sequelize');


exports.explorer = async (req, res) => {
    try{

        const livrosData = await Books.findAll({
            order: [
                Sequelize.fn('RANDOM')
            ],
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username']
                },
                {
                    model: Users,
                    as: 'usuariosQueFavoritaram',
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        });

        const usuarioId = req.session.usuarioLogado.id

        const livros = livrosData.map(livro => {
            const livroSimples = livro.get({plan: true});

            livroSimples.favoritado = false;
            if (usuarioId && livroSimples.usuariosQueFavoritaram){
                livroSimples.favoritado = livroSimples.usuariosQueFavoritaram.some(u => u.id === usuarioId);
            }
            return livroSimples
        });

        return res.render('profiles/explorer', {livros: livros, usuarioLogado: req.session.usuarioLogado, title: 'EduStream'});

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao carregar livros');
        return res.redirect('/');
    }
}

exports.getProfile = async (req, res) => {
    try{

        const id = req.params.id;

        const totalLivros = await Books.count({where: {user_id: id}});

        const perfil = await Users.findOne({
            where: {
                id: id,
                ativo: true
            },
            attributes: [
                'username', 'first_name', 'last_name'
            ]
        });

        if(!perfil){
            req.flash('error', 'Usuário não encontrado');
            return res.redirect('/profiles/explorer');
        }

        return res.render('profiles/user-profile', { perfil, totalLivros, title: 'EduStream' });

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao ver perfil');
        return res.redirect('/profiles/explorer');
    }
}

exports.favoritar = async (req, res) => {
    const userId = req.session.usuarioLogado.id;
    const livro = await Books.findByPk(req.params.id);
    const ja = await livro.hasUsuariosQueFavoritaram(userId);
    if (ja) await livro.removeUsuariosQueFavoritaram(userId);
    else    await livro.addUsuariosQueFavoritaram(userId);
    return res.json({ favoritado: !ja });
};