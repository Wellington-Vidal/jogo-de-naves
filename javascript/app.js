
const LOCAL_IMAGENS = "recursos/imagens/";

const canvas = document.getElementById('cenario-jogo');
const LARGURA_CANVAS = canvas.width;
const ALTURA_CANVAS = canvas.height;

var ctx = canvas.getContext("2d");
/*
var somHelicoptero = document.getElementById('somHelicoptero');
var somTiro = document.getElementById('somDisparo');
var somExplosao = document.getElementById('somExplosao');*/

var somHelicoptero = new Audio('recursos/audio/somHelicoptero.mp3');
var somTiro = new Audio('recursos/audio/somDisparo.mp3');
var somExplosao = new Audio('recursos/audio/somExplosao.mp3');

//Objetos
var msgInicial;
var fundoCenario;
var relogio;
var jogador;
var inimigo1;
var inimigo2;
var cuboDourado;

var jogo = {
    iniciaJogo: function() {
        this.tempo = setInterval(atualizaJogo, 50);
        console.log('Iniciou');
    },
    paraJogo: function(){
        clearInterval(this.tempo);
        if (msgInicial)
        {
            msgInicial.desenhaImagem();
        }

        console.log('Parou');
    },
    limpaCenario: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function iniciaJogo()
{
    //Cria Objetos
    fundoCenario = new ObjetoFundoCenario('imagem-fundo', 640, 480, 0, 0);
    fundoCenario.desenhaImagem();

    relogio = new Relogio();
    relogio.desenhaImagem();

    jogador = new Jogador('HelicopteroAzul', 20, 200);
    jogador.desenhaImagem();
    somHelicoptero.loop = true;
    somHelicoptero.play();

    inimigo1 = new Inimigo('HelicopteroVermelho', LARGURA_CANVAS, 200, 15, 0);
    inimigo1.desenhaImagem();

    inimigo2 = new Inimigo('HelicopteroVermelho', LARGURA_CANVAS + 150, 400, 15, 0);
    inimigo2.desenhaImagem();

    cuboDourado = new CuboDourado('cubo-dourado', LARGURA_CANVAS/2, ALTURA_CANVAS/2, 10, 10);
    cuboDourado.desenhaImagem();

    //Inicia Loop do Jogo
    jogo.iniciaJogo();
}

function atualizaJogo()
{
    jogo.limpaCenario();

    fundoCenario.movimenta();
    fundoCenario.desenhaImagem();

    relogio.atualiza();
    relogio.desenhaImagem();

    jogador.movimenta();
    jogador.desenhaImagem();
    
    inimigo1.movimenta();
    inimigo1.desenhaImagem();

    inimigo2.movimenta();
    inimigo2.desenhaImagem();

    if (!inimigo1.colidiu)
    {
        jogador.colide(inimigo1.posX, inimigo1.posY, inimigo1.larguraObjeto, inimigo1.alturaObjeto, 'INIMIGO');
    }
    if (!inimigo2.colidiu)
    {
        jogador.colide(inimigo2.posX, inimigo2.posY, inimigo2.larguraObjeto, inimigo2.alturaObjeto, 'INIMIGO');
    }

    if (jogador.bala.disparada)
    {
        inimigo1.colide(jogador.bala.posX, jogador.bala.posY, jogador.bala.larguraObjeto, jogador.bala.alturaObjeto);
        inimigo2.colide(jogador.bala.posX, jogador.bala.posY, jogador.bala.larguraObjeto, jogador.bala.alturaObjeto);
    }

    if (!cuboDourado.colidiu)
    {
        cuboDourado.movimenta();
        jogador.colide(cuboDourado.posX, cuboDourado.posY, cuboDourado.larguraObjeto, cuboDourado.alturaObjeto, 'CUBO');
        cuboDourado.colide(jogador.posX, jogador.posY, jogador.larguraObjeto, jogador.alturaObjeto);
    }
    
    cuboDourado.desenhaImagem();

    if (jogador.energia == 0)
    {
        jogador.desenhaImagem();
        jogo.paraJogo();
    }
}

class Jogador {
    constructor(nomeImagem, posXInicial, posYInicial){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.numQuadrosImagem = 2;
        this.tempoAnimacao = 1;
        this.tempo = 0;
        this.imgAnimacao = 0;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = 0;
        this.velocidadeY = 5;
        this.direcaoX = 0;
        this.direcaoY = 0;

        this.larguraObjeto = 100;
        this.alturaObjeto = 70;

        this.colidiu = false;
        this.energia = 3;
        this.tempoColete = 60;

        this.bala = new Bala(this.posX, this.posY);
    }

    sobe(){
        if (this.posY > 0)
        {
            this.direcaoY = -1;
        }
        else
        {
            this.para();
        }
    }

    desce(){
        if (this.posY + this.alturaObjeto < ALTURA_CANVAS)
        {
            this.direcaoY = 1;
        }
        else
        {
            this.para();
        }
    }

    para(){
        this.direcaoY = 0;
    }

    dispara(){
        if (!this.bala.disparada)
        {
            this.bala.dispara(this.posX + 70, this.posY + 40);
            somTiro.play();
        }
    }

    colide(x, y, lar, alt, tipo){
        if (!this.colidiu)
        {
            if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
            {
                if (tipo == 'INIMIGO')
                {
                    if (this.energia > 0)
                    {
                        this.energia = this.energia - 1;
                    }
                    
                    this.colidiu = true;
                }
                else if (tipo == 'CUBO')
                {
                    if (this.energia < 3)
                    {
                        this.energia = this.energia + 1;
                    }
                }
            }
        }
        else
        {
            if (this.tempoColete > 0)
            {
                this.tempoColete = this.tempoColete - 1;
            }
            else
            {
                this.colidiu = false;
                this.tempoColete = 60;
            }
        }
    }

    movimenta(){
        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);

        if (this.bala.disparada)
        {
            this.bala.movimenta();
        }
    }

    desenhaImagem(){
        let posAnimacao = this.imgAnimacao * (this.largura / 2);

        ctx.drawImage(this.imagem, posAnimacao, 0, this.largura / 2, this.altura, this.posX, this.posY, 100, 70);

        this.tempo = this.tempo + 1;

        if (this.tempo == this.tempoAnimacao)
        {
            this.imgAnimacao = (this.imgAnimacao + 1) % this.numQuadrosImagem;
            this.tempo = 0;
        }

        if (this.bala.disparada)
        {
            this.bala.desenhaImagem();
        }

        //ENERGIA (MAX 90, MIN 0, 3X30)
        ctx.fillStyle = 'yellow';
        ctx.fillRect(10, 10, 96, 30);
        ctx.fillStyle = 'red';
        ctx.fillRect(13, 13, this.energia * 30, 24);
    }
}

