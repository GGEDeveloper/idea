/**
 * Constrói a árvore de categorias a partir do campo 'path' da tabela categories.
 * Cada nó terá um array 'children' com as subcategorias.
 * 
 * @param {Array} categories - Lista de categorias com campos {id, name, path, product_count}
 * @returns {Array} Árvore de categorias aninhada
 */
function buildCategoryTreeFromPaths(categories) {
    const pathMap = {};

    // Primeiro, popule o mapa com todas as categorias reais da BD.
    // Isto garante que temos todos os dados reais (como IDs e contagens diretas).
    for (const cat of categories) {
        pathMap[cat.path] = {
            id: cat.id,
            name: cat.name,
            path: cat.path,
            directProductCount: parseInt(cat.product_count, 10) || 0,
            children: [],
        };
    }

    const roots = [];
    const sortedPaths = Object.keys(pathMap).sort();

    for (const path of sortedPaths) {
        const pathParts = path.split('\\');
        const node = pathMap[path];

        if (pathParts.length > 1) {
            // É um nó filho. Encontrar ou criar o pai.
            const parentPath = pathParts.slice(0, -1).join('\\');
            
            if (!pathMap[parentPath]) {
                // O pai não existe, criar um nó virtual.
                pathMap[parentPath] = {
                    id: `virtual-${parentPath}`,
                    name: pathParts[pathParts.length - 2],
                    path: parentPath,
                    directProductCount: 0,
                    children: [],
                };
            }
            
            // Adicionar o nó atual aos filhos do pai.
            if (!pathMap[parentPath].children.some(c => c.path === path)) {
                pathMap[parentPath].children.push(node);
            }
        } 
    }

    // Identificar os nós raiz (aqueles que não são filhos de ninguém)
    const childPaths = new Set();
    Object.values(pathMap).forEach(node => {
        node.children.forEach(child => childPaths.add(child.path));
    });
    Object.values(pathMap).forEach(node => {
        if (!childPaths.has(node.path)) {
            roots.push(node);
        }
    });

    // Calcular recursivamente a contagem total de produtos para cada nó.
    function calculateTotalProductCount(node) {
        let total = node.directProductCount;
        for (const child of node.children) {
            total += calculateTotalProductCount(child);
        }
        node.productCount = total; // Contagem total para exibição
        return total;
    }

    for (const root of roots) {
        calculateTotalProductCount(root);
    }

    // Ordenar a árvore alfabeticamente.
    function sortTree(nodes) {
                nodes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        for (const node of nodes) {
            sortTree(node.children);
        }
    }

    sortTree(roots);

    return roots;
}

module.exports = {
    buildCategoryTreeFromPaths,
};
