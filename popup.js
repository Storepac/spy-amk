// Script para popup - controle básico sem funcionalidades complexas
document.addEventListener('DOMContentLoaded', function() {
    // Apenas animações simples e feedback visual
    const logo = document.querySelector('.logo');
    const title = document.querySelector('.title');
    
    if (logo) {
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    if (title) {
        title.addEventListener('click', function() {
            // Pequena animação no título
            this.style.textShadow = '0 2px 20px rgba(1, 70, 65, 0.4)';
            setTimeout(() => {
                this.style.textShadow = 'none';
            }, 1000);
        });
    }
    
    console.log('🎯 Popup AMK spy carregado - Use o painel lateral na Amazon!');
}); 