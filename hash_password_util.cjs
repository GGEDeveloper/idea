const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const HASH_SALT_ROUNDS = 10;

readline.question('Digite a password para gerar o hash: ', async (password) => {
  if (!password) {
    console.error('Password não pode ser vazia.');
    readline.close();
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);
    console.log('\nPassword original:', password);
    console.log('Hash gerado (para copiar para a BD):', hashedPassword);
  } catch (err) {
    console.error('Erro ao gerar hash:', err);
  }
  readline.close();
}); 