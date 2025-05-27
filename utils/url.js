class UrlManager {
    static extrairTermoBusca() {
        const url = new URL(window.location.href);
        const termo = url.searchParams.get('k') || '';
        return decodeURIComponent(termo.replace(/\+/g, ' '));
    }

    static navegarParaBusca(novoTermo) {
        const url = new URL(window.location.href);
        url.searchParams.set('k', novoTermo);
        url.searchParams.delete('page');
        window.location.href = url.toString();
    }
}

window.UrlManager = UrlManager; 