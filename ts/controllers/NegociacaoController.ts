import { NegociacoesView, MensagemView } from '../views/index';
import { Negociacoes, Negociacao } from '../models/index';
import { domInjects, throttle } from '../helpers/decorators/index';
import { NegociacaoParcial } from '../models/NegociacaoParcial';
import { NegociacaoService } from '../services/index';
import { Imprime } from '../helpers/index';

export class NegociacaoController {

    @domInjects('#data')
    private _inputData: JQuery;

    @domInjects('#quantidade')
    private _inputQuantidade: JQuery;

    @domInjects('#valor')
    private _inputValor: JQuery;
    private _negociacoes = new Negociacoes();
    private _negociacoesView = new NegociacoesView('#negociacoesView');
    private _mensagemView = new MensagemView('#mensagemView');
    private _service = new NegociacaoService();

    constructor(){
        this._negociacoesView.update(this._negociacoes);
    }

    @throttle()
    adiciona(){        
        
        let data = new Date(this._inputData.val().replace(/-/g, ','));

        if(!this._ehDiaUtil(data)){
           this._mensagemView.update("Somente negociações em dias da semana!"); 
           return
        }

        const negociacao = new Negociacao(
            data,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())
        );

        this._negociacoes.adiciona(negociacao);
        Imprime(negociacao, this._negociacoes);
        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update("Negociação adicionada com sucesso!");

    }

    private _ehDiaUtil(data: Date){
        return data.getDay() != DiaDaSemana.Sabado && data.getDay() != DiaDaSemana.Domingo;
    }

    @throttle()
    async importaDados(){

        try{

            const negociacoesParaImportar = await this._service
            .obterNegociacoes(res => {

                if(res.ok) {
                    return res;
                } else {
                    throw new Error(res.statusText);
                }
            });
            
            const negociacoesJaImportadas = this._negociacoes.paraArray();

            negociacoesParaImportar
                .filter(negociacao =>
                    !negociacoesJaImportadas.some(jaImportada =>
                        negociacao.ehIgual(jaImportada)))
                    .forEach(negociacao =>
                        this._negociacoes.adiciona(negociacao));
                        
            this._negociacoesView.update(this._negociacoes);
        }catch(err){
            this._mensagemView.update(err.message);
        }
    }
}

enum DiaDaSemana{
    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado
}