class Bala {
    constructor(posXInicial, posYInicial){
        this.disparada = false;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = 15;
        this.velocidadeY = 0;
        this.direcaoX = 1;
        this.direcaoY = 0;

        this.larguraObjeto = 30;
        this.alturaObjeto = 5;
    }

    dispara(x, y) {
        this.posX = x;
        this.posY = y;
        this.disparada = true;
    }

    perdida(){
        this.disparada = false;
    }

    movimenta(){
        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);

        if (this.posX > LARGURA_CANVAS)
        {
            this.disparada = false;
        }
    }

    desenhaImagem(){
        ctx.fillStyle = 'red';
        ctx.fillRect(this.posX, this.posY, 30, 5);
    }
}

class Inimigo {
    constructor(nomeImagem, posXInicial, posYInicial, velocidadeX, velocidadeY){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.numQuadrosImagem = 2;
        this.tempoAnimacao = 1;
        this.tempo = 0;
        this.imgAnimacao = 0;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = velocidadeX;
        this.velocidadeY = velocidadeY;
        this.direcaoX = -1;
        this.direcaoY = 0;

        this.larguraObjeto = 100;
        this.alturaObjeto = 70;

        this.colidiu = false;
    }

    colide(x, y, lar, alt){
        if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
        {
            this.colidiu = true;
            somExplosao.play();
        }
    }

