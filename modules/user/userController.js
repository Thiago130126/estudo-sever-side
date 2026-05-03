const Users = require("./userModel");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
    try{
        const { username, first_name, last_name, email, senha, senha2 } = req.body;

        if (!email || !senha || !senha2 || !username) {
            req.flash('error', 'Preencha todos os campos obrigatórios!');
            return res.redirect('/register'); 
        }

        if(!(senha == senha2)){
            req.flash('error', 'Senhas não coincidem');
            return res.redirect('/register');
        }

        if(senha.length < 6 || senha2.length < 6){
            req.flash('error', 'Senha com menos de 6 caracteres');
            return res.redirect('/register');
        }

        const emailQuery = await Users.findOne({where: { email: email }});

        if(emailQuery){
            req.flash('error', 'Email já cadastrado');
            return res.redirect('/register');
        }

        const usernameQuery = await Users.findOne({where: { username: username }});

        if(usernameQuery){
            req.flash('error', 'Nome de usuário já cadastrado');
            return res.redirect('/register');
        }

        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hash(senha, salt);

        const qtdeUsers = await Users.count();

        if(qtdeUsers == 0){
            await Users.create({
                username: username,
                first_name: first_name,
                last_name: last_name,
                senha: hash,
                email: email,
                adm: true
            });
        }else{
            await Users.create({
                username: username,
                first_name: first_name,
                last_name: last_name,
                senha: hash,
                email: email
            });
        }

        req.flash('success', 'Usuário criado com sucesso');
        console.log('Usuário criado com sucesso');
        return res.redirect('/register');


    } catch(erro){
        console.error(erro);
        req.flash('error', 'Erro ao cadastrar');
        return res.redirect('/register');
    }
}