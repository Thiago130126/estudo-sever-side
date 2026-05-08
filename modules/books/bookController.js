const Books = require('./bookModel');
const fs = require('fs').promises;
const path = require('path');

exports.addBook = async (req, res) =>{

    try{
        const { titulo, paginas, tipo_imagem, imagem_url } = req.body;

        const usuario = req.session.usuarioLogado.id;

        if(!titulo || !tipo_imagem || !paginas){
            req.flash('error', 'Preencha todos os campos.');
            return res.redirect('/books/add');
        }

        const numPaginas = Number(paginas);

        if(numPaginas <= 0 || !Number.isInteger(numPaginas)){
            req.flash('error', 'Número de páginas inválido');
            return res.redirect('/books/add');
        }

        let caminhoFinal = '';

        if(tipo_imagem === 'url'){
            caminhoFinal = imagem_url;
        }else if(tipo_imagem === 'upload'){
            if(req.file){
                caminhoFinal = '/uploads/books/' + req.file.filename;
            }else{
                req.flash('error', 'Preencha todos os campos.');
                return res.redirect('/books/add');
            }
        }else{
            req.flash('error', 'Formato inválido');
            res.redirect('/books/add');
        }

        const novoLivro = await Books.create({
            titulo: titulo,
            imagem: caminhoFinal,
            paginas: numPaginas,
            user_id: usuario
        });

        req.flash('success', 'Livro adicionado com sucesso');
        return res.redirect('/');

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Erro ao adicionar livro');
        return res.redirect('/books/add');
    }
};

exports.getLivro = async (req, res) => {
    try{
        if (req.session.usuarioLogado){
            const usuario = req.session.usuarioLogado.id;

            const livros = await Books.findAll({
                where: {user_id: usuario}
            });

            return res.render('index', { title: 'EduStream', livros: livros });
        }

        return res.render('index', {title: 'EduStream', livros: []});
    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao carregar seus livros');
        return res.redirect('/account/profile');
    }
};

exports.deleteBook = async (req, res) => {
    try{

        const livroDeletar = req.params.id;

        const usuario = req.session.usuarioLogado.id;

        const livro_busca = await Books.findOne({
            where: {
                id: livroDeletar,
                user_id: usuario
            }
        });

        if(!livro_busca){
            req.flash('error', 'Livro não encontrado');
            return res.redirect('/');
        }

        if(livro_busca.imagem && !livro_busca.imagem.startsWith('http')){
            const caminhoArquivo = path.join(__dirname, '..', 'public', livro_busca.imagem);

            try{
                await fs.unlink(caminhoArquivo);
                console.log('Imagem deletada com sucesso');

            }catch(erro){
                // ENOENT significa "Error No Entry" (Arquivo ou diretório não encontrado)
                if(erro.code !== 'ENOENT'){
                    console.error('Não foi possível deletar a imagem física:', erro);
                }
            }
        }

        const titulo = livro_busca.titulo;

        await livro_busca.destroy();

        req.flash('success', `Livro "${titulo}" deletado com sucesso!`);

        return res.redirect('/');

    }catch(erro){
        console.error(erro);
        req.flash('error', 'Falha ao deletar livro');
        return res.redirect('/');
    }
};

exports.editBook = async(req, res) => {
    try{

        const livro_id = req.params.id;

        const usuario = req.session.usuarioLogado.id;

        if(!livro_id){
            req.flash('error', 'Falha ao editar livro');
            return res.redirect('/');
        }

        const livro = await Books.findOne({
            where: {
                id: livro_id,
                user_id: usuario
            }
        });

        if(!livro){
            req.flash('error', 'Livro, não encontrado');
            return res.redirect('/');
        }

        return res.render('books/form_books', {title: 'Editar Livro', livro: livro});

    }catch(erro){
        console.error('Houve uma falha: ', erro);
        req.flash('error', 'Falha ao editar livro');
        return res.redirect('/');
    }
};

