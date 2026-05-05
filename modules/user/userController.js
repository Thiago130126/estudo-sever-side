const Users = require("./userModel");
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');

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

        req.flash('success', 'Usuário criado com sucesso');
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