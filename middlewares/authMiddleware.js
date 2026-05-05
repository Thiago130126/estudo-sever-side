falha = 'Erro ao fazer autenticação.';

exports.admAuth = (req, res, next) => {
    try{
        if(!req.session.usuarioLogado){
        req.flash('error', 'Precisa estar logado para acessar essa página');
        return res.redirect('/account/login');
        }
        const userLogado = req.session.usuarioLogado;

        if(!userLogado.adm){ 
            req.flash('error', 'Você não tem autorização para acessar essa página');
            return res.redirect('/');
        }
        
        next();

    }catch(erro){
        console.error(erro);
        req.flash('error', falha);
        return res.redirect('/');
    }
};

exports.userAuth = (req, res, next) => {
    try{

        if(!req.session.usuarioLogado){
            req.flash('error', 'Precisa estar logado para acessar esta rota');
            return res.redirect('/account/login');
        }

        next();

    }catch(erro){
        console.error(erro);
        req.flash('erro', falha);
        return res.redirect('/');
    }
};