exports.updateBook = async(req, res) => {

    try{
        const livro_id = req.params.id;

        const usuario = req.session.usuarioLogado.id;

        const { titulo, paginas, tipo_imagem, imagem_url } = req.body;

        if(!livro_id){
            req.flash('error', 'Falha ao atualizar livro');
            return res.redirect('/');
        }

        if(!titulo || !tipo_imagem || !paginas){
            req.flash('error', 'Preencha todos os campos');
            return res.redirect(`/books/edit/${livro_id}`);
        }

        const numPaginas = Number(paginas);

        if(numPaginas <= 0 || !Number.isInteger(numPaginas)){
            req.flash('error', 'Número de páginas inválido');
            return res.redirect(`/books/edit/${livro_id}`);
        }

        const livro_Atual = await Books.findOne({
            where: {
                id: livro_id,
                user_id: usuario
            }
        });

        if(!livro_Atual){
            req.flash('error', 'Falha ao atualizar livro');
            return res.redirect('/');
        }

        const imagem_livro = livro_Atual.imagem;

        if(!imagem_livro){
            req.flash('error', 'Precisa haver uma imagem para a capa');
            return res.redirect(`/books/edit/${livro_id}`);
        }

        let caminhoFinal = '';

        if(!imagem_url && !req.file){
            caminhoFinal = imagem_livro;
        }
        if(imagem_url && !req.file){
            caminhoFinal = imagem_url;
        }else if(req.file && !imagem_url){
            caminhoFinal = '/uploads/books/' + req.file.filename;
        }else{
            req.flash( 'error', 'Falha ao atualizar livro');
            return res.redirect('/');
        }        
        

        if(caminhoFinal !== imagem_livro){
            if(!imagem_livro.startsWith('http')){
                const caminhoArquivo = path.join(__dirname, '..', 'public', imagem_livro);
                try{
                    await fs.unlink(caminhoArquivo);
                    console.log('Imagens apagadas com sucesso');
                }catch(erro){
                     // ENOENT significa "Error No Entry" (Arquivo ou diretório não encontrado)
                    if(erro.code !== 'ENOENT'){
                        console.error('Não foi possível deletar a imagem física:', erro);
                    }
                }
            }   
        }

        await Books.update({
            titulo: titulo,
            imagem: caminhoFinal,
            paginas: numPaginas,
            user_id: usuario
        }, {where:{
            id: livro_id,
            user_id: usuario
            }
        });

        req.flash('success', 'Livro atualizado com sucesso');
        return res.redirect('/');

    }catch(erro){
        console.error(erro);
        req.flash( 'error', 'Falha ao atualizar livro');
        return res.redirect('/');
    }
};

exports.faxinaDisco = async () => {
    try{

        const pastaUploads = path.join(__dirname, '..', '..', 'public', 'uploads', 'books');

        const arquivosFisicos = await fs.readdir(pastaUploads);

        const capas = await Books.findAll({
            attributes: ['imagem']
        });

        const capasFiltradas = capas.filter(capa => capa.imagem && !capa.imagem.startsWith('http'));

        const arquivos = capasFiltradas.map(capa => capa.imagem.split('/').pop());

        const imagensValidasBanco = new Set(arquivos);

        let apagados = 0;

        for (const arquivo of arquivosFisicos) {
            if (arquivo == '.gitkeep' || arquivo == '.DS_Store' || arquivo == 'Thumbs.db'){
                continue;
            }

            if (!imagensValidasBanco.has(arquivo)) {
                const caminhoParaApagar = path.join(pastaUploads, arquivo);

                await fs.unlink(caminhoParaApagar);

                apagados++;
                console.log(`[Coletor de lixo] Arquivo removido: ${arquivo}`);
            }
        }

        return apagados;

    }catch(erro){
        console.error('Erro ao limpar arquivos: ', erro);
        return 0;
    }
}

exports.coletorLixoImagens = async (req, res) => {
    try{

        const apagados = await this.faxinaDisco();

        req.flash('success', `Limpeza concluída! ${apagados} imagens órfãs foram removidas.`);
        return res.redirect('/admin');

    }catch(erro){
        console.error('Erro ao limpar arquivos: ', erro);
        req.flash('error', 'Erro ao tentar realizar a limpeza de arquivos.');
        return res.redirect('/admin');
    }
};
