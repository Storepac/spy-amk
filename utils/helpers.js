/**
 * Helpers - Funções utilitárias comuns
 */
class Helpers {
    /**
     * Formata número para moeda brasileira
     */
    static formatarMoeda(valor, decimais = 2) {
        if (!valor || isNaN(valor)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: decimais
        }).format(valor);
    }

    /**
     * Formata número com separadores de milhares
     */
    static formatarNumero(valor) {
        if (!valor || isNaN(valor)) return '0';
        return new Intl.NumberFormat('pt-BR').format(valor);
    }

    /**
     * Extrai número de uma string
     */
    static extrairNumero(texto) {
        if (!texto) return 0;
        const match = texto.toString().match(/[\d.,]+/);
        return match ? parseFloat(match[0].replace(',', '.')) : 0;
    }

    /**
     * Debounce para otimizar performance
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle para limitar frequência de execução
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Verifica se elemento está visível na viewport
     */
    static isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Scroll suave para elemento
     */
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Gera ID único
     */
    static gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Valida ASIN
     */
    static validarASIN(asin) {
        return /^[A-Z0-9]{10}$/.test(asin);
    }

    /**
     * Sanitiza texto para HTML
     */
    static sanitizarTexto(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    /**
     * Trunca texto com ellipsis
     */
    static truncarTexto(texto, maxLength) {
        if (!texto || texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    }

    /**
     * Capitaliza primeira letra
     */
    static capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    /**
     * Remove acentos de texto
     */
    static removerAcentos(texto) {
        if (!texto) return '';
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Converte texto para slug
     */
    static paraSlug(texto) {
        if (!texto) return '';
        return this.removerAcentos(texto)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    /**
     * Verifica se é dispositivo móvel
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Verifica se é navegador moderno
     */
    static isModernBrowser() {
        return 'Promise' in window && 'fetch' in window && 'IntersectionObserver' in window;
    }

    /**
     * Aguarda elemento estar disponível no DOM
     */
    static aguardarElemento(seletor, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                resolve(elemento);
                return;
            }

            const observer = new MutationObserver((mutations) => {
                const elemento = document.querySelector(seletor);
                if (elemento) {
                    observer.disconnect();
                    resolve(elemento);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Elemento ${seletor} não encontrado em ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Retry com backoff exponencial
     */
    static async retry(fn, maxRetries = 3, baseDelay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                const delay = baseDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Mede tempo de execução
     */
    static medirTempo(fn, label = 'Execução') {
        const inicio = performance.now();
        const resultado = fn();
        const fim = performance.now();
        console.log(`${label}: ${(fim - inicio).toFixed(2)}ms`);
        return resultado;
    }

    /**
     * Mede tempo de execução assíncrono
     */
    static async medirTempoAsync(fn, label = 'Execução') {
        const inicio = performance.now();
        const resultado = await fn();
        const fim = performance.now();
        console.log(`${label}: ${(fim - inicio).toFixed(2)}ms`);
        return resultado;
    }

    /**
     * Cria elemento com atributos
     */
    static criarElemento(tag, atributos = {}, filhos = []) {
        const elemento = document.createElement(tag);
        
        Object.entries(atributos).forEach(([chave, valor]) => {
            if (chave === 'textContent') {
                elemento.textContent = valor;
            } else if (chave === 'innerHTML') {
                elemento.innerHTML = valor;
            } else {
                elemento.setAttribute(chave, valor);
            }
        });

        filhos.forEach(filho => {
            if (typeof filho === 'string') {
                elemento.appendChild(document.createTextNode(filho));
            } else {
                elemento.appendChild(filho);
            }
        });

        return elemento;
    }

    /**
     * Remove elemento do DOM
     */
    static removerElemento(elemento) {
        if (elemento && elemento.parentNode) {
            elemento.parentNode.removeChild(elemento);
        }
    }

    /**
     * Adiciona classe se não existir
     */
    static adicionarClasse(elemento, classe) {
        if (elemento && !elemento.classList.contains(classe)) {
            elemento.classList.add(classe);
        }
    }

    /**
     * Remove classe se existir
     */
    static removerClasse(elemento, classe) {
        if (elemento && elemento.classList.contains(classe)) {
            elemento.classList.remove(classe);
        }
    }

    /**
     * Toggle classe
     */
    static toggleClasse(elemento, classe) {
        if (elemento) {
            elemento.classList.toggle(classe);
        }
    }

    /**
     * Verifica se elemento tem classe
     */
    static temClasse(elemento, classe) {
        return elemento && elemento.classList.contains(classe);
    }

    /**
     * Obtém dados do localStorage
     */
    static getStorage(chave, padrao = null) {
        try {
            const item = localStorage.getItem(chave);
            return item ? JSON.parse(item) : padrao;
        } catch (error) {
            console.error('Erro ao ler localStorage:', error);
            return padrao;
        }
    }

    /**
     * Salva dados no localStorage
     */
    static setStorage(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (error) {
            console.error('Erro ao salvar localStorage:', error);
            return false;
        }
    }

    /**
     * Remove dados do localStorage
     */
    static removeStorage(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (error) {
            console.error('Erro ao remover localStorage:', error);
            return false;
        }
    }

    /**
     * Limpa localStorage
     */
    static clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return false;
        }
    }
}

window.Helpers = Helpers; 