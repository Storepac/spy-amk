class ClipboardManager {
    static copiarParaClipboard(texto, botao) {
        if (!navigator.clipboard) {
            const input = document.createElement('textarea');
            input.value = texto;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            NotificationManager.mostrarFeedbackCopia(botao);
            return;
        }
        
        navigator.clipboard.writeText(texto)
            .then(() => {
                NotificationManager.mostrarFeedbackCopia(botao);
            })
            .catch(err => {
                console.error('Erro ao copiar para o clipboard:', err);
                NotificationManager.mostrar('Erro ao copiar o ASIN');
            });
    }

    static formatarMoeda(valor) {
        if (!valor) return '';
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    static aplicarMascaraMoeda(input) {
        let valor = input.value.replace(/\D/g, '');
        valor = (parseFloat(valor) / 100).toFixed(2);
        input.value = this.formatarMoeda(parseFloat(valor));
    }

    static extrairNumeroMoeda(valor) {
        if (!valor) return 0;
        return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    }
}

window.ClipboardManager = ClipboardManager; 