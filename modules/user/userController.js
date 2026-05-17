const Users = require("./userModel");
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');
const bookControl = require('../books/bookController');
const Books = require('../books/bookModel');

exports.createUser = async (req, res) => {
    try{
        const { username, first_name, last_name, email, senha, senha2 } = req.body;

        if (!email || !senha || !senha2 || !username) {
            req.flash('error', 'Preencha todos os campos obrigatórios!');
            return res.redirect('/account/register'); 
        }

        if(!(senha == senha2)){
            req.flash('error', 'Senhas não coincidem');
            return res.redirect('/account/register');
        }

        if(senha.length < 6 || senha2.length < 6){
            req.flash('error', 'Senha com menos de 6 caracteres');
            return res.redirect('/account/register');
        }

        const emailQuery = await Users.findOne({where: { email: email }});

        if(emailQuery){
            req.flash('error', 'Email já cadastrado');
            return res.redirect('/account/register');
        }

        const usernameQuery = await Users.findOne({where: { username: username }});

        if(usernameQuery){
            req.flash('error', 'Nome de usuário já cadastrado');
            return res.redirect('/account/register');
        }

        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hash(senha, salt);

        const qtdeUsers = await Users.count();

        let novoUsuario;

        if(qtdeUsers == 0){
            novoUsuario = await Users.create({
                username: username,
                first_name: first_name,
                last_name: last_name,
                senha: hash,
                email: email,
                adm: true
            });
        }else{
            novoUsuario = await Users.create({
                username: username,
                first_name: first_name,
                last_name: last_name,
                senha: hash,
                email: email
            });
        }

        req.session.usuarioLogado = {
            id: novoUsuario.id,
            username: novoUsuario.username,
            adm: novoUsuario.adm,
        }

        req.flash('success', `Bem vindo ${novoUsuario.first_name}`);
        console.log('Usuário criado com sucesso');
        return res.redirect('/');


    } catch(erro){
        console.error(erro);
        req.flash('error', 'Erro ao cadastrar');
        return res.redirect('/account/register');
    }
}

exports.loginUser = async (req, res) => {

    try{

        const { email_username, senha } = req.body;
    
        if(!email_username || !senha){
            req.flash('error', 'Credenciais inválidas');
            return res.redirect('/account/login');
        }

        const usuario = await Users.findOne({
            where: {
                [Op.or]: [
                    {email: email_username},
                    {username: email_username}
                ]
            }
        });

        if(!usuario){
            req.flash('error', 'Credenciais inválidas');
            return res.redirect('/account/login');
        }

        const senhaBate = await bcrypt.compare(senha, usuario.senha);

        if(!senhaBate){
            req.flash('error', 'Credenciais inválidas');
            return res.redirect('/account/login');
        }

        if(!usuario.ativo){
            req.flash('error', 'Conta desativada');
            return res.redirect('/account/login');
        }

        req.session.usuarioLogado = {
            id: usuario.id,
            username: usuario.username,
            adm: usuario.adm,
        }

        req.flash('success', `Bem vindo de volta, ${usuario.first_name}`);
        return res.redirect('/');

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Erro ao fazer login');
        res.redirect('/account/login');
    }
};

exports.logoutUser = (req, res) => {
    req.session.usuarioLogado = null;
    res.redirect('/');
}

exports.getProfile = async (req, res) => {
    try{

        const usuario = await Users.findOne({
            where: {
                username: req.session.usuarioLogado.username
            }
        });

        if(!usuario){
            req.flash('erro', 'Falha ao buscar perfil');
            return res.redirect('/');
        }

        return res.render('account/profile', {usuario: usuario});

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao carregar perfil');
        return res.redirect('/');
    }
}

exports.updateProfile = async (req, res) => {
    try{

        let { first_name, last_name, username, email, senha_nova } = req.body;

        const usuarioAntes = await Users.findOne({
            where: {
                id: req.session.usuarioLogado.id
            }
        });

        const dadosParaAtualizar = {};

        if (first_name) dadosParaAtualizar.first_name = first_name;
        if (last_name) dadosParaAtualizar.last_name = last_name;
        
        if(username && username !== usuarioAntes.username){
            const usernameEmUso = await Users.findOne({where: {username: username}});
            if(usernameEmUso){
                req.flash('error', 'Esse nome de usuário já está em uso por outra pessoa.');
                return res.redirect('/account/profile');
            }
            dadosParaAtualizar.username = username;
        }

        if(email && email !== usuarioAntes.email){
            const emailEmUso = await Users.findOne({where: {email: email}});
            if(emailEmUso){
                req.flash('error', 'Esse endereço de e-mail já está cadastrado no sistema.');
                return res.redirect('/account/profile');
            }
            dadosParaAtualizar.email = email;
        }

        if(senha_nova){
            if(senha_nova.length < 6){
                req.flash('error', 'A nova senha deve ter pelo menos 6 caracteres.');
                return res.redirect('/account/profile');
            }

            if(await bcrypt.compare(senha_nova, usuarioAntes.senha)){
                req.flash('error', 'A nova senha precisa ser diferente da anterior.');
                return res.redirect('/account/profile');
            }

            const salt = await bcrypt.genSalt(10);
            dadosParaAtualizar.senha = await bcrypt.hash(senha_nova, salt);
        }

        await Users.update(dadosParaAtualizar, {
            where: {id: usuarioAntes.id}
        });

        if(dadosParaAtualizar.username) req.session.usuarioLogado.username = dadosParaAtualizar.username;

        req.flash('success', 'Usuario atualizado com sucesso');
        return res.redirect('/account/profile');

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao atualizar conta');
        return res.redirect('/');
    }
}

exports.deleteAccount = async (req, res) => {
    try{
        const user = req.params.id;

        const { senha, confirmacao } = req.body;


        if(Number(user) !== req.session.usuarioLogado.id){
            req.flash('error', 'Falha ao deletar conta');
            return res.redirect('/account/profile');
        }

        if(confirmacao !== "EXCLUIR"){
            req.flash('error', 'Precisa digitar EXCLUIR para confirmar');
            return res.redirect('/account/profile');
        }

        const usuario = await Users.findOne({where: {id: user}});

        if(!(await bcrypt.compare(senha, usuario.senha))){
            req.flash('error', 'Senha incorreta. A exclusão foi cancelada por segurança.');
            return res.redirect('/account/profile');
        }

        await Users.destroy({
            where: {
                id: user
            }
        });

        delete req.session.usuarioLogado;

        await bookControl.faxinaDisco().catch(console.error);

        req.flash('success', `Sua conta foi excluída permanentemente. Sentiremos sua falta!`);
        return res.redirect('/');

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao deletar conta');
        return res.redirect('/');
    }
}

exports.getFavoritos = async (req, res) => {
    try{

        const userId = req.session.usuarioLogado.id;

        const usuario = await Users.findByPk(userId, {
            include: [{
                model: Books,
                as: 'livrosFavoritos',
                through: {attributes: []},
                include: [{model: Users, attributes: ['username']}]
            }]
        });

        const livros = usuario.livrosFavoritos || [];

        res.render('account/favoritos', {title: 'Meus Favoritos', livros: livros, usuarioLogado: req.session.usuarioLogado});

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao carregar favoritos');
        return res.redirect('/');
    }
}