/**
 * Utilitários para gestão de produtos VIP e redirecionamento de variantes
 */

/**
 * Verifica se um EAN é uma variante VIP
 * @param {string} ean - EAN a verificar
 * @returns {boolean} - True se for uma variante VIP
 */
export function isVipVariant(ean) {
    if (!ean || typeof ean !== 'string') return false;
    // Detectar se EAN é uma variante VIP (formato: INT_XXXXX_VN)
    return /^INT_[A-Z0-9]+_V\d+$/.test(ean);
}

/**
 * Extrai o EAN do produto pai de uma variante VIP
 * @param {string} variantEan - EAN da variante
 * @returns {string} - EAN do produto pai
 */
export function extractParentEan(variantEan) {
    if (!isVipVariant(variantEan)) return variantEan;
    return variantEan.replace(/_V\d+$/, '');
}

/**
 * Extrai o número da variante
 * @param {string} variantEan - EAN da variante
 * @returns {string|null} - Número da variante ou null
 */
export function extractVariantNumber(variantEan) {
    if (!isVipVariant(variantEan)) return null;
    const match = variantEan.match(/_V(\d+)$/);
    return match ? match[1] : null;
}

/**
 * Prepara dados de redirecionamento para variantes VIP
 * @param {string} ean - EAN acessado
 * @returns {object} - Dados de redirecionamento
 */
export function handleVariantRedirect(ean) {
    if (isVipVariant(ean)) {
        const parentEan = extractParentEan(ean);
        const variantNumber = extractVariantNumber(ean);
        
        return {
            shouldRedirect: true,
            parentEan: parentEan,
            variantId: ean,
            variantNumber: variantNumber,
            redirectUrl: `/produtos/${parentEan}?variant=${ean}`
        };
    }
    
    return { shouldRedirect: false };
}

/**
 * Verifica se um EAN é VIP (produto ou variante)
 * @param {string} ean - EAN a verificar
 * @returns {boolean} - True se for VIP
 */
export function isVipProduct(ean) {
    if (!ean || typeof ean !== 'string') return false;
    return ean.startsWith('INT_');
}

/**
 * Normaliza EAN para busca de produto (remove sufixo de variante se existir)
 * @param {string} ean - EAN original
 * @returns {string} - EAN normalizado para o produto pai
 */
export function normalizeEanForProductSearch(ean) {
    if (isVipVariant(ean)) {
        return extractParentEan(ean);
    }
    return ean;
} 