    movimenta(){
        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);

        if (this.posX + 100 < 0)
        {
            this.colidiu = false;
            this.posX = LARGURA_CANVAS;
            this.posY = Math.floor(Math.random() * (ALTURA_CANVAS - 100));            
        }
    }

    desenhaImagem(){
        if (!this.colidiu)
        {
            let posAnimacao = this.imgAnimacao * (this.largura / 2);

            ctx.drawImage(this.imagem, posAnimacao, 0, this.largura / 2, this.altura, this.posX, this.posY, 100, 70);
    
            this.tempo = this.tempo + 1;
    
            if (this.tempo == this.tempoAnimacao)
            {
                this.imgAnimacao = (this.imgAnimacao + 1) % this.numQuadrosImagem;
                this.tempo = 0;
            }
        }
    }
}

class ObjetoFundoCenario {
    constructor(nomeImagem, larguraObjeto, alturaObjeto, posXInicial, posYInicial){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.numQuadrosImagem = 1;

        this.posX = posXInicial;
        this.posY = posYInicial;
        
        class Quadro{
            constructor(imgX, imgY, imgLargura, imgAltura, posX, posY, largura, altura){
                this.imgX = imgX;
                this.imgY = imgY;
                this.imgLargura = imgLargura;
                this.imgAltura = imgAltura;

                this.posX = posX;
                this.posY = posY;
                this.largura = largura;
                this.altura = altura;
            }
        }

        this.quadro1 = new Quadro(posXInicial, posYInicial, this.largura / 2, this.altura, posXInicial, posYInicial, this.largura / 2, this.altura);
        this.quadro2 = new Quadro(this.largura / 2, posYInicial, this.largura * 2, this.altura, (this.posX + this.largura/2), this.posY, this.largura * 2, this.altura);
    }

    movimenta(){
        this.quadro1.posX = this.quadro1.posX - 2;
        this.quadro2.posX = this.quadro2.posX - 2;
        
        if (this.quadro1.posX < (-1) * (this.largura / 2))
        {
            this.quadro1.posX = this.quadro2.posX + (this.largura / 2);
        }
        if (this.quadro2.posX < (-1) * (this.largura / 2))
        {
            this.quadro2.posX = this.quadro1.posX + (this.largura / 2);
        }
    }

    desenhaImagem(){
        ctx.drawImage(this.imagem, this.quadro1.imgX, this.quadro1.imgY, this.quadro1.imgLargura, this.quadro1.imgAltura, this.quadro1.posX, this.quadro1.posY, this.quadro1.largura, this.quadro1.altura);
        ctx.drawImage(this.imagem, this.quadro2.imgX, this.quadro2.imgY, this.quadro2.imgLargura, this.quadro2.imgAltura, this.quadro2.posX, this.quadro2.posY, this.quadro2.largura, this.quadro2.altura);
        ctx.restore();
    }
}

class CuboDourado{
    constructor(nomeImagem, posXInicial, posYInicial, velocidadeX, velocidadeY){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = velocidadeX;
        this.velocidadeY = velocidadeY;
        this.direcaoX = 1;
        this.direcaoY = 1;

        this.larguraObjeto = 50;
        this.alturaObjeto = 50;

        this.colidiu = false;
        this.tempoNovo = 0;
    }

    colide(x, y, lar, alt){
        if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
        {
            this.colidiu = true;
            this.posX = LARGURA_CANVAS / 2;
            this.posY = ALTURA_CANVAS / 2;
            this.direcaoX = 1;
            this.direcaoY = 1;
            this.tempoNovo = Math.floor(Math.random() * 2000) + 1000;
        }
    }

