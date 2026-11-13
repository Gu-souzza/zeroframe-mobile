import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../FRONTEND/componentes/dropdown-menu/dropdown-menu.js', import.meta.url), 'utf8');

function menu(pathname, usuario) {
    const name = {}, email = { appendChild(link) { this.link = link; } }, config = {};
    const logout = { textContent: 'Sair da conta', style: {}, addEventListener(type, fn) { this[type] = fn; } };
    const dropdown = {
        querySelector(selector) { return selector.endsWith('h3') ? name : selector.endsWith(' p') ? email : config; },
        querySelectorAll() { return [logout]; }, addEventListener() {},
    };
    const values = new Map(usuario ? [['zf_usuario', JSON.stringify(usuario)], ['zf_token', 'teste']] : []);
    const context = {
        document: {
            getElementById(id) { return id === 'dropdownMenu' ? dropdown : { addEventListener() {} }; },
            createElement() { return {}; }, addEventListener() {},
        },
        localStorage: { getItem: key => values.get(key) ?? null, removeItem: key => values.delete(key) },
        window: { location: { pathname } }, console,
    };
    vm.runInNewContext(source, context);
    return { email, config, logout, context, values };
}

for (const path of ['/desktop/index.html', '/desktop/pages/search/search.html', '/desktop/pages/login-page/login.html']) {
    test(`visitante consegue abrir login a partir de ${path}`, () => {
        const result = menu(path);
        const expected = new URL('/desktop/pages/login-page/login.html', 'http://localhost');
        assert.equal(new URL(result.email.link.href, `http://localhost${path}`).href, expected.href);
        assert.equal(new URL(result.config.href, `http://localhost${path}`).href, expected.href);
        assert.equal(result.logout.style.display, 'none');
    });
}

test('cliente e administrador preservam email e destino correto; sair limpa sessão', () => {
    for (const perfil of ['Cliente', 'Administrador']) {
        const result = menu('/desktop/index.html', { nome: 'Teste', email: 'teste@example.com', perfil });
        assert.equal(result.email.textContent, 'teste@example.com');
        assert.equal(result.email.link, undefined);
        assert.match(result.config.href, perfil === 'Administrador' ? /admin\/admin.html$/ : /account-settings\/account.html$/);
        result.logout.click({ preventDefault() {} });
        assert.equal(result.values.size, 0);
        assert.equal(result.context.window.location.href, './pages/login-page/login.html');
    }
});
