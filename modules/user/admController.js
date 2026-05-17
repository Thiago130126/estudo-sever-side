const Users = require('../user/userModel');
const userControll = require('../user/userController');
const Books = require('../books/bookModel');
const bookControl = require('../books/bookController');
const { Op, Sequelize } = require('sequelize');

exports.dashboardAdm = async (req, res) => {
    try{

        const usuario = await Users.findOne({where: {id: req.session.usuarioLogado.id}});

        const total_usuarios = await Users.count();

        const total_adms = await Users.count({ where: {adm: true}});

        const total_banidos = await Users.count({ where: {ativo: false}});

        const total_livros = await Books.count();

        let dados = {}

        dados.usuario = usuario;
        dados.total_usuarios = total_usuarios;
        dados.total_adms = total_adms;
        dados.total_banidos = total_banidos;
        dados.total_livros = total_livros;


        const { filter, sort, q } = req.query;

        const ondeBuscar = {};

        if(q){
            ondeBuscar[Op.or] = [
                { username: { [Op.like]: `%${q}%` }},
                { email: { [Op.like]: `%${q}%` }}
            ];
        }

        if(filter === 'adm'){
            ondeBuscar.adm = true;
        }else if(filter === 'banned'){
            ondeBuscar.ativo = false;
        }

        let comoOrdenar = [['createdAt', 'DESC']];

        if(sort === 'books'){
            comoOrdenar = [[Sequelize.literal('"booksCount"'), 'DESC']];
        }else if(sort === 'asc'){
            comoOrdenar = [['createdAt', 'ASC']];
        }else if(sort === 'desc'){
            comoOrdenar = [['createdAt', 'DESC']];
        }else if(sort === 'az'){
            comoOrdenar = [['username', 'ASC']];
        }else if(sort === 'za'){
            comoOrdenar = [['username', 'DESC']];
        }

        const users = await Users.findAll({
            where: ondeBuscar,
            attributes: {
                include: [
                    [Sequelize.fn('COUNT', Sequelize.col('Books.id')), 'booksCount']
                ]
            },
            include: [{
                model: Books,
                attributes: [],
                required: false
            }],
            group: ['Users.id'],
            order: comoOrdenar,
            subQuery: false
        });


        res.render('adm/index', { title: 'Painel Administrativo', dados: dados, users:users, query: req.query});

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao carregar dashboard');
        return res.redirect('/');
    }
}

exports.getAccount = async (req, res) => {
    try{

        const usuario = await Users.findOne({
            where: { id: req.params.id },
            attributes: {
                include: [
                    [Sequelize.fn('COUNT', Sequelize.col('Books.id')), 'booksCount']
                ]
            },
            // 1. O Sequelize precisa fazer o JOIN (LEFT JOIN) com a tabela Books
            include: [{
                model: Books,
                attributes: [], // Array vazio porque não queremos trazer os dados do livro, só contar
                required: false // Garante que traga o usuário mesmo se ele tiver 0 livros
            }],
            // 2. O SQL exige agrupar os dados quando usamos COUNT
            group: ['Users.id'],
            subQuery: false
        });

        if(!usuario){
            req.flash('error', 'Usuário não encontrado');
            return  res.redirect('/admin');
        }

        return res.render('adm/edit-user', {usuario: usuario})

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao carregar dados do usuário');
        return res.redirect('/admin');
    }
}

exports.updateAccount = async (req, res) => {
    try{

        const id_do_editado = Number(req.params.id);

        if(!Number.isInteger(id_do_editado)){
            req.flash('error', 'Falha ao alterar perfil');
            return res.redirect('/admin');
        }

        if(id_do_editado === 1){
            req.flash('error', 'Não é possível editar o primeiro usuário.');
            return res.redirect('/admin');
        }

        let { username, email, first_name, last_name, adm, ativo, senha, senha_confirm } = req.body;

        const usuarioAntes = await Users.findOne({
            where: {
                id: id_do_editado
            }
        });

        const dadosParaAtualizar = {};

        if(first_name) dadosParaAtualizar.first_name = first_name;
        if(last_name) dadosParaAtualizar.last_name = last_name;

        if(username && username !== usuarioAntes.username){
            const usernameEmUso = await Users.findOne({
                where: {
                    username: username
                }
            });

            if(usernameEmUso){
                req.flash('error', 'Esse username já está em uso');
                return res.redirect('/admin');
            }
            dadosParaAtualizar.username = username;
        }

        if(email && email !== usuarioAntes.email){
            const emailEmUso = await Users.findOne({
                where: {email: email}
            });

            if(emailEmUso){
                req.flash('error', 'Esse email já está em uso');
                return res.redirect('/admin');
            }
            dadosParaAtualizar.email = email;
        }

        if(senha){
            if(senha && !senha_confirm){
                req.flash('error', 'Preencha senha e a confirmação de senha');
                return res.redirect('/admin');
            }
            if(senha !== senha_confirm){
                req.flash('error', 'As senha não coincidem');
                return res.redirect('/admin');
            }

            if(await bcrypt.compare(senha, usuarioAntes.senha)){
                req.flash('error', 'A senha não pode ser a mesma de antes');
                return res.redirect('/admin');
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(senha, salt);

            dadosParaAtualizar.senha = hash;
        }


        adm = !!adm;

        ativo = !!ativo;

        dadosParaAtualizar.adm = adm;
        dadosParaAtualizar.ativo = ativo;

        await Users.update(dadosParaAtualizar, {
            where: {id: id_do_editado}
        });

        req.flash('success', 'Usuário atualizado com sucesso');
        return res.redirect('/admin/');

    }catch(error){
        console.error(error);
        req.flash('error', 'Falha ao alterar usuário');
        return res.redirect('/admin');
    }
}

exports.deleteAccount = async (req, res) =>{
    try{

        const id_a_deletar = Number(req.params.id);

        if(!Number.isInteger(id_a_deletar) || id_a_deletar === 1){
            req.flash('error', 'Não pode excluir essa conta');
            return res.redirect('/admin');
        }

        await Users.destroy({ where: {id: id_a_deletar}});

        await bookControl.faxinaDisco().catch(console.error);

        if(id_a_deletar === req.session.usuarioLogado.id){
            
            req.session.destroy(() => {
                return res.redirect('/');
            });
            return;
        }

        req.flash('success', 'Usuário deletado com sucesso');
        return res.redirect('/admin');

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao deletar conta');
        return res.redirect('/admin');
    }
}