    movimenta(){
        if ((this.posX < 0) || (this.posX + this.larguraObjeto > LARGURA_CANVAS))
        {
            this.direcaoX = this.direcaoX * (-1);
        }

        if ((this.posY < 0) || (this.posY + this.alturaObjeto > ALTURA_CANVAS))
        {
            this.direcaoY = this.direcaoY * (-1);
        }

        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);
    }

    desenhaImagem(){
        if (!this.colidiu)
        {
            ctx.drawImage(this.imagem, 0, 0, this.largura, this.altura, this.posX, this.posY, 50, 50);
        }
        else
        {
            this.tempoNovo = this.tempoNovo - 1;

            if (this.tempoNovo == 0)
            {
                this.colidiu = false;
            }
        }
    }
}

class ObjMsgInicial {
    constructor() {
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + "aviso-inicio.png";

        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.posX = (LARGURA_CANVAS / 2) - (this.largura / 2);
        this.posY = (ALTURA_CANVAS / 2) - (this.altura / 2);

        this.clicou = false;
    }

    clickMouse(mouseX, mouseY){
        if (!((this.posX > mouseX) || (this.posX + this.larguraObjeto < mouseX) || (this.posY > mouseY) || (this.posY + this.alturaObjeto < mouseY)))
        {
            this.clicou = true;
        }
    }

    desenhaImagem(){
        ctx.drawImage(this.imagem, 0, 0, this.largura, this.altura, this.posX, this.posY, this.largura, this.altura);
    }
}

class Relogio{
    constructor(){
        this.hms = '00:00:00';
        this.hora = 0;
        this.minuto = 0;
        this.segundo = 0;
        this.milisegundos = 0;
    }

    atualiza(){
        if (this.milisegundos == 1000)
        {
            this.segundo = this.segundo + 1;
            this.milisegundos = 0;

            if (this.segundo == 60)
            {
                this.minuto = this.minuto + 1;
                this.segundo = 0;

                if (this.minuto == 60)
                {
                    this.hora = this.hora + 1;
                    this.minuto = 0;
                }
            }
        }
        
        this.milisegundos = this.milisegundos + 50;
    }

    desenhaImagem(){
        let hora = this.hora < 10 ? '0' + this.hora : this.hora;
        let minuto = this.minuto < 10 ? '0' + this.minuto : this.minuto;
        let segundo = this.segundo < 10 ? '0' + this.segundo : this.segundo;

        this.hms = hora + ':' + minuto + ':' + segundo + ':' + this.milisegundos;

        ctx.font = "30px Arial";
        ctx.fillText(this.hms, (LARGURA_CANVAS / 2) - 100, 35);
    }
}

function desenhaMensagemInicial()
{
    msgInicial = new ObjMsgInicial();
    msgInicial.desenhaImagem();
}

function verificaClick(mouseX ,mouseY)
{
    msgInicial.clickMouse(mouseX ,mouseY);

    if (msgInicial.clicou)
    {
        iniciaJogo();
    }
}

window.addEventListener('keydown', function (e) {
    e.preventDefault();
    canvas.keys = (canvas.keys || []);
    canvas.keys[e.key] = (e.type == "keydown");

    if ((e.key == 'ArrowUp') || (e.key == 'w')) //SETA CIMA ou W
    {
        jogador.sobe();
    }
    else if ((e.key == 'ArrowDown') || (e.key == 's')) //SETA BAIXO ou S
    {
        jogador.desce();
    }
    else if ((e.key == 'ArrowRight') || (e.key == 'd')) //SETA DIREITA ou D
    {
        jogador.dispara();
    }
})
window.addEventListener('keyup', function (e) {
    canvas.keys[e.key] = (e.type == "keyup");
    jogador.para();
})

canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;
    verificaClick(x ,y);
  });