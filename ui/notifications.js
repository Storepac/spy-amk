class NotificationManager {
    static mostrar(mensagem) {
        const notificacaoExistente = document.querySelector('.toast-notificacao');
        if (notificacaoExistente) {
            notificacaoExistente.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notificacao';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = mensagem;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    static mostrarFeedbackCopia(botao) {
        const svg = botao.querySelector('svg');
        const originalStroke = svg.getAttribute('stroke');
        const originalBg = botao.style.background;
        
        svg.setAttribute('stroke', '#6ac768');
        botao.style.background = '#d1fae5';
        
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #014641;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 1000;
        `;
        tooltip.textContent = 'ASIN Copiado!';
        
        botao.parentElement.style.position = 'relative';
        botao.parentElement.appendChild(tooltip);
        
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
        
        setTimeout(() => {
            svg.setAttribute('stroke', originalStroke);
            botao.style.background = originalBg;
            tooltip.style.opacity = '0';
            
            setTimeout(() => tooltip.remove(), 200);
        }, 1500);
    }
}

window.NotificationManager = NotificationManager; 