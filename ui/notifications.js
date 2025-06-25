class NotificationManager {
    static mostrar(mensagem, tipo = 'info', duracao = 3000) {
        // Remover notificações existentes
        const notificacoesExistentes = document.querySelectorAll('.amk-spy-notification');
        notificacoesExistentes.forEach(notif => notif.remove());

        // Criar nova notificação
        const notificacao = document.createElement('div');
        notificacao.className = `amk-spy-notification amk-spy-notification-${tipo}`;
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getCorFundo(tipo)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
            transition: all 0.3s ease;
            max-width: 400px;
            text-align: center;
            backdrop-filter: blur(10px);
        `;

        // Adicionar ícone baseado no tipo
        const icone = this.getIcone(tipo);
        notificacao.innerHTML = `${icone} ${mensagem}`;

        // Adicionar ao DOM
        document.body.appendChild(notificacao);

        // Animar entrada
        setTimeout(() => {
            notificacao.style.opacity = '1';
            notificacao.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        // Remover após duração
        setTimeout(() => {
            notificacao.style.opacity = '0';
            notificacao.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, duracao);
    }

    static getCorFundo(tipo) {
        switch(tipo) {
            case 'success':
                return 'linear-gradient(135deg, #10b981, #059669)';
            case 'error':
                return 'linear-gradient(135deg, #ef4444, #dc2626)';
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b, #d97706)';
            case 'info':
            default:
                return 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }
    }

    static getIcone(tipo) {
        switch(tipo) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    }

    static sucesso(mensagem, duracao = 3000) {
        this.mostrar(mensagem, 'success', duracao);
    }

    static erro(mensagem, duracao = 4000) {
        this.mostrar(mensagem, 'error', duracao);
    }

    static aviso(mensagem, duracao = 3500) {
        this.mostrar(mensagem, 'warning', duracao);
    }

    static informacao(mensagem, duracao = 3000) {
        this.mostrar(mensagem, 'info', duracao);
    }
}

window.NotificationManager = NotificationManager; 