function calcularSoma (n,tipo){
    tipo = tipo.toLowerCase();
    if (tipo === "par") {
        let k = Math.floor(n / 2);
        return k * (k + 1);

    }
    
let resultado = calcularSoma(8819172, "par");

console.log("O resultado da soma dos pares é:");
console.log(resultado);
    
// ==========================================
// MATEMÁTICA PARA SOMA DE ÍMPARES
// ==========================================
// Número limite (n) = 8819172
//
// 1. Quantidade de números ímpares (k) até 8819172:
//    k = 8819172 / 2 = 4409586
//
// 2. Fórmula da soma dos ímpares: k * k (ou k ao quadrado)
//    soma = 4409586 * 4409586
//
// O resultado da soma dos números ímpares de 1 até 8819171 é: 19444450298796

{
    let k = 8819172 / 2;
    let somaImparesMath = k * k;    
    console.log("Soma Ímpares (Fórmula):", somaImparesMath); // 19444450298796
}

// ==========================================
// MATEMÁTICA PARA SOMA DE PARES
// ==========================================
// Número escolhido (n) = 8819172 (É par!)
//
// 1. Encontrando a quantidade de números pares (k):
//    k = 8819172 / 2 
//    k = 4409586 (Exato, sem decimais!)
//
// 2. Aplicando a fórmula da soma dos pares: k * (k + 1)
//    soma = 4409586 * (4409586 + 1)
//    soma = 4409586 * 4409587
//
// O resultado exato da soma dos números pares de 0 a 8819172 é: 19